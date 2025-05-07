"""
JavaScript package installer for dependency manager.

This module provides functionality for installing JavaScript packages
automatically using npm, yarn, or pnpm.
"""

import os
import json
import asyncio
import subprocess
import logging
import sqlite3
import re
from typing import List, Dict, Tuple, Optional, Union, Any

logger = logging.getLogger(__name__)

class JavaScriptPackageInstaller:
    """
    Installer for JavaScript packages.
    
    This class provides functionality for installing JavaScript packages
    with npm, yarn, or pnpm, including dependency resolution and
    installation result tracking.
    
    Attributes:
        db_path: Path to the SQLite database for tracking installations
    """
    
    def __init__(self, db_path: str):
        """
        Initialize the JavaScript package installer.
        
        Args:
            db_path: Path to the SQLite database for tracking installations
        """
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize the database for tracking installations."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS js_packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            version TEXT,
            project_path TEXT NOT NULL,
            package_manager TEXT NOT NULL,
            installed BOOLEAN DEFAULT 0,
            installation_time INTEGER,
            installation_log TEXT,
            dev BOOLEAN DEFAULT 0,
            UNIQUE(name, project_path)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def _detect_package_manager(self, project_path: str) -> str:
        """
        Detect the package manager used in the project.
        
        Args:
            project_path: Path to the project directory
            
        Returns:
            Package manager name ('npm', 'yarn', 'pnpm')
        """
        # Check for lock files to identify package manager
        if os.path.isfile(os.path.join(project_path, "yarn.lock")):
            return "yarn"
        if os.path.isfile(os.path.join(project_path, "pnpm-lock.yaml")):
            return "pnpm"
        
        # Default to npm
        return "npm"
    
    def _parse_package_json(self, package_json_path: str) -> Dict[str, Any]:
        """
        Parse a package.json file.
        
        Args:
            package_json_path: Path to the package.json file
            
        Returns:
            Dictionary with package information
        """
        if not os.path.isfile(package_json_path):
            return {
                "dependencies": {},
                "devDependencies": {}
            }
            
        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error parsing package.json file {package_json_path}: {e}")
            logger.exception(e)
            return {
                "dependencies": {},
                "devDependencies": {}
            }
    
    async def install_package(
        self, 
        name: str, 
        version: Optional[str] = None, 
        project_path: Optional[str] = None, 
        dev: bool = False, 
        package_manager: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Install a JavaScript package.
        
        Args:
            name: Package name
            version: Version specification (e.g., "1.2.3" or "^1.0.0")
            project_path: Path to the project directory
            dev: Whether to install as a dev dependency
            package_manager: Package manager to use ('npm', 'yarn', 'pnpm')
            
        Returns:
            Tuple of (success, output)
        """
        logger.info(f"Installing JavaScript package: {name}{' ' + version if version else ''}")
        
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        # Determine package manager
        if not package_manager:
            package_manager = self._detect_package_manager(project_path)
        
        # Construct the package specification
        package_spec = name
        if version:
            package_spec = f"{name}@{version}"
        
        # Build the command based on package manager
        if package_manager == "yarn":
            cmd = ["yarn", "add", package_spec]
            if dev:
                cmd.append("--dev")
        elif package_manager == "pnpm":
            cmd = ["pnpm", "add", package_spec]
            if dev:
                cmd.append("--save-dev")
        else:  # npm
            cmd = ["npm", "install", package_spec]
            if dev:
                cmd.append("--save-dev")
            else:
                cmd.append("--save")
        
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
                    INSERT INTO js_packages 
                        (name, version, project_path, package_manager, installed, installation_time, installation_log, dev) 
                    VALUES 
                        (?, ?, ?, ?, ?, strftime('%s', 'now'), ?, ?) 
                    ON CONFLICT(name, project_path) 
                    DO UPDATE SET 
                        version=excluded.version, 
                        package_manager=excluded.package_manager,
                        installed=excluded.installed, 
                        installation_time=excluded.installation_time,
                        installation_log=excluded.installation_log,
                        dev=excluded.dev
                    """,
                    (name, version, project_path, package_manager, success, combined_output, dev)
                )
                conn.commit()
            except Exception as db_error:
                logger.error(f"Database error when recording installation of {name}: {db_error}")
            finally:
                conn.close()
            
            if success:
                logger.info(f"Successfully installed JavaScript package: {name}")
            else:
                logger.error(f"Failed to install JavaScript package {name}: {stderr}")
                
            return success, combined_output
            
        except Exception as e:
            logger.error(f"Error installing JavaScript package {name}: {e}")
            logger.exception(e)
            return False, str(e)
    
    async def process_package_json(self, package_json_path: str, install_dev_dependencies: bool = True) -> Dict[str, Any]:
        """
        Process a package.json file and install missing packages.
        
        Args:
            package_json_path: Path to the package.json file
            install_dev_dependencies: Whether to install dev dependencies
            
        Returns:
            Dictionary with installation results
        """
        if not os.path.isfile(package_json_path):
            logger.error(f"package.json file not found: {package_json_path}")
            return {
                "regular": [],
                "dev": []
            }
            
        project_path = os.path.dirname(package_json_path)
        package_data = self._parse_package_json(package_json_path)
        package_manager = self._detect_package_manager(project_path)
        
        regular_results = []
        dev_results = []
        
        # Check if node_modules exists, if not, run full install
        node_modules_path = os.path.join(project_path, "node_modules")
        if not os.path.isdir(node_modules_path):
            logger.info(f"node_modules not found in {project_path}, running full install")
            await self._run_full_install(project_path, package_manager)
            
            # Update results for all dependencies
            for name, version in package_data.get("dependencies", {}).items():
                regular_results.append({
                    "name": name,
                    "action": "install",
                    "success": True,  # Assume success since we're not checking individual packages
                    "version": version
                })
                
            if install_dev_dependencies:
                for name, version in package_data.get("devDependencies", {}).items():
                    dev_results.append({
                        "name": name,
                        "action": "install",
                        "success": True,  # Assume success since we're not checking individual packages
                        "version": version,
                        "dev": True
                    })
        else:
            # Install individual missing packages
            installed_packages = await self._get_installed_packages(project_path)
            
            # Process regular dependencies
            for name, version in package_data.get("dependencies", {}).items():
                if name not in installed_packages:
                    logger.info(f"Package {name} not installed, installing...")
                    success, output = await self.install_package(name, version, project_path, False, package_manager)
                    regular_results.append({
                        "name": name,
                        "action": "install",
                        "success": success,
                        "version": version
                    })
                else:
                    # Check if installed version satisfies required version
                    installed_version = installed_packages.get(name)
                    if not self._version_satisfies(installed_version, version):
                        logger.info(f"Package {name} version {installed_version} doesn't match {version}, upgrading...")
                        success, output = await self.install_package(name, version, project_path, False, package_manager)
                        regular_results.append({
                            "name": name,
                            "action": "upgrade",
                            "success": success,
                            "from_version": installed_version,
                            "to_version": version
                        })
                    else:
                        logger.info(f"Package {name} version {installed_version} already installed")
                        regular_results.append({
                            "name": name,
                            "action": "none",
                            "success": True,
                            "version": installed_version
                        })
            
            # Process dev dependencies
            if install_dev_dependencies:
                for name, version in package_data.get("devDependencies", {}).items():
                    if name not in installed_packages:
                        logger.info(f"Dev package {name} not installed, installing...")
                        success, output = await self.install_package(name, version, project_path, True, package_manager)
                        dev_results.append({
                            "name": name,
                            "action": "install",
                            "success": success,
                            "version": version,
                            "dev": True
                        })
                    else:
                        # Check if installed version satisfies required version
                        installed_version = installed_packages.get(name)
                        if not self._version_satisfies(installed_version, version):
                            logger.info(f"Dev package {name} version {installed_version} doesn't match {version}, upgrading...")
                            success, output = await self.install_package(name, version, project_path, True, package_manager)
                            dev_results.append({
                                "name": name,
                                "action": "upgrade",
                                "success": success,
                                "from_version": installed_version,
                                "to_version": version,
                                "dev": True
                            })
                        else:
                            logger.info(f"Dev package {name} version {installed_version} already installed")
                            dev_results.append({
                                "name": name,
                                "action": "none",
                                "success": True,
                                "version": installed_version,
                                "dev": True
                            })
        
        return {
            "regular": regular_results,
            "dev": dev_results
        }
    
    async def _run_full_install(self, project_path: str, package_manager: str = None) -> Tuple[bool, str]:
        """
        Run a full package install.
        
        Args:
            project_path: Path to the project directory
            package_manager: Package manager to use ('npm', 'yarn', 'pnpm')
            
        Returns:
            Tuple of (success, output)
        """
        if not package_manager:
            package_manager = self._detect_package_manager(project_path)
            
        # Build command based on package manager
        if package_manager == "yarn":
            cmd = ["yarn", "install"]
        elif package_manager == "pnpm":
            cmd = ["pnpm", "install"]
        else:  # npm
            cmd = ["npm", "install"]
            
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
            
            success = process.returncode == 0
            
            if success:
                logger.info(f"Successfully ran full install in {project_path}")
            else:
                logger.error(f"Failed to run full install in {project_path}: {stderr}")
                
            return success, combined_output
            
        except Exception as e:
            logger.error(f"Error running full install in {project_path}: {e}")
            logger.exception(e)
            return False, str(e)
    
    async def _get_installed_packages(self, project_path: str) -> Dict[str, str]:
        """
        Get a dictionary of installed packages and their versions.
        
        Args:
            project_path: Path to the project directory
            
        Returns:
            Dictionary mapping package names to versions
        """
        node_modules_path = os.path.join(project_path, "node_modules")
        if not os.path.isdir(node_modules_path):
            return {}
            
        result = {}
        package_manager = self._detect_package_manager(project_path)
        
        # Use 'npm list', 'yarn list', or 'pnpm list' to get installed packages
        if package_manager == "yarn":
            cmd = ["yarn", "list", "--depth=0", "--json"]
        elif package_manager == "pnpm":
            cmd = ["pnpm", "list", "--depth=0", "--json"]
        else:  # npm
            cmd = ["npm", "list", "--depth=0", "--json"]
            
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
                logger.warning(f"Non-zero return code ({process.returncode}) when listing packages: {stderr}")
            
            # Parse JSON output
            try:
                data = json.loads(stdout)
                
                # Extract dependencies based on package manager
                if package_manager == "yarn":
                    for name, info in data.get("data", {}).get("trees", {}).items():
                        if "name" in info:
                            # Parse name and version (format: "package@version")
                            package_spec = info["name"]
                            if "@" in package_spec:
                                name, version = package_spec.rsplit("@", 1)
                                result[name] = version
                elif package_manager == "pnpm":
                    for pkg in data:
                        if "name" in pkg and "version" in pkg:
                            result[pkg["name"]] = pkg["version"]
                else:  # npm
                    deps = data.get("dependencies", {})
                    for name, info in deps.items():
                        if "version" in info:
                            result[name] = info["version"]
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON output from package listing: {stdout[:100]}...")
                
        except Exception as e:
            logger.error(f"Error getting installed packages: {e}")
            logger.exception(e)
            
        return result
    
    def _version_satisfies(self, installed_version: str, required_spec: str) -> bool:
        """
        Check if an installed version satisfies a version specification.
        
        This is a simplified version checker for semver.
        For proper semver checking, a library like 'semver' would be used.
        
        Args:
            installed_version: Installed version (e.g., "1.2.3")
            required_spec: Required version specification (e.g., "^1.0.0" or "~1.2.0")
            
        Returns:
            True if the installed version satisfies the specification
        """
        # Handle exact version match
        if not required_spec.startswith(("^", "~", ">", "<", "=")):
            return installed_version == required_spec
        
        # Handle caret range (^1.2.3) - compatible with 1.x.x
        if required_spec.startswith("^"):
            base_version = required_spec[1:]
            base_parts = [int(p) for p in base_version.split(".")]
            installed_parts = [int(p) for p in installed_version.split(".")]
            
            # Major version must match for ^1.x.x
            if base_parts[0] > 0:
                return (installed_parts[0] == base_parts[0] and 
                        installed_parts >= base_parts)
            # For ^0.x.y, minor version must match
            elif len(base_parts) > 1 and base_parts[1] > 0:
                return (installed_parts[0] == base_parts[0] and
                        installed_parts[1] == base_parts[1] and
                        installed_parts >= base_parts)
            # For ^0.0.z, patch must match exactly
            else:
                return installed_version == base_version
        
        # Handle tilde range (~1.2.3) - patch level changes
        if required_spec.startswith("~"):
            base_version = required_spec[1:]
            base_parts = [int(p) for p in base_version.split(".")]
            installed_parts = [int(p) for p in installed_version.split(".")]
            
            if len(base_parts) >= 2:
                # Major and minor versions must match
                return (installed_parts[0] == base_parts[0] and
                        installed_parts[1] == base_parts[1] and
                        installed_parts >= base_parts)
            else:
                # Only major version specified with ~, exact match needed
                return installed_version == base_version
        
        # Simplified handling of >, <, >=, <= operators
        if required_spec.startswith(">"):
            if required_spec.startswith(">="):
                version = required_spec[2:].strip()
                return self._compare_versions(installed_version, version) >= 0
            else:
                version = required_spec[1:].strip()
                return self._compare_versions(installed_version, version) > 0
        
        if required_spec.startswith("<"):
            if required_spec.startswith("<="):
                version = required_spec[2:].strip()
                return self._compare_versions(installed_version, version) <= 0
            else:
                version = required_spec[1:].strip()
                return self._compare_versions(installed_version, version) < 0
        
        # Fallback - exact match
        return installed_version == required_spec
    
    def _compare_versions(self, ver1: str, ver2: str) -> int:
        """
        Compare two semver versions.
        
        Args:
            ver1: First version
            ver2: Second version
            
        Returns:
            -1 if ver1 < ver2, 0 if ver1 == ver2, 1 if ver1 > ver2
        """
        def normalize(v):
            # Remove any build metadata or pre-release identifiers
            v = v.split("+")[0].split("-")[0]
            return [int(x) for x in v.split(".")]
            
        try:
            parts1 = normalize(ver1)
            parts2 = normalize(ver2)
            
            for i in range(max(len(parts1), len(parts2))):
                # If we've reached the end of one version, the longer one is greater
                if i >= len(parts1):
                    return -1
                if i >= len(parts2):
                    return 1
                    
                # Compare version components
                if parts1[i] < parts2[i]:
                    return -1
                if parts1[i] > parts2[i]:
                    return 1
                    
            # Versions are equal
            return 0
        except Exception:
            # Fallback to string comparison if parsing fails
            return -1 if ver1 < ver2 else (1 if ver1 > ver2 else 0)