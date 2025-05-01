import os
import sys
import subprocess
import platform
import json
import time # Added for timing

# --- Configuration ---
STARTUP_DIR = ".startup"
CHECK_SYSTEM_SCRIPT = os.path.join(STARTUP_DIR, "check_system.py")
INSTALL_DEPS_SCRIPT = os.path.join(STARTUP_DIR, "install_deps.py") # Changed to .py
OLLAMA_BOOT_SCRIPT = os.path.join(STARTUP_DIR, "ollama_boot.py")
AUTOROUND_INIT_SCRIPT = os.path.join(STARTUP_DIR, "autoround_init.py") # Added
WELCOME_PROMPT_SCRIPT = os.path.join(STARTUP_DIR, "welcome_prompt.py") # Added
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")
VENV_DIR = ".venv" # Added for venv activation check

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
    if platform.system() != "Windows" and hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
        print(f"{colors.get(color.upper(), colors['ENDC'])}{text}{colors['ENDC']}")
    else:
        prefix = f"[{color.upper()}] " if color.upper() not in ["ENDC", "BOLD", "UNDERLINE", "HEADER"] else ""
        print(f"{prefix}{text}")

def get_venv_python_executable():
    """Gets the path to the Python executable within the virtual environment."""
    if platform.system() == "Windows":
        return os.path.abspath(os.path.join(VENV_DIR, "Scripts", "python.exe"))
    else:
        return os.path.abspath(os.path.join(VENV_DIR, "bin", "python"))

def run_script(script_path):
    """Runs a Python script, attempting to use the virtual environment's Python."""
    if not os.path.exists(script_path):
        print_color(f"[ERROR] Script not found: {script_path}", "red")
        return False

    # Determine the Python executable to use
    venv_python = get_venv_python_executable()
    if os.path.exists(venv_python):
        interpreter = venv_python
        print_color(f"Using venv Python: {interpreter}", "magenta")
    else:
        # Fallback to the Python running *this* script if venv doesn't exist yet
        # (e.g., during the install_deps step which creates the venv)
        interpreter = sys.executable
        print_color(f"Venv Python not found, using system Python: {interpreter}", "magenta")

    command = [interpreter, script_path]

    print_color(f"--- Running {os.path.basename(script_path)} --- ({' '.join(command)})", "HEADER")
    try:
        # Use check=True to raise CalledProcessError on failure
        # Capture stderr for better error reporting
        process = subprocess.run(command, check=True, text=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        if process.stdout:
            print(process.stdout.strip()) # Print stdout from the script
        print_color(f"[OK] {os.path.basename(script_path)} completed successfully.", "green")
        return True
    except FileNotFoundError:
        print_color(f"[ERROR] Interpreter '{command[0]}' not found for script {script_path}.", "red")
        return False
    except subprocess.CalledProcessError as e:
        print_color(f"[ERROR] {os.path.basename(script_path)} failed with exit code {e.returncode}.", "red")
        if e.stderr:
            print_color("Stderr:", "red")
            print_color(e.stderr.strip(), "red")
        if e.stdout:
            print_color("Stdout:", "yellow") # Show stdout too on error
            print_color(e.stdout.strip(), "yellow")
        return False
    except Exception as e:
        print_color(f"[ERROR] An unexpected error occurred running {script_path}: {e}", "red")
        import traceback
        traceback.print_exc() # Print full traceback for unexpected errors
        return False

def load_status():
    """Loads status from the JSON file."""
    try:
        if os.path.exists(STATUS_FILE):
            # Specify encoding
            with open(STATUS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except (IOError, json.JSONDecodeError) as e:
        print_color(f"[WARN] Could not load status file {STATUS_FILE}: {e}", "yellow")
    return {}

# --- Main Bootstrap Logic ---
def main():
    print_color("===============================", "HEADER")
    print_color("🚀 ArtifactVirtual Bootstrap 🚀", "HEADER")
    print_color("===============================", "HEADER")
    start_time = time.time()

    # Ensure startup dir exists
    os.makedirs(STARTUP_DIR, exist_ok=True)

    # Define the sequence of startup scripts
    startup_scripts = [
        CHECK_SYSTEM_SCRIPT,
        INSTALL_DEPS_SCRIPT,
        OLLAMA_BOOT_SCRIPT,
        AUTOROUND_INIT_SCRIPT,
        WELCOME_PROMPT_SCRIPT,
    ]

    all_successful = True
    for script in startup_scripts:
        if not run_script(script):
            all_successful = False
            print_color(f"Setup aborted due to failure in {os.path.basename(script)}.", "RED")
            break # Stop processing further scripts on failure

    end_time = time.time()
    duration = end_time - start_time
    print_color(f"\n--- Bootstrap Finished ({duration:.2f} seconds) ---", "BOLD")

    # Final Status Check (Optional but helpful)
    print_color("--- Final Status Summary ---", "HEADER")
    final_status = load_status()
    overall_status = True

    if final_status.get('checks_passed', False):
        print_color("[OK] System checks passed initially.", "green")
    else:
        print_color("[WARN] Some initial system checks failed.", "yellow")
        overall_status = False

    # Check if Ollama setup was marked complete and model available
    if final_status.get('ollama_setup_complete', False) and final_status.get('ollama_model_available', False):
        print_color("[OK] Ollama setup complete and default model available.", "green")
    elif final_status.get('ollama_setup_complete', False):
        print_color("[WARN] Ollama setup ran, but the default model might not be available.", "yellow")
        overall_status = False
    else:
        print_color("[WARN] Ollama setup did not complete successfully.", "yellow")
        overall_status = False

    # Add check for venv existence
    if os.path.exists(get_venv_python_executable()):
        print_color("[OK] Virtual environment exists.", "green")
    else:
        print_color("[ERROR] Virtual environment does not seem to exist or is incomplete.", "red")
        overall_status = False

    print_color("-----------------------------", "HEADER")
    if all_successful and overall_status:
        print_color("✅ Bootstrap appears to have completed successfully.", "GREEN")
        print_color("You might need to activate the virtual environment manually if not already active:", "CYAN")
        if platform.system() == "Windows":
            print_color(f"   .\{VENV_DIR}\Scripts\activate", "CYAN")
        else:
            print_color(f"   source ./{VENV_DIR}/bin/activate", "CYAN")
    else:
        print_color("❌ Bootstrap finished with errors or warnings. Please review the logs above.", "RED")
        sys.exit(1) # Exit with error code if setup failed

if __name__ == "__main__":
    # Change directory to the script's location to ensure relative paths work
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir != os.getcwd():
        print_color(f"Changing working directory to: {script_dir}", "magenta")
        os.chdir(script_dir)
    main()
