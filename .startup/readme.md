# ArtifactVirtual: Portable, Self-Initializing Workspace Bootstrap

ArtifactVirtual provides a seamless, Docker-free bootstrap for your AI workspace. On clone or launch, it sets up your entire environment, installs all required modules/tools, boots key services, and welcomes you to start building immediately.

---

## 🚀 Key Features

- **No Docker/devcontainer required**: Runs natively on Windows, macOS, and Linux.
- **One-step setup**: Just `python startup.py` after cloning.
- **Automated dependency management**: Installs and verifies CUDA, PostgreSQL, Ollama, LangChain stack, and more.
- **Service orchestration**: Boots Ollama, memory backends, and core modules.
- **Interactive onboarding**: Ends with a prompt:  
    _Welcome to ArtifactVirtual. What's your first prompt?_

---

## 🧠 Bootstrap Flow

### Objectives

- **Cross-platform**: Works on Windows/macOS/Linux.
- **Self-initializing**: Activates on clone, pull, or workspace launch.
- **Automated**: Installs, verifies, and launches all core components.

### What Happens on Startup

1. **System Check**: Verifies Python, CUDA, PostgreSQL, and other dependencies.
2. **Dependency Installation**: Installs Python packages and system tools as needed.
3. **Service Boot**: Starts Ollama, initializes Autoround, and loads LLM chains.
4. **Interactive Prompt**: Welcomes you and awaits your first command.

---

## 📁 File Structure

```
artifactvirtual/
├── .startup/
│   ├── check_system.py        # Ensures GPU, Python, dependencies
│   ├── install_deps.py        # Installs pip/apt/npm tools
│   ├── ollama_boot.py         # Starts Ollama and checks model load
│   ├── autoround_init.py      # Runs and verifies Autoround environment
│   └── welcome_prompt.py      # "What's your first prompt?"
│
├── startup.py                 # Cross-platform orchestrator
├── requirements.txt
├── README.md
```

---

## 🛠️ startup.py Logic

The main `startup.py` script:

1. **Detects the platform** and sets appropriate paths
2. **Sequentially runs** each step in the bootstrap process
3. **Handles errors gracefully** with proper fallbacks
4. **Logs progress** for transparency and debugging
5. **Provides a final status summary** showing component availability

Key components:

```python
# Core bootstrap sequence
startup_scripts = [
    CHECK_SYSTEM_SCRIPT,
    INSTALL_DEPS_SCRIPT,
    OLLAMA_BOOT_SCRIPT,
    AUTOROUND_INIT_SCRIPT,
    WELCOME_PROMPT_SCRIPT,
]

# Run each script in sequence
for script in startup_scripts:
    script_succeeded = run_script(script)
    if not script_succeeded:
        all_successful = False
        print_color(f"Setup step {os.path.basename(script)} failed or reported errors.", "YELLOW")
```

---

## 🗂️ Components

### check_system.py

- Validates system requirements
- Checks Python version and platform compatibility
- Verifies GPU availability and drivers
- Reports on available memory and disk space

### install_deps.py

- Creates Python virtual environment
- Installs core Python packages from requirements.txt
- Sets up platform-specific dependencies
- Configures development tools

### ollama_boot.py

- Verifies Ollama installation
- Pulls required models if not already present
- Tests model loading and inference
- Ensures API endpoint is accessible

### autoround_init.py

- Sets up AutoRound for model quantization
- Verifies required libraries and components
- Tests basic quantization functionality
- Prepares for model optimization

### welcome_prompt.py

- Presents an interactive welcome message
- Guides the user through initial setup
- Offers suggestions for first steps
- Collects initial preferences

---

## 🏁 Quickstart

After cloning:

```bash
python startup.py
```

- Verifies your system
- Installs missing dependencies
- Boots Ollama, memory, and LLM chains
- Prints:

```
🧠 Welcome to ArtifactVirtual.
What's your first prompt?
> _
```

---

**ArtifactVirtual**: Your AI workspace, ready in seconds—no containers, no hassle.
