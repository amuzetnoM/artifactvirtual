# Dependency Manager: Core Implementation

## Self-Sustaining Service Design

The Dependency Manager is designed as a continuously running service with advanced self-recovery capabilities. This document details the core implementation logic with emphasis on the fail-safe mechanisms that ensure the service continues running under virtually all circumstances.

## Watchdog Architecture

### Cross-Platform Service Registration

The system employs a multi-layered approach for service persistence:

#### 1. Primary Service Registration (OS-Level)

```python
def register_system_service():
    """Register the dependency manager as a system service based on OS platform."""
    system = platform.system()
    
    if system == "Linux":
        # Create systemd service
        service_content = """
        [Unit]
        Description=ArtifactVirtual Dependency Manager
        After=network.target

        [Service]
        Type=simple
        User={current_user}
        WorkingDirectory={workspace_root}
        ExecStart={python_path} {script_path}
        Restart=always
        RestartSec=10
        StandardOutput=syslog
        StandardError=syslog
        SyslogIdentifier=av-depman

        [Install]
        WantedBy=multi-user.target
        """.format(
            current_user=get_current_user(),
            workspace_root=get_workspace_root(),
            python_path=sys.executable,
            script_path=os.path.join(get_workspace_root(), "dependency-manager", "service.py")
        )
        
        # Write service file and register with systemd
        with open("/tmp/av-dependency-manager.service", "w") as f:
            f.write(service_content)
        
        subprocess.run(["sudo", "mv", "/tmp/av-dependency-manager.service", "/etc/systemd/system/"])
        subprocess.run(["sudo", "systemctl", "daemon-reload"])
        subprocess.run(["sudo", "systemctl", "enable", "av-dependency-manager"])
        subprocess.run(["sudo", "systemctl", "start", "av-dependency-manager"])
        
    elif system == "Windows":
        # Use Windows Service Control Manager
        import win32service
        import win32serviceutil
        
        service_path = f'"{sys.executable}" "{os.path.join(get_workspace_root(), "dependency-manager", "windows_service.py")}"'
        subprocess.run(["sc", "create", "AVDependencyManager", 
                        "binPath=", service_path,
                        "start=", "auto",
                        "DisplayName=", "ArtifactVirtual Dependency Manager"])
        subprocess.run(["sc", "start", "AVDependencyManager"])
        
    elif system == "Darwin":  # macOS
        # Create launchd plist
        plist_content = """
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
        <dict>
            <key>Label</key>
            <string>com.artifactvirtual.dependencymanager</string>
            <key>ProgramArguments</key>
            <array>
                <string>{python_path}</string>
                <string>{script_path}</string>
            </array>
            <key>RunAtLoad</key>
            <true/>
            <key>KeepAlive</key>
            <true/>
            <key>StandardOutPath</key>
            <string>{log_path}/depman.log</string>
            <key>StandardErrorPath</key>
            <string>{log_path}/depman_error.log</string>
        </dict>
        </plist>
        """.format(
            python_path=sys.executable,
            script_path=os.path.join(get_workspace_root(), "dependency-manager", "service.py"),
            log_path=os.path.join(get_workspace_root(), "logs")
        )
        
        plist_path = os.path.expanduser("~/Library/LaunchAgents/com.artifactvirtual.dependencymanager.plist")
        with open(plist_path, "w") as f:
            f.write(plist_content)
        
        subprocess.run(["launchctl", "load", plist_path])
```

#### 2. Secondary Watchdog Process (Application-Level)

```python
class WatchdogProcess:
    """A lightweight process that ensures the main service stays running."""
    
    def __init__(self, service_module, check_interval=10, max_restart_attempts=0):
        self.service_module = service_module
        self.check_interval = check_interval  # seconds
        self.max_restart_attempts = max_restart_attempts  # 0 = unlimited
        self.service_process = None
        self.restart_count = 0
        self.last_restart_time = 0
        self.running = False
        self.db_path = os.path.join(get_workspace_root(), "dependency-manager", "data", "watchdog.db")
        
        # Initialize database
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database for persistence."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables if they don't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS watchdog_state (
            id INTEGER PRIMARY KEY,
            restart_count INTEGER,
            last_restart_time INTEGER,
            is_running INTEGER
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS restart_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            reason TEXT,
            exit_code INTEGER
        )
        ''')
        
        # Initialize state if needed
        cursor.execute("SELECT COUNT(*) FROM watchdog_state")
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                "INSERT INTO watchdog_state (id, restart_count, last_restart_time, is_running) VALUES (1, 0, 0, 0)")
        
        conn.commit()
        conn.close()
    
    def _load_state(self):
        """Load watchdog state from database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT restart_count, last_restart_time, is_running FROM watchdog_state WHERE id = 1")
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
    
    def _log_restart_event(self, reason, exit_code=None):
        """Log a restart event to the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO restart_events (timestamp, reason, exit_code) VALUES (?, ?, ?)",
            (int(time.time()), reason, exit_code)
        )
        conn.commit()
        conn.close()
    
    def start_service(self):
        """Start the service process."""
        if self.service_process is not None and self.service_process.poll() is None:
            return  # Process is already running
        
        try:
            # Start the main service as a subprocess
            self.service_process = subprocess.Popen(
                [sys.executable, "-m", self.service_module],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.running = True
            self.last_restart_time = int(time.time())
            self.restart_count += 1
            self._save_state()
            self._log_restart_event("Service started")
            
            logger.info(f"Started service process (PID: {self.service_process.pid})")
        except Exception as e:
            logger.error(f"Failed to start service process: {e}")
            self._log_restart_event(f"Start failed: {str(e)}")
    
    def check_service(self):
        """Check if the service is running and restart if needed."""
        if self.service_process is None or self.service_process.poll() is not None:
            exit_code = None if self.service_process is None else self.service_process.poll()
            
            # If max restart attempts is set and exceeded, don't restart
            if 0 < self.max_restart_attempts <= self.restart_count:
                logger.warning(f"Max restart attempts ({self.max_restart_attempts}) reached. Not restarting.")
                return
            
            # Use exponential backoff for restarts
            if self.restart_count > 0:
                backoff_time = min(300, 2 ** min(self.restart_count, 8))  # Max 5 minutes
                time_since_last = time.time() - self.last_restart_time
                
                if time_since_last < backoff_time:
                    logger.info(f"Waiting {backoff_time-time_since_last:.1f}s before restart (backoff)")
                    return
            
            logger.warning(f"Service process not running (exit code: {exit_code}). Restarting...")
            self._log_restart_event("Process not running", exit_code)
            self.start_service()
    
    def run(self):
        """Run the watchdog process continuously."""
        logger.info("Starting watchdog process")
        
        # Check if we were previously running
        was_running = self._load_state()
        if was_running:
            logger.info("Watchdog was previously running, resuming monitoring")
        
        # Start the service initially
        self.start_service()
        
        try:
            while True:
                self.check_service()
                time.sleep(self.check_interval)
        except KeyboardInterrupt:
            logger.info("Watchdog process interrupted")
            self.running = False
            self._save_state()
            
            # Gracefully terminate service
            if self.service_process and self.service_process.poll() is None:
                self.service_process.terminate()
                try:
                    self.service_process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    self.service_process.kill()
```

#### 3. Tertiary In-Process Monitoring (Service-Level)

```python
class ServiceSelfMonitor:
    """In-process monitoring for the dependency manager service."""
    
    def __init__(self, service_instance, heartbeat_interval=5):
        self.service = service_instance
        self.heartbeat_interval = heartbeat_interval
        self.last_heartbeat = time.time()
        self.heartbeat_file = os.path.join(get_workspace_root(), "dependency-manager", "data", "heartbeat")
        self.pid_file = os.path.join(get_workspace_root(), "dependency-manager", "data", "service.pid")
        self._write_pid()
    
    def _write_pid(self):
        """Write the current process ID to the PID file."""
        os.makedirs(os.path.dirname(self.pid_file), exist_ok=True)
        with open(self.pid_file, "w") as f:
            f.write(str(os.getpid()))
    
    async def update_heartbeat(self):
        """Update the heartbeat timestamp."""
        self.last_heartbeat = time.time()
        
        # Write to heartbeat file
        os.makedirs(os.path.dirname(self.heartbeat_file), exist_ok=True)
        with open(self.heartbeat_file, "w") as f:
            f.write(str(self.last_heartbeat))
    
    async def start_heartbeat_task(self):
        """Start the heartbeat update task."""
        while True:
            await self.update_heartbeat()
            await asyncio.sleep(self.heartbeat_interval)
```

### Fail-Safe Mechanisms

Multiple layers of fail-safe mechanisms ensure continuous operation:

1. **Process Resurrection**
   - When the main service process terminates unexpectedly, the watchdog process immediately restarts it.
   - Exponential backoff prevents rapid restart loops for persistent issues.
   - Detailed failure logs help diagnose and fix recurring issues.

2. **State Persistence**
   - SQLite database maintains service state across restarts.
   - Restart events and history are preserved.
   - Resumable tasks ensure no dependency tracking is lost.

3. **Deadlock Detection**
   - Heartbeat mechanism detects service hangs or deadlocks.
   - If heartbeats stop, the watchdog can force terminate and restart.
   - Critical sections are implemented with timeouts to prevent indefinite locks.

4. **Crash Recovery**
   - Exception handlers at multiple levels prevent cascading failures.
   - Memory-mapped transaction logs allow recovery from partial operations.
   - Atomic file operations prevent configuration corruption.

### Process Initialization Flow

```
┌──────────────────┐
│ System Boot      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ OS Service       │
│ Manager          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ Watchdog Process │────►│ Service Process  │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         └──────────────►│ Self-Monitor     │
                         └──────────────────┘
```

## Core Service Implementation

### Main Service Class

```python
class DependencyManagerService:
    """Core dependency manager service."""
    
    def __init__(self):
        self.db_path = os.path.join(get_workspace_root(), "dependency-manager", "data", "service.db")
        self.config_path = os.path.join(get_workspace_root(), "dependency-manager", "config", "service.json")
        self.running = False
        self.monitors = {}
        self.tasks = {}
        self.llm_engine = None
        self.file_watcher = None
        self.self_monitor = None
        
        # Initialize state
        self._init_db()
        self._load_config()
    
    def _init_db(self):
        """Initialize the service database."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables for dependency tracking, file monitoring, and tasks
        cursor.execute('''
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
        ''')
        
        # Additional tables for file tracking, tasks, etc.
        # ...
        
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
                }
            }
            
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, "w") as f:
                json.dump(config, f, indent=2)
            
            self.config = config
        else:
            with open(self.config_path, "r") as f:
                self.config = json.load(f)
    
    async def initialize(self):
        """Initialize the service components."""
        logger.info("Initializing dependency manager service")
        
        # Initialize self-monitoring
        self.self_monitor = ServiceSelfMonitor(self, self.config["watchdog"]["heartbeat_interval"])
        
        # Initialize file watcher
        self.file_watcher = FileWatcher(
            workspace_root=get_workspace_root(),
            patterns=self.config["file_patterns"],
            ignore_patterns=self.config["ignore_patterns"],
            callback=self.handle_file_change
        )
        
        # Initialize LLM engine (lazily loaded when needed)
        self.llm_engine = LLMEngine(
            model_path=self.config["llm"]["model_path"],
            quantization=self.config["llm"]["quantization"]
        )
    
    async def start(self):
        """Start the service."""
        logger.info("Starting dependency manager service")
        self.running = True
        
        # Start self-monitoring
        asyncio.create_task(self.self_monitor.start_heartbeat_task())
        
        # Start file watcher
        await self.file_watcher.start()
        
        # Start main service loop
        await self._run_service_loop()
    
    async def _run_service_loop(self):
        """Main service loop."""
        try:
            while self.running:
                # Process any pending tasks
                await self._process_tasks()
                
                # Wait for the next cycle
                await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in main service loop: {e}")
            logger.exception(e)
    
    async def _process_tasks(self):
        """Process pending tasks from the task queue."""
        # Implementation for task processing
        pass
    
    async def handle_file_change(self, file_path, event_type):
        """Handle file change events from file watcher."""
        logger.info(f"File change detected: {file_path} ({event_type})")
        
        # Determine file type and appropriate handler
        if file_path.endswith("requirements.txt"):
            await self._handle_python_requirements(file_path)
        elif file_path.endswith("package.json"):
            await self._handle_npm_package(file_path)
        elif file_path.endswith("Cargo.toml"):
            await self._handle_rust_cargo(file_path)
        # More handlers for other file types...
    
    async def _handle_python_requirements(self, file_path):
        """Handle changes to Python requirements.txt files."""
        try:
            with open(file_path, "r") as f:
                content = f.read()
            
            # Parse requirements
            dependencies = []
            for line in content.splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    # Basic parsing (would be more sophisticated in real implementation)
                    parts = line.split("==")
                    if len(parts) == 2:
                        name, version = parts
                        dependencies.append({"name": name.strip(), "version": version.strip()})
                    else:
                        dependencies.append({"name": line.strip(), "version": None})
            
            # Queue installation task
            for dep in dependencies:
                self._queue_dependency_task(
                    name=dep["name"],
                    version=dep["version"],
                    language="python",
                    project_path=os.path.dirname(file_path),
                    file_path=file_path
                )
        except Exception as e:
            logger.error(f"Error handling Python requirements file {file_path}: {e}")
            logger.exception(e)
    
    def _queue_dependency_task(self, name, version, language, project_path, file_path):
        """Queue a dependency installation task."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Check if dependency already exists
            cursor.execute(
                "SELECT id, version, installed FROM dependencies WHERE name = ? AND language = ? AND project_path = ?",
                (name, language, project_path)
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update existing dependency if version changed or not installed
                dep_id, existing_version, installed = existing
                if version != existing_version or not installed:
                    cursor.execute(
                        "UPDATE dependencies SET version = ?, installed = 0 WHERE id = ?",
                        (version, dep_id)
                    )
                    conn.commit()
                    
                    # Queue for installation
                    task_id = f"install_{language}_{name}_{int(time.time())}"
                    self.tasks[task_id] = {
                        "type": "install_dependency",
                        "name": name,
                        "version": version,
                        "language": language,
                        "project_path": project_path,
                        "file_path": file_path,
                        "status": "pending"
                    }
            else:
                # Insert new dependency
                cursor.execute(
                    "INSERT INTO dependencies (name, version, language, project_path, file_path) VALUES (?, ?, ?, ?, ?)",
                    (name, version, language, project_path, file_path)
                )
                conn.commit()
                
                # Queue for installation
                task_id = f"install_{language}_{name}_{int(time.time())}"
                self.tasks[task_id] = {
                    "type": "install_dependency",
                    "name": name,
                    "version": version,
                    "language": language,
                    "project_path": project_path,
                    "file_path": file_path,
                    "status": "pending"
                }
        except Exception as e:
            logger.error(f"Error queuing dependency task: {e}")
            conn.rollback()
        finally:
            conn.close()
```

### LLM Engine Implementation

```python
class LLMEngine:
    """LLM engine for dependency analysis."""
    
    def __init__(self, model_path, quantization):
        self.model_path = model_path
        self.quantization = quantization
        self.model = None
        self.tokenizer = None
        self.loaded = False
        self.lock = asyncio.Lock()
    
    async def ensure_loaded(self):
        """Ensure the model is loaded."""
        if self.loaded:
            return
        
        async with self.lock:
            if self.loaded:
                return
            
            try:
                logger.info(f"Loading LLM model: {self.model_path}")
                
                # Import libraries here to avoid loading them unless needed
                from transformers import AutoModelForCausalLM, AutoTokenizer
                
                # Load tokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                
                # Load model with optimizations
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_path,
                    device_map="auto",
                    load_in_8bit=self.quantization == "int8",
                    load_in_4bit=self.quantization == "int4" or self.quantization == "q4_k_m"
                )
                
                self.loaded = True
                logger.info("LLM model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading LLM model: {e}")
                logger.exception(e)
                raise
    
    async def analyze_dependencies(self, dependencies, file_content, language):
        """Analyze dependencies using the LLM."""
        await self.ensure_loaded()
        
        # Create prompt for dependency analysis
        prompt = f"""
        Analyze the following {language} dependencies:
        
        File content:
        {file_content}
        
        Current dependencies:
        {json.dumps(dependencies, indent=2)}
        
        1. Identify any missing dependencies based on code usage.
        2. Suggest updates or alternatives for outdated packages.
        3. Flag any potential security issues or conflicts.
        
        Respond with a JSON object containing:
        1. missing_dependencies: array of packages to install
        2. updates: array of packages to update with versions
        3. security_issues: array of packages with security concerns
        """
        
        # Generate response
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            inputs["input_ids"],
            max_length=2048,
            temperature=0.1,
            top_p=0.95
        )
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract JSON from response (in real implementation, more robust parsing would be needed)
        try:
            # Find JSON content in response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
            else:
                logger.warning("Could not find valid JSON in LLM response")
                return {}
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return {}
```

## File Watcher Implementation

```python
class FileWatcher:
    """File system watcher for dependency-related files."""
    
    def __init__(self, workspace_root, patterns, ignore_patterns, callback):
        self.workspace_root = workspace_root
        self.patterns = patterns
        self.ignore_patterns = ignore_patterns
        self.callback = callback
        self.observers = []
        self._setup_observers()
    
    def _setup_observers(self):
        """Set up file system observers."""
        # Import here to avoid loading watchdog unless needed
        from watchdog.observers import Observer
        from watchdog.events import PatternMatchingEventHandler
        
        # Create event handler
        event_handler = PatternMatchingEventHandler(
            patterns=self.patterns,
            ignore_patterns=self.ignore_patterns,
            ignore_directories=True,
            case_sensitive=False
        )
        
        # Set up event callbacks
        event_handler.on_created = self._on_created
        event_handler.on_modified = self._on_modified
        event_handler.on_deleted = self._on_deleted
        
        # Create observer
        observer = Observer()
        observer.schedule(event_handler, self.workspace_root, recursive=True)
        self.observers.append(observer)
    
    async def start(self):
        """Start the file watcher."""
        for observer in self.observers:
            observer.start()
    
    async def stop(self):
        """Stop the file watcher."""
        for observer in self.observers:
            observer.stop()
            observer.join()
    
    def _on_created(self, event):
        """Handle file creation events."""
        asyncio.create_task(self.callback(event.src_path, "created"))
    
    def _on_modified(self, event):
        """Handle file modification events."""
        asyncio.create_task(self.callback(event.src_path, "modified"))
    
    def _on_deleted(self, event):
        """Handle file deletion events."""
        asyncio.create_task(self.callback(event.src_path, "deleted"))
```

## Main Entry Point

```python
def main():
    """Main entry point for the dependency manager service."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Dependency Manager Service")
    parser.add_argument("--watchdog", action="store_true", help="Run as watchdog process")
    args = parser.parse_args()
    
    if args.watchdog:
        # Run as watchdog process
        watchdog = WatchdogProcess("dependency_manager.service")
        watchdog.run()
    else:
        # Run as main service
        async def run_service():
            service = DependencyManagerService()
            await service.initialize()
            await service.start()
        
        # Run the service
        asyncio.run(run_service())

if __name__ == "__main__":
    main()
```

## Installation Module Examples

### Python Package Installer

```python
class PythonPackageInstaller:
    """Installer for Python packages."""
    
    def __init__(self, db_path):
        self.db_path = db_path
    
    async def install_package(self, name, version=None, project_path=None):
        """Install a Python package."""
        logger.info(f"Installing Python package: {name}{' == ' + version if version else ''}")
        
        try:
            # Determine if virtual environment exists
            venv_path = os.path.join(project_path, ".venv")
            has_venv = os.path.exists(venv_path) and os.path.isdir(venv_path)
            
            # Construct command
            cmd = [sys.executable, "-m", "pip", "install"]
            if version:
                cmd.append(f"{name}=={version}")
            else:
                cmd.append(name)
            
            # Execute installation
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = await process.communicate()
            
            # Update database with installation result
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if process.returncode == 0:
                cursor.execute(
                    "UPDATE dependencies SET installed = 1, installation_time = ? WHERE name = ? AND language = ?",
                    (int(time.time()), name, "python")
                )
                conn.commit()
                logger.info(f"Successfully installed Python package: {name}")
                return True, stdout
            else:
                logger.error(f"Failed to install Python package {name}: {stderr}")
                return False, stderr
        except Exception as e:
            logger.error(f"Error installing Python package {name}: {e}")
            logger.exception(e)
            return False, str(e)
        finally:
            if 'conn' in locals():
                conn.close()
```

## Deployment Instructions

1. **Clone repository**
   - `git clone <repository-url>`
   - `cd <repository-dir>`

2. **Install dependencies**
   - `pip install -r dependency-manager/requirements.txt`

3. **Create configuration**
   - `cp dependency-manager/config/service.json.example dependency-manager/config/service.json`
   - Edit configuration as needed

4. **Register as system service**
   - Linux: `sudo python -m dependency_manager.install --system`
   - Windows: Run as administrator: `python -m dependency_manager.install --system`
   - macOS: `python -m dependency_manager.install --system`

5. **Start service immediately**
   - `python -m dependency_manager.service`

6. **Verify service is running**
   - `python -m dependency_manager.status`