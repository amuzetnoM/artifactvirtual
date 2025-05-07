"""
Dependency manager service implementation.

This module provides the central service class that coordinates
all dependency management functionality.
"""

import os
import sys
import json
import asyncio
import logging
import signal
import sqlite3
import argparse
from typing import Dict, List, Any, Optional, Tuple, Set

# Internal imports
from .file_watcher import FileWatcher
from .llm_engine import LLMEngine
from .watchdog import ServiceSelfMonitor
from .installers import (
    PythonPackageInstaller,
    JavaScriptPackageInstaller,
    RustPackageInstaller,
)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(
            os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "logs",
                "service.log"
            )
        )
    ]
)

logger = logging.getLogger(__name__)

class DependencyManagerService:
    """
    Core dependency manager service.
    
    This class coordinates all dependency management functionality, including
    file watching, dependency analysis, and package installation.
    
    Attributes:
        db_path: Path to the service database
        config_path: Path to the service configuration
        running: Whether the service is running
        file_watcher: File watcher instance
        llm_engine: LLM engine instance
        self_monitor: Service self-monitor instance
        installers: Dictionary of package installers by language
        tasks: Dictionary of pending tasks
    """
    
    def __init__(self):
        """Initialize the dependency manager service."""
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.db_path = os.path.join(base_dir, "data", "service.db")
        self.config_path = os.path.join(base_dir, "config", "service.json")
        self.running = False
        self.file_watcher = None
        self.llm_engine = None
        self.self_monitor = None
        self.installers = {}
        self.tasks = {}
        
        # Create directories if they don't exist
        os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)
        os.makedirs(os.path.join(base_dir, "config"), exist_ok=True)
        os.makedirs(os.path.join(base_dir, "logs"), exist_ok=True)
        
        # Initialize state
        self._init_db()
        self._load_config()
        
        # Set up signal handlers for graceful shutdown
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Set up signal handlers for graceful shutdown."""
        if os.name != "nt":  # Not on Windows
            # Register SIGTERM and SIGINT handlers
            for sig in [signal.SIGTERM, signal.SIGINT]:
                signal.signal(sig, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle termination signals."""
        logger.info(f"Received signal {signum}, initiating shutdown")
        
        # Use asyncio to schedule the shutdown
        if self.running:
            loop = asyncio.get_event_loop()
            loop.create_task(self.shutdown())
    
    def _init_db(self):
        """Initialize the service database."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for dependency tracking
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dependencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            language TEXT NOT NULL,
            project_path TEXT NOT NULL,
            file_path TEXT NOT NULL,
            installed BOOLEAN DEFAULT 0,
            installation_time INTEGER,
            UNIQUE(name, language, project_path)
        )
        """)
        
        # Create table for tasks
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
        """)
        
        # Create table for file tracking
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS file_tracking (
            file_path TEXT PRIMARY KEY,
            last_modified INTEGER NOT NULL,
            last_processed INTEGER NOT NULL,
            language TEXT NOT NULL
        )
        """)
        
        conn.commit()
        conn.close()
    
    def _load_config(self):
        """Load service configuration."""
        if not os.path.exists(self.config_path):
            # Create default config
            config = {
                "file_patterns": ["requirements.txt", "package.json", "Cargo.toml", "*.csproj", "build.gradle"],
                "ignore_patterns": ["node_modules/**", ".git/**", "__pycache__/**", "dist/**", "build/**"],
                "llm": {
                    "model_path": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                    "quantization": "q4_k_m"
                },
                "watchdog": {
                    "check_interval": 10,
                    "heartbeat_interval": 5
                },
                "workspace_root": None  # Will be determined automatically if None
            }
            
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, "w") as f:
                json.dump(config, f, indent=2)
            
            self.config = config
        else:
            with open(self.config_path, "r") as f:
                self.config = json.load(f)
    
    def get_workspace_root(self) -> str:
        """Get the workspace root directory."""
        if self.config.get("workspace_root"):
            return self.config["workspace_root"]
        
        # Try to determine workspace root automatically
        # Start with the current directory and go up until we find a .git, .svn, etc.
        cwd = os.path.abspath(os.getcwd())
        path = cwd
        
        while path != os.path.dirname(path):  # Stop at root directory
            # Check for common VCS directories
            for vcs_dir in [".git", ".svn", ".hg"]:
                if os.path.isdir(os.path.join(path, vcs_dir)):
                    return path
            
            # Go up one directory
            path = os.path.dirname(path)
        
        # Fallback to current directory if no VCS found
        return cwd
    
    async def initialize(self):
        """Initialize the service components."""
        logger.info("Initializing dependency manager service")
        
        # Determine workspace root
        workspace_root = self.get_workspace_root()
        logger.info(f"Using workspace root: {workspace_root}")
        
        # Initialize self-monitoring
        self.self_monitor = ServiceSelfMonitor(
            self,
            heartbeat_interval=self.config["watchdog"]["heartbeat_interval"]
        )
        
        # Initialize LLM engine (lazily loaded when needed)
        self.llm_engine = LLMEngine(
            model_path=self.config["llm"]["model_path"],
            quantization=self.config["llm"]["quantization"]
        )
        
        # Initialize installers
        self.installers = {
            "python": PythonPackageInstaller(
                os.path.join(os.path.dirname(self.db_path), "python.db")
            ),
            "javascript": JavaScriptPackageInstaller(
                os.path.join(os.path.dirname(self.db_path), "javascript.db")
            ),
            "rust": RustPackageInstaller(
                os.path.join(os.path.dirname(self.db_path), "rust.db")
            )
        }
        
        # Initialize file watcher
        self.file_watcher = FileWatcher(
            workspace_root=workspace_root,
            patterns=self.config["file_patterns"],
            ignore_patterns=self.config["ignore_patterns"],
            callback=self.handle_file_change
        )
    
    async def start(self):
        """Start the service."""
        logger.info("Starting dependency manager service")
        self.running = True
        
        # Start self-monitoring
        self.monitor_task = asyncio.create_task(
            self.self_monitor.start_heartbeat_task()
        )
        
        # Start file watcher
        await self.file_watcher.start()
        
        # Perform initial scan of workspace
        await self._scan_workspace()
        
        # Start main service loop
        await self._run_service_loop()
    
    async def _scan_workspace(self):
        """Scan the workspace for dependency files."""
        logger.info("Scanning workspace for dependency files")
        
        # Use the file watcher to get a list of files matching our patterns
        matching_files = self.file_watcher.scan_workspace()
        
        logger.info(f"Found {len(matching_files)} dependency files")
        
        # Queue processing for each file
        for file_path in matching_files:
            await self.schedule_file_processing(file_path)
    
    async def schedule_file_processing(self, file_path: str):
        """
        Schedule a file for processing.
        
        Args:
            file_path: Path to the file to process
        """
        # Determine file type and appropriate handler
        handler_name = None
        
        if file_path.endswith("requirements.txt"):
            handler_name = "_handle_python_requirements"
        elif file_path.endswith("package.json"):
            handler_name = "_handle_npm_package"
        elif file_path.endswith("Cargo.toml"):
            handler_name = "_handle_rust_cargo"
        # Add more handlers for other file types
        
        if handler_name:
            # Create a task for processing this file
            import time
            import uuid
            
            task_id = f"file_process_{uuid.uuid4().hex}"
            task_data = {
                "file_path": file_path,
                "handler": handler_name
            }
            
            # Store task in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            now = int(time.time())
            cursor.execute(
                "INSERT INTO tasks (id, type, data, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (task_id, "file_processing", json.dumps(task_data), "pending", now, now)
            )
            
            conn.commit()
            conn.close()
            
            # Add to memory task queue
            self.tasks[task_id] = {
                "type": "file_processing",
                "data": task_data,
                "status": "pending",
                "created_at": now
            }
            
            logger.info(f"Scheduled file processing task {task_id} for {file_path}")
    
    async def _run_service_loop(self):
        """Main service loop."""
        logger.info("Starting main service loop")
        
        try:
            while self.running:
                # Process any pending tasks
                await self._process_tasks()
                
                # Wait for the next cycle
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            logger.info("Service loop cancelled")
        except Exception as e:
            logger.error(f"Error in main service loop: {e}")
            logger.exception(e)
            # In production code, we might want to attempt recovery here
    
    async def _process_tasks(self):
        """Process pending tasks from the task queue."""
        # Get a list of pending tasks ordered by creation time
        pending_tasks = {
            task_id: task for task_id, task in self.tasks.items()
            if task["status"] == "pending"
        }
        
        if not pending_tasks:
            return
        
        # Process up to 5 tasks per cycle
        for task_id, task in list(pending_tasks.items())[:5]:
            # Update task status to processing
            self.tasks[task_id]["status"] = "processing"
            self._update_task_status(task_id, "processing")
            
            try:
                # Process based on task type
                if task["type"] == "file_processing":
                    file_path = task["data"]["file_path"]
                    handler_name = task["data"]["handler"]
                    
                    # Call the appropriate handler method
                    handler = getattr(self, handler_name, None)
                    if handler:
                        await handler(file_path)
                    else:
                        logger.error(f"Unknown handler method: {handler_name}")
                
                # Mark task as completed
                self.tasks[task_id]["status"] = "completed"
                self._update_task_status(task_id, "completed")
                
            except Exception as e:
                logger.error(f"Error processing task {task_id}: {e}")
                logger.exception(e)
                
                # Mark task as failed
                self.tasks[task_id]["status"] = "failed"
                self.tasks[task_id]["error"] = str(e)
                self._update_task_status(task_id, "failed", error=str(e))
    
    def _update_task_status(self, task_id: str, status: str, error: Optional[str] = None):
        """
        Update a task's status in the database.
        
        Args:
            task_id: Task ID
            status: New status
            error: Error message (if status is 'failed')
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if error:
                # Add error information to task data
                cursor.execute("SELECT data FROM tasks WHERE id = ?", (task_id,))
                row = cursor.fetchone()
                if row:
                    data = json.loads(row[0])
                    data["error"] = error
                    
                    cursor.execute(
                        "UPDATE tasks SET status = ?, data = ?, updated_at = ? WHERE id = ?",
                        (status, json.dumps(data), int(time.time()), task_id)
                    )
            else:
                cursor.execute(
                    "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
                    (status, int(time.time()), task_id)
                )
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating task status: {e}")
    
    async def handle_file_change(self, file_path: str, event_type: str):
        """
        Handle file change events from the file watcher.
        
        Args:
            file_path: Path to the changed file
            event_type: Type of event ('created', 'modified', 'deleted')
        """
        logger.info(f"File change detected: {file_path} ({event_type})")
        
        # Ignore deleted files
        if event_type == "deleted":
            return
        
        # Schedule file for processing
        await self.schedule_file_processing(file_path)
    
    async def _handle_python_requirements(self, file_path: str):
        """
        Handle changes to Python requirements.txt files.
        
        Args:
            file_path: Path to the requirements.txt file
        """
        logger.info(f"Processing Python requirements file: {file_path}")
        
        # Get Python installer
        installer = self.installers.get("python")
        if not installer:
            logger.error("Python installer not available")
            return
        
        # Process the requirements file
        results = await installer.process_requirements_file(file_path)
        
        # Log results
        installed = len([r for r in results if r["action"] in ("install", "upgrade") and r["success"]])
        logger.info(f"Processed {len(results)} Python packages, {installed} installed/upgraded")
        
        # Use LLM to analyze dependencies if any were installed
        if installed > 0:
            try:
                with open(file_path, "r") as f:
                    content = f.read()
                
                # Get LLM analysis
                analysis = await self.llm_engine.analyze_dependencies(
                    results,
                    content,
                    "python"
                )
                
                # Log analysis results
                if analysis:
                    if analysis.get("missing_dependencies"):
                        logger.info(f"LLM suggests these additional dependencies: {', '.join(d['name'] for d in analysis['missing_dependencies'])}")
                    
                    if analysis.get("updates"):
                        logger.info(f"LLM suggests updating these dependencies: {', '.join(d['name'] for d in analysis['updates'])}")
                    
                    if analysis.get("security_issues"):
                        logger.warning(f"LLM flagged these dependencies with security concerns: {', '.join(d['name'] for d in analysis['security_issues'])}")
                        
            except Exception as e:
                logger.error(f"Error analyzing dependencies with LLM: {e}")
    
    async def _handle_npm_package(self, file_path: str):
        """
        Handle changes to package.json files.
        
        Args:
            file_path: Path to the package.json file
        """
        logger.info(f"Processing NPM package.json file: {file_path}")
        
        # Get JavaScript installer
        installer = self.installers.get("javascript")
        if not installer:
            logger.error("JavaScript installer not available")
            return
        
        # Process the package.json file
        results = await installer.process_package_json(file_path)
        
        # Count installed/upgraded packages
        regular_installed = len([r for r in results["regular"] if r["action"] in ("install", "upgrade") and r["success"]])
        dev_installed = len([r for r in results["dev"] if r["action"] in ("install", "upgrade") and r["success"]])
        
        logger.info(f"Processed {len(results['regular'])} regular and {len(results['dev'])} dev JS packages, {regular_installed + dev_installed} installed/upgraded")
        
        # Use LLM to analyze dependencies if any were installed
        if regular_installed + dev_installed > 0:
            try:
                with open(file_path, "r") as f:
                    content = f.read()
                
                # Get LLM analysis
                analysis = await self.llm_engine.analyze_dependencies(
                    results["regular"] + results["dev"],
                    content,
                    "javascript"
                )
                
                # Log analysis results
                if analysis:
                    if analysis.get("missing_dependencies"):
                        logger.info(f"LLM suggests these additional dependencies: {', '.join(d['name'] for d in analysis['missing_dependencies'])}")
                    
                    if analysis.get("updates"):
                        logger.info(f"LLM suggests updating these dependencies: {', '.join(d['name'] for d in analysis['updates'])}")
                    
                    if analysis.get("security_issues"):
                        logger.warning(f"LLM flagged these dependencies with security concerns: {', '.join(d['name'] for d in analysis['security_issues'])}")
                        
            except Exception as e:
                logger.error(f"Error analyzing dependencies with LLM: {e}")
    
    async def _handle_rust_cargo(self, file_path: str):
        """
        Handle changes to Cargo.toml files.
        
        Args:
            file_path: Path to the Cargo.toml file
        """
        logger.info(f"Processing Rust Cargo.toml file: {file_path}")
        
        # Get Rust installer
        installer = self.installers.get("rust")
        if not installer:
            logger.error("Rust installer not available")
            return
        
        # Process the Cargo.toml file
        results = await installer.process_cargo_toml(file_path)
        
        # Count installed/upgraded packages
        regular_installed = len([r for r in results["regular"] if r["action"] in ("install", "upgrade") and r["success"]])
        dev_installed = len([r for r in results["dev"] if r["action"] in ("install", "upgrade") and r["success"]])
        
        logger.info(f"Processed {len(results['regular'])} regular and {len(results['dev'])} dev Rust crates, {regular_installed + dev_installed} installed/upgraded")
        
        # Use LLM to analyze dependencies if any were installed
        if regular_installed + dev_installed > 0:
            try:
                with open(file_path, "r") as f:
                    content = f.read()
                
                # Get LLM analysis
                analysis = await self.llm_engine.analyze_dependencies(
                    results["regular"] + results["dev"],
                    content,
                    "rust"
                )
                
                # Log analysis results
                if analysis:
                    if analysis.get("missing_dependencies"):
                        logger.info(f"LLM suggests these additional crates: {', '.join(d['name'] for d in analysis['missing_dependencies'])}")
                    
                    if analysis.get("updates"):
                        logger.info(f"LLM suggests updating these crates: {', '.join(d['name'] for d in analysis['updates'])}")
                    
                    if analysis.get("security_issues"):
                        logger.warning(f"LLM flagged these crates with security concerns: {', '.join(d['name'] for d in analysis['security_issues'])}")
                        
            except Exception as e:
                logger.error(f"Error analyzing dependencies with LLM: {e}")
    
    async def shutdown(self):
        """Shut down the service gracefully."""
        if not self.running:
            return
            
        logger.info("Shutting down dependency manager service")
        self.running = False
        
        # Cancel the heartbeat task
        if hasattr(self, "monitor_task"):
            self.monitor_task.cancel()
            try:
                await self.monitor_task
            except asyncio.CancelledError:
                pass
        
        # Stop file watcher
        if self.file_watcher:
            await self.file_watcher.stop()
        
        # Clean up self-monitor
        if self.self_monitor:
            self.self_monitor.cleanup()
        
        logger.info("Dependency manager service has shut down")

async def run_service():
    """Run the dependency manager service."""
    # Create service instance
    service = DependencyManagerService()
    
    # Initialize and start service
    await service.initialize()
    await service.start()
    
    # Keep running until interrupted
    try:
        # This will run until the service is stopped
        while service.running:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    finally:
        # Ensure proper shutdown
        await service.shutdown()

def main():
    """Main entry point for the dependency manager service."""
    parser = argparse.ArgumentParser(description="Dependency Manager Service")
    parser.add_argument("--config", help="Path to config file")
    args = parser.parse_args()
    
    # If config file specified, update the default path
    if args.config:
        os.environ["DM_CONFIG_PATH"] = args.config
    
    # Run the service
    asyncio.run(run_service())

if __name__ == "__main__":
    main()