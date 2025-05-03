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
"""Unit tests for configuration management."""

import os
import json
import tempfile
import pytest

from auto_round.config_manager import (
    AutoRoundConfig, 
    MemoryConfig, 
    QuantizationConfig, 
    ExportConfig,
    get_config,
    configure,
    load_config
)


class TestConfigManager:
    """Test suite for configuration management."""
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test files."""
        with tempfile.TemporaryDirectory() as tmpdirname:
            yield tmpdirname
    
    def test_default_config(self):
        """Test default configuration values."""
        config = AutoRoundConfig()
        
        # Check memory config defaults
        assert config.memory.workspace_dir == 'layer_wise_quantize_workspace'
        assert config.memory.clean_weights_after_use is True
        assert config.memory.use_cpu_offload is True
        assert config.memory.gpu_batch_size == 16
        
        # Check quantization config defaults
        assert config.quantization.bits == 4
        assert config.quantization.group_size == 128
        assert config.quantization.symmetric is False
        assert config.quantization.weight_dtype == 'int4'
        
        # Check export config defaults
        assert config.export.export_format == 'autoround'
        assert config.export.export_path is None
        
        # Check general settings
        assert config.device.startswith('cuda') or config.device == 'cpu'
        assert config.model_path is None
        assert config.verbose is False
    
    def test_custom_config(self):
        """Test custom configuration values."""
        config = AutoRoundConfig(
            device='cpu',
            model_path='my_model',
            verbose=True,
            memory=MemoryConfig(
                workspace_dir='custom_workspace',
                clean_weights_after_use=False,
                gpu_batch_size=32
            ),
            quantization=QuantizationConfig(
                bits=8,
                group_size=64,
                symmetric=True
            ),
            export=ExportConfig(
                export_format='awq',
                export_path='/path/to/export'
            )
        )
        
        # Check memory config
        assert config.memory.workspace_dir == 'custom_workspace'
        assert config.memory.clean_weights_after_use is False
        assert config.memory.gpu_batch_size == 32
        
        # Check quantization config
        assert config.quantization.bits == 8
        assert config.quantization.group_size == 64
        assert config.quantization.symmetric is True
        
        # Check export config
        assert config.export.export_format == 'awq'
        assert config.export.export_path == '/path/to/export'
        
        # Check general settings
        assert config.device == 'cpu'
        assert config.model_path == 'my_model'
        assert config.verbose is True
    
    def test_update_config(self):
        """Test updating configuration values."""
        config = AutoRoundConfig()
        
        # Initial values
        assert config.device != 'test_device'
        assert config.quantization.bits == 4
        
        # Update values
        config.update(
            device='test_device',
            quantization={'bits': 2}
        )
        
        # Check updated values
        assert config.device == 'test_device'
        assert config.quantization.bits == 2
        
        # Test nested dot notation
        config.update(**{'quantization.group_size': 32})
        assert config.quantization.group_size == 32
    
    def test_serialize_deserialize(self, temp_dir):
        """Test serializing and deserializing configuration."""
        original_config = AutoRoundConfig(
            device='cpu',
            model_path='test_model',
            quantization={'bits': 8, 'group_size': 32}
        )
        
        # Save to file
        config_path = os.path.join(temp_dir, 'config.json')
        original_config.save(config_path)
        
        # Verify file exists and has content
        assert os.path.exists(config_path)
        with open(config_path, 'r') as f:
            content = json.load(f)
            assert content['device'] == 'cpu'
            assert content['model_path'] == 'test_model'
            assert content['quantization']['bits'] == 8
            assert content['quantization']['group_size'] == 32
        
        # Load from file
        loaded_config = AutoRoundConfig.load(config_path)
        
        # Check values
        assert loaded_config.device == 'cpu'
        assert loaded_config.model_path == 'test_model'
        assert loaded_config.quantization.bits == 8
        assert loaded_config.quantization.group_size == 32
    
    def test_global_config(self):
        """Test global configuration instance."""
        # Get default global config
        global_config = get_config()
        
        # Initial state
        initial_device = global_config.device
        initial_bits = global_config.quantization.bits
        
        # Update global config
        configure(
            device='test_global',
            quantization={'bits': 3}
        )
        
        # Check that global config was updated
        assert global_config.device == 'test_global'
        assert global_config.quantization.bits == 3
        
        # Check that get_config() returns the updated instance
        updated_config = get_config()
        assert updated_config.device == 'test_global'
        assert updated_config.quantization.bits == 3
        
        # Reset for other tests
        configure(
            device=initial_device,
            quantization={'bits': initial_bits}
        )
    
    def test_load_global_config(self, temp_dir):
        """Test loading global configuration from file."""
        # Create a custom config
        custom_config = AutoRoundConfig(
            device='custom_device',
            verbose=True
        )
        
        # Save to file
        config_path = os.path.join(temp_dir, 'global_config.json')
        custom_config.save(config_path)
        
        # Load as global config
        loaded_global = load_config(config_path)
        
        # Check that the global config was updated
        global_config = get_config()
        assert global_config.device == 'custom_device'
        assert global_config.verbose is True
        
        # Check that the return value matches global config
        assert loaded_global is global_config