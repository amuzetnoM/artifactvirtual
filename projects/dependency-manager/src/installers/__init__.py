"""
Package installer modules for dependency manager.

This package contains installer implementations for different languages
and package managers (Python, JavaScript, Rust).
"""

from .js_installer import JavaScriptInstaller
from .python import PythonInstaller
from .rust import RustInstaller

__all__ = ["JavaScriptInstaller", "PythonInstaller", "RustInstaller"]