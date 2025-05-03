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
"""Example script demonstrating how to use the centralized configuration system."""

import os
import logging
import torch
from auto_round.config_manager import get_config, configure, load_config
from auto_round.memory_utils import MemoryTracker, clear_memory, enable_memory_tracking
from auto_round.low_cpu_mem import ModelConverter

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def basic_configuration_example():
    """Demonstrates basic configuration operations."""
    # Get the global configuration (default values)
    config = get_config()
    logger.info(f"Default device: {config.device}")
    logger.info(f"Default bits: {config.quantization.bits}")
    
    # Update configuration values
    configure(
        device="cuda" if torch.cuda.is_available() else "cpu",
        model_path="Qwen/Qwen-14B",
        quantization={"bits": 4, "group_size": 128, "symmetric": True},
        memory={"clean_weights_after_use": True, "use_cpu_offload": True}
    )
    
    logger.info(f"Updated device: {config.device}")
    logger.info(f"Updated bits: {config.quantization.bits}")
    logger.info(f"Updated group_size: {config.quantization.group_size}")
    
    # Save configuration to a file
    config_path = config.save("./auto_round_config.json")
    logger.info(f"Configuration saved to: {config_path}")
    
    # Load configuration from file
    loaded_config = load_config(config_path)
    logger.info(f"Loaded configuration device: {loaded_config.device}")
    logger.info(f"Loaded configuration bits: {loaded_config.quantization.bits}")
    
    # Clean up the config file
    os.remove(config_path)

def model_conversion_with_config():
    """Demonstrates using the configuration system with model conversion."""
    # Configure settings for model conversion
    configure(
        device="cpu",
        memory={
            "workspace_dir": "conversion_workspace",
            "clean_weights_after_use": True
        },
        quantization={
            "bits": 4,
            "group_size": 128,
            "symmetric": True
        }
    )
    
    config = get_config()
    logger.info("Configuration for model conversion:")
    logger.info(f"  Device: {config.device}")
    logger.info(f"  Workspace: {config.memory.workspace_dir}")
    logger.info(f"  Quantization: {config.quantization.bits}-bit, group size {config.quantization.group_size}")
    
    # Usage with ModelConverter would look like:
    # converter = ModelConverter(
    #     model_path=config.model_path, 
    #     device=config.device,
    #     save_path=config.memory.workspace_dir
    # )
    # model = converter.load_model_with_hooks(clean_weights=config.memory.clean_weights_after_use)

def memory_management_with_config():
    """Demonstrates using the configuration system with memory management."""
    # Configure memory settings
    configure(
        memory={
            "clean_weights_after_use": True,
            "use_cpu_offload": True
        },
        verbose=True
    )
    
    config = get_config()
    
    # Enable memory tracking if verbose is enabled
    if config.verbose:
        enable_memory_tracking(True)
    
    # Use memory tracking with configuration
    with MemoryTracker("example_operation"):
        # Create a sample tensor
        x = torch.randn(1000, 1000)
        y = x @ x.T
        
        # Clear memory according to configuration
        if config.memory.clean_weights_after_use:
            clear_memory([x, y])
    
    # Memory stats would be logged automatically due to verbose mode

if __name__ == "__main__":
    logger.info("=== Basic Configuration Example ===")
    basic_configuration_example()
    
    logger.info("\n=== Model Conversion Example ===")
    model_conversion_with_config()
    
    logger.info("\n=== Memory Management Example ===")
    memory_management_with_config()