"""
Watchdog process implementation for dependency manager service.

This module provides a process that monitors and automatically restarts
the dependency manager service if it crashes or stops responding.
"""

import os
import sys
import time
import sqlite3
import subprocess
import logging
import signal
import platform
import asyncio
from typing import Optional, List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

class WatchdogProcess:
    """
    A watchdog process that ensures the dependency manager service stays running.
    
    This class implements a lightweight process that monitors the main service
    and automatically restarts it if it fails or becomes unresponsive.
    
    Attributes:
        service_module: Python module to run as the service
        check_interval: How often to check service health (seconds)
        max_restart_attempts: Maximum number of restarts before giving up (0 = unlimited)
        service_process: Process object for the service
        restart_count: How many times the service has been restarted
        last_restart_time: Timestamp of the last restart
        running: Whether the watchdog is running
        db_path: Path to the database for persistent state
        heartbeat_path: Path to the heartbeat file used to check if service is alive
    """
    
    def __init__(
        self,
        service_module: str,
        check_interval: int = 10,
        max_restart_attempts: int = 0,
        db_dir: Optional[str] = None
    ):
        """
        Initialize the watchdog process.
        
        Args:
            service_module: Python module to run as the service
            check_interval: How often to check service health (seconds)
            max_restart_attempts: Maximum number of restarts before giving up (0 = unlimited)
            db_dir: Directory to store the database file (defaults to data directory)
        """
        self.service_module = service_module
        self.check_interval = check_interval
        self.max_restart_attempts = max_restart_attempts
        self.service_process = None
        self.restart_count = 0
        self.last_restart_time = 0
        self.running = False
        
        # Set up paths
        if db_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            db_dir = os.path.join(base_dir, "data")
        
        os.makedirs(db_dir, exist_ok=True)
        self.db_path = os.path.join(db_dir, "watchdog.db")
        self.heartbeat_path = os.path.join(db_dir, "heartbeat")
        
        # Initialize database for persistence
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database for persistence."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS watchdog_state (
            id INTEGER PRIMARY KEY,
            restart_count INTEGER,
            last_restart_time INTEGER,
            is_running INTEGER
        )
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS restart_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            reason TEXT,
            exit_code INTEGER,
            output TEXT
        )
        """)
        
        # Initialize state if needed
        cursor.execute("SELECT COUNT(*) FROM watchdog_state")
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                "INSERT INTO watchdog_state (id, restart_count, last_restart_time, is_running) VALUES (1, 0, 0, 0)"
            )
        
        conn.commit()
        conn.close()
    
    def _load_state(self) -> bool:
        """
        Load watchdog state from database.
        
        Returns:
            Whether the watchdog was previously running
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT restart_count, last_restart_time, is_running FROM watchdog_state WHERE id = 1"
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            self.restart_count = row[0]
            self.last_restart_time = row[1]
            was_running = bool(row[2])
            return was_running
            
        return False
    
    def _save_state(self):
        """Save watchdog state to database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE watchdog_state SET restart_count = ?, last_restart_time = ?, is_running = ? WHERE id = 1",
            (self.restart_count, self.last_restart_time, int(self.running))
        )
        
        conn.commit()
        conn.close()
    
    def _log_restart_event(self, reason: str, exit_code: Optional[int] = None, output: Optional[str] = None):
        """
        Log a restart event to the database.
        
        Args:
            reason: Reason for the restart
            exit_code: Exit code from the service process (if any)
            output: Process output (if any)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO restart_events (timestamp, reason, exit_code, output) VALUES (?, ?, ?, ?)",
            (int(time.time()), reason, exit_code, output)
        )
        
        conn.commit()
        conn.close()
    
    def start_service(self):
        """
        Start the service process.
        
        This method attempts to start the main service as a subprocess.
        """
        # If process is already running, do nothing
        if self.service_process is not None and self.service_process.poll() is None:
            return
        
        try:
            # Build command to run the service module
            cmd = [sys.executable, "-m", self.service_module]
            
            # Set up logging directories
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            log_dir = os.path.join(base_dir, "logs")
            os.makedirs(log_dir, exist_ok=True)
            
            # Open log files
            log_file = os.path.join(log_dir, "service.log")
            err_file = os.path.join(log_dir, "service_error.log")
            
            stdout = open(log_file, "a")
            stderr = open(err_file, "a")
            
            # Start the process
            self.service_process = subprocess.Popen(
                cmd,
                stdout=stdout,
                stderr=stderr,
                text=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if platform.system() == "Windows" else 0
            )
            
            # Update state
            self.running = True
            self.last_restart_time = int(time.time())
            self.restart_count += 1
            self._save_state()
            
            # Log event
            self._log_restart_event("Service started")
            
            logger.info(f"Started service process (PID: {self.service_process.pid})")
            
        except Exception as e:
            logger.error(f"Failed to start service process: {e}")
            self._log_restart_event(f"Start failed: {str(e)}")
    
    def check_heartbeat(self) -> bool:
        """
        Check if the service is still responding using heartbeat file.
        
        Returns:
            True if the service is responding, False if it's stuck/frozen
        """
        if not os.path.exists(self.heartbeat_path):
            return False
        
        try:
            # Check the age of the heartbeat file
            heartbeat_age = time.time() - os.path.getmtime(self.heartbeat_path)
            
            # If the heartbeat is older than 3x check interval, service is stuck
            return heartbeat_age < (self.check_interval * 3)
            
        except Exception as e:
            logger.error(f"Error checking heartbeat: {e}")
            return False
    
    def check_service(self):
        """Check if the service is running and restart if needed."""
        # Check if process has terminated
        if self.service_process is None or self.service_process.poll() is not None:
            exit_code = None if self.service_process is None else self.service_process.poll()
            
            # If max restart attempts is set and exceeded, don't restart
            if 0 < self.max_restart_attempts <= self.restart_count:
                logger.warning(f"Max restart attempts ({self.max_restart_attempts}) reached. Not restarting.")
                return
            
            # Use exponential backoff for restarts to prevent rapid cycling
            if self.restart_count > 0:
                backoff_time = min(300, 2 ** min(self.restart_count - 1, 8))  # Max 5 minutes
                time_since_last = time.time() - self.last_restart_time
                
                if time_since_last < backoff_time:
                    logger.info(f"Waiting {backoff_time - time_since_last:.1f}s before restart (backoff)")
                    return
            
            logger.warning(f"Service process not running (exit code: {exit_code}). Restarting...")
            self._log_restart_event("Process not running", exit_code)
            self.start_service()
        # Process is running, but check heartbeat to detect hangs
        elif not self.check_heartbeat():
            logger.warning("Service appears to be hung (no recent heartbeat). Restarting...")
            
            # Terminate the hung process
            try:
                if platform.system() == "Windows":
                    # On Windows, we need to use taskkill for the process group
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(self.service_process.pid)])
                else:
                    # On Unix, kill the process group
                    os.killpg(os.getpgid(self.service_process.pid), signal.SIGTERM)
                
                # Wait briefly for process to terminate
                try:
                    self.service_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if not terminated
                    self.service_process.kill()
            except Exception as e:
                logger.error(f"Error terminating hung process: {e}")
            
            self._log_restart_event("Process not responding (heartbeat timeout)")
            self.start_service()
    
    def run(self):
        """
        Run the watchdog process continuously.
        
        This method enters a loop checking the service process
        and restarting it if necessary.
        """
        logger.info("Starting watchdog process")
        
        # Check if we were previously running
        was_running = self._load_state()
        if was_running:
            logger.info("Watchdog was previously running, resuming monitoring")
        
        # Start the service initially
        self.start_service()
        
        try:
            # Main monitoring loop
            while True:
                self.check_service()
                time.sleep(self.check_interval)
                
        except KeyboardInterrupt:
            logger.info("Watchdog process interrupted")
            self.running = False
            self._save_state()
            
            # Gracefully terminate service
            if self.service_process and self.service_process.poll() is None:
                logger.info("Terminating service process...")
                self.service_process.terminate()
                
                try:
                    self.service_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    logger.warning("Service process did not terminate, forcing kill")
                    self.service_process.kill()
        
        except Exception as e:
            logger.error(f"Watchdog process error: {e}")
            logger.exception(e)
            self.running = False
            self._save_state()
            
            # Attempt to cleanup
            if self.service_process and self.service_process.poll() is None:
                try:
                    self.service_process.terminate()
                except Exception:
                    pass