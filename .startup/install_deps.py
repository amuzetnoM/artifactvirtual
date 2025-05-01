import os
import sys
import platform
import subprocess
import venv
import json

# --- Configuration ---
VENV_DIR = ".venv"
STARTUP_DIR = ".startup"
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")
REQUIREMENTS_FILE = "requirements.txt"

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
        # Fallback to system python if venv doesn't exist or isn't activated
        # This might happen if the script is run before venv creation or outside it
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
    if not os.path.exists(os.path.join(VENV_DIR, 'pyvenv.cfg')):
        print_color(f"Creating virtual environment in '{VENV_DIR}'...", "blue")
        try:
            # Use the current system Python to create the venv
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
    # Construct pip path relative to the python executable in the venv
    pip_exe = os.path.join(os.path.dirname(python_exe), 'pip')
    if platform.system() == "Windows":
        pip_exe += ".exe" # Ensure .exe extension on Windows

    # Verify pip executable exists
    if not os.path.exists(pip_exe):
        print_color(f"[ERROR] Pip executable not found at expected location: {pip_exe}", "red")
        print_color("Please ensure the virtual environment is correctly set up.", "red")
        sys.exit(1)

    # 2. Install Python Requirements
    print_color(f"Installing Python requirements from {REQUIREMENTS_FILE}...", "cyan")
    if os.path.exists(REQUIREMENTS_FILE):
        try:
            # Upgrade pip first within the venv
            print_color("Upgrading pip...", "blue")
            subprocess.check_call([python_exe, "-m", "pip", "install", "--upgrade", "pip"])
            # Install requirements using the venv's pip
            print_color(f"Running: {pip_exe} install -r {REQUIREMENTS_FILE}", "blue")
            subprocess.check_call([pip_exe, "install", "-r", REQUIREMENTS_FILE])
            print_color("[OK] Python requirements installed successfully.", "green")
        except subprocess.CalledProcessError as e:
            print_color(f"[ERROR] Failed to install Python requirements: {e}", "red")
            # Decide whether to exit or continue
            # sys.exit(1)
        except FileNotFoundError:
            print_color(f"[ERROR] '{pip_exe}' or '{python_exe}' command not found. Venv might be corrupted or PATH issue.", "red")
            sys.exit(1)
    else:
        print_color(f"[WARN] '{REQUIREMENTS_FILE}' not found. Skipping Python dependency installation.", "yellow")

    # 3. Install AutoRound (Conditional)
    print_color("Installing AutoRound...", "cyan")
    autoround_package = "auto-round"
    if not cuda_available:
        autoround_package += "[cpu]"
        print_color("[INFO] Installing CPU version of AutoRound.", "magenta")
    else:
        print_color("[INFO] Installing GPU version of AutoRound.", "magenta")

    try:
        print_color(f"Running: {pip_exe} install {autoround_package}", "blue")
        subprocess.check_call([pip_exe, "install", autoround_package])
        print_color("[OK] AutoRound installed successfully.", "green")
    except subprocess.CalledProcessError as e:
        print_color(f"[ERROR] Failed to install AutoRound: {e}", "red")
    except FileNotFoundError:
        print_color(f"[ERROR] '{pip_exe}' command not found. Venv might be corrupted.", "red")
        sys.exit(1)

    # 4. Guidance for Manual Installs (if checks failed in check_system.py)
    print_color("--- Manual Installation Notes ---", "HEADER")
    # Reload status in case check_system created it but this script runs separately
    status = load_status() # Reload status to get latest checks

    # Check specific commands again for guidance (could rely solely on status file)
    if not check_command("ollama"):
        print_color("[ACTION] Ollama not found. Please install from https://ollama.com/", "yellow")
    if not check_command("psql"):
        print_color("[ACTION] PostgreSQL client (psql) not found. Please install PostgreSQL (including client tools) for your OS.", "yellow")
    if not check_command("ffmpeg"):
        print_color("[ACTION] ffmpeg not found. Please install ffmpeg for your OS if needed for audio/video processing.", "yellow")
    if not check_command("node"):
        print_color("[ACTION] Node.js not found. Please install Node.js (v20+) from https://nodejs.org/ if needed for frontend tasks.", "yellow")

    print_color("--- Dependency Installation Complete ---", "HEADER")

if __name__ == "__main__":
    main()
