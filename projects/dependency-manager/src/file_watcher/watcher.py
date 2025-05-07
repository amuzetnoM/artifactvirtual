"""
File watcher implementation for the dependency manager.

This module provides a file watching system that monitors the file system
for changes in dependency definition files like requirements.txt, package.json, etc.
It uses debouncing to avoid excessive processing when files change rapidly.
"""

import os
import asyncio
import glob
import fnmatch
import logging
import time
from typing import List, Dict, Set, Callable, Any, Optional, Tuple, Union
from collections import defaultdict
from functools import partial

logger = logging.getLogger(__name__)

class FileWatcher:
    """
    Watches for file changes in the workspace.
    
    This class monitors file system changes for dependency definition files
    like requirements.txt, package.json, etc., and triggers callbacks when
    changes are detected.
    
    Attributes:
        workspace_root: Root directory of the workspace to watch
        patterns: List of file patterns to watch (e.g., "requirements.txt")
        ignore_patterns: List of patterns to ignore
        callback: Function to call when a change is detected
        scan_interval: How often to check for changes (seconds)
        debounce_seconds: How long to wait for further changes before processing
        running: Whether the watcher is running
        watch_task: Asyncio task for the watcher
        pending_changes: Dictionary tracking pending file changes
    """
    
    def __init__(
        self,
        workspace_root: str,
        patterns: List[str],
        ignore_patterns: List[str] = None,
        callback: Callable[[str, str], Any] = None,
        scan_interval: float = 2.0,
        debounce_seconds: float = 1.0
    ):
        """
        Initialize the file watcher.
        
        Args:
            workspace_root: Root directory of the workspace to watch
            patterns: List of file patterns to watch (e.g., "requirements.txt")
            ignore_patterns: List of patterns to ignore
            callback: Function to call when a change is detected (receives file_path, event_type)
            scan_interval: How often to check for changes (seconds)
            debounce_seconds: How long to wait for further changes before processing
        """
        self.workspace_root = os.path.abspath(workspace_root)
        self.patterns = patterns
        self.ignore_patterns = ignore_patterns or []
        self.callback = callback
        self.scan_interval = scan_interval
        self.debounce_seconds = debounce_seconds
        self.running = False
        self.watch_task = None
        self.pending_changes = {}
        self.file_states = {}  # Maps file paths to last modified times
    
    def _should_track_file(self, file_path: str) -> bool:
        """
        Check if a file should be tracked based on patterns.
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if the file should be tracked, False otherwise
        """
        # Get relative path from workspace root
        rel_path = os.path.relpath(file_path, self.workspace_root)
        
        # First check if the file matches any ignore patterns
        for pattern in self.ignore_patterns:
            if fnmatch.fnmatch(rel_path, pattern):
                return False
        
        # Then check if it matches any include patterns
        for pattern in self.patterns:
            if fnmatch.fnmatch(rel_path, pattern) or fnmatch.fnmatch(os.path.basename(file_path), pattern):
                return True
        
        return False
    
    def scan_workspace(self) -> List[str]:
        """
        Scan the workspace for matching files.
        
        Returns:
            List of file paths that match the patterns
        """
        matching_files = []
        
        for root, _, files in os.walk(self.workspace_root):
            # Check if this directory should be ignored
            rel_root = os.path.relpath(root, self.workspace_root)
            if rel_root == '.':
                rel_root = ''
            
            skip_dir = False
            for pattern in self.ignore_patterns:
                if fnmatch.fnmatch(rel_root + '/', pattern):
                    skip_dir = True
                    break
            
            if skip_dir:
                continue
            
            # Check files in this directory
            for file in files:
                file_path = os.path.join(root, file)
                if self._should_track_file(file_path):
                    matching_files.append(file_path)
        
        return matching_files
    
    async def _process_pending_change(self, file_path: str, event_type: str):
        """
        Process a pending file change after debounce period.
        
        Args:
            file_path: Path to the changed file
            event_type: Type of event ('created', 'modified', 'deleted')
        """
        # If file no longer exists, mark as deleted
        if not os.path.exists(file_path) and event_type != 'deleted':
            event_type = 'deleted'
        elif os.path.exists(file_path) and event_type == 'deleted':
            # File exists again, mark as modified
            event_type = 'modified'
        
        # Remove from pending changes
        if file_path in self.pending_changes:
            del self.pending_changes[file_path]
        
        # Update file state
        if event_type == 'deleted':
            if file_path in self.file_states:
                del self.file_states[file_path]
        else:
            try:
                self.file_states[file_path] = os.path.getmtime(file_path)
            except OSError:
                logger.warning(f"Could not get modification time for {file_path}")
                return
        
        # Call the callback if provided
        if self.callback:
            logger.debug(f"Calling callback for {file_path} ({event_type})")
            try:
                if asyncio.iscoroutinefunction(self.callback):
                    await self.callback(file_path, event_type)
                else:
                    self.callback(file_path, event_type)
            except Exception as e:
                logger.error(f"Error in file change callback: {e}")
                logger.exception(e)
    
    def _schedule_debounced_processing(self, file_path: str, event_type: str):
        """
        Schedule debounced processing of a file change.
        
        Args:
            file_path: Path to the changed file
            event_type: Type of event ('created', 'modified', 'deleted')
        """
        # Cancel any pending processing for this file
        if file_path in self.pending_changes and not self.pending_changes[file_path].done():
            self.pending_changes[file_path].cancel()
        
        # Schedule processing after debounce period
        loop = asyncio.get_event_loop()
        self.pending_changes[file_path] = loop.create_task(
            self._debounced_process(file_path, event_type)
        )
    
    async def _debounced_process(self, file_path: str, event_type: str):
        """
        Debounced processing of a file change.
        
        Args:
            file_path: Path to the changed file
            event_type: Type of event ('created', 'modified', 'deleted')
        """
        await asyncio.sleep(self.debounce_seconds)
        await self._process_pending_change(file_path, event_type)
    
    async def _watch_loop(self):
        """Run the file watching loop."""
        logger.info(f"Starting file watcher for {self.workspace_root}")
        
        # Get initial state of all files
        self.file_states = {}
        for file_path in self.scan_workspace():
            try:
                self.file_states[file_path] = os.path.getmtime(file_path)
            except OSError:
                logger.warning(f"Could not get modification time for {file_path}")
        
        logger.info(f"Initially tracking {len(self.file_states)} files")
        
        try:
            while self.running:
                # Scan for new or modified files
                found_files = set()
                
                for file_path in self.scan_workspace():
                    found_files.add(file_path)
                    
                    try:
                        mtime = os.path.getmtime(file_path)
                        
                        # Check if this is a new or modified file
                        if file_path not in self.file_states:
                            logger.debug(f"New file detected: {file_path}")
                            self._schedule_debounced_processing(file_path, 'created')
                        elif mtime > self.file_states[file_path]:
                            logger.debug(f"Modified file detected: {file_path}")
                            self._schedule_debounced_processing(file_path, 'modified')
                    except OSError:
                        logger.warning(f"Error checking file {file_path}")
                
                # Check for deleted files
                for file_path in list(self.file_states.keys()):
                    if file_path not in found_files:
                        logger.debug(f"Deleted file detected: {file_path}")
                        self._schedule_debounced_processing(file_path, 'deleted')
                
                # Wait for next scan
                await asyncio.sleep(self.scan_interval)
                
        except asyncio.CancelledError:
            logger.info("File watcher task cancelled")
        except Exception as e:
            logger.error(f"Error in file watcher: {e}")
            logger.exception(e)
    
    async def start(self):
        """Start the file watcher."""
        if self.running:
            return
        
        self.running = True
        
        # Create and start the watch task
        self.watch_task = asyncio.create_task(self._watch_loop())
        logger.info("File watcher started")
    
    async def stop(self):
        """Stop the file watcher."""
        if not self.running:
            return
        
        logger.info("Stopping file watcher")
        self.running = False
        
        # Cancel all pending debounced processing
        for task in self.pending_changes.values():
            if not task.done():
                task.cancel()
        
        # Cancel the watch task
        if self.watch_task and not self.watch_task.done():
            self.watch_task.cancel()
            try:
                await self.watch_task
            except asyncio.CancelledError:
                pass
        
        logger.info("File watcher stopped")