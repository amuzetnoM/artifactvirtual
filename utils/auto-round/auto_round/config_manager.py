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
"""Unified configuration management for Auto-Round."""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass, field, asdict

logger = logging.getLogger(__name__)


@dataclass
class MemoryConfig:
    """Memory configuration settings."""
    
    workspace_dir: str = 'layer_wise_quantize_workspace'
    clean_weights_after_use: bool = True
    use_cpu_offload: bool = True
    gpu_batch_size: int = 16
    use_meta_tensors: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class QuantizationConfig:
    """Quantization parameters."""
    
    bits: int = 4
    group_size: int = 128
    symmetric: bool = False
    weight_dtype: str = 'int4'
    act_bits: int = 8
    act_group_size: int = 128
    act_symmetric: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class ExportConfig:
    """Export configuration settings."""
    
    export_format: str = 'autoround'  # One of: 'autoround', 'awq', 'autogptq'
    export_path: Optional[str] = None
    mixed_precision: bool = False
    interleave: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class AutoRoundConfig:
    """Centralized configuration management for Auto-Round."""
    
    memory: MemoryConfig = field(default_factory=MemoryConfig)
    quantization: QuantizationConfig = field(default_factory=QuantizationConfig)
    export: ExportConfig = field(default_factory=ExportConfig)
    
    # General settings
    model_path: Optional[str] = None
    device: str = 'auto'  # 'cpu', 'cuda', 'auto'
    
    # Global path settings
    config_path: Optional[str] = None
    output_dir: str = 'output'
    cache_dir: Optional[str] = None
    
    # Verbose output settings
    verbose: bool = False
    log_level: str = 'INFO'
    
    def __post_init__(self):
        """Initialize after setting dataclass fields."""
        # Auto-detect device if set to 'auto'
        if self.device == 'auto':
            import torch
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            
        # Use standardized paths
        if not self.cache_dir:
            self.cache_dir = os.environ.get('AUTOROUND_CACHE_DIR', 
                                           os.path.join(Path.home(), '.cache', 'auto-round'))
        
        # Configure logging based on verbose flag
        log_level = logging.DEBUG if self.verbose else getattr(logging, self.log_level)
        logging.basicConfig(level=log_level,
                           format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    def save(self, path: Optional[str] = None) -> str:
        """Save configuration to a JSON file.
        
        Args:
            path: Optional path to save the config file (defaults to self.config_path)
            
        Returns:
            Path where the config was saved
        """
        save_path = path or self.config_path
        
        if not save_path:
            save_path = os.path.join(self.output_dir, 'auto_round_config.json')
            
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
            
        logger.info(f"Configuration saved to {save_path}")
        return save_path
    
    @classmethod
    def load(cls, path: str) -> 'AutoRoundConfig':
        """Load configuration from a JSON file.
        
        Args:
            path: Path to the config file
            
        Returns:
            AutoRoundConfig instance
        """
        with open(path, 'r') as f:
            config_dict = json.load(f)
            
        # Handle nested dataclasses
        if 'memory' in config_dict and isinstance(config_dict['memory'], dict):
            config_dict['memory'] = MemoryConfig(**config_dict['memory'])
            
        if 'quantization' in config_dict and isinstance(config_dict['quantization'], dict):
            config_dict['quantization'] = QuantizationConfig(**config_dict['quantization'])
            
        if 'export' in config_dict and isinstance(config_dict['export'], dict):
            config_dict['export'] = ExportConfig(**config_dict['export'])
            
        config = cls(**config_dict)
        config.config_path = path
        return config
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the configuration to a dictionary.
        
        Returns:
            Dictionary representation of the config
        """
        result = asdict(self)
        
        # Process nested dataclasses to ensure proper serialization
        if isinstance(result['memory'], MemoryConfig):
            result['memory'] = result['memory'].to_dict()
            
        if isinstance(result['quantization'], QuantizationConfig):
            result['quantization'] = result['quantization'].to_dict()
            
        if isinstance(result['export'], ExportConfig):
            result['export'] = result['export'].to_dict()
            
        return result
    
    def update(self, **kwargs) -> None:
        """Update configuration parameters.
        
        Args:
            **kwargs: Key-value pairs to update
        """
        for key, value in kwargs.items():
            # Handle nested configs
            if '.' in key:
                section, param = key.split('.', 1)
                if hasattr(self, section) and hasattr(getattr(self, section), param):
                    setattr(getattr(self, section), param, value)
            elif hasattr(self, key):
                setattr(self, key, value)
                
        # Re-run initialization to handle any derivative settings
        self.__post_init__()


# Global default configuration
default_config = AutoRoundConfig()


def get_config() -> AutoRoundConfig:
    """Get the global configuration instance.
    
    Returns:
        The global AutoRoundConfig instance
    """
    return default_config


def configure(**kwargs) -> AutoRoundConfig:
    """Configure the global settings.
    
    Args:
        **kwargs: Configuration parameters to update
        
    Returns:
        Updated global configuration
    """
    default_config.update(**kwargs)
    return default_config


def load_config(path: str) -> AutoRoundConfig:
    """Load a configuration file and set as global config.
    
    Args:
        path: Path to config file
        
    Returns:
        Loaded configuration
    """
    global default_config
    default_config = AutoRoundConfig.load(path)
    return default_config