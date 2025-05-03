# Integrating the Centralized Configuration System

This guide explains how to adopt the new centralized configuration system (`AutoRoundConfig`) across your existing code. The new system provides a consistent, flexible approach to managing settings throughout the codebase.

## Benefits of the Centralized Configuration

- **Unified Settings:** Access all configuration through a single API
- **Type Safety:** Configuration values have proper type validation
- **Default Values:** Sensible defaults that can be overridden as needed
- **Hierarchical Structure:** Organized settings by functional area
- **Flexible Access:** Multiple ways to access settings depending on context

## Basic Usage

### Getting Started

```python
from auto_round.config_manager import configure, get_config

# Set configuration values
configure(
    model_path="facebook/opt-1.3b",
    device="cuda",
    memory={
        "workspace_dir": "my_workspace",
        "clean_weights_after_use": True
    },
    quantization={
        "bits": 4,
        "group_size": 128,
        "symmetric": True
    }
)

# Access configuration values
config = get_config()
print(f"Using model: {config.model_path}")
print(f"Quantization bits: {config.quantization.bits}")
```

### Configuration Sections

The configuration is organized into logical sections:

- **Core Settings:** Model path, device, etc.
- **Memory Management:** Workspace directory, cleanup behavior
- **Quantization:** Bit precision, group size, symmetry settings
- **Training:** Batch size, learning rate, etc.
- **Export:** Format options, optimization levels

## Migration Steps

### Step 1: Import the Configuration Module

Replace direct parameter definitions with imports from the configuration system:

```python
# Before
def process_model(model_path, device="cuda", bits=4, group_size=128):
    # ...

# After
from auto_round.config_manager import get_config

def process_model():
    config = get_config()
    model_path = config.model_path
    device = config.device
    bits = config.quantization.bits
    group_size = config.quantization.group_size
    # ...
```

### Step 2: Configure Settings at Entry Points

Set configuration values at application entry points:

```python
# In main.py or similar entry point
from auto_round.config_manager import configure

def main():
    # Parse command line arguments
    args = parse_args()
    
    # Configure settings based on arguments
    configure(
        model_path=args.model_path,
        device=args.device,
        memory={
            "workspace_dir": args.workspace_dir,
            "clean_weights_after_use": args.clean_weights
        },
        # Other settings...
    )
    
    # Now all components will use these settings
    run_pipeline()
```

### Step 3: Remove Redundant Parameters

Simplify function signatures by removing parameters that can be accessed from the config:

```python
# Before
def quantize_model(model, bits=4, group_size=128, sym=False):
    # ...

# After
from auto_round.config_manager import get_config

def quantize_model(model):
    config = get_config()
    bits = config.quantization.bits
    group_size = config.quantization.group_size
    sym = config.quantization.symmetric
    # ...
```

### Step 4: Use Configuration-Aware Components

Leverage components that are already integrated with the configuration system:

```python
from auto_round.memory_utils import setup_workspace
from auto_round.inference import AutoRoundQuantizer

# Workspace automatically uses config.memory settings
workspace = setup_workspace()

# Quantizer automatically uses config.quantization settings
quantizer = AutoRoundQuantizer(model)
```

## Advanced Usage

### Environment-Specific Configurations

Load different configurations based on the environment:

```python
import os
from auto_round.config_manager import configure, load_config_file

# Load environment-specific configuration
env = os.environ.get("AUTO_ROUND_ENV", "development")
config_file = f"configs/{env}.json"

# Load and apply configuration
if os.path.exists(config_file):
    load_config_file(config_file)
else:
    # Use defaults with environment-specific overrides
    configure(
        memory={"workspace_dir": f"workspace_{env}"}
    )
```

### Temporary Configuration Changes

Make temporary changes to configuration for specific operations:

```python
from auto_round.config_manager import get_config, configure, temp_config

# Current configuration
current_bits = get_config().quantization.bits

# Temporarily use different settings
with temp_config(quantization={"bits": 8}):
    # Code here uses 8-bit quantization
    process_model()

# Outside the context manager, back to original settings
assert get_config().quantization.bits == current_bits
```

## Best Practices

1. **Configure Early:** Set configuration at the beginning of execution flow
2. **Minimize Parameters:** Avoid passing configuration as parameters when possible
3. **Validate Settings:** Verify important settings at key checkpoints
4. **Document Requirements:** Note any specific configuration requirements in docstrings
5. **Provide Defaults:** Always ensure reasonable defaults for all settings

## Troubleshooting

### Common Issues

- **Missing Configuration:** If a component can't find expected configuration, ensure `configure()` is called before accessing the configuration.
- **Type Errors:** Configuration values have type validation; ensure you're providing the correct types.
- **Overriding Defaults:** To override a nested default setting, specify the entire path to that setting.

### Getting Help

For additional assistance with the configuration system:

- Review the API documentation in `docs/api/config_manager.md`
- See examples in `examples/configuration/`
- Check test cases in `tests/test_config_manager.py`

## Configuration Schema Reference

See the [Configuration Schema Documentation](../api/configuration_schema.md) for a complete reference of all available configuration options and their default values.