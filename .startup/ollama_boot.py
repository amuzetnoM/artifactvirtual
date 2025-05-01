import os
import subprocess
import time
import platform
import sys
import json

# --- Configuration ---
OLLAMA_MODEL_DEFAULT = "gemma3" # Changed default model
STARTUP_DIR = ".startup"
STATUS_FILE = os.path.join(STARTUP_DIR, "system_status.json")

# --- Helper Functions (Copied from check_system.py for standalone use if needed) ---
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

def load_status():
    """Loads status from the JSON file."""
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, 'r') as f:
                return json.load(f)
    except (IOError, json.JSONDecodeError) as e:
        print_color(f"[WARN] Could not load status file {STATUS_FILE}: {e}", "yellow")
    return {}

def save_status(data):
    """Saves status to a JSON file."""
    os.makedirs(STARTUP_DIR, exist_ok=True)
    try:
        with open(STATUS_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        print_color(f"[ERROR] Could not write status file {STATUS_FILE}: {e}", "red")

# --- Ollama Functions ---
def is_ollama_running():
    """Checks if the Ollama server process is running."""
    try:
        # Use ollama ps as a more reliable check than simple process listing
        result = subprocess.run(["ollama", "ps"], capture_output=True, text=True, check=False, timeout=10)
        # Ollama ps might return non-zero if no models are running, but the server is up.
        # A more robust check might involve trying to connect to the API endpoint.
        # For simplicity, we check if the command executed without error and output isn't empty/error message.
        if result.returncode == 0 and "error" not in result.stdout.lower():
             print_color("[INFO] Ollama server appears to be running.", "magenta")
             return True
        # Attempt API check as fallback
        try:
            import requests
            response = requests.get("http://localhost:11434", timeout=2) # Default Ollama port
            if response.status_code == 200:
                 print_color("[INFO] Ollama server responded to API check.", "magenta")
                 return True
        except Exception:
            pass # Ignore connection errors, means server likely not running

        print_color("[INFO] Ollama server does not appear to be running.", "magenta")
        return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print_color("[WARN] 'ollama' command not found or timed out. Cannot check if server is running.", "yellow")
        return False # Assume not running if command fails
    except Exception as e:
        print_color(f"[WARN] Error checking Ollama status: {e}", "yellow")
        return False

def start_ollama_server():
    """Starts the Ollama server in the background."""
    print_color("Attempting to start Ollama server in the background...", "cyan")
    try:
        # Use nohup and & for background execution on Linux/macOS
        # Use start /B for background execution on Windows
        if platform.system() == "Windows":
            # This might flash a window briefly. Starting detached is complex without extra tools.
            subprocess.Popen(["start", "/B", "ollama", "serve"], shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
        else:
            # nohup ensures the process continues even if the terminal closes
            subprocess.Popen(["nohup", "ollama", "serve", "&"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, preexec_fn=os.setpgrp)

        print_color("Waiting a few seconds for Ollama server to initialize...", "cyan")
        time.sleep(10) # Give the server time to start

        if is_ollama_running():
            print_color("[OK] Ollama server started successfully.", "green")
            return True
        else:
            print_color("[ERROR] Failed to start or confirm Ollama server is running.", "red")
            return False
    except FileNotFoundError:
        print_color("[ERROR] 'ollama' command not found. Cannot start server.", "red")
        return False
    except Exception as e:
        print_color(f"[ERROR] Failed to start Ollama server: {e}", "red")
        return False

def check_and_pull_model(model_name):
    """Checks if a model exists locally and pulls it if not."""
    print_color(f"Checking for Ollama model: {model_name}...", "cyan")
    try:
        # Check if model exists
        list_result = subprocess.run(["ollama", "list"], capture_output=True, text=True, check=True, timeout=30)
        if model_name in list_result.stdout:
            print_color(f"[OK] Model '{model_name}' found locally.", "green")
            return True
        else:
            print_color(f"[INFO] Model '{model_name}' not found locally. Attempting to pull...", "magenta")
            # Pull the model
            pull_result = subprocess.run(["ollama", "pull", model_name], check=True, timeout=600) # Long timeout for download
            print_color(f"[OK] Model '{model_name}' pulled successfully.", "green")
            return True
    except FileNotFoundError:
        print_color("[ERROR] 'ollama' command not found. Cannot check/pull model.", "red")
        return False
    except subprocess.CalledProcessError as e:
        print_color(f"[ERROR] Failed to check/pull Ollama model '{model_name}': {e}", "red")
        print_color(f"Stderr: {e.stderr}", "red")
        return False
    except subprocess.TimeoutExpired:
         print_color(f"[ERROR] Timeout checking/pulling Ollama model '{model_name}'.", "red")
         return False
    except Exception as e:
        print_color(f"[ERROR] An unexpected error occurred with model '{model_name}': {e}", "red")
        return False

# --- Main Logic ---
def main():
    print_color("--- Ollama Setup ---", "HEADER")
    status = load_status()
    status['ollama_setup_complete'] = False
    status['ollama_model_available'] = False

    # 1. Check if Ollama command exists (already done in check_system, but good to double-check)
    try:
        subprocess.run(["ollama", "--version"], capture_output=True, check=True, timeout=5)
    except (FileNotFoundError, subprocess.TimeoutExpired, subprocess.CalledProcessError):
        print_color("[ERROR] 'ollama' command not found or not working. Cannot proceed with Ollama setup.", "red")
        save_status(status)
        sys.exit(1) # Exit if Ollama isn't installed/functional

    # 2. Check if server is running, start if not
    if not is_ollama_running():
        if not start_ollama_server():
            print_color("[FAIL] Could not start Ollama server. Aborting Ollama setup.", "red")
            save_status(status)
            sys.exit(1)
        else:
             # Re-check after starting
             if not is_ollama_running():
                  print_color("[FAIL] Ollama server did not stay running after start attempt. Aborting.", "red")
                  save_status(status)
                  sys.exit(1)

    # 3. Check and pull the default model
    default_model_ok = False
    if check_and_pull_model(OLLAMA_MODEL_DEFAULT):
        status['ollama_model_available'] = True # Mark true if default is okay
        status['ollama_setup_complete'] = True # Mark setup complete if default is okay
        print_color(f"[OK] Default Ollama model '{OLLAMA_MODEL_DEFAULT}' is available.", "green")
        default_model_ok = True
    else:
        print_color(f"[FAIL] Failed to ensure default Ollama model '{OLLAMA_MODEL_DEFAULT}' is available.", "red")
        # Don't exit, maybe user wants to use a different model later

    # 4. Check and pull additional requested models
    additional_models = ["llama2-uncensored", "llava"]
    all_additional_ok = True
    for model_name in additional_models:
        if not check_and_pull_model(model_name):
            all_additional_ok = False
            print_color(f"[WARN] Failed to ensure Ollama model '{model_name}' is available.", "yellow")
        else:
            print_color(f"[OK] Additional Ollama model '{model_name}' is available.", "green")

    if not default_model_ok:
         print_color(f"[WARN] Default model '{OLLAMA_MODEL_DEFAULT}' failed, setup considered incomplete.", "yellow")
         status['ollama_setup_complete'] = False # Ensure setup is marked incomplete if default failed

    save_status(status)
    print_color("--- Ollama Setup Complete ---", "HEADER")

if __name__ == "__main__":
    main()
