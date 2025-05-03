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
"""Unified model conversion system for auto-round."""

import os
import logging
from functools import partial
from typing import Dict, Optional, Union, Any, Tuple, List, Callable

import torch
from accelerate import init_empty_weights
from transformers import AutoConfig, AutoModelForCausalLM
from transformers.models.auto.auto_factory import _BaseAutoModelClass

from .tensor_utils import TensorUtils
from .hook_manager import HookManager

logger = logging.getLogger(__name__)


class ModelConverter:
    """Unified model conversion system for efficient loading and quantization."""
    
    LWQ_WORKSPACE = 'layer_wise_quantize_workspace'
    
    def __init__(
        self,
        model_path: str = None,
        model_class=AutoModelForCausalLM,
        device: str = None,
        save_path: str = None,
        **kwargs
    ):
        """Initialize the model converter.
        
        Args:
            model_path: Path to the model to convert
            model_class: Model class to use for conversion
            device: Device to load the model on
            save_path: Path to save converted model components
            **kwargs: Additional arguments for model loading
        """
        self.model_path = model_path
        self.model_class = model_class
        self.device = TensorUtils.detect_device(device)
        
        # Set default save path if not provided
        if save_path is None:
            logger.warning(f"save_path not set, using default: {self.LWQ_WORKSPACE}")
            self.save_path = self.LWQ_WORKSPACE
        else:
            self.save_path = save_path
            
        os.makedirs(self.save_path, exist_ok=True)
        
        self.model_kwargs = kwargs
        self.model = None
        self.hook_manager = None
        
    def _validate_model_path(self) -> str:
        """Validate and resolve the model path.
        
        Returns:
            Resolved model path
        """
        from .utils import download_hf_model
        
        if self.model_path is None:
            raise ValueError("Model path must be provided")
            
        # Check if the path is a directory
        if os.path.isdir(self.model_path):
            return self.model_path
            
        # If not a directory, assume it's a Hugging Face model ID
        return download_hf_model(self.model_path)
        
    def load_empty_model(self) -> torch.nn.Module:
        """Load an empty model with meta tensors.
        
        Returns:
            Empty model with meta tensors
        """
        path = self._validate_model_path()
        torch_dtype = self.model_kwargs.pop("torch_dtype", None)
        
        # Handle different model class types
        if self.model_class.__base__ == _BaseAutoModelClass:
            config = AutoConfig.from_pretrained(path, **self.model_kwargs)
            
            # Handle 'auto' dtype setting
            if str(torch_dtype) == "auto":
                if hasattr(config, "torch_dtype") and config.torch_dtype is not None:
                    torch_dtype = config.torch_dtype
                else:
                    torch_dtype = torch.float32
                    
            # Create empty model with the config
            with init_empty_weights():
                model = self.model_class.from_config(config, torch_dtype=torch_dtype)
        else:
            config = self.model_class.config_class.from_pretrained(path, **self.model_kwargs)
            
            if hasattr(config, "torch_dtype") and config.torch_dtype is not None:
                torch_dtype = config.torch_dtype
            else:
                torch_dtype = torch.float32
                
            with init_empty_weights():
                model = self.model_class(config, torch_dtype=torch_dtype)
                
        # Perform standard model initialization
        model.tie_weights()
        model.eval()
        model.path = path
        
        # Store reference to the model
        self.model = model
        return model
        
    def prepare_model_for_conversion(self) -> torch.nn.Module:
        """Prepare the model for layer-wise conversion.
        
        Returns:
            Model prepared for conversion
        """
        if self.model is None:
            self.load_empty_model()
            
        # Apply conversion logic
        self._add_layer_access_methods()
        self._replace_to_method()
        
        return self.model
        
    def _get_named_children(self):
        """Get all named children of the model recursively.
        
        Returns:
            List of (name, module) pairs
        """
        from .utils import get_named_children
        return get_named_children(self.model)
        
    def _add_layer_access_methods(self) -> None:
        """Add methods for accessing layer weights and parameters."""
        modules = self._get_named_children()
        
        for name, module in modules:
            # Add weight getter method
            if hasattr(module, 'weight'):
                module.get_weight = partial(self._get_parameter_value, name, 'weight')
                
            # Add bias getter method if bias exists
            if hasattr(module, 'bias') and module.bias is not None:
                module.get_bias = partial(self._get_parameter_value, name, 'bias')
                
            # Add update method for saving state
            module.update = partial(self._update_module_state, name, module)
    
    def _get_parameter_value(self, name: str, param_name: str) -> torch.Tensor:
        """Get parameter value from checkpoint or cache.
        
        Args:
            name: Module name
            param_name: Parameter name
            
        Returns:
            Parameter tensor
        """
        # Try to load from saved state first
        state_dict = None
        if os.path.exists(os.path.join(self.save_path, f"{name}.pt")):
            state_dict = TensorUtils.load_tensor_state(os.path.join(self.save_path, f"{name}.pt"))
            
        # Get value from state dict or load from original model
        if state_dict and param_name in state_dict:
            value = state_dict[param_name]
        else:
            from .utils import load_value
            full_param_name = f"{name}.{param_name}"
            value = load_value(self.model, full_param_name, self.model.path)
            
        return value
        
    def _update_module_state(self, name: str, module: torch.nn.Module) -> None:
        """Update module state by loading parameters.
        
        Args:
            name: Module name
            module: Module to update
        """
        # Check if we have a cached state
        state_dict = None
        if os.path.exists(os.path.join(self.save_path, f"{name}.pt")):
            state_dict = TensorUtils.load_tensor_state(os.path.join(self.save_path, f"{name}.pt"))
            
        # Load parameters
        for param_name, param in module.named_parameters():
            # Skip if parameter is not a meta tensor
            if str(param.device) != 'meta':
                continue
                
            # Load parameter value
            full_param_name = f"{name}.{param_name}"
            if state_dict and param_name in state_dict:
                value = state_dict[param_name]
            else:
                from .utils import load_value
                value = load_value(self.model, full_param_name, self.model.path)
                
            # Set parameter value
            TensorUtils.set_module_tensor_to_device(self.model, full_param_name, 'cpu', value)
            
        # Save module state
        TensorUtils.save_tensor_state(module, os.path.join(self.save_path, f"{name}.pt"))
        
        # Save quantization info if available
        quant_info = {}
        if hasattr(module, "scale"):
            quant_info["scale"] = module.scale
        if hasattr(module, "zp"):
            quant_info["zp"] = module.zp
            
        if quant_info:
            logger.debug(f"Saving quant info for layer: {name}")
            import pickle
            with open(os.path.join(self.save_path, f"{name}_quant_info.pkl"), 'wb') as f:
                pickle.dump(quant_info, f)
    
    def _replace_to_method(self) -> None:
        """Replace the to() method with layer-wise loading implementation."""
        def _layer_wise_to(module, name, device_or_dtype):
            """Custom to() implementation that loads parameters on demand."""
            # Handle dtype conversion normally
            if isinstance(device_or_dtype, torch.dtype):
                return module.ori_to(device_or_dtype)
                
            # Handle device conversion for leaf modules
            elif len(module._modules) == 0:
                # Skip if no parameters or already loaded
                if len(module._parameters) == 0 or module.weight.device.type != 'meta':
                    return module.ori_to(device_or_dtype)
                else:
                    # Load parameters
                    for param_name, _ in module.named_parameters():
                        full_param_name = f"{name}.{param_name}"
                        value = self._get_parameter_value(name, param_name)
                        
                        # Handle dtype if module has specific dtype
                        dtype = None
                        if hasattr(module, 'dtype'):
                            dtype = module.dtype
                            
                        TensorUtils.set_module_tensor_to_device(
                            module, param_name, device_or_dtype, value, dtype=dtype
                        )
                    
                    # Load quantization info if available
                    qinfo_path = os.path.join(self.save_path, f"{name}_quant_info.pkl")
                    if os.path.exists(qinfo_path):
                        import pickle
                        with open(qinfo_path, 'rb') as f:
                            quant_info = pickle.load(f)
                            
                        if "scale" in quant_info:
                            module.scale = quant_info["scale"].to(device_or_dtype)
                        if "zp" in quant_info:
                            module.zp = quant_info["zp"].to(device_or_dtype)
                            
                    return module.ori_to(device_or_dtype)
            else:
                # Handle non-leaf modules by recursively converting children
                for child_name, child_module in module.named_children():
                    child_module.to(device_or_dtype)
                return module
                
        # Apply the replacement recursively
        def _replace_module_to(module, name):
            if len(module._modules) > 0:
                for child_name, child_module in module.named_children():
                    full_name = f"{name}.{child_name}" if name else child_name
                    _replace_module_to(child_module, full_name)
                    
            # Save original to() method and replace it
            module.ori_to = module.to
            module.to = partial(_layer_wise_to, module, name)
            
        # Start replacement from the root
        _replace_module_to(self.model, '')
        
    def add_hooks(self, clean_weights: bool = True) -> Dict:
        """Add hooks for efficient weight loading and cleaning.
        
        Args:
            clean_weights: Whether to clean weights after forward pass
            
        Returns:
            Dictionary of hook handles
        """
        if self.model is None:
            self.prepare_model_for_conversion()
            
        # Create hook manager
        self.hook_manager = HookManager(
            model=self.model,
            path=self.model.path,
            device=self.device,
            clean_weights=clean_weights,
            save_path=self.save_path
        )
        
        return self.hook_manager.handles
        
    def load_model_with_hooks(self, clean_weights: bool = True) -> torch.nn.Module:
        """Load a model with efficient memory usage via hooks.
        
        This is a convenience method combining multiple steps.
        
        Args:
            clean_weights: Whether to clean weights after forward pass
            
        Returns:
            Model with hooks for efficient memory usage
        """
        # Load empty model and add hooks
        self.load_empty_model()
        self.add_hooks(clean_weights)
        
        return self.model
        
    def convert(self, inplace: bool = False) -> torch.nn.Module:
        """Convert a model for memory-efficient inference.
        
        Args:
            inplace: Whether to modify the model in place
            
        Returns:
            Converted model
        """
        if not inplace and self.model is not None:
            import copy
            model = copy.deepcopy(self.model)
            self.model = model
            
        self.prepare_model_for_conversion()
        return self.model


# Convenience function
def convert_model(
    model_path: str,
    model_class=AutoModelForCausalLM,
    device: str = None,
    save_path: Optional[str] = None,
    clean_weights: bool = True,
    **kwargs
) -> torch.nn.Module:
    """Convert a model for memory-efficient inference.
    
    This is a convenience function that uses ModelConverter internally.
    
    Args:
        model_path: Path to the model to convert
        model_class: Model class to use for conversion
        device: Device to load the model on
        save_path: Path to save converted model components
        clean_weights: Whether to clean weights after forward pass
        **kwargs: Additional arguments for model loading
        
    Returns:
        Converted model
    """
    converter = ModelConverter(
        model_path=model_path,
        model_class=model_class,
        device=device,
        save_path=save_path,
        **kwargs
    )
    
    return converter.load_model_with_hooks(clean_weights=clean_weights)