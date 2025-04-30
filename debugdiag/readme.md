# Debugging & Diagnostics CLI (`debugdiag`)

The `debugdiag` CLI is a Python-based tool designed to provide structured debugging, logging, and diagnostic capabilities for the `artifactvirtual` project. It leverages the `click` and `rich` libraries to deliver a modular, extensible, and user-friendly command-line experience.

## Features

- **Structured Logging:** Uses Python's `logging` module to generate consistent and scalable log files.
- **Centralized Log Storage:** All logs are stored in a dedicated `.logs` directory at the project root.
- **Enhanced CLI Output:** Utilizes `rich` for formatted tables and improved terminal output.
- **Modular Command Structure:** Commands are organized into logical groups (`project`, `logs`, `diagnose`) using `click`.
- **Basic Diagnostics:** Includes essential diagnostic tools such as network ping.
- **Extensible Design:** Easily accommodates new diagnostic commands and logging features.

## Implementation Overview

The `debugdiag` tool is built with clarity and modularity in mind:

1. **Logging Setup**
    - Ensures a `.logs` directory exists at startup.
    - Configures a logger to write timestamped messages to `debug.log` within the log directory.
2. **CLI Framework**
    - Uses the `click` library to define the command-line interface.
    - Commands are grouped logically (e.g., `project`, `logs`, `diagnose`) for maintainability.
    - Each command is implemented as a function decorated with `@click.command` or `@click.group`.
3. **Rich Output**
    - The `rich` library is used to enhance terminal output, including formatted tables and styled text for readability.
4. **Testing**
    - Unit tests (e.g., `test_debug.py`) verify core functionality such as log directory creation, log writing, and log clearing.

## Command Reference

The CLI is organized into the following groups and commands:

- **project**
    - `status`: Displays system information and project status in a formatted table.
- **logs**
    - `show`: Displays the last N (default 20) entries from the `debug.log` file.
    - `clear`: Clears all entries from the `debug.log` file.
- **diagnose**
    - `ping`: Pings a specified host (default: 8.8.8.8) to check network connectivity.

## Usage Examples

```bash
# View project status
python debugdiag/main.py project status

# Show the last 10 log entries
python debugdiag/main.py logs show --lines 10

# Clear the debug log
python debugdiag/main.py logs clear

# Ping google.com
python debugdiag/main.py diagnose ping --host google.com
```

## Extensibility Guidelines

To build a modular and extensible CLI:

1. **Use a CLI Framework:** Libraries like `click` or `typer` simplify argument parsing, subcommand creation, help message generation, and execution flow management.
2. **Group Related Commands:** Organize commands under logical groups (e.g., `logs`, `diagnose`) for clarity and scalability.
3. **Separate Concerns:** Keep core logic (such as ping execution or log file handling) separate from CLI presentation code to improve testability and reusability.
4. **Configuration:** Use configuration files or environment variables for settings that may change, such as log file paths or default hosts.
5. **Clear Entry Point:** Provide a single entry point (e.g., `main.py` with `if __name__ == "__main__": cli()`) to initialize and run the CLI application.

Following these practices ensures that the CLI remains maintainable and can be extended with new commands and features as requirements evolve.

## Testing

Run tests using `pytest`:

```bash
pip install pytest
pytest debugdiag/test_debug.py
```
