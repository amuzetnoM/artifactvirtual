# API Reference

This document provides comprehensive reference documentation for the key modules and classes in the ArtifactVirtual codebase following the refactoring.

## Table of Contents

- [Configuration Management](#configuration-management)
- [Memory Management](#memory-management)
- [Model Conversion](#model-conversion)
- [Tensor Utilities](#tensor-utilities)
- [Hook Management](#hook-management)
- [Pickle Wrapper](#pickle-wrapper)

## Configuration Management

The configuration system provides a centralized way to manage settings across the codebase.

### `AutoRoundConfig`

Central configuration class that manages all settings for Auto-Round.

```python
from auto_round.config_manager import AutoRoundConfig, get_config, configure

# Create a custom configuration
config = AutoRoundConfig(
    model_path="Qwen/Qwen-14B",
    device="cuda",
    quantization={"bits": 4, "group_size": 128, "symmetric": True}
)

# Or use the global configuration
config = get_config()
```

#### Key Methods

| Method | Description |
|--------|-------------|
| `save(path=None)` | Save configuration to a JSON file |
| `load(path)` | Load configuration from a JSON file |
| `update(**kwargs)` | Update configuration parameters |
| `to_dict()` | Convert configuration to a dictionary |

#### Configuration Areas

| Area | Description | Key Parameters |
|------|-------------|----------------|
| `memory` | Memory management settings | `workspace_dir`, `clean_weights_after_use`, `use_cpu_offload`, `gpu_batch_size` |
| `quantization` | Quantization parameters | `bits`, `group_size`, `symmetric`, `weight_dtype`, `act_bits` |
| `export` | Export configuration | `export_format`, `export_path`, `mixed_precision` |

### Global Functions

| Function | Description |
|----------|-------------|
| `get_config()` | Get the global configuration instance |
| `configure(**kwargs)` | Update the global configuration |
| `load_config(path)` | Load a configuration file and set as global config |

## Memory Management

The memory management system provides tools for efficient memory usage and tracking.

### `clear_memory()`

```python
from auto_round.memory_utils import clear_memory

# Clear specific tensors
clear_memory(tensor)
clear_memory([tensor1, tensor2])

# General cleanup
clear_memory(force_cuda_empty_cache=True)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `weights` | `Optional[Union[torch.Tensor, List[torch.Tensor]]]` | Tensor(s) to explicitly delete |
| `dataloader` | `Optional[DataLoader]` | DataLoader to explicitly delete |
| `force_cuda_empty_cache` | `bool` | Whether to force CUDA cache emptying |

### `MemoryTracker`

Context manager for tracking memory usage during operations.

```python
from auto_round.memory_utils import MemoryTracker

with MemoryTracker("operation_name"):
    # Code to track
    result = process_data(data)
```

### Other Memory Functions

| Function | Description |
|----------|-------------|
| `enable_memory_tracking(enabled=True)` | Enable or disable memory usage tracking |
| `get_memory_stats()` | Get all memory statistics |
| `get_gpu_memory(device_id=None)` | Get current GPU memory usage in MB |
| `get_cpu_memory()` | Get current CPU memory usage in MB |
| `optimize_memory_usage()` | Apply memory optimization based on configuration |
| `reset_peak_memory()` | Reset peak memory tracking |

## Model Conversion

The model conversion system provides a unified interface for model loading and quantization.

### `ModelConverter`

```python
from auto_round.low_cpu_mem import ModelConverter

converter = ModelConverter(
    model_path="Qwen/Qwen-14B",
    model_class=AutoModelForCausalLM,
    device="cuda",
    save_path="workspace"
)

# Load model with efficient memory usage
model = converter.load_model_with_hooks(clean_weights=True)
```

#### Key Methods

| Method | Description |
|--------|-------------|
| `load_empty_model()` | Load an empty model with meta tensors |
| `prepare_model_for_conversion()` | Prepare the model for layer-wise conversion |
| `add_hooks(clean_weights=True)` | Add hooks for efficient weight loading and cleaning |
| `load_model_with_hooks(clean_weights=True)` | Load a model with efficient memory usage via hooks |
| `convert(inplace=False)` | Convert a model for memory-efficient inference |

### Convenience Functions

| Function | Description |
|----------|-------------|
| `convert_model(model_path, model_class, device, save_path, clean_weights=True, **kwargs)` | Convert a model for memory-efficient inference |

## Tensor Utilities

The tensor utilities provide centralized functions for tensor operations.

### `TensorUtils`

```python
from auto_round.low_cpu_mem import TensorUtils

# Save tensors
TensorUtils.save_tensor_state(module, "path/to/save.pt")

# Load tensors
state = TensorUtils.load_tensor_state("path/to/save.pt")

# Move tensors to device
TensorUtils.set_module_tensor_to_device(module, param_name, device, value)
```

#### Key Methods

| Method | Description |
|--------|-------------|
| `save_tensor_state(module, path)` | Save module state to a file |
| `load_tensor_state(path)` | Load module state from a file |
| `set_module_tensor_to_device(module, param_name, device, value, dtype=None)` | Set a module parameter to a device |
| `detect_device(device)` | Detect and validate device specification |
| `clear_memory(tensors=None)` | Clear memory for tensors |

## Hook Management

The hook management system provides tools for efficient model hooks.

### `HookManager`

```python
from auto_round.low_cpu_mem import HookManager

hook_manager = HookManager(
    model=model,
    path="model_path",
    device="cuda",
    clean_weights=True,
    save_path="workspace"
)

# Access hooks
hooks = hook_manager.handles
```

#### Key Methods

| Method | Description |
|--------|-------------|
| `register_hooks()` | Register all hooks for the model |
| `remove_hooks()` | Remove all registered hooks |
| `pre_forward_hook(module, input)` | Hook called before forward pass |
| `post_forward_hook(module, input, output)` | Hook called after forward pass |

### Convenience Functions

| Function | Description |
|----------|-------------|
| `register_hooks(model, path, device, clean_weights=True, save_path=None)` | Register hooks for a model |

## Pickle Wrapper

The pickle wrapper provides a lightweight replacement for the custom pickle implementation.

```python
from auto_round.low_cpu_mem import load, loads, dump, dumps

# Load a specific tensor from a file
tensor = load(file_path, tensor_name="module.weight")

# Load all tensors
state_dict = load(file_path)

# Standard pickle operations
dump(obj, file)
data = dumps(obj)
```

### Functions

| Function | Description |
|----------|-------------|
| `load(f, tensor_name=None, prefix=None, map_location=None, **pickle_load_args)` | Load an object or tensor from a file |
| `loads(data, tensor_name=None, **kwargs)` | Load a pickled object from bytes |
| `dump(obj, file)` | Pickle an object to a file |
| `dumps(obj)` | Pickle an object to a bytes object |