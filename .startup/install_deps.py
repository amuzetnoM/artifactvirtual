# -*- coding: utf-8 -*-
import os
import sys
import platform
import subprocess
import json

# --- Configuration ---
VENV_DIR = ".venv"
STARTUP_DIR = os.path.dirname(__file__)
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")
REQUIREMENTS_FILE = os.path.abspath(os.path.join(STARTUP_DIR, "..", "requirements.txt"))
VENV_DIR = os.path.abspath(os.path.join(STARTUP_DIR, "..", ".venv"))

# --- Helper Functions ---
def print_color(text, color):
    colors = {
        "HEADER": '\033[95m', "BLUE": '\033[94m', "CYAN": '\033[96m',
        "GREEN": '\033[92m', "YELLOW": '\033[93m', "RED": '\033[91m',
        "ENDC": '\033[0m', "BOLD": '\033[1m', "UNDERLINE": '\033[4m'
    }
    if platform.system() != "Windows" and hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
        print(f"{colors.get(color.upper(), colors['ENDC'])}{text}{colors['ENDC']}")
    else:
        prefix = f"[{color.upper()}] " if color.upper() not in ["ENDC", "BOLD", "UNDERLINE", "HEADER"] else ""
        print(f"{prefix}{text}")

def check_command(command):
    """Checks if a command exists using shutil.which."""
    import shutil
    path = shutil.which(command)
    return path is not None # Return True if found, False otherwise

def get_python_executable():
    """Gets the path to the Python executable, preferring the venv."""
    if platform.system() == "Windows":
        python_exe = os.path.join(VENV_DIR, "Scripts", "python.exe")
    else:
        python_exe = os.path.join(VENV_DIR, "bin", "python")

    if os.path.exists(python_exe):
        return python_exe
    else:
        return sys.executable

def load_status():
    """Loads status from a JSON file."""
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (IOError, json.JSONDecodeError) as e:
            print_color(f"[WARN] Could not read status file {STATUS_FILE}: {e}", "yellow")
            return {}
    return {}

# --- Main Installation Logic ---
def main():
    print_color("--- Installing Dependencies ---", "HEADER")
    status = load_status()
    cuda_available = status.get('cuda_available', False) # Default to False

    # 1. Create/Verify Virtual Environment
    print_color(f"Ensuring virtual environment '{VENV_DIR}' exists...", "cyan")
    venv_pyvenv_cfg = os.path.join(VENV_DIR, 'pyvenv.cfg')
    if not os.path.exists(venv_pyvenv_cfg):
        print_color(f"Creating virtual environment in '{VENV_DIR}'...", "blue")
        try:
            subprocess.check_call([sys.executable, "-m", "venv", VENV_DIR])
            print_color("[OK] Virtual environment created.", "green")
        except subprocess.CalledProcessError as e:
            print_color(f"[ERROR] Failed to create virtual environment: {e}", "red")
            sys.exit(1)
        except Exception as e:
            print_color(f"[ERROR] Unexpected error creating virtual environment: {e}", "red")
            sys.exit(1)
    else:
        print_color(f"[OK] Virtual environment '{VENV_DIR}' already exists.", "green")

    python_exe = get_python_executable()
    pip_exe = os.path.join(os.path.dirname(python_exe), 'pip')
    if platform.system() == "Windows":
        pip_exe += ".exe"

    if not os.path.exists(pip_exe):
        print_color(f"[ERROR] Pip executable not found at expected location: {pip_exe}", "red")
        print_color("Please ensure the virtual environment is correctly set up.", "red")
        sys.exit(1)

    # 2. Install Python Requirements
    print_color(f"Installing Python requirements from {REQUIREMENTS_FILE}...", "cyan")
    requirements_ok = False
    if os.path.exists(REQUIREMENTS_FILE):
        try:
            print_color("Upgrading pip...", "blue")
            subprocess.check_call([python_exe, "-m", "pip", "install", "--upgrade", "pip"])
            print_color(f"Running: {pip_exe} install -r {REQUIREMENTS_FILE}", "blue")
            result = subprocess.run([pip_exe, "install", "-r", REQUIREMENTS_FILE], capture_output=True, text=True, encoding='utf-8', errors='ignore')
            if result.returncode == 0:
                print_color("[OK] Python requirements installed successfully.", "green")
                requirements_ok = True
            else:
                print_color(f"[ERROR] Failed to install Python requirements (exit code {result.returncode}).", "red")
                print_color("--- pip stdout ---", "yellow")
                print(result.stdout)
                print_color("--- pip stderr ---", "red")
                print(result.stderr)
                print_color("Continuing setup, but some dependencies might be missing.", "yellow")
        except FileNotFoundError:
            print_color(f"[ERROR] '{pip_exe}' or '{python_exe}' command not found. Venv might be corrupted or PATH issue.", "red")
            sys.exit(1)
        except Exception as e:
            print_color(f"[ERROR] An unexpected error occurred during requirements installation: {e}", "red")
    else:
        print_color(f"[WARN] '{REQUIREMENTS_FILE}' not found. Skipping Python dependency installation.", "yellow")

    # 3. Install AutoRound (Conditional)
    print_color("Installing AutoRound...", "cyan")
    autoround_ok = False
    autoround_package = "auto-round"
    if not cuda_available:
        autoround_package += "[cpu]"
        print_color("[INFO] Installing CPU version of AutoRound.", "magenta")
    else:
        print_color("[INFO] Installing GPU version of AutoRound.", "magenta")

    try:
        print_color(f"Running: {pip_exe} install {autoround_package}", "blue")
        result = subprocess.run([pip_exe, "install", autoround_package], capture_output=True, text=True, encoding='utf-8', errors='ignore')
        if result.returncode == 0:
            print_color("[OK] AutoRound installed successfully.", "green")
            autoround_ok = True
        else:
            print_color(f"[ERROR] Failed to install AutoRound (exit code {result.returncode}).", "red")
            print_color("--- pip stdout ---", "yellow")
            print(result.stdout)
            print_color("--- pip stderr ---", "red")
            print(result.stderr)
            print_color("Continuing setup, but AutoRound might be missing or non-functional.", "yellow")
    except FileNotFoundError:
        print_color(f"[ERROR] '{pip_exe}' command not found. Venv might be corrupted.", "red")
        sys.exit(1)
    except Exception as e:
        print_color(f"[ERROR] An unexpected error occurred during AutoRound installation: {e}", "red")

    # 4. Guidance for Manual Installs (if checks failed in check_system.py)
    print_color("--- Manual Installation Notes ---", "HEADER")
    status = load_status()

    if not check_command("ollama"):
        print_color("[ACTION] Ollama not found. Please install from https://ollama.com/", "yellow")
    if not check_command("psql"):
        print_color("[ACTION] PostgreSQL client (psql) not found. Please install PostgreSQL (including client tools) for your OS.", "yellow")
    if not check_command("ffmpeg"):
        print_color("[ACTION] ffmpeg not found. Please install ffmpeg for your OS if needed for audio/video processing.", "yellow")
    if not check_command("node"):
        print_color("[ACTION] Node.js not found. Please install Node.js (v20+) from https://nodejs.org/ if needed for frontend tasks.", "yellow")

    if not requirements_ok:
        print_color("[WARN] Core Python requirements from requirements.txt may not have installed correctly.", "yellow")
    if not autoround_ok:
        print_color("[WARN] AutoRound may not have installed correctly.", "yellow")

    print_color("--- Dependency Installation Complete ---", "HEADER")

if __name__ == "__main__":
    main()
