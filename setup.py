import os
import sys
import subprocess

REQUIRED_SYSTEM = [
    ("python", "Python 3.11+"),
    ("cmake", "CMake (for building some dependencies)"),
]

REQUIRED_PYTHON = [
    "-r requirements.txt"
]

OPTIONAL_PACKAGES = [
    ("auto-round", "AutoRound for LLM quantization/inference (GPU, default)"),
    ("auto-round[cpu]", "AutoRound for CPU-only (optional, for CPU inference)"),
    ("auto-round-lib", "AutoRound for HPU (Habana) (optional)"),
    ("mcp[cli]", "Model Context Protocol (MCP) SDK and CLI"),
]

def check_system():
    print("Checking system requirements...")
    for cmd, desc in REQUIRED_SYSTEM:
        if not shutil.which(cmd):
            print(f"[ERROR] {desc} not found. Please install it and re-run this script.")
            sys.exit(1)
    print("All system requirements satisfied.")

def install_python():
    print("Installing Python dependencies...")
    for req in REQUIRED_PYTHON:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", req])
    print("Python dependencies installed.")

def prompt_optional():
    print("\nOptional/large dependencies:")
    for pkg, desc in OPTIONAL_PACKAGES:
        resp = input(f"Install {desc}? [y/N]: ").strip().lower()
        if resp == "y":
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

def main():
    import shutil
    check_system()
    install_python()
    prompt_optional()
    print("\nSetup complete. You may now use all modules and servers in this workspace.")

if __name__ == "__main__":
    main()
