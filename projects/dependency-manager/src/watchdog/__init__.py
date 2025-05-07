"""
Watchdog module for dependency manager.

This module provides self-recovery and fault tolerance capabilities
for the dependency manager service.
"""

from .process import WatchdogProcess
from .monitor import ServiceSelfMonitor

__all__ = ["WatchdogProcess", "ServiceSelfMonitor"]