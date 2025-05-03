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
"""Unified hook management system for model weight loading and cleaning."""

import os
import logging
from typing import Dict, Any, Optional, Callable, List, Tuple, Union

import torch

from .tensor_utils import TensorUtils

logger = logging.getLogger(__name__)


class HookManager:
    """Centralized hook management for model weight loading and cleaning."""

    def __init__(
        self,
        model: torch.nn.Module,
        path: str,
        device: str = "cpu",
        clean_weights: bool = True,
        save_path: Optional[str] = None,
        get_modules_func: Optional[Callable] = None
    ):
        """Initialize hook manager.
        
        Args:
            model: The model to manage hooks for
            path: Path to load weights from
            device: Device to load weights to
            clean_weights: Whether to clean weights after forward pass
            save_path: Path to save module states to (if None, states won't be saved)
            get_modules_func: Function to get named modules (if None, will use utils.get_named_children)
        """
        self.model = model
        self.path = path
        self.device = device
        self.clean_weights = clean_weights
        self.save_path = save_path
        
        if save_path:
            os.makedirs(save_path, exist_ok=True)
            
        if get_modules_func is None:
            from .utils import get_named_children
            self.get_modules = get_named_children
        else:
            self.get_modules = get_modules_func
        
        self.handles = {}
        self._register_hooks()

    def _create_load_hook(self, name: str) -> Callable:
        """Create a forward pre-hook to load weights for a module.
        
        Args:
            name: Name of the module
            
        Returns:
            Hook function
        """
        def hook(module, input):
            logger.debug(f"{name} forward pre-hook loading weights")
            state_dict = None
            
            # Try to load from save path first if available
            if self.save_path and os.path.exists(os.path.join(self.save_path, f"{name}.pt")):
                state_dict = TensorUtils.load_tensor_state(os.path.join(self.save_path, f"{name}.pt"))
                
            for param_name, _ in module.named_parameters():
                full_param_name = f"{name}.{param_name}"
                # Use saved state dict if available, otherwise load from path
                if state_dict and param_name in state_dict:
                    value = state_dict[param_name]
                else:
                    from .utils import load_value
                    value = load_value(self.model, full_param_name, self.path)
                
                TensorUtils.set_module_tensor_to_device(
                    self.model, full_param_name, self.device, value
                )
            
            # Move module to desired device
            module.to(self.device)
        
        return hook
    
    def _create_clean_hook(self, name: str) -> Callable:
        """Create a forward hook to clean weights after computation.
        
        Args:
            name: Name of the module
            
        Returns:
            Hook function
        """
        def hook(module, input, output):
            logger.debug(f"{name} forward hook cleaning weights")
            
            # Save module state if save path is specified
            if self.save_path:
                TensorUtils.save_tensor_state(
                    module, os.path.join(self.save_path, f"{name}.pt")
                )
            
            # Clean module weights
            self._clean_module_weights(module)
            
        return hook
    
    def _clean_module_weights(self, module: torch.nn.Module) -> None:
        """Clean module weights by replacing with meta tensors.
        
        Args:
            module: Module to clean weights for
        """
        for param_name, param in module.named_parameters():
            is_buffer = param_name in module._buffers
            old_value = getattr(module, param_name)
            
            with torch.no_grad():
                if is_buffer:
                    module._buffers[param_name] = torch.zeros(
                        old_value.shape, device="meta"
                    )
                else:
                    param_cls = type(module._parameters[param_name])
                    kwargs = module._parameters[param_name].__dict__
                    
                    new_value = torch.zeros(old_value.shape, device="meta")
                    new_value = param_cls(
                        new_value, 
                        requires_grad=old_value.requires_grad, 
                        **kwargs
                    ).to("meta")
                    
                    module._parameters[param_name] = new_value
                    
        # Clean memory
        TensorUtils.clear_memory()
    
    def _register_hooks(self) -> None:
        """Register all hooks for modules in the model."""
        for name, module in self.get_modules(self.model):
            # Always register load hook
            load_hook = module.register_forward_pre_hook(self._create_load_hook(name))
            self.handles[name] = [load_hook]
            
            # Register clean hook if cleaning is enabled
            if self.clean_weights:
                clean_hook = module.register_forward_hook(self._create_clean_hook(name))
                self.handles[name].append(clean_hook)
    
    def remove_hooks(self) -> None:
        """Remove all registered hooks."""
        for hooks in self.handles.values():
            for hook in hooks:
                hook.remove()
        self.handles = {}


def register_hooks(
    model: torch.nn.Module,
    path: str,
    device: str = "cpu",
    clean_weights: bool = True,
    save_path: Optional[str] = None
) -> Dict[str, List]:
    """Register weight hooks on a model for efficient memory usage.
    
    A convenience function that uses HookManager internally.
    
    Args:
        model: Model to register hooks on
        path: Path to load weights from
        device: Device to load weights to
        clean_weights: Whether to clean weights after forward pass
        save_path: Path to save module states to (if None, states won't be saved)
        
    Returns:
        Dictionary of hook handles
    """
    manager = HookManager(
        model=model,
        path=path,
        device=device,
        clean_weights=clean_weights,
        save_path=save_path
    )
    return manager.handles