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
        print(f"{colors.get(color.upper(), colors['ENDC'])}{text}{colors['ENDC']}")
    else:
        prefix = f"[{color.upper()}] " if color.upper() not in ["ENDC", "BOLD", "UNDERLINE", "HEADER"] else ""
        print(f"{prefix}{text}")

# --- Main Logic ---
def main():
    print_color("--- Welcome to ArtifactVirtual ---", "HEADER")
    print_color("Environment setup complete (or attempted).", "cyan")

    # Placeholder for actual AI pipeline initialization
    print_color("TODO: Initialize AI pipeline...", "magenta")
    # Example:
    # try:
    #     from your_project.ai_core import initialize_pipeline
    #     pipeline = initialize_pipeline()
    #     print_color("[OK] AI Pipeline initialized.", "green")
    # except Exception as e:
    #     print_color(f"[ERROR] Failed to initialize AI pipeline: {e}", "red")
    #     # Decide if this is critical
    #     # sys.exit(1)

    try:
        print("\n")
        # Use input() which works across platforms
        prompt = input("What's your first prompt? > ")
        print_color(f"\nReceived: {prompt}", "blue")

        # Placeholder for sending prompt to the pipeline
        print_color("\n(TODO: Process prompt with AI pipeline...)", "magenta")
        # Example:
        # if 'pipeline' in locals() and pipeline:
        #     response = pipeline.process(prompt)
        #     print_color("AI Response:", "green")
        #     print(response)
        # else:
        #     print_color("[WARN] AI Pipeline not available.", "yellow")

    except KeyboardInterrupt:
        print_color("\nExiting.", "yellow")
    except EOFError:
        # This happens if input stream is closed (e.g., piping input)
        print_color("\nInput stream closed. Exiting.", "yellow")

if __name__ == "__main__":
    main()
