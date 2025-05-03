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
"""Low CPU memory utilities for model loading and inference."""

# Import from the new modules
from .pickle_wrapper import load, loads, dump, dumps
from .tensor_utils import TensorUtils, load_tensor, load_tensor_from_shard
from .hook_manager import HookManager, register_hooks
from .model_converter import ModelConverter, convert_model

# Import necessary utilities for backward compatibility
from .utils import (
    get_named_children,
    update_module,
    get_layers_before_block,
    load_layer_wise_quantized_model,
    load_value,
    load_module,
    register_weight_hooks,
    clean_module_weight,
    load_empty_model,
    load_model_with_hooks,
    detect_device,
    clear_memory,
    layer_wise_save,
    layer_wise_load
)

__all__ = [
    # New unified classes
    'TensorUtils',
    'HookManager',
    'ModelConverter',
    
    # Core pickle functionality
    'load', 'loads', 'dump', 'dumps',
    
    # Model conversion
    'convert_model',
    
    # Tensor operations
    'load_tensor', 'load_tensor_from_shard',
    
    # Hook management
    'register_hooks',
    
    # Compatibility functions
    'get_named_children', 'update_module', 'get_layers_before_block',
    'load_layer_wise_quantized_model', 'load_value', 'load_module',
    'register_weight_hooks', 'clean_module_weight', 'load_empty_model',
    'load_model_with_hooks', 'detect_device', 'clear_memory',
    'layer_wise_save', 'layer_wise_load'
]
