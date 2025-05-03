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
"""
Performance profiling script to identify memory bottlenecks in the codebase.

This script helps identify memory-intensive operations using the new memory tracking
features, allowing developers to optimize problematic areas of code.
"""

import argparse
import time
import os
import json
import logging
import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer
import matplotlib.pyplot as plt

from auto_round.memory_utils import (
    MemoryTracker, 
    enable_memory_tracking,
    get_memory_stats,
    clear_memory,
    reset_peak_memory
)
from auto_round.config_manager import AutoRoundConfig, get_config, configure
from auto_round.low_cpu_mem import ModelConverter

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PerformanceProfiler:
    """Tool for profiling memory and performance across different operations."""
    
    def __init__(self, output_dir="profiling_results"):
        """Initialize the profiler.
        
        Args:
            output_dir: Directory to save profiling results.
        """
        self.output_dir = output_dir
        self.results = {}
        self.current_section = None
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Enable memory tracking
        enable_memory_tracking(True)
    
    def start_section(self, name):
        """Start a new profiling section.
        
        Args:
            name: Name of the section to profile.
        """
        self.current_section = name
        self.results[name] = {
            "operations": [],
            "total_time": 0,
            "max_gpu_memory": 0,
            "max_cpu_memory": 0
        }
        logger.info(f"Starting profiling section: {name}")
        reset_peak_memory()
    
    def profile_operation(self, operation_name, func, *args, **kwargs):
        """Profile a specific operation.
        
        Args:
            operation_name: Name of the operation to profile.
            func: Function to profile.
            args: Arguments to pass to the function.
            kwargs: Keyword arguments to pass to the function.
            
        Returns:
            Result of the function call.
        """
        if self.current_section is None:
            raise ValueError("Please start a section before profiling operations")
        
        # Track memory usage during operation
        with MemoryTracker(f"{self.current_section}/{operation_name}"):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
        
        # Get memory stats
        stats = get_memory_stats()
        duration = end_time - start_time
        
        # Store operation results
        operation_data = {
            "name": operation_name,
            "duration_seconds": duration,
            "gpu_memory_mb": stats.get("gpu_memory_mb", 0),
            "cpu_memory_mb": stats.get("cpu_memory_mb", 0),
            "peak_gpu_memory_mb": stats.get("peak_gpu_mb", 0),
            "peak_cpu_memory_mb": stats.get("peak_cpu_mb", 0),
        }
        
        # Update section results
        self.results[self.current_section]["operations"].append(operation_data)
        self.results[self.current_section]["total_time"] += duration
        self.results[self.current_section]["max_gpu_memory"] = max(
            self.results[self.current_section]["max_gpu_memory"],
            operation_data["peak_gpu_memory_mb"]
        )
        self.results[self.current_section]["max_cpu_memory"] = max(
            self.results[self.current_section]["max_cpu_memory"],
            operation_data["peak_cpu_memory_mb"]
        )
        
        logger.info(
            f"Operation: {operation_name}, "
            f"Duration: {duration:.2f}s, "
            f"GPU Memory: {operation_data['gpu_memory_mb']:.2f}MB, "
            f"CPU Memory: {operation_data['cpu_memory_mb']:.2f}MB"
        )
        
        return result
    
    def end_section(self):
        """End the current profiling section."""
        if self.current_section is None:
            return
            
        logger.info(
            f"Section {self.current_section} completed: "
            f"Total time: {self.results[self.current_section]['total_time']:.2f}s, "
            f"Max GPU Memory: {self.results[self.current_section]['max_gpu_memory']:.2f}MB, "
            f"Max CPU Memory: {self.results[self.current_section]['max_cpu_memory']:.2f}MB"
        )
        self.current_section = None
    
    def save_results(self, filename=None):
        """Save profiling results to a JSON file.
        
        Args:
            filename: Name of the file to save results to.
        """
        if filename is None:
            timestamp = time.strftime("%Y%m%d-%H%M%S")
            filename = f"profile_{timestamp}.json"
        
        file_path = os.path.join(self.output_dir, filename)
        with open(file_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        logger.info(f"Saved profiling results to {file_path}")
    
    def generate_charts(self):
        """Generate charts from profiling results."""
        if not self.results:
            logger.warning("No profiling results to generate charts from")
            return
        
        # Create charts directory
        charts_dir = os.path.join(self.output_dir, "charts")
        os.makedirs(charts_dir, exist_ok=True)
        
        # Generate charts for each section
        for section_name, section_data in self.results.items():
            if not section_data["operations"]:
                continue
                
            # Extract data for plotting
            operation_names = [op["name"] for op in section_data["operations"]]
            durations = [op["duration_seconds"] for op in section_data["operations"]]
            gpu_memory = [op["gpu_memory_mb"] for op in section_data["operations"]]
            cpu_memory = [op["cpu_memory_mb"] for op in section_data["operations"]]
            
            # Create time chart
            plt.figure(figsize=(12, 6))
            plt.bar(operation_names, durations)
            plt.title(f"{section_name} - Operation Duration")
            plt.xlabel("Operation")
            plt.ylabel("Duration (seconds)")
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(os.path.join(charts_dir, f"{section_name}_duration.png"))
            plt.close()
            
            # Create memory chart
            plt.figure(figsize=(12, 6))
            x = range(len(operation_names))
            plt.bar(x, gpu_memory, width=0.4, label="GPU Memory", align="edge")
            plt.bar([i+0.4 for i in x], cpu_memory, width=0.4, label="CPU Memory", align="edge")
            plt.title(f"{section_name} - Memory Usage")
            plt.xlabel("Operation")
            plt.ylabel("Memory Usage (MB)")
            plt.xticks([i+0.2 for i in x], operation_names, rotation=45)
            plt.legend()
            plt.tight_layout()
            plt.savefig(os.path.join(charts_dir, f"{section_name}_memory.png"))
            plt.close()
            
        logger.info(f"Generated charts in {charts_dir}")


def profile_model_load_inference(model_name, profiler):
    """Profile model loading and inference operations.
    
    Args:
        model_name: Name of the model to profile.
        profiler: PerformanceProfiler instance.
    """
    # Configure settings
    configure(
        model_path=model_name,
        memory={
            "workspace_dir": "profiling_workspace",
            "clean_weights_after_use": True
        }
    )
    
    config = get_config()
    device = config.device
    
    # Profile model loading
    profiler.start_section("model_loading")
    
    # Create converter
    converter = profiler.profile_operation(
        "create_converter",
        ModelConverter,
        model_path=config.model_path,
        device=device,
        save_path=config.memory.workspace_dir
    )
    
    # Load model
    model = profiler.profile_operation(
        "load_model_with_hooks",
        converter.load_model_with_hooks,
        clean_weights=config.memory.clean_weights_after_use
    )
    
    # Load tokenizer
    tokenizer = profiler.profile_operation(
        "load_tokenizer",
        AutoTokenizer.from_pretrained,
        config.model_path
    )
    
    profiler.end_section()
    
    # Profile inference operations
    profiler.start_section("model_inference")
    
    # Prepare input
    input_text = "Once upon a time in a galaxy far, far away,"
    
    # Tokenize
    tokens = profiler.profile_operation(
        "tokenize",
        lambda: tokenizer(input_text, return_tensors="pt").to(device)
    )
    
    # Generate
    output = profiler.profile_operation(
        "generate",
        lambda: model.generate(
            input_ids=tokens["input_ids"],
            max_new_tokens=50,
            do_sample=True,
            temperature=0.7
        )
    )
    
    # Decode
    decoded = profiler.profile_operation(
        "decode",
        lambda: tokenizer.decode(output[0], skip_special_tokens=True)
    )
    
    profiler.end_section()
    
    # Clean up
    clear_memory([model, tokenizer, tokens, output])
    
    logger.info(f"Generated text: {decoded}")
    
    return decoded


def profile_model_quantization(model_name, profiler):
    """Profile model quantization operations.
    
    Args:
        model_name: Name of the model to profile.
        profiler: PerformanceProfiler instance.
    """
    from auto_round.inference import (
        AutoRoundQuantizer, 
        quantize,
        get_supported_backends
    )
    
    # Configure settings
    configure(
        model_path=model_name,
        memory={
            "workspace_dir": "quantization_workspace",
            "clean_weights_after_use": True,
            "gpu_batch_size": 8
        },
        quantization={
            "bits": 4,
            "group_size": 128,
            "symmetric": True
        }
    )
    
    config = get_config()
    device = config.device
    
    # Profile quantization setup
    profiler.start_section("quantization_setup")
    
    # Check supported backends
    backends = profiler.profile_operation(
        "get_backends",
        get_supported_backends,
        device=device,
        sym=config.quantization.symmetric,
        bits=config.quantization.bits,
        group_size=config.quantization.group_size
    )
    
    # Create model converter
    converter = profiler.profile_operation(
        "create_converter",
        ModelConverter,
        model_path=config.model_path,
        device=device,
        save_path=config.memory.workspace_dir
    )
    
    # Load model
    model = profiler.profile_operation(
        "load_model",
        converter.load_model_with_hooks,
        clean_weights=config.memory.clean_weights_after_use
    )
    
    profiler.end_section()
    
    # Profile actual quantization
    profiler.start_section("quantization_process")
    
    # Create quantizer
    quantizer = profiler.profile_operation(
        "create_quantizer",
        AutoRoundQuantizer,
        model=model,
        bits=config.quantization.bits,
        group_size=config.quantization.group_size,
        sym=config.quantization.symmetric
    )
    
    # Prepare for quantization
    quantizer = profiler.profile_operation(
        "prepare_quantization",
        lambda: quantizer
    )
    
    # Note: We don't actually run the full quantization process here as it would be too intensive
    # Just simulate a couple of layers
    
    # Simulate quantizing one layer
    for name, module in list(model.named_modules())[:3]:
        if isinstance(module, nn.Linear) and module.weight.requires_grad:
            profiler.profile_operation(
                f"quantize_{name}",
                lambda mod=module: quantizer._quantize_weight(mod)
            )
    
    profiler.end_section()
    
    # Clean up
    clear_memory([model, quantizer])


def main():
    parser = argparse.ArgumentParser(description="Profile memory usage and performance")
    parser.add_argument("--model", type=str, default="facebook/opt-125m",
                        help="Model to profile (default: facebook/opt-125m)")
    parser.add_argument("--output-dir", type=str, default="profiling_results",
                        help="Directory to save profiling results")
    parser.add_argument("--skip-quantization", action="store_true",
                        help="Skip quantization profiling")
    parser.add_argument("--device", type=str, default=None,
                        help="Device to use for profiling (default: auto-detect)")
                        
    args = parser.parse_args()
    
    if args.device:
        configure(device=args.device)
    
    profiler = PerformanceProfiler(output_dir=args.output_dir)
    
    try:
        # Profile model loading and inference
        profile_model_load_inference(args.model, profiler)
        
        # Profile model quantization (optional)
        if not args.skip_quantization:
            profile_model_quantization(args.model, profiler)
        
        # Save results and generate charts
        profiler.save_results()
        profiler.generate_charts()
        
    except Exception as e:
        logger.error(f"Error during profiling: {str(e)}")
        raise
    
    logger.info("Profiling completed. Check the results in the output directory.")


if __name__ == "__main__":
    main()