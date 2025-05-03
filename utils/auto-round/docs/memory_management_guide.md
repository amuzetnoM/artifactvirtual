# Memory Management Guide for ArtifactVirtual

This guide explains how to use the new centralized memory management system in the ArtifactVirtual codebase.

## Overview

The ArtifactVirtual codebase now includes a unified memory management system that provides consistent memory cleanup, tracking, and optimization across all modules. This system helps prevent memory leaks, reduce memory usage, and improve performance.

## Key Components

### `clear_memory()` Function

The core function for memory cleanup. Replace direct calls to `gc.collect()`, `torch.cuda.empty_cache()`, or explicit deletion with this function.

```python
from auto_round.memory_utils import clear_memory

# Before - Old approach
import gc
del tensor
gc.collect()
if torch.cuda.is_available():
    torch.cuda.empty_cache()

# After - New approach
clear_memory(tensor)  # Handles deletion, gc.collect(), and cuda.empty_cache() automatically
```

### Memory Tracking

For performance-critical code, use the memory tracking tools to identify memory usage patterns:

```python
from auto_round.memory_utils import MemoryTracker, enable_memory_tracking

# Enable memory tracking (typically in your application's initialization code)
enable_memory_tracking(True)

# Track memory usage for a specific operation
with MemoryTracker("model_inference"):
    # Your code here
    outputs = model(**inputs)
    
# Get memory statistics
from auto_round.memory_utils import get_memory_stats
stats = get_memory_stats()
print(f"Peak GPU memory: {stats['peak_gpu_mb']} MB")
```

### Configuration Integration

Use the centralized configuration system to control memory management behavior:

```python
from auto_round.config_manager import configure, get_config
from auto_round.memory_utils import optimize_memory_usage

# Set memory configuration
configure(
    memory={
        "clean_weights_after_use": True,
        "use_cpu_offload": True,
        "gpu_batch_size": 8
    }
)

# Apply memory optimization based on configuration
optimize_memory_usage()
```

## Converting Existing Code

### Step 1: Identify Memory Management Code

Look for patterns like:
- Explicit deletion with `del`
- Calls to `gc.collect()`
- Calls to `torch.cuda.empty_cache()`
- Memory-related context managers

### Step 2: Replace with Standardized Approach

Replace these patterns with the appropriate functions:

| Old Pattern | New Replacement |
|-------------|----------------|
| `del tensor` followed by `gc.collect()` | `clear_memory(tensor)` |
| `torch.cuda.empty_cache()` | `clear_memory(force_cuda_empty_cache=True)` |
| Manual memory tracking | `MemoryTracker` context manager |

### Step 3: Add Memory Profiling Where Needed

For performance-critical operations, add memory tracking:

```python
with MemoryTracker("critical_operation"):
    # Performance-critical code
```

## Best Practices

1. **Use Configuration**: Always use the configuration system for memory settings instead of hardcoding values.

2. **Profile First**: Use memory tracking to profile memory usage before making optimizations.

3. **Batch Processing**: When processing large datasets, use batches with explicit memory cleanup between batches.

4. **Model Loading**: Use `ModelConverter` with appropriate memory configuration for loading large models.

## Example: Processing Large Datasets

```python
from auto_round.memory_utils import clear_memory, MemoryTracker
from auto_round.config_manager import get_config

config = get_config()
batch_size = config.memory.gpu_batch_size

# Process data in batches with memory tracking
for i in range(0, len(dataset), batch_size):
    with MemoryTracker(f"batch_{i}"):
        batch = dataset[i:i+batch_size]
        results = process_batch(batch)
        # Save results
        save_results(results)
        # Clean up
        clear_memory([batch, results])
```

## Example: Model Inference Pipeline

```python
from auto_round.memory_utils import clear_memory, MemoryTracker
from auto_round.low_cpu_mem import ModelConverter
from auto_round.config_manager import get_config

config = get_config()

# Load model efficiently
with MemoryTracker("model_loading"):
    converter = ModelConverter(
        model_path=config.model_path,
        device=config.device,
        save_path=config.memory.workspace_dir
    )
    model = converter.load_model_with_hooks(
        clean_weights=config.memory.clean_weights_after_use
    )

# Run inference with memory tracking
with MemoryTracker("inference"):
    outputs = model(**inputs)
    processed_results = post_process(outputs)
    
    # Clean up temporary data
    clear_memory([outputs])
    
# Final cleanup
clear_memory()
```