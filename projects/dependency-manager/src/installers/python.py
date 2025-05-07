"""
Python package installer for dependency manager.

This module provides functionality for installing Python packages
automatically using pip, with support for virtual environments.
"""

import os
import sys
import asyncio
import subprocess
import logging
import sqlite3
import re
from typing import List, Dict, Tuple, Optional, Union, Any

logger = logging.getLogger(__name__)

class PythonPackageInstaller:
    """
    Installer for Python packages.
    
    This class provides functionality for installing Python packages
    with pip, including virtual environment support, dependency resolution,
    and installation result tracking.
    
    Attributes:
        db_path: Path to the SQLite database for tracking installations
        pip_command: Base command for pip (modified for venv support)
    """
    
    def __init__(self, db_path: str):
        """
        Initialize the Python package installer.
        
        Args:
            db_path: Path to the SQLite database for tracking installations
        """
        self.db_path = db_path
        self.pip_command = [sys.executable, "-m", "pip"]
        self._init_db()
    
    def _init_db(self):
        """Initialize the database for tracking installations."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS python_packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            project_path TEXT NOT NULL,
            installed BOOLEAN DEFAULT 0,
            installation_time INTEGER,
            installation_log TEXT,
            UNIQUE(name, project_path)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def _detect_virtual_env(self, project_path: str) -> Optional[str]:
        """
        Detect a virtual environment for the project.
        
        Args:
            project_path: Path to the project directory
            
        Returns:
            Path to the virtual environment Python interpreter, or None if not found
        """
        # Common virtual environment paths relative to the project
        venv_paths = [
            os.path.join(project_path, ".venv"),
            os.path.join(project_path, "venv"),
            os.path.join(project_path, "env"),
            os.path.join(project_path, ".env")
        ]
        
        # Poetry virtual environment (more complex path)
        poetry_lock = os.path.join(project_path, "poetry.lock")
        if os.path.exists(poetry_lock):
            # Try to find Poetry's virtual environment
            try:
                result = subprocess.run(
                    ["poetry", "env", "info", "-p"],
                    cwd=project_path,
                    capture_output=True,
                    text=True,
                    check=False
                )
                if result.returncode == 0 and result.stdout.strip():
                    venv_paths.append(result.stdout.strip())
            except Exception:
                pass
        
        # Check each path for a Python interpreter
        for venv_path in venv_paths:
            if not os.path.isdir(venv_path):
                continue
                
            # Check for Python executable in the bin/Scripts directory
            bin_dir = "Scripts" if sys.platform == "win32" else "bin"
            python_path = os.path.join(venv_path, bin_dir, "python")
            
            # Add .exe extension on Windows
            if sys.platform == "win32":
                python_path += ".exe"
                
            if os.path.isfile(python_path):
                return python_path
        
        return None
    
    def _parse_requirements(self, requirements_file: str) -> List[Dict[str, str]]:
        """
        Parse a requirements.txt file.
        
        Args:
            requirements_file: Path to the requirements.txt file
            
        Returns:
            List of dictionaries with package information
        """
        if not os.path.isfile(requirements_file):
            return []
            
        packages = []
        
        try:
            with open(requirements_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    
                    # Skip comments and empty lines
                    if not line or line.startswith("#"):
                        continue
                    
                    # Skip options like --extra-index-url
                    if line.startswith("-"):
                        continue
                        
                    # Handle line continuations
                    if line.endswith("\\"):
                        continue
                        
                    # Handle environment markers
                    if ";" in line:
                        line = line.split(";")[0].strip()
                    
                    # Parse package specs using regex
                    match = re.match(r'^([A-Za-z0-9_\-\.]+)(?:\[([^\]]+)\])?(?:\s*([=~<>!]+.+))?$', line)
                    if match:
                        name = match.group(1)
                        extras = match.group(2)
                        version_spec = match.group(3)
                        
                        package = {"name": name}
                        if version_spec:
                            package["version_spec"] = version_spec.strip()
                        if extras:
                            package["extras"] = extras
                            
                        packages.append(package)
        except Exception as e:
            logger.error(f"Error parsing requirements file {requirements_file}: {e}")
            logger.exception(e)
            
        return packages
    
    async def install_package(self, name: str, version: Optional[str] = None, project_path: Optional[str] = None) -> Tuple[bool, str]:
        """
        Install a Python package.
        
        Args:
            name: Package name
            version: Version specification (e.g., "==1.2.3" or ">=1.0,<2.0")
            project_path: Path to the project directory
            
        Returns:
            Tuple of (success, output)
        """
        logger.info(f"Installing Python package: {name}{' ' + version if version else ''}")
        
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        # Determine if virtual environment exists
        venv_python = self._detect_virtual_env(project_path)
        
        # Adjust pip command for virtual environment if available
        pip_cmd = self.pip_command.copy()
        if venv_python:
            pip_cmd[0] = venv_python
            
        # Construct the package specification
        package_spec = name
        if version:
            if version.startswith(("=", "<", ">", "~", "!")):
                package_spec = f"{name}{version}"
            else:
                package_spec = f"{name}=={version}"
        
        # Build the full command
        cmd = pip_cmd + ["install", package_spec, "--no-input"]
        
        try:
            # Execute installation
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                text=True,
                cwd=project_path
            )
            
            stdout, stderr = await process.communicate()
            combined_output = f"STDOUT:\n{stdout}\n\nSTDERR:\n{stderr}"
            
            # Update database with installation result
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            success = process.returncode == 0
            
            try:
                cursor.execute(
                    """
                    INSERT INTO python_packages 
                        (name, version, project_path, installed, installation_time, installation_log) 
                    VALUES 
                        (?, ?, ?, ?, strftime('%s', 'now'), ?) 
                    ON CONFLICT(name, project_path) 
                    DO UPDATE SET 
                        version=excluded.version, 
                        installed=excluded.installed, 
                        installation_time=excluded.installation_time,
                        installation_log=excluded.installation_log
                    """,
                    (name, version, project_path, success, combined_output)
                )
                conn.commit()
            except Exception as db_error:
                logger.error(f"Database error when recording installation of {name}: {db_error}")
            finally:
                conn.close()
            
            if success:
                logger.info(f"Successfully installed Python package: {name}")
            else:
                logger.error(f"Failed to install Python package {name}: {stderr}")
                
            return success, combined_output
            
        except Exception as e:
            logger.error(f"Error installing Python package {name}: {e}")
            logger.exception(e)
            return False, str(e)
            
    async def check_installed_version(self, name: str, project_path: Optional[str] = None) -> Optional[str]:
        """
        Check the installed version of a package.
        
        Args:
            name: Package name
            project_path: Path to the project directory
            
        Returns:
            Installed version or None if not installed
        """
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        # Determine if virtual environment exists
        venv_python = self._detect_virtual_env(project_path)
        
        # Adjust pip command for virtual environment if available
        pip_cmd = self.pip_command.copy()
        if venv_python:
            pip_cmd[0] = venv_python
        
        cmd = pip_cmd + ["show", name]
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                text=True,
                cwd=project_path
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                return None
                
            # Parse the version from pip show output
            for line in stdout.splitlines():
                if line.startswith("Version:"):
                    return line.split(":", 1)[1].strip()
                    
            return None
            
        except Exception as e:
            logger.error(f"Error checking installed version of {name}: {e}")
            return None
    
    async def process_requirements_file(self, requirements_file: str) -> List[Dict[str, Any]]:
        """
        Process a requirements.txt file and install missing packages.
        
        Args:
            requirements_file: Path to the requirements.txt file
            
        Returns:
            List of dictionaries with installation results
        """
        if not os.path.isfile(requirements_file):
            logger.error(f"Requirements file not found: {requirements_file}")
            return []
            
        project_path = os.path.dirname(requirements_file)
        packages = self._parse_requirements(requirements_file)
        results = []
        
        for package in packages:
            name = package["name"]
            version = package.get("version_spec")
            
            # Check if already installed with correct version
            installed_version = await self.check_installed_version(name, project_path)
            
            # If not installed or version doesn't match, install it
            if installed_version is None:
                logger.info(f"Package {name} not installed, installing...")
                success, output = await self.install_package(name, version, project_path)
                results.append({
                    "name": name,
                    "action": "install",
                    "success": success,
                    "version": version
                })
            else:
                # Check if installed version matches required version
                if version and not self._version_matches(installed_version, version):
                    logger.info(f"Package {name} version {installed_version} doesn't match {version}, upgrading...")
                    success, output = await self.install_package(name, version, project_path)
                    results.append({
                        "name": name,
                        "action": "upgrade",
                        "success": success,
                        "from_version": installed_version,
                        "to_version": version
                    })
                else:
                    logger.info(f"Package {name} version {installed_version} already installed")
                    results.append({
                        "name": name,
                        "action": "none",
                        "success": True,
                        "version": installed_version
                    })
        
        return results
    
    def _version_matches(self, installed_version: str, required_spec: str) -> bool:
        """
        Check if an installed version matches a version specification.
        
        Args:
            installed_version: Installed version (e.g., "1.2.3")
            required_spec: Required version specification (e.g., "==1.2.3" or ">=1.0,<2.0")
            
        Returns:
            True if the installed version matches the specification
        """
        # This is a simplified version check that doesn't handle all PEP 440 cases
        # For proper semantic version comparison, we could use the 'packaging' library
        
        # Handle exact version match (==1.2.3)
        if required_spec.startswith("=="):
            return installed_version == required_spec[2:]
        
        # Handle minimum version (>=1.2.3)
        if required_spec.startswith(">="):
            return self._compare_versions(installed_version, required_spec[2:]) >= 0
        
        # Handle maximum version (<1.2.3)
        if required_spec.startswith("<"):
            return self._compare_versions(installed_version, required_spec[1:]) < 0
        
        # Handle compatible release (~=1.2.3)
        if required_spec.startswith("~="):
            # This is a simplification - proper impl would follow PEP 440
            base_version = required_spec[2:]
            parts = base_version.split(".")
            if len(parts) >= 2:
                compatible_prefix = ".".join(parts[:-1])
                return installed_version.startswith(compatible_prefix)
        
        # Fallback - just check if versions are exactly the same
        return installed_version == required_spec
    
    def _compare_versions(self, ver1: str, ver2: str) -> int:
        """
        Compare two version strings.
        
        Args:
            ver1: First version
            ver2: Second version
            
        Returns:
            -1 if ver1 < ver2, 0 if ver1 == ver2, 1 if ver1 > ver2
        """
        # This is a simplified version comparison that may not handle all cases
        # For proper semantic version comparison, we could use the 'packaging' library
        
        def normalize(v):
            return [int(x) if x.isdigit() else x for x in re.findall(r'[0-9]+|[a-zA-Z]+', v)]
            
        parts1 = normalize(ver1)
        parts2 = normalize(ver2)
        
        for p1, p2 in zip(parts1, parts2):
            if p1 == p2:
                continue
            if isinstance(p1, int) and isinstance(p2, int):
                return -1 if p1 < p2 else 1
            if isinstance(p1, int):
                return 1  # Numbers > strings
            if isinstance(p2, int):
                return -1  # Numbers > strings
            return -1 if p1 < p2 else 1
        
        # If we get here, versions are equal up to the length of the shorter one
        return 0 if len(parts1) == len(parts2) else (-1 if len(parts1) < len(parts2) else 1)