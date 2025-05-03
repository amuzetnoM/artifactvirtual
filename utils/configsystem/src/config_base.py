"""
Base classes for ArtifactVirtual configuration system.

This module provides the foundation for a unified configuration approach across
all ArtifactVirtual projects, supporting multiple data sources, validation,
and environment-specific configurations.
"""

import json
import os
import yaml
from pathlib import Path
from typing import Any, Dict, Optional, Union, TypeVar, Generic, Type
from dataclasses import dataclass, field, asdict

T = TypeVar('T')

class ConfigError(Exception):
    """Base exception for configuration errors."""
    pass

class ConfigValidationError(ConfigError):
    """Raised when configuration validation fails."""
    pass

class ConfigLoadError(ConfigError):
    """Raised when configuration loading fails."""
    pass

@dataclass
class ConfigSource:
    """Base class for configuration sources."""
    priority: int = 0
    
    def load(self) -> Dict[str, Any]:
        """Load configuration from this source."""
        raise NotImplementedError("Subclasses must implement load()")

@dataclass
class EnvVarSource(ConfigSource):
    """Load configuration from environment variables with optional prefix."""
    prefix: str = "AV_"
    priority: int = 100  # Higher priority than file sources
    
    def load(self) -> Dict[str, Any]:
        """Load configuration from environment variables with prefix."""
        result = {}
        for key, value in os.environ.items():
            if key.startswith(self.prefix):
                # Strip prefix and convert to lowercase for consistency
                config_key = key[len(self.prefix):].lower()
                # Handle boolean values
                if value.lower() in ("true", "yes", "1"):
                    result[config_key] = True
                elif value.lower() in ("false", "no", "0"):
                    result[config_key] = False
                # Handle numeric values
                elif value.isdigit():
                    result[config_key] = int(value)
                elif value.replace(".", "", 1).isdigit() and value.count(".") == 1:
                    result[config_key] = float(value)
                else:
                    result[config_key] = value
        return result

@dataclass
class FileSource(ConfigSource):
    """Load configuration from a file."""
    path: Union[str, Path]
    priority: int = 50  # Lower priority than environment variables
    
    def load(self) -> Dict[str, Any]:
        """Load configuration from file based on extension."""
        path = Path(self.path)
        if not path.exists():
            return {}
            
        try:
            with open(path, "r") as f:
                if path.suffix == ".json":
                    return json.load(f)
                elif path.suffix in (".yaml", ".yml"):
                    return yaml.safe_load(f) or {}
                else:
                    raise ConfigLoadError(f"Unsupported file type: {path.suffix}")
        except (json.JSONDecodeError, yaml.YAMLError) as e:
            raise ConfigLoadError(f"Error parsing {path}: {str(e)}")
        except Exception as e:
            raise ConfigLoadError(f"Error loading {path}: {str(e)}")

@dataclass
class DictSource(ConfigSource):
    """Configuration source from a dictionary."""
    values: Dict[str, Any]
    priority: int = 75  # Between env vars and files
    
    def load(self) -> Dict[str, Any]:
        """Return the dictionary values."""
        return self.values.copy()

@dataclass
class ConfigRegistry(Generic[T]):
    """Configuration manager that loads and validates configuration."""
    config_class: Type[T]
    sources: list[ConfigSource] = field(default_factory=list)
    _config: Optional[T] = None
    
    def add_source(self, source: ConfigSource) -> None:
        """Add a configuration source."""
        self.sources.append(source)
        # Sort sources by priority (highest first)
        self.sources.sort(key=lambda s: s.priority, reverse=True)
        self._config = None  # Invalidate cached config
    
    def load(self) -> T:
        """Load and merge configuration from all sources."""
        if self._config is not None:
            return self._config
            
        combined_config = {}
        for source in self.sources:
            try:
                source_config = source.load()
                # Merge configurations (higher priority sources override lower)
                combined_config.update(source_config)
            except Exception as e:
                # Log error but continue with other sources
                print(f"Error loading from {source.__class__.__name__}: {str(e)}")
                
        # Create configuration object from combined dictionary
        try:
            self._config = self.config_class(**combined_config)
            return self._config
        except Exception as e:
            raise ConfigValidationError(f"Configuration validation failed: {str(e)}")
    
    def get(self) -> T:
        """Get the current configuration, loading it if necessary."""
        if self._config is None:
            return self.load()
        return self._config
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        config = self.get()
        return asdict(config)
    
    def to_json(self) -> str:
        """Convert configuration to JSON string."""
        return json.dumps(self.to_dict(), indent=2)