# Debugging & Diagnostics CLI (`debugdiag`)

The `debugdiag` CLI is the primary diagnostic and bootstrap tool for the ArtifactVirtual DevContainer. It provides structured logging, intelligent diagnostics, system introspection, and DevContainer initialization—all through a modular Python CLI built with [Click](https://click.palletsprojects.com/) and [Rich](https://rich.readthedocs.io/).

---

## Features

- **Unified Entry Point**  
    Acts as both a system debugger and container initializer (bootstrap).

- **Structured Logging**  
    All logs are saved to a `.logs/` directory with timestamped entries.

- **Beautiful CLI Output**  
    Styled using Rich tables, colors, and formatting.

- **Modular Subcommands**  
    Organized via Click groups: `project`, `logs`, `diagnose`, `bootstrap`.

- **CUDA-Aware Diagnostics**  
    Checks for GPU availability and displays relevant CUDA info.

- **DevContainer-Ready**  
    Automatically sets up critical folders and confirms environment state on startup.

- **Extensible by Design**  
    Easily add tools, validators, and runtime setup logic as needed.

---

## Command Reference

### `bootstrap`
Initializes the devcontainer workspace.  
Automatically run from `.devcontainer/devcontainer.json`:

```sh
python debugdiag/main.py bootstrap
```

---

### `project`
System and environment awareness.

- `status`  
    Shows current platform, Python version, RAM, uptime, and CUDA device status.

```sh
python debugdiag/main.py project status
```

---

### `logs`
Log management for diagnostics and telemetry.

- `show [--lines 20]`  
    Tail view of the latest log entries.

- `clear`  
    Erases the debug log.

```sh
python debugdiag/main.py logs show --lines 15
python debugdiag/main.py logs clear
```

---

### `diagnose`
Diagnostic utilities for network and system probing.

- `ping [--host 8.8.8.8]`  
    Checks if a remote host is reachable.

```sh
python debugdiag/main.py diagnose ping --host github.com
```

---

## Project Structure

```
debugdiag/
├── main.py           # CLI entry point
├── logger.py         # Shared logger setup
├── __init__.py
└── test_debug.py     # Unit tests (pytest)
```

---

## Best Practices for Extension

- Use `@click.group()` and `@click.command()` decorators to logically expand commands.
- Encapsulate diagnostics logic in functions/modules for reusability.
- Avoid platform-specific assumptions—fallback gracefully.
- Keep `main.py` minimal; offload logic to helpers.
- Keep logs informative but clean (no internal debug spam).

---

## Testing

Install dependencies and run tests:

```sh
pip install -r requirements.txt
pytest debugdiag/test_debug.py
```

---

## DevContainer Integration

In `.devcontainer/devcontainer.json`:

```json
"onCreateCommand": "python debugdiag/main.py bootstrap"
```

This ensures every fresh Codespace or Docker container auto-configures itself, checks environment readiness, and logs the initialization.

---
