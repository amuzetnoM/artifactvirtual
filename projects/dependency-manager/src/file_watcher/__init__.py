"""
File watching module for dependency manager.

This module provides functionality for monitoring file changes
in the workspace, with specific focus on dependency definition files.
"""

from .watcher import FileWatcher

__all__ = ["FileWatcher"]