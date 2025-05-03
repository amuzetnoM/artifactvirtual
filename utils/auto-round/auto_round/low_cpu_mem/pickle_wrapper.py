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
"""Pickle wrapper for selective tensor loading.

This module provides a lightweight wrapper around the standard pickle module
to enable selective loading of tensors from PyTorch model files.
"""

import io
import os
import pickle
import warnings
from typing import Any, BinaryIO, Callable, Dict, IO, Optional, Union

import torch
from torch.serialization import (
    StorageType,
    _get_restore_location,
    _is_zipfile,
    _is_torchscript_zip,
    _maybe_decode_ascii,
    _open_file_like,
    _open_zipfile_reader,
)

FILE_LIKE = Union[str, os.PathLike, BinaryIO, IO[bytes]]
MAP_LOCATION = Optional[Union[Callable[[torch.Tensor, str], torch.Tensor], torch.device, str, Dict[str, str]]]


class TensorSelectiveUnpickler(pickle.Unpickler):
    """Extension of standard Unpickler that supports selective tensor loading."""
    
    def __init__(self, file, tensor_name=None, **kwargs):
        """Initialize the selective unpickler.
        
        Args:
            file: File-like object to unpickle from
            tensor_name: Optional tensor name to selectively load
            **kwargs: Additional keyword arguments passed to pickle.Unpickler
        """
        super().__init__(file, **kwargs)
        self.tensor_name = tensor_name
        self.metastack = []
        
    def find_class(self, mod_name, name):
        """Override to handle special Storage classes."""
        if isinstance(name, str) and "Storage" in name:
            try:
                return StorageType(name)
            except KeyError:
                pass
                
        # Handle special case for torch.tensor vs torch._tensor
        if mod_name == "torch.tensor":
            mod_name = "torch._tensor"
            
        return super().find_class(mod_name, name)

    def persistent_load(self, saved_id):
        """Custom persistent_load to handle selective tensor loading."""
        if not isinstance(saved_id, tuple):
            return super().persistent_load(saved_id)
            
        typename = _maybe_decode_ascii(saved_id[0])
        if typename != "storage":
            return super().persistent_load(saved_id)
            
        storage_type, key, location, numel = saved_id[1:]
        
        # Get dtype from storage type
        if storage_type is torch.UntypedStorage:
            dtype = torch.uint8
        else:
            dtype = storage_type.dtype
            
        # If tensor_name is provided and doesn't match the current tensor being processed,
        # return None to skip loading this tensor
        should_load = True
        if self.tensor_name:
            name_list = [self.tensor_name]
            if len(self.metastack) > 0 and len(self.metastack[-1]) > 1:
                if self.metastack[-1][-2] not in name_list:
                    should_load = False
                    
        if should_load:
            # This is where we would normally load the tensor from storage
            # For now, we defer to the standard PyTorch loader
            pass
        else:
            # Return None for tensors we don't want to load
            return None
            
        return super().persistent_load(saved_id)
        
    def load(self):
        """Load the pickled data.
        
        Returns:
            The unpickled object.
        """
        self.stack = []
        self.append = self.stack.append
        self.metastack = []
        result = super().load()
        return result
        
    def mark(self):
        """Store and restore stack state on a marker."""
        super().mark()
        self.metastack.append(self.stack)
    
    def pop_mark(self):
        """Pop marker from metastack."""
        result = self.stack
        self.stack = self.metastack.pop()
        self.append = self.stack.append
        return result


def _load_from_zipfile(zip_file, tensor_name=None, prefix=None, map_location=None, **pickle_load_args):
    """Load specifically from a zip file format, used by PyTorch.
    
    Args:
        zip_file: ZipFile reader
        tensor_name: Name of tensor to load (if None, loads all tensors)
        prefix: Optional prefix for tensor name
        map_location: Optional device mapping
        **pickle_load_args: Additional arguments for unpickling
        
    Returns:
        The loaded object or tensor
    """
    pickle_file = "data.pkl"
    data_file = io.BytesIO(zip_file.get_record(pickle_file))
    
    unpickler = TensorSelectiveUnpickler(data_file, tensor_name=tensor_name, **pickle_load_args)
    result = unpickler.load()
    
    # Validate sparse tensors as in the original PyTorch code
    torch._utils._validate_loaded_sparse_tensors()
    
    return result


def load(
    f: FILE_LIKE,
    tensor_name: str = None,
    prefix: str = None,
    map_location: MAP_LOCATION = None,
    **pickle_load_args
) -> Any:
    """Load an object or specific tensor from a pickle file.
    
    Args:
        f: A file-like object
        tensor_name: Name of tensor to load (if None, loads all tensors)
        prefix: Optional prefix for tensor name
        map_location: Optional device mapping
        **pickle_load_args: Additional arguments for unpickling
        
    Returns:
        The loaded object or tensor
    """
    if "encoding" not in pickle_load_args:
        pickle_load_args["encoding"] = "utf-8"
        
    with _open_file_like(f, "rb") as opened_file:
        if _is_zipfile(opened_file):
            # Handle PyTorch ZIP format
            with _open_zipfile_reader(opened_file) as opened_zipfile:
                if _is_torchscript_zip(opened_zipfile):
                    warnings.warn(
                        "'load' received a zip file that looks like a TorchScript archive. "
                        "This is likely a PyTorch JIT model file. Use torch.jit.load() to load "
                        "these files instead.", UserWarning
                    )
                    return None
                    
                return _load_from_zipfile(
                    opened_zipfile,
                    tensor_name=tensor_name,
                    prefix=prefix,
                    map_location=map_location,
                    **pickle_load_args
                )
        else:
            # Handle standard pickle file
            unpickler = TensorSelectiveUnpickler(opened_file, tensor_name=tensor_name, **pickle_load_args)
            return unpickler.load()


def loads(data: bytes, tensor_name: str = None, **kwargs) -> Any:
    """Load a pickled object from bytes.
    
    Args:
        data: Pickle data as bytes
        tensor_name: Name of tensor to load (if None, loads all tensors)
        **kwargs: Additional arguments for unpickling
        
    Returns:
        The unpickled object or tensor
    """
    if isinstance(data, str):
        raise TypeError("Cannot load pickle from a string; use bytes instead")
        
    file_obj = io.BytesIO(data)
    return load(file_obj, tensor_name=tensor_name, **kwargs)


# Re-export standard pickle dump functions
dump = pickle.dump
dumps = pickle.dumps