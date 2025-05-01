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
│   ├── install_deps.sh        # Installs pip/apt/npm tools
│   ├── ollama_boot.py         # Starts Ollama and checks model load
│   ├── autoround_init.py      # Runs and verifies Autoround environment
│   └── welcome_prompt.py      # "What's your first prompt?"
│
├── run.sh                     # Unified startup script (bash)
├── startup.py                 # Cross-platform orchestrator
├── requirements.txt
├── README.md
```

---

## 🛠️ startup.py Logic

```python
import subprocess
import sys
import os

def run_script(name):
        subprocess.run([sys.executable, f".startup/{name}.py"], check=True)

def main():
        print("🔧 Initializing ArtifactVirtual environment...")
        run_script("check_system")
        subprocess.run(["bash", ".startup/install_deps.sh"], check=True)
        run_script("ollama_boot")
        run_script("autoround_init")
        run_script("welcome_prompt")

if __name__ == "__main__":
        main()
```

---

## 🗂️ requirements.txt (Sample)

```
transformers
langchain
autoround
ollama
openai
datasets
psycopg2-binary
faiss-cpu
readability-lxml
beautifulsoup4
trafilatura
```

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
What’s your first prompt?
> _
```

---

**ArtifactVirtual**: Your AI workspace, ready in seconds—no containers, no hassle.
