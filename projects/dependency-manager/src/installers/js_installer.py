"""
JavaScript dependency installer for the dependency manager.

This module provides functionality for installing and managing JavaScript 
dependencies using npm, yarn, or pnpm.
"""

import os
import json
import asyncio
import logging
import subprocess
from typing import Dict, List, Any, Optional, Tuple, Union

logger = logging.getLogger(__name__)

class JavaScriptInstaller:
    """
    Installer for JavaScript dependencies using npm, yarn, or pnpm.
    
    This class handles the installation, updating, and removal of
    JavaScript dependencies using the appropriate package manager
    based on the project configuration.
    
    Attributes:
        workspace_path: Path to the workspace root
        package_manager: Package manager to use ('npm', 'yarn', 'pnpm')
        package_json_path: Path to package.json file
    """
    
    def __init__(
        self,
        workspace_path: str,
        package_manager: Optional[str] = None,
        package_json_path: Optional[str] = None
    ):
        """
        Initialize the JavaScript installer.
        
        Args:
            workspace_path: Path to the workspace root
            package_manager: Package manager to use ('npm', 'yarn', 'pnpm')
                             If None, will be auto-detected
            package_json_path: Path to package.json file, defaults to
                              workspace_path/package.json
        """
        self.workspace_path = os.path.abspath(workspace_path)
        
        # Set default package.json path if not provided
        if package_json_path is None:
            self.package_json_path = os.path.join(self.workspace_path, "package.json")
        else:
            self.package_json_path = os.path.abspath(package_json_path)
        
        # Auto-detect package manager if not specified
        if package_manager is None:
            self.package_manager = self._detect_package_manager()
        else:
            self.package_manager = package_manager.lower()
            
        logger.info(f"JavaScript installer initialized with {self.package_manager}")
    
    def _detect_package_manager(self) -> str:
        """
        Detect the package manager to use based on lockfiles and available commands.
        
        Returns:
            Package manager name ('npm', 'yarn', or 'pnpm')
        """
        # Check for lockfiles in the workspace path
        yarn_lock = os.path.exists(os.path.join(self.workspace_path, "yarn.lock"))
        pnpm_lock = os.path.exists(os.path.join(self.workspace_path, "pnpm-lock.yaml"))
        npm_lock = os.path.exists(os.path.join(self.workspace_path, "package-lock.json"))
        
        # Check availability of package managers
        def check_command(cmd: str) -> bool:
            try:
                result = subprocess.run(
                    [cmd, "--version"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=2
                )
                return result.returncode == 0
            except (subprocess.SubprocessError, FileNotFoundError):
                return False
        
        # First prioritize based on lockfiles
        if yarn_lock and check_command("yarn"):
            return "yarn"
        if pnpm_lock and check_command("pnpm"):
            return "pnpm"
        if npm_lock and check_command("npm"):
            return "npm"
        
        # If no lockfile is found, use whatever is available
        if check_command("yarn"):
            return "yarn"
        if check_command("pnpm"):
            return "pnpm"
        if check_command("npm"):
            return "npm"
        
        # Default to npm if nothing else is detected
        logger.warning("No JavaScript package manager detected; defaulting to npm")
        return "npm"
    
    def _get_package_json(self) -> Dict[str, Any]:
        """
        Get the contents of package.json.
        
        Returns:
            Contents of package.json as a dict, or empty dict if not found
        """
        try:
            if not os.path.exists(self.package_json_path):
                logger.warning(f"package.json not found at {self.package_json_path}")
                return {}
            
            with open(self.package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error parsing package.json: {e}")
            return {}
    
    def _save_package_json(self, data: Dict[str, Any]) -> bool:
        """
        Save contents to package.json.
        
        Args:
            data: Contents to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(self.package_json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            return True
        except IOError as e:
            logger.error(f"Error saving package.json: {e}")
            return False
    
    async def get_installed_packages(self) -> List[Dict[str, Any]]:
        """
        Get the list of installed JavaScript packages.
        
        Returns:
            List of dictionaries with package info
        """
        package_json = self._get_package_json()
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})
        
        # Use package manager to get actual installed versions
        if self.package_manager == "npm":
            cmd = ["npm", "list", "--json"]
        elif self.package_manager == "yarn":
            cmd = ["yarn", "list", "--json"]
        elif self.package_manager == "pnpm":
            cmd = ["pnpm", "list", "--json"]
        else:
            logger.error(f"Unsupported package manager: {self.package_manager}")
            return []
        
        try:
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.workspace_path
            )
            
            stdout, stderr = await result.communicate()
            
            # Parse the JSON output
            try:
                output = json.loads(stdout.decode('utf-8'))
                installed_deps = []
                
                if self.package_manager == "npm":
                    deps = output.get("dependencies", {})
                    for name, info in deps.items():
                        installed_deps.append({
                            "name": name,
                            "version": info.get("version", ""),
                            "dev": name in dev_dependencies
                        })
                elif self.package_manager == "yarn" or self.package_manager == "pnpm":
                    # Yarn and pnpm format is different, handle accordingly
                    deps = output.get("data", {}).get("trees", [])
                    for dep in deps:
                        name = dep.get("name", "")
                        if "@" in name:
                            name_parts = name.split("@")
                            if name_parts[0] == "":  # For scoped packages like @org/pkg
                                name = "@" + name_parts[1]
                                version = name_parts[2] if len(name_parts) > 2 else ""
                            else:
                                name = name_parts[0]
                                version = name_parts[1] if len(name_parts) > 1 else ""
                        else:
                            version = ""
                            
                        installed_deps.append({
                            "name": name,
                            "version": version,
                            "dev": name in dev_dependencies
                        })
                
                return installed_deps
                
            except json.JSONDecodeError:
                logger.warning(f"Error parsing package manager output: {stdout.decode('utf-8')}")
                
                # Fallback to using package.json
                deps = []
                for name, version in dependencies.items():
                    deps.append({"name": name, "version": version.replace("^", "").replace("~", ""), "dev": False})
                for name, version in dev_dependencies.items():
                    deps.append({"name": name, "version": version.replace("^", "").replace("~", ""), "dev": True})
                return deps
                
        except Exception as e:
            logger.error(f"Error getting installed packages: {e}")
            
            # Fallback to using package.json
            deps = []
            for name, version in dependencies.items():
                deps.append({"name": name, "version": version.replace("^", "").replace("~", ""), "dev": False})
            for name, version in dev_dependencies.items():
                deps.append({"name": name, "version": version.replace("^", "").replace("~", ""), "dev": True})
            return deps
    
    async def install_package(
        self,
        package_name: str,
        version: Optional[str] = None,
        dev: bool = False
    ) -> Dict[str, Any]:
        """
        Install a JavaScript package.
        
        Args:
            package_name: Name of the package to install
            version: Version to install (optional)
            dev: Whether to install as a dev dependency
            
        Returns:
            Dictionary with installation result
        """
        logger.info(f"Installing JavaScript package {package_name}" + 
                    (f" version {version}" if version else "") +
                    (" (dev)" if dev else ""))
        
        if version:
            full_name = f"{package_name}@{version}"
        else:
            full_name = package_name
        
        # Build command based on package manager
        if self.package_manager == "npm":
            cmd = ["npm", "install"]
            if dev:
                cmd.append("--save-dev")
            else:
                cmd.append("--save")
        elif self.package_manager == "yarn":
            cmd = ["yarn", "add"]
            if dev:
                cmd.append("--dev")
        elif self.package_manager == "pnpm":
            cmd = ["pnpm", "add"]
            if dev:
                cmd.append("--save-dev")
        else:
            return {"success": False, "error": f"Unsupported package manager: {self.package_manager}"}
        
        cmd.append(full_name)
        
        try:
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.workspace_path
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "package": package_name,
                    "version": version,
                    "dev": dev,
                    "output": stdout.decode('utf-8')
                }
            else:
                error_msg = stderr.decode('utf-8') or stdout.decode('utf-8')
                logger.error(f"Error installing {package_name}: {error_msg}")
                return {
                    "success": False,
                    "package": package_name,
                    "error": error_msg
                }
                
        except Exception as e:
            logger.error(f"Exception installing {package_name}: {e}")
            return {
                "success": False,
                "package": package_name,
                "error": str(e)
            }
    
    async def update_package(
        self,
        package_name: str,
        version: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update a JavaScript package to a specific version.
        
        Args:
            package_name: Name of the package to update
            version: Version to update to (optional)
            
        Returns:
            Dictionary with update result
        """
        logger.info(f"Updating JavaScript package {package_name}" + 
                    (f" to version {version}" if version else ""))
        
        # Get current package info to determine if it's a dev dependency
        package_json = self._get_package_json()
        is_dev = package_name in package_json.get("devDependencies", {})
        
        # Just use install with the version specified
        return await self.install_package(package_name, version, is_dev)
    
    async def uninstall_package(self, package_name: str) -> Dict[str, Any]:
        """
        Uninstall a JavaScript package.
        
        Args:
            package_name: Name of the package to uninstall
            
        Returns:
            Dictionary with uninstall result
        """
        logger.info(f"Uninstalling JavaScript package {package_name}")
        
        # Build command based on package manager
        if self.package_manager == "npm":
            cmd = ["npm", "uninstall", package_name]
        elif self.package_manager == "yarn":
            cmd = ["yarn", "remove", package_name]
        elif self.package_manager == "pnpm":
            cmd = ["pnpm", "remove", package_name]
        else:
            return {"success": False, "error": f"Unsupported package manager: {self.package_manager}"}
        
        try:
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.workspace_path
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "package": package_name,
                    "output": stdout.decode('utf-8')
                }
            else:
                error_msg = stderr.decode('utf-8') or stdout.decode('utf-8')
                logger.error(f"Error uninstalling {package_name}: {error_msg}")
                return {
                    "success": False,
                    "package": package_name,
                    "error": error_msg
                }
                
        except Exception as e:
            logger.error(f"Exception uninstalling {package_name}: {e}")
            return {
                "success": False,
                "package": package_name,
                "error": str(e)
            }
    
    async def update_all_packages(self) -> Dict[str, Any]:
        """
        Update all JavaScript packages to their latest versions.
        
        Returns:
            Dictionary with update results
        """
        logger.info(f"Updating all JavaScript packages")
        
        # Build command based on package manager
        if self.package_manager == "npm":
            cmd = ["npm", "update"]
        elif self.package_manager == "yarn":
            cmd = ["yarn", "upgrade"]
        elif self.package_manager == "pnpm":
            cmd = ["pnpm", "update"]
        else:
            return {"success": False, "error": f"Unsupported package manager: {self.package_manager}"}
        
        try:
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.workspace_path
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "output": stdout.decode('utf-8')
                }
            else:
                error_msg = stderr.decode('utf-8') or stdout.decode('utf-8')
                logger.error(f"Error updating packages: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg
                }
                
        except Exception as e:
            logger.error(f"Exception updating packages: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def check_outdated_packages(self) -> List[Dict[str, Any]]:
        """
        Check for outdated JavaScript packages.
        
        Returns:
            List of dictionaries with outdated package info
        """
        logger.info(f"Checking for outdated JavaScript packages")
        
        # Build command based on package manager
        if self.package_manager == "npm":
            cmd = ["npm", "outdated", "--json"]
        elif self.package_manager == "yarn":
            cmd = ["yarn", "outdated", "--json"]
        elif self.package_manager == "pnpm":
            cmd = ["pnpm", "outdated", "--json"]
        else:
            logger.error(f"Unsupported package manager: {self.package_manager}")
            return []
        
        try:
            result = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.workspace_path
            )
            
            stdout, stderr = await result.communicate()
            
            if result.returncode in [0, 1]:  # npm returns 1 when outdated packages are found
                output = stdout.decode('utf-8')
                
                try:
                    outdated = json.loads(output)
                    
                    # Format the results
                    if self.package_manager == "npm":
                        # npm returns a dictionary of package names
                        result_list = []
                        for name, info in outdated.items():
                            result_list.append({
                                "name": name,
                                "current": info.get("current", ""),
                                "wanted": info.get("wanted", ""),
                                "latest": info.get("latest", ""),
                                "dependent": info.get("dependent", ""),
                                "dev": name in self._get_package_json().get("devDependencies", {})
                            })
                        return result_list
                    else:
                        # yarn and pnpm return an array
                        result_list = []
                        for item in outdated:
                            result_list.append({
                                "name": item.get("name", ""),
                                "current": item.get("current", ""),
                                "wanted": item.get("wanted", ""),
                                "latest": item.get("latest", ""),
                                "dev": item.get("name", "") in self._get_package_json().get("devDependencies", {})
                            })
                        return result_list
                        
                except json.JSONDecodeError:
                    logger.warning(f"Error parsing outdated packages output: {output}")
                    return []
            else:
                error_msg = stderr.decode('utf-8')
                logger.error(f"Error checking outdated packages: {error_msg}")
                return []
                
        except Exception as e:
            logger.error(f"Exception checking outdated packages: {e}")
            return []