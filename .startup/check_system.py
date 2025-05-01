import os
import sys
import platform
import subprocess
import importlib.util
import json

# --- Configuration ---
PYTHON_VERSION_REQUIRED = (3, 11)
STARTUP_DIR = ".startup"
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")

# --- Helper Functions ---
def print_color(text, color):
    colors = {
        "HEADER": '\033[95m',
        "BLUE": '\033[94m',
        "CYAN": '\033[96m',
        "GREEN": '\033[92m',
        "YELLOW": '\033[93m',
        "RED": '\033[91m',
        "ENDC": '\033[0m',
        "BOLD": '\033[1m',
        "UNDERLINE": '\033[4m'
    }
    # Basic check for non-Windows or terminals supporting color
    if platform.system() != "Windows" and hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
         print(f"{colors.get(color.upper(), colors['ENDC'])}{text}{colors['ENDC']}")
    else:
        # Fallback for Windows or non-tty outputs
        prefix = f"[{color.upper()}] " if color.upper() not in ["ENDC", "BOLD", "UNDERLINE", "HEADER"] else ""
        print(f"{prefix}{text}")

def check_command(command):
    """Checks if a command exists using shutil.which (more reliable)."""
    import shutil
    path = shutil.which(command)
    if path:
        print_color(f"[OK] Found '{command}' at {path}", "green")
        return True
    else:
        print_color(f"[WARN] Command '{command}' not found in PATH.", "yellow")
        return False

def save_status(data):
    """Saves status to a JSON file."""
    os.makedirs(STARTUP_DIR, exist_ok=True)
    try:
        with open(STATUS_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        print_color(f"[ERROR] Could not write status file {STATUS_FILE}: {e}", "red")

# --- Main Check Logic ---
def main():
    print_color("--- Running System Check ---", "HEADER")
    # Ensure startup dir exists for status file
    os.makedirs(STARTUP_DIR, exist_ok=True)
    status = {'cuda_available': False, 'checks_passed': True}

    # 1. Check Python Version
    print_color(f"Checking Python version (requires >= {'.'.join(map(str, PYTHON_VERSION_REQUIRED))})...", "cyan")
    current_version = sys.version_info
    if current_version >= PYTHON_VERSION_REQUIRED:
        print_color(f"[OK] Python version {platform.python_version()} is sufficient.", "green")
    else:
        print_color(f"[ERROR] Python version {platform.python_version()} is too old. Please install >= {'.'.join(map(str, PYTHON_VERSION_REQUIRED))}.", "red")
        status['checks_passed'] = False
        # Don't exit yet, let other checks run

    # 2. Check CUDA Availability
    print_color("Checking for CUDA availability via PyTorch...", "cyan")
    try:
        # Check if torch is installed first (might be installed by install_deps later)
        torch_spec = importlib.util.find_spec("torch")
        if torch_spec is None:
             print_color("[INFO] PyTorch not installed yet. Skipping CUDA check for now.", "magenta")
        else:
            import torch
            if torch.cuda.is_available():
                print_color(f"[OK] CUDA is available. GPU: {torch.cuda.get_device_name(0)}", "green")
                status['cuda_available'] = True
            else:
                print_color("[INFO] CUDA not available via PyTorch. Will proceed with CPU.", "magenta")
    except ImportError:
        print_color("[INFO] PyTorch not installed yet. Skipping CUDA check for now.", "magenta")
    except Exception as e:
        print_color(f"[WARN] Error checking CUDA with PyTorch: {e}", "yellow")

    # 3. Check Essential Commands
    print_color("Checking for essential command-line tools...", "cyan")
    commands_to_check = ["git", "ollama"]
    optional_commands = ["psql", "ffmpeg", "node", "npm"] # Add others as needed

    all_essential_found = True
    for cmd in commands_to_check:
        if not check_command(cmd):
            all_essential_found = False
            status['checks_passed'] = False # Mark essential check as failed

    if not all_essential_found:
         print_color("[ACTION] Please install the missing essential command(s) listed above.", "yellow")

    print_color("Checking for optional command-line tools...", "cyan")
    for cmd in optional_commands:
        check_command(cmd) # Just check and warn for optional ones

    save_status(status)
    print_color("--- System Check Complete ---", "HEADER")
    if not status['checks_passed']:
        print_color("[WARNING] Some essential system checks failed. Setup may encounter issues.", "yellow")
        # sys.exit(1) # Optional: exit if essential checks fail

if __name__ == "__main__":
    main()
