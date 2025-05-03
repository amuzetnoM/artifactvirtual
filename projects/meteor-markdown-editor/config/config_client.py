"""
Configuration client for the Meteor Markdown Editor.

This module demonstrates how to use the ConfigSystem in a Python project.
"""

import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

# Add utils directory to path so we can import configsystem
# In a real project, you would install the configsystem package properly
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from utils.configsystem.src.config_base import ConfigRegistry, FileSource, EnvVarSource, DictSource
from utils.configsystem.src.js_bridge import export_config_to_json, create_js_config_loader

@dataclass
class AIAssistantConfig:
    """AI Assistant feature configuration."""
    enabled: bool = True
    default_model: str = "local-distilgpt2"
    show_model_details: bool = False

@dataclass
class SourceControlConfig:
    """Source control feature configuration."""
    enabled: bool = True
    auto_commit: bool = False
    commit_interval_minutes: int = 30

@dataclass
class FeaturesConfig:
    """Features configuration."""
    ai_assistant: AIAssistantConfig = AIAssistantConfig()
    source_control: SourceControlConfig = SourceControlConfig()

@dataclass
class UIConfig:
    """User interface configuration."""
    theme: str = "system"
    default_preview_mode: str = "split"
    sidebar_open_by_default: bool = True
    show_line_numbers: bool = True
    font_size: int = 16
    font_family: str = "system-ui, sans-serif"
    highlight_current_line: bool = True
    enable_syntax_highlighting: bool = True

@dataclass
class EditorConfig:
    """Editor behavior configuration."""
    tab_size: int = 2
    use_tabs: bool = False
    word_wrap: bool = True
    spell_check: bool = True
    auto_format_on_save: bool = False
    markdown_extensions: List[str] = None
    
    def __post_init__(self):
        if self.markdown_extensions is None:
            self.markdown_extensions = ["tables", "strikethrough", "autolink", "tasklists"]

@dataclass
class ApiConfig:
    """API connection configuration."""
    base_url: str = "http://localhost:3001"
    timeout_ms: int = 30000
    retry_attempts: int = 3
    retry_delay_ms: int = 1000

@dataclass
class StorageConfig:
    """Storage configuration."""
    save_location: str = "local"
    local_storage_key: str = "meteor-markdown-editor"
    backup_interval_minutes: int = 10
    max_backup_count: int = 5

@dataclass
class GithubConfig:
    """GitHub integration configuration."""
    client_id: str = ""
    redirect_uri: str = "http://localhost:5173/auth/callback"

@dataclass
class IntegrationsConfig:
    """External integrations configuration."""
    github: GithubConfig = GithubConfig()
    dev_to: Dict[str, Any] = None
    hashnode: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.dev_to is None:
            self.dev_to = {"api_key": ""}
        if self.hashnode is None:
            self.hashnode = {"api_key": ""}

@dataclass
class AppConfig:
    """Main application configuration."""
    name: str = "Meteor Markdown Editor"
    version: str = "1.0.0"
    debug: bool = False
    auto_save_interval_ms: int = 5000

@dataclass
class MeteorMarkdownConfig:
    """Root configuration class for Meteor Markdown Editor."""
    app: AppConfig = AppConfig()
    ui: UIConfig = UIConfig()
    features: FeaturesConfig = FeaturesConfig()
    editor: EditorConfig = EditorConfig()
    api: ApiConfig = ApiConfig()
    storage: StorageConfig = StorageConfig()
    integrations: IntegrationsConfig = IntegrationsConfig()

def create_config_registry() -> ConfigRegistry:
    """Create and initialize the configuration registry."""
    registry = ConfigRegistry(config_class=MeteorMarkdownConfig)
    
    # Add environment variables source (highest priority)
    # Uses MM_ prefix for environment variables
    registry.add_source(EnvVarSource(prefix="MM_"))
    
    # Add configuration files
    config_dir = Path(__file__).parent
    
    # Development-specific config
    env_config = config_dir / "meteor-markdown.development.yaml"
    if env_config.exists():
        registry.add_source(FileSource(path=env_config, priority=60))
    
    # Base config
    base_config = config_dir / "meteor-markdown.yaml"
    if base_config.exists():
        registry.add_source(FileSource(path=base_config, priority=50))
        
    return registry

def generate_js_config(config_registry: ConfigRegistry) -> None:
    """Generate JavaScript configuration files."""
    # Export configuration to JSON
    config_dir = Path(__file__).parent
    json_path = config_dir / "meteor-markdown-config.json"
    export_config_to_json(config_registry, str(json_path))
    
    # Generate JavaScript loader
    js_loader_code = create_js_config_loader("./config/meteor-markdown-config.json")
    js_loader_path = config_dir / "configLoader.js"
    with open(js_loader_path, "w") as f:
        f.write(js_loader_code)
    
    print(f"Generated configuration files:")
    print(f" - JSON config: {json_path}")
    print(f" - JS loader: {js_loader_path}")

if __name__ == "__main__":
    # Create and load configuration
    registry = create_config_registry()
    config = registry.get()
    
    # Print configuration
    print("Meteor Markdown Editor Configuration:")
    print(f"App Name: {config.app.name}")
    print(f"Version: {config.app.version}")
    print(f"Theme: {config.ui.theme}")
    print(f"AI Assistant Enabled: {config.features.ai_assistant.enabled}")
    
    # Generate JavaScript configuration
    generate_js_config(registry)