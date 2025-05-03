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
"""Centralized tensor persistence utilities."""

import os
import io
import gc
import json
import pickle
from collections import OrderedDict
from typing import Dict, Optional, Union, Any

import torch
from accelerate.utils import set_module_tensor_to_device
from transformers import AutoModelForCausalLM

from .pickle_wrapper import load as pickle_load


class TensorUtils:
    """Centralized utilities for tensor persistence and device management."""
    
    @staticmethod
    def save_tensor_state(model, file_path: str) -> None:
        """Save model tensor state to a file.
        
        Args:
            model: The model containing the tensor states to save
            file_path: Path to save the tensor state
        """
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        torch.save(model.state_dict(), file_path)
    
    @staticmethod
    def load_tensor_state(file_path: str, map_location=None) -> Dict:
        """Load tensor state from a file.
        
        Args:
            file_path: Path to the saved tensor state
            map_location: Optional device mapping for tensors
            
        Returns:
            Dictionary containing the loaded tensor state
        """
        if not os.path.exists(file_path):
            return {}
        return torch.load(file_path, map_location=map_location)
    
    @staticmethod
    def layer_wise_save(model, path: str) -> None:
        """Save model tensors layer by layer for efficient loading.
        
        Args:
            model: The model to save
            path: Directory to save the model
        """
        from .utils import get_named_children  # Import here to avoid circular imports
        
        os.makedirs(path, exist_ok=True)
        file_path = os.path.join(path, 'layer_wise_model.bin')
        modules = get_named_children(model)
        
        with open(file_path, 'wb') as f:
            for name, module in modules:
                output = OrderedDict()
                if hasattr(module, "get_weight"):
                    output[f"{name}.weight"] = module.get_weight()
                if hasattr(module, "get_bias"):
                    output[f"{name}.bias"] = module.get_bias()
                output = pickle.dumps(output)
                f.write(output + b'split_tag')
    
    @staticmethod
    def layer_wise_load(path: str) -> Dict:
        """Load model tensors saved layer by layer.
        
        Args:
            path: Directory where the model was saved
            
        Returns:
            Dictionary containing the loaded tensor state
        """
        file_path = os.path.join(path, 'layer_wise_model.bin')
        state_dict = OrderedDict()
        
        with open(file_path, 'rb') as f:
            data = f.read().split(b'split_tag')
            for d in data:
                if len(d) > 0:
                    d = pickle.loads(d)
                    state_dict.update(d)
        return state_dict
    
    @staticmethod
    def load_tensor(path: str, tensor_name: str = None, prefix: str = None) -> Union[Dict, torch.Tensor]:
        """Load a specific tensor from PyTorch model file.
        
        Args:
            path: Path to model file or directory
            tensor_name: Name of tensor to load (if None, loads all tensors)
            prefix: Optional prefix for tensor name
            
        Returns:
            Tensor or state dict
        """
        # Handle tensor name adjustments for legacy compatibility
        if tensor_name:
            if "gamma" in tensor_name:  # pragma: no cover
                tensor_name = tensor_name.replace("gamma", "weight")
            if "beta" in tensor_name:  # pragma: no cover
                tensor_name = tensor_name.replace("beta", "bias")

        # Handle directory or file
        if os.path.isdir(path):
            path = os.path.join(path, "pytorch_model.bin")
        
        state_dict = pickle_load(path, tensor_name, prefix)
        
        if tensor_name:
            if tensor_name in state_dict:
                return state_dict[tensor_name]
            else:  # pragma: no cover
                return state_dict[tensor_name.replace(f"{prefix}.", "")]
        else:  # pragma: no cover
            return state_dict
    
    @staticmethod
    def load_tensor_from_shard(path: str, tensor_name: str, prefix: str = None) -> Union[Dict, torch.Tensor]:
        """Load tensor from a sharded model.
        
        Args:
            path: Path to model directory
            tensor_name: Name of tensor to load
            prefix: Optional prefix for tensor name
            
        Returns:
            Tensor or state dict
        """
        idx_dict = json.load(open(os.path.join(path, "pytorch_model.bin.index.json"), "r"))["weight_map"]
        
        if tensor_name not in idx_dict.keys():
            if tensor_name.replace(f"{prefix}.", "") in idx_dict.keys():
                tensor_name = tensor_name.replace(f"{prefix}.", "")
            else:
                assert False, f"{tensor_name} not in the index.json"
                
        return TensorUtils.load_tensor(
            os.path.join(path, idx_dict[tensor_name]), 
            tensor_name, 
            None
        )
    
    @staticmethod
    def set_module_tensor_to_device(model, tensor_name: str, device: str, value: torch.Tensor, dtype=None) -> None:
        """Set a specific tensor to the given device.
        
        Args:
            model: Model containing the tensor
            tensor_name: Name of the tensor to set
            device: Target device
            value: Tensor value to set
            dtype: Optional data type to convert tensor to
        """
        if dtype is not None:
            value = value.to(dtype)
        set_module_tensor_to_device(model, tensor_name, device, value)
    
    @staticmethod
    def clear_memory(weight=None):
        """Free memory resources.
        
        Args:
            weight: Optional weight tensor to explicitly delete
        """
        if weight is not None:
            del weight
        gc.collect()
        torch.cuda.empty_cache()
    
    @staticmethod
    def detect_device(device=None):
        """Detect the best available device.
        
        Args:
            device: Optional device preference
            
        Returns:
            Device string for tensor operations
        """
        if device is not None:
            return device
            
        if torch.cuda.is_available():
            return "cuda"
        elif hasattr(torch, "hpu") and torch.hpu.is_available():
            return "hpu"
        else:
            return "cpu"


# Convenience functions for backward compatibility
def layer_wise_save(model, path):
    """Backward compatible wrapper for TensorUtils.layer_wise_save"""
    return TensorUtils.layer_wise_save(model, path)

def layer_wise_load(path):
    """Backward compatible wrapper for TensorUtils.layer_wise_load"""
    return TensorUtils.layer_wise_load(path)

def load_tensor(path, tensor_name=None, prefix=None):
    """Backward compatible wrapper for TensorUtils.load_tensor"""
    return TensorUtils.load_tensor(path, tensor_name, prefix)

def load_tensor_from_shard(path, tensor_name, prefix=None):
    """Backward compatible wrapper for TensorUtils.load_tensor_from_shard"""
    return TensorUtils.load_tensor_from_shard(path, tensor_name, prefix)

def clear_memory(weight=None):
    """Backward compatible wrapper for TensorUtils.clear_memory"""
    return TensorUtils.clear_memory(weight)

def detect_device(device=None):
    """Backward compatible wrapper for TensorUtils.detect_device"""
    return TensorUtils.detect_device(device)