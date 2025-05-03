"""
Schema definitions for the ArtifactVirtual configuration system.

This module provides schema validation for configuration using Pydantic models.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional, List, Union, Callable
try:
    from pydantic import BaseModel, Field, validator
    PYDANTIC_AVAILABLE = True
except ImportError:
    # Provide fallback using dataclasses if Pydantic is not available
    from dataclasses import dataclass as BaseModel
    PYDANTIC_AVAILABLE = False
    Field = lambda *args, **kwargs: None  # noqa
    def validator(*args, **kwargs):  # noqa
        def decorator(func):
            return func
        return decorator

from .config_base import ConfigRegistry, FileSource, EnvVarSource, DictSource

class BaseAppConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """Base configuration class for all ArtifactVirtual applications."""
    app_name: str = "artifactvirtual"
    debug: bool = False
    log_level: str = "INFO"
    env: str = "development"
    
    @validator("env")
    def validate_env(cls, v):
        """Validate environment name."""
        valid_envs = ["development", "testing", "staging", "production"]
        if v not in valid_envs:
            raise ValueError(f"Environment must be one of {valid_envs}, got {v}")
        return v

class PathConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """Configuration for file paths."""
    base_dir: Path = Path(os.path.expanduser("~/.artifactvirtual"))
    data_dir: Optional[Path] = None
    log_dir: Optional[Path] = None
    cache_dir: Optional[Path] = None
    
    def __init__(self, **data):
        """Initialize with path calculation."""
        super().__init__(**data)
        if self.data_dir is None:
            self.data_dir = self.base_dir / "data"
        if self.log_dir is None:
            self.log_dir = self.base_dir / "logs"
        if self.cache_dir is None:
            self.cache_dir = self.base_dir / "cache"

class LoggingConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """Logging configuration."""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format: str = "%Y-%m-%d %H:%M:%S"
    log_to_file: bool = False
    log_file: Optional[str] = None
    log_rotation: bool = True
    max_log_size_mb: int = 10
    backup_count: int = 5

class APIConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """API configuration."""
    host: str = "127.0.0.1"
    port: int = 8000
    base_url: str = "/api"
    enable_docs: bool = True
    enable_cors: bool = True
    cors_origins: List[str] = ["*"]
    timeout_seconds: int = 60

class DatabaseConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """Database configuration."""
    url: str = "sqlite:///artifactvirtual.db"
    pool_size: int = 5
    max_overflow: int = 10
    pool_timeout: int = 30
    pool_recycle: int = 3600
    connect_args: Dict[str, Any] = {}

class MemoryConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """Memory and caching configuration."""
    cache_enabled: bool = True
    cache_backend: str = "memory"  # "memory", "redis", "file"
    redis_url: Optional[str] = None
    ttl_seconds: int = 3600  # 1 hour
    max_memory_percent: float = 75.0
    chunk_size_kb: int = 512

class ModelConfig(BaseModel if PYDANTIC_AVAILABLE else object):
    """AI Model configuration."""
    provider: str = "ollama"  # "ollama", "openai", "azure", "huggingface", "custom"
    model_name: str = "llama2"
    model_path: Optional[str] = None
    api_key: Optional[str] = None
    api_base: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2048
    quantization: Optional[str] = None  # "q4_0", "q4_1", "q5_0", "q5_1", "q8_0"

def create_default_config_registry(
    config_class: Any,
    config_name: str,
    env_prefix: str = "AV_",
    default_values: Dict[str, Any] = None,
    config_dir: Optional[Path] = None,
) -> ConfigRegistry:
    """Create a ConfigRegistry with default sources for the given config class."""
    # Create registry
    registry = ConfigRegistry(config_class=config_class)
    
    # Add environment variables source
    registry.add_source(EnvVarSource(prefix=env_prefix))
    
    # Add default values if provided
    if default_values:
        registry.add_source(DictSource(values=default_values))
    
    # Determine config directory
    if config_dir is None:
        # Try common locations
        config_dirs = [
            Path(os.environ.get("AV_CONFIG_DIR", "")),
            Path(os.path.expanduser("~/.artifactvirtual/config")),
            Path("./config"),
        ]
        for directory in config_dirs:
            if directory.is_dir():
                config_dir = directory
                break
        else:
            # Default to current directory if none found
            config_dir = Path(".")
    
    # Add file sources with different priorities
    # Local file has highest priority among files
    local_config = config_dir / f"{config_name}.local.yaml"
    if local_config.exists():
        registry.add_source(FileSource(path=local_config, priority=60))
    
    # Environment-specific config (e.g., development.yaml, production.yaml)
    env_name = os.environ.get("AV_ENV", "development")
    env_config = config_dir / f"{config_name}.{env_name}.yaml"
    if env_config.exists():
        registry.add_source(FileSource(path=env_config, priority=40))
    
    # Base config has lowest priority
    base_config = config_dir / f"{config_name}.yaml"
    if base_config.exists():
        registry.add_source(FileSource(path=base_config, priority=20))
    
    return registry