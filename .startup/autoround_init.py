# -*- coding: utf-8 -*-
import platform
import sys

# --- Helper Functions ---
def print_color(text, color):
    colors = {
        "HEADER": '\033[95m', "BLUE": '\033[94m', "CYAN": '\033[96m',
        "GREEN": '\033[92m', "YELLOW": '\033[93m', "RED": '\033[91m',
        "ENDC": '\033[0m', "BOLD": '\033[1m', "UNDERLINE": '\033[4m'
    }
    if platform.system() != "Windows" and hasattr(sys.stdout, 'isatty') and sys.stdout.isatty():
        # Corrected indentation
        print(f"{colors.get(color.upper(), colors['ENDC'])}{text}{colors['ENDC']}")
    else:
        prefix = f"[{color.upper()}] " if color.upper() not in ["ENDC", "BOLD", "UNDERLINE", "HEADER"] else ""
        print(f"{prefix}{text}")

# --- Main Logic ---
def main():
    print_color("--- Verifying AutoRound Installation ---", "HEADER")
    try:
        # Attempt to import the package
        import auto_round # noqa: F401 - This import is intentionally checked for existence
        print_color("[OK] AutoRound package imported successfully.", "green")

        # Optional: Add a more specific check if needed, e.g., accessing a function or attribute
        # if hasattr(auto_round, 'some_function'):
        #     print_color("[OK] Found expected AutoRound component.", "green")
        # else:
        #     print_color("[WARN] AutoRound imported, but expected component not found.", "yellow")

    except ImportError:
        print_color("[ERROR] Failed to import AutoRound package. Installation might have failed or is not in the Python path.", "red")
        print_color("Ensure the virtual environment is activated or dependencies were installed correctly.", "yellow")
    except Exception as e:
        print_color(f"[ERROR] An unexpected error occurred while verifying AutoRound: {e}", "red")

    print_color("--- AutoRound Verification Complete ---", "HEADER")

if __name__ == "__main__":
    main()
