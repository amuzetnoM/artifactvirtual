# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import platform
import json
import time # Added for timing

# --- Configuration ---
# Get the directory where startup.py resides
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STARTUP_DIR = os.path.join(SCRIPT_DIR, ".startup")
CHECK_SYSTEM_SCRIPT = os.path.join(STARTUP_DIR, "check_system.py")
INSTALL_DEPS_SCRIPT = os.path.join(STARTUP_DIR, "install_deps.py") # Changed to .py
OLLAMA_BOOT_SCRIPT = os.path.join(STARTUP_DIR, "ollama_boot.py")
AUTOROUND_INIT_SCRIPT = os.path.join(STARTUP_DIR, "autoround_init.py") # Added
WELCOME_PROMPT_SCRIPT = os.path.join(STARTUP_DIR, "welcome_prompt.py") # Added
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")
VENV_DIR = os.path.join(SCRIPT_DIR, ".venv") # Added for venv activation check

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
        interpreter = sys.executable
        print_color(f"Venv Python not found, using system Python: {interpreter}", "magenta")

    command = [interpreter, script_path]

    print_color(f"--- Running {os.path.basename(script_path)} --- ({' '.join(command)})", "HEADER")
    try:
        # Use check=False, capture output, specify encoding and error handling
        process = subprocess.run(command, check=False, capture_output=True, text=True, encoding='utf-8', errors='ignore')

        # Print stdout regardless of success/failure for better debugging
        if process.stdout:
            print(process.stdout.strip())

        # Check return code *after* printing stdout
        if process.returncode != 0:
             print_color(f"[ERROR] {os.path.basename(script_path)} failed with exit code {process.returncode}.", "red")
             if process.stderr:
                 print_color("Stderr:", "red")
                 print_color(process.stderr.strip(), "red")
             return False # Indicate failure
        else:
            print_color(f"[OK] {os.path.basename(script_path)} completed successfully.", "green")
            return True # Indicate success

    except FileNotFoundError:
        print_color(f"[ERROR] Interpreter '{command[0]}' not found for script {script_path}. Ensure Python is installed and in PATH.", "red")
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

    all_successful = True # Tracks if all scripts *completed* without unexpected errors
    overall_status_ok = True # Tracks if critical steps (like venv) succeeded

    for script in startup_scripts:
        script_succeeded = run_script(script)
        if not script_succeeded:
            # Mark all_successful as False if any script run fails (returns False)
            all_successful = False
            print_color(f"Setup step {os.path.basename(script)} failed or reported errors. Continuing...", "YELLOW")
            # Check if the failed script is critical (e.g., venv creation in install_deps)
            # This logic is now mostly handled within install_deps.py itself (sys.exit)
            # If run_script returns False, it means either the script exited non-zero
            # or an exception occurred in run_script itself.

    end_time = time.time()
    duration = end_time - start_time
    print_color(f"\n--- Bootstrap Finished ({duration:.2f} seconds) ---", "BOLD")

    # Final Status Check
    print_color("--- Final Status Summary ---", "HEADER")
    final_status = load_status()

    if final_status.get('checks_passed', False):
        print_color("[OK] System checks passed initially.", "green")
    else:
        print_color("[WARN] Some initial system checks failed or were skipped.", "yellow")
        # Don't mark overall as failed just for initial checks, but note it.

    # Check if venv exists (crucial)
    if os.path.exists(get_venv_python_executable()):
        print_color("[OK] Virtual environment exists.", "green")
    else:
        print_color("[ERROR] Virtual environment does not seem to exist or is incomplete.", "red")
        overall_status_ok = False # This is a critical failure

    # Check if Ollama setup was marked complete and model available
    if final_status.get('ollama_setup_complete', False) and final_status.get('ollama_model_available', False):
        print_color("[OK] Ollama setup complete and default model available.", "green")
    elif final_status.get('ollama_setup_complete', False):
        print_color("[WARN] Ollama setup ran, but the default model might not be available.", "yellow")
        # Not necessarily a failure of the bootstrap itself, but a warning.
    else:
        print_color("[WARN] Ollama setup did not complete successfully or was skipped.", "yellow")
        # Not necessarily a failure of the bootstrap itself.

    # Check if AutoRound import succeeded (based on its own output, not status file yet)
    # We could enhance autoround_init.py to write to status file if needed.
    # For now, rely on its log output during the run.

    print_color("-----------------------------", "HEADER")
    # Check both all_successful (scripts ran without error) and overall_status_ok (critical checks passed)
    if all_successful and overall_status_ok:
        print_color("✅ Bootstrap completed. Review logs for any warnings (e.g., failed optional dependencies).", "GREEN")
        print_color("Activate the virtual environment manually if needed:", "CYAN")
        if platform.system() == "Windows":
            # Use os.path.relpath to show a relative path from the current dir
            venv_activate_path = os.path.relpath(os.path.join(VENV_DIR, "Scripts", "activate"), os.getcwd())
            print_color(f"   {venv_activate_path}", "CYAN")
        else:
            venv_activate_path = os.path.relpath(os.path.join(VENV_DIR, "bin", "activate"), os.getcwd())
            print_color(f"   source {venv_activate_path}", "CYAN")
    else:
        print_color("❌ Bootstrap finished with errors or critical warnings. Please review the logs above.", "RED")
        # Optionally exit with error code if critical failures occurred
        if not overall_status_ok:
             sys.exit(1) # Exit only if critical checks failed (like venv)

if __name__ == "__main__":
    # Change directory to the script's location to ensure relative paths work
    # SCRIPT_DIR is already defined globally
    if SCRIPT_DIR != os.getcwd():
        print_color(f"Changing working directory to: {SCRIPT_DIR}", "magenta")
        os.chdir(SCRIPT_DIR)
    main()
