#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (c) 2023 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Unified memory management utilities for Auto-Round."""

import gc
import logging
import os
import psutil
import threading
from typing import Dict, Optional, List, Union, Any

import torch
from torch.utils.data import DataLoader

from .config_manager import get_config

logger = logging.getLogger(__name__)

# Global memory tracking dict
_memory_tracking = {
    "peak_gpu": 0.0,
    "peak_cpu": 0.0,
    "current_gpu": 0.0,
    "current_cpu": 0.0,
    "tracking_enabled": False,
    "memory_stats": []
}

# Lock for thread-safe memory tracking
_tracking_lock = threading.Lock()


def enable_memory_tracking(enabled: bool = True) -> None:
    """Enable or disable memory usage tracking.
    
    Args:
        enabled: Whether to enable tracking
    """
    with _tracking_lock:
        _memory_tracking["tracking_enabled"] = enabled
        if not enabled:
            _memory_tracking["memory_stats"] = []


def get_gpu_memory(device_id: Optional[int] = None) -> float:
    """Get the current GPU memory usage in MB.
    
    Args:
        device_id: Optional device ID (defaults to current device)
        
    Returns:
        Memory usage in MB
    """
    if not torch.cuda.is_available():
        return 0.0
        
    if device_id is None:
        device_id = torch.cuda.current_device()
        
    try:
        # Get memory usage in bytes
        memory_bytes = torch.cuda.memory_allocated(device_id)
        # Convert to MB
        memory_mb = memory_bytes / (1024 * 1024)
        return memory_mb
    except Exception as e:
        logger.warning(f"Failed to get GPU memory: {str(e)}")
        return 0.0


def get_cpu_memory() -> float:
    """Get the current CPU memory usage in MB.
    
    Returns:
        Memory usage in MB
    """
    try:
        process = psutil.Process(os.getpid())
        memory_bytes = process.memory_info().rss
        memory_mb = memory_bytes / (1024 * 1024)
        return memory_mb
    except Exception as e:
        logger.warning(f"Failed to get CPU memory: {str(e)}")
        return 0.0


def track_memory_usage(tag: str = "") -> Dict[str, float]:
    """Track current memory usage and update stats.
    
    Args:
        tag: Optional identifier for this memory snapshot
        
    Returns:
        Dictionary with current memory stats
    """
    with _tracking_lock:
        if not _memory_tracking["tracking_enabled"]:
            return {
                "gpu_mb": 0.0,
                "cpu_mb": 0.0,
                "tag": tag
            }
            
        gpu_mb = get_gpu_memory()
        cpu_mb = get_cpu_memory()
        
        # Update peak values
        _memory_tracking["peak_gpu"] = max(_memory_tracking["peak_gpu"], gpu_mb)
        _memory_tracking["peak_cpu"] = max(_memory_tracking["peak_cpu"], cpu_mb)
        _memory_tracking["current_gpu"] = gpu_mb
        _memory_tracking["current_cpu"] = cpu_mb
        
        stats = {
            "gpu_mb": gpu_mb,
            "cpu_mb": cpu_mb,
            "tag": tag
        }
        
        _memory_tracking["memory_stats"].append(stats)
        return stats


def get_memory_stats() -> Dict[str, Any]:
    """Get all memory statistics.
    
    Returns:
        Dictionary with memory stats
    """
    with _tracking_lock:
        return {
            "peak_gpu_mb": _memory_tracking["peak_gpu"],
            "peak_cpu_mb": _memory_tracking["peak_cpu"],
            "current_gpu_mb": _memory_tracking["current_gpu"],
            "current_cpu_mb": _memory_tracking["current_cpu"],
            "tracking_enabled": _memory_tracking["tracking_enabled"],
            "memory_stats": _memory_tracking["memory_stats"]
        }


def reset_peak_memory() -> None:
    """Reset peak memory tracking."""
    with _tracking_lock:
        _memory_tracking["peak_gpu"] = get_gpu_memory()
        _memory_tracking["peak_cpu"] = get_cpu_memory()


def clear_memory(
    weights: Optional[Union[torch.Tensor, List[torch.Tensor]]] = None,
    dataloader: Optional[DataLoader] = None,
    force_cuda_empty_cache: bool = True
) -> Dict[str, float]:
    """Comprehensive memory cleanup.
    
    This function provides a standardized way to free memory resources
    across the codebase.
    
    Args:
        weights: Optional tensor(s) to explicitly delete
        dataloader: Optional dataloader to explicitly delete
        force_cuda_empty_cache: Whether to force CUDA cache emptying
        
    Returns:
        Dictionary with memory stats before and after cleanup
    """
    # Track memory before cleanup
    before = {
        "gpu_mb": get_gpu_memory(),
        "cpu_mb": get_cpu_memory()
    }
    
    # Delete specific weights if provided
    if weights is not None:
        if isinstance(weights, list):
            for w in weights:
                del w
        else:
            del weights
    
    # Delete dataloader if provided
    if dataloader is not None:
        del dataloader
        
    # Call Python's garbage collector
    gc.collect()
    
    # Clear CUDA cache if requested and available
    if force_cuda_empty_cache and torch.cuda.is_available():
        torch.cuda.empty_cache()
        
    # Track memory after cleanup
    after = {
        "gpu_mb": get_gpu_memory(),
        "cpu_mb": get_cpu_memory()
    }
    
    freed = {
        "gpu_mb": before["gpu_mb"] - after["gpu_mb"],
        "cpu_mb": before["cpu_mb"] - after["cpu_mb"]
    }
    
    # Track memory for stats if enabled
    if _memory_tracking["tracking_enabled"]:
        track_memory_usage("after_clear_memory")
        
    return {
        "before": before,
        "after": after,
        "freed": freed
    }


def optimize_memory_usage() -> None:
    """Apply memory optimization techniques based on current configuration.
    
    This uses the global configuration to determine what optimizations to apply.
    """
    config = get_config()
    
    # Apply CPU offload if configured
    if config.memory.use_cpu_offload:
        if torch.cuda.is_available():
            # Empty CUDA cache to free up GPU memory
            torch.cuda.empty_cache()
            logger.info("Applied CPU offload: CUDA cache cleared")
            
    # Apply general memory optimizations
    clear_memory(force_cuda_empty_cache=True)
    
    # Log optimization results
    logger.info(f"Memory optimization complete. Current GPU usage: {get_gpu_memory():.2f}MB, "
               f"CPU usage: {get_cpu_memory():.2f}MB")


class MemoryTracker:
    """Context manager for tracking memory usage."""
    
    def __init__(self, tag: str = ""):
        """Initialize memory tracker.
        
        Args:
            tag: Optional name for this tracking context
        """
        self.tag = tag
        self.start_stats = {}
        
    def __enter__(self):
        """Enter context and start tracking."""
        # Track starting memory
        self.start_stats = {
            "gpu_mb": get_gpu_memory(),
            "cpu_mb": get_cpu_memory()
        }
        track_memory_usage(f"{self.tag}_start")
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context and record memory usage."""
        end_stats = {
            "gpu_mb": get_gpu_memory(),
            "cpu_mb": get_cpu_memory()
        }
        
        # Calculate difference
        diff = {
            "gpu_mb": end_stats["gpu_mb"] - self.start_stats["gpu_mb"],
            "cpu_mb": end_stats["cpu_mb"] - self.start_stats["cpu_mb"]
        }
        
        track_memory_usage(f"{self.tag}_end")
        
        logger.debug(
            f"Memory {self.tag}: GPU: {self.start_stats['gpu_mb']:.2f}MB -> "
            f"{end_stats['gpu_mb']:.2f}MB ({diff['gpu_mb']:.2f}MB change), "
            f"CPU: {self.start_stats['cpu_mb']:.2f}MB -> "
            f"{end_stats['cpu_mb']:.2f}MB ({diff['cpu_mb']:.2f}MB change)"
        )
        
        return False  # Don't suppress exceptions