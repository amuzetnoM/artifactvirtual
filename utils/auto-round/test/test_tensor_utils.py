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
"""Unit tests for TensorUtils class."""

import os
import pytest
import tempfile
import torch
import torch.nn as nn

from auto_round.low_cpu_mem import TensorUtils


class SimpleModel(nn.Module):
    """Simple model for testing tensor operations."""
    
    def __init__(self):
        super().__init__()
        self.linear1 = nn.Linear(10, 20)
        self.linear2 = nn.Linear(20, 5)
        
    def forward(self, x):
        x = self.linear1(x)
        x = torch.relu(x)
        x = self.linear2(x)
        return x


class TestTensorUtils:
    """Test suite for TensorUtils."""
    
    @pytest.fixture
    def model(self):
        """Create a test model."""
        return SimpleModel()
    
    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for test files."""
        with tempfile.TemporaryDirectory() as tmpdirname:
            yield tmpdirname
    
    def test_save_load_tensor_state(self, model, temp_dir):
        """Test saving and loading tensor state."""
        # Save model state
        save_path = os.path.join(temp_dir, "model_state.pt")
        TensorUtils.save_tensor_state(model, save_path)
        
        # Verify file exists
        assert os.path.exists(save_path)
        
        # Create a new model instance
        new_model = SimpleModel()
        
        # Verify weights are different
        assert not torch.all(
            torch.eq(
                model.linear1.weight, 
                new_model.linear1.weight
            )
        )
        
        # Load state into new model
        state_dict = TensorUtils.load_tensor_state(save_path)
        new_model.load_state_dict(state_dict)
        
        # Verify weights are now the same
        assert torch.all(
            torch.eq(
                model.linear1.weight, 
                new_model.linear1.weight
            )
        )
    
    def test_save_load_sharded(self, model, temp_dir):
        """Test saving and loading sharded tensor state."""
        # Save model state with sharding
        save_path = os.path.join(temp_dir, "sharded")
        TensorUtils.layer_wise_save(model, save_path)
        
        # Verify files exist
        assert os.path.exists(os.path.join(save_path, "linear1.weight.pt"))
        assert os.path.exists(os.path.join(save_path, "linear1.bias.pt"))
        assert os.path.exists(os.path.join(save_path, "linear2.weight.pt"))
        assert os.path.exists(os.path.join(save_path, "linear2.bias.pt"))
        
        # Create a new model instance
        new_model = SimpleModel()
        
        # Load sharded state
        TensorUtils.layer_wise_load(new_model, save_path)
        
        # Verify weights are now the same
        assert torch.all(
            torch.eq(
                model.linear1.weight, 
                new_model.linear1.weight
            )
        )
        assert torch.all(
            torch.eq(
                model.linear2.weight, 
                new_model.linear2.weight
            )
        )
    
    def test_set_module_tensor_to_device(self, model):
        """Test setting tensor to device."""
        # Create test tensor
        test_tensor = torch.randn(20, 10)
        
        # Set tensor to model parameter
        TensorUtils.set_module_tensor_to_device(
            model, 
            "linear1.weight", 
            "cpu", 
            test_tensor
        )
        
        # Verify the parameter was updated
        assert torch.all(torch.eq(model.linear1.weight, test_tensor))

    def test_detect_device(self):
        """Test device detection."""
        # Test CPU detection
        device = TensorUtils.detect_device("cpu")
        assert device == "cpu"
        
        # Test auto detection (should return a valid device string)
        device = TensorUtils.detect_device("auto")
        assert isinstance(device, str)
        assert device in ["cpu", "cuda", "cuda:0"] or device.startswith("cuda:")
        
        # Test invalid device
        with pytest.raises(ValueError):
            TensorUtils.detect_device("invalid_device")
            
    def test_clear_memory(self):
        """Test memory cleanup."""
        # Create test tensors
        t1 = torch.randn(1000, 1000)
        t2 = torch.randn(1000, 1000)
        
        # Keep references for testing
        t1_id = id(t1)
        t2_id = id(t2)
        
        # Clear memory for specific tensor
        TensorUtils.clear_memory(t1)
        
        # Clear memory for general cleanup
        # Note: We can only verify the function runs without error,
        # not that it actually freed memory
        TensorUtils.clear_memory()