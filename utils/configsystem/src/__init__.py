"""
ArtifactVirtual Configuration System

This package provides a unified configuration approach for ArtifactVirtual projects.
"""

from .config_base import (
    ConfigRegistry, ConfigSource, EnvVarSource,
    FileSource, DictSource, ConfigError
)
from .config_schema import (
    BaseAppConfig, PathConfig, LoggingConfig,
    APIConfig, DatabaseConfig, MemoryConfig, ModelConfig,
    create_default_config_registry
)
from .js_bridge import (
    export_config_to_json, create_js_config_loader,
    create_typescript_types
)

__all__ = [
    'ConfigRegistry', 'ConfigSource', 'EnvVarSource',
    'FileSource', 'DictSource', 'ConfigError',
    'BaseAppConfig', 'PathConfig', 'LoggingConfig',
    'APIConfig', 'DatabaseConfig', 'MemoryConfig', 'ModelConfig',
    'create_default_config_registry',
    'export_config_to_json', 'create_js_config_loader',
    'create_typescript_types',
]