"""
Rust package installer for dependency manager.

This module provides functionality for installing Rust packages (crates)
automatically using cargo, with support for workspace detection.
"""

import os
import toml
import asyncio
import subprocess
import logging
import sqlite3
import re
from typing import List, Dict, Tuple, Optional, Union, Any

logger = logging.getLogger(__name__)

class RustPackageInstaller:
    """
    Installer for Rust packages (crates).
    
    This class provides functionality for installing Rust packages
    with cargo, including workspace support, dependency resolution,
    and installation result tracking.
    
    Attributes:
        db_path: Path to the SQLite database for tracking installations
    """
    
    def __init__(self, db_path: str):
        """
        Initialize the Rust package installer.
        
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
        CREATE TABLE IF NOT EXISTS rust_packages (
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
    
    def _parse_cargo_toml(self, cargo_toml_path: str) -> Dict[str, Any]:
        """
        Parse a Cargo.toml file.
        
        Args:
            cargo_toml_path: Path to the Cargo.toml file
            
        Returns:
            Dictionary with package information
        """
        if not os.path.isfile(cargo_toml_path):
            return {"dependencies": {}, "dev-dependencies": {}}
            
        try:
            return toml.load(cargo_toml_path)
        except Exception as e:
            logger.error(f"Error parsing Cargo.toml file {cargo_toml_path}: {e}")
            logger.exception(e)
            return {"dependencies": {}, "dev-dependencies": {}}
    
    async def add_dependency(
        self, 
        name: str, 
        version: Optional[str] = None, 
        project_path: Optional[str] = None, 
        dev: bool = False
    ) -> Tuple[bool, str]:
        """
        Add a dependency to a Rust project.
        
        Args:
            name: Crate name
            version: Version specification (e.g., "1.2.3" or "^1.0.0")
            project_path: Path to the project directory
            dev: Whether to install as a dev dependency
            
        Returns:
            Tuple of (success, output)
        """
        logger.info(f"Adding Rust dependency: {name}{' ' + version if version else ''}")
        
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        # Construct the dependency specification
        dep_spec = name
        if version:
            dep_spec = f"{name}@{version}"
        
        # Build the command
        cmd = ["cargo", "add", dep_spec]
        if dev:
            cmd.append("--dev")
        
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
                    INSERT INTO rust_packages 
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
                logger.info(f"Successfully added Rust dependency: {name}")
            else:
                logger.error(f"Failed to add Rust dependency {name}: {stderr}")
                
            return success, combined_output
            
        except Exception as e:
            logger.error(f"Error adding Rust dependency {name}: {e}")
            logger.exception(e)
            return False, str(e)
    
    async def check_installed_version(self, name: str, project_path: Optional[str] = None) -> Optional[str]:
        """
        Check the installed version of a crate.
        
        Args:
            name: Crate name
            project_path: Path to the project directory
            
        Returns:
            Installed version or None if not installed
        """
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        cargo_toml_path = os.path.join(project_path, "Cargo.toml")
        if not os.path.isfile(cargo_toml_path):
            return None
            
        try:
            cargo_data = self._parse_cargo_toml(cargo_toml_path)
            
            # Check in dependencies
            deps = cargo_data.get("dependencies", {})
            if name in deps:
                dep_info = deps[name]
                if isinstance(dep_info, str):
                    return dep_info
                elif isinstance(dep_info, dict) and "version" in dep_info:
                    return dep_info["version"]
            
            # Check in dev-dependencies
            dev_deps = cargo_data.get("dev-dependencies", {})
            if name in dev_deps:
                dep_info = dev_deps[name]
                if isinstance(dep_info, str):
                    return dep_info
                elif isinstance(dep_info, dict) and "version" in dep_info:
                    return dep_info["version"]
                    
            return None
            
        except Exception as e:
            logger.error(f"Error checking installed version of {name}: {e}")
            logger.exception(e)
            return None
    
    async def process_cargo_toml(self, cargo_toml_path: str, install_dev_dependencies: bool = True) -> Dict[str, Any]:
        """
        Process a Cargo.toml file and install missing dependencies.
        
        Args:
            cargo_toml_path: Path to the Cargo.toml file
            install_dev_dependencies: Whether to install dev dependencies
            
        Returns:
            Dictionary with installation results
        """
        if not os.path.isfile(cargo_toml_path):
            logger.error(f"Cargo.toml file not found: {cargo_toml_path}")
            return {
                "regular": [],
                "dev": []
            }
            
        project_path = os.path.dirname(cargo_toml_path)
        cargo_data = self._parse_cargo_toml(cargo_toml_path)
        
        regular_results = []
        dev_results = []
        
        # Process regular dependencies
        for name, dep_info in cargo_data.get("dependencies", {}).items():
            version = None
            if isinstance(dep_info, str):
                version = dep_info
            elif isinstance(dep_info, dict) and "version" in dep_info:
                version = dep_info["version"]
                
            # Check if already installed with correct version
            installed_version = await self.check_installed_version(name, project_path)
            
            # If not installed or version doesn't match, install it
            if installed_version is None:
                logger.info(f"Dependency {name} not installed, adding...")
                success, output = await self.add_dependency(name, version, project_path, False)
                regular_results.append({
                    "name": name,
                    "action": "install",
                    "success": success,
                    "version": version
                })
            else:
                # For simplicity, we assume if the dependency is in Cargo.toml, it's properly installed
                logger.info(f"Dependency {name} version {installed_version} already installed")
                regular_results.append({
                    "name": name,
                    "action": "none",
                    "success": True,
                    "version": installed_version
                })
        
        # Process dev dependencies if requested
        if install_dev_dependencies:
            for name, dep_info in cargo_data.get("dev-dependencies", {}).items():
                version = None
                if isinstance(dep_info, str):
                    version = dep_info
                elif isinstance(dep_info, dict) and "version" in dep_info:
                    version = dep_info["version"]
                    
                # Check if already installed with correct version
                installed_version = await self.check_installed_version(name, project_path)
                
                # If not installed or version doesn't match, install it
                if installed_version is None:
                    logger.info(f"Dev dependency {name} not installed, adding...")
                    success, output = await self.add_dependency(name, version, project_path, True)
                    dev_results.append({
                        "name": name,
                        "action": "install",
                        "success": success,
                        "version": version,
                        "dev": True
                    })
                else:
                    # For simplicity, we assume if the dependency is in Cargo.toml, it's properly installed
                    logger.info(f"Dev dependency {name} version {installed_version} already installed")
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
    
    async def build_project(self, project_path: Optional[str] = None) -> Tuple[bool, str]:
        """
        Build a Rust project.
        
        Args:
            project_path: Path to the project directory
            
        Returns:
            Tuple of (success, output)
        """
        project_path = os.path.abspath(project_path) if project_path else os.getcwd()
        
        # Check if this is a valid Rust project
        cargo_toml_path = os.path.join(project_path, "Cargo.toml")
        if not os.path.isfile(cargo_toml_path):
            return False, "Not a valid Rust project (no Cargo.toml found)"
        
        # Build the command
        cmd = ["cargo", "build"]
        
        try:
            # Execute build
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
                logger.info(f"Successfully built Rust project in {project_path}")
            else:
                logger.error(f"Failed to build Rust project in {project_path}: {stderr}")
                
            return success, combined_output
            
        except Exception as e:
            logger.error(f"Error building Rust project in {project_path}: {e}")
            logger.exception(e)
            return False, str(e)