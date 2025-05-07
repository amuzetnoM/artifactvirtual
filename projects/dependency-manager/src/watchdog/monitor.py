"""
Service self-monitoring implementation for dependency manager.

This module provides in-process monitoring capabilities to detect
deadlocks, hangs, and other issues within the service process.
"""

import os
import time
import asyncio
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

class ServiceSelfMonitor:
    """
    In-process monitoring for the dependency manager service.
    
    This class provides self-monitoring capabilities, including heartbeat
    updates and health checks to help the external watchdog detect issues.
    
    Attributes:
        service: Reference to the service instance
        heartbeat_interval: How often to update heartbeat (seconds)
        last_heartbeat: Timestamp of the last heartbeat
        heartbeat_file: Path to the heartbeat file
        pid_file: Path to the PID file
    """
    
    def __init__(self, service: Any, heartbeat_interval: int = 5, data_dir: Optional[str] = None):
        """
        Initialize the service monitor.
        
        Args:
            service: Reference to the service instance
            heartbeat_interval: How often to update heartbeat (seconds)
            data_dir: Directory for storing heartbeat files (defaults to data directory)
        """
        self.service = service
        self.heartbeat_interval = heartbeat_interval
        self.last_heartbeat = time.time()
        
        # Set up paths
        if data_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            data_dir = os.path.join(base_dir, "data")
        
        os.makedirs(data_dir, exist_ok=True)
        self.heartbeat_file = os.path.join(data_dir, "heartbeat")
        self.pid_file = os.path.join(data_dir, "service.pid")
        
        # Write PID file
        self._write_pid()
    
    def _write_pid(self):
        """Write the current process ID to the PID file."""
        try:
            with open(self.pid_file, "w") as f:
                f.write(str(os.getpid()))
            logger.debug(f"PID file created: {self.pid_file}")
        except Exception as e:
            logger.error(f"Failed to write PID file: {e}")
    
    async def update_heartbeat(self):
        """Update the heartbeat timestamp and file."""
        self.last_heartbeat = time.time()
        
        try:
            # Write to heartbeat file
            with open(self.heartbeat_file, "w") as f:
                f.write(str(self.last_heartbeat))
            
            logger.debug(f"Heartbeat updated: {self.last_heartbeat}")
        except Exception as e:
            logger.error(f"Failed to update heartbeat file: {e}")
    
    async def start_heartbeat_task(self):
        """
        Start the heartbeat update task.
        
        This creates an asyncio task that updates the heartbeat
        at regular intervals.
        """
        logger.info(f"Starting heartbeat task (interval: {self.heartbeat_interval}s)")
        
        try:
            while True:
                await self.update_heartbeat()
                await asyncio.sleep(self.heartbeat_interval)
        except asyncio.CancelledError:
            logger.info("Heartbeat task cancelled")
            # Final heartbeat update before shutdown
            await self.update_heartbeat()
        except Exception as e:
            logger.error(f"Error in heartbeat task: {e}")
            logger.exception(e)
    
    def check_health(self) -> bool:
        """
        Perform a comprehensive health check of the service.
        
        Returns:
            True if the service is healthy, False otherwise
        """
        # Calculate time since last heartbeat
        time_since_heartbeat = time.time() - self.last_heartbeat
        
        # If heartbeat is older than 2x interval, something is wrong
        if time_since_heartbeat > (self.heartbeat_interval * 2):
            logger.warning(f"Health check failed: Last heartbeat was {time_since_heartbeat:.1f}s ago")
            return False
        
        # Add additional health checks as needed:
        # - Check if database is responsive
        # - Check if file system is writable
        # - Check resource usage (memory, CPU)
        # - Check external dependencies
        
        return True
    
    def cleanup(self):
        """Clean up resources on shutdown."""
        try:
            # Remove PID file
            if os.path.exists(self.pid_file):
                os.unlink(self.pid_file)
                
            # Update heartbeat one last time to indicate clean shutdown
            with open(self.heartbeat_file, "w") as f:
                f.write(f"{time.time()}|SHUTDOWN")
                
            logger.info("Service monitor cleanup complete")
        except Exception as e:
            logger.error(f"Error during service monitor cleanup: {e}")
            logger.exception(e)