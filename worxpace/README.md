# Worxpace Command Intelligence

## Overview

This module provides an intelligent, extensible, and interactive command parser and executor for Windows and Linux environments. It is designed to:
- Parse high-level user objectives and map them to the correct OS command.
- Dynamically build its command knowledge from a comprehensive markdown reference (`commands_reference.md`).
- Use advanced NLP (WordNet, fuzzy matching) to interpret user intent.
- Prompt interactively for missing command arguments.
- Execute commands and return output, with robust error handling.

## Files

- `commands_reference.md`: Exhaustive, structured list of Windows and Linux commands and their usage. This file is parsed automatically by the parser.
- `command_parser.py`: The main parser and executor. Reads the command reference, interprets objectives, prompts for arguments, and runs commands.

## Features

- **Dynamic Command Mapping**: Always in sync with the markdown reference. Add or update commands in `commands_reference.md` and the parser adapts automatically.
- **Advanced NLP**: Uses NLTK WordNet (if available) and fuzzy matching to understand user objectives, even with synonyms or imprecise phrasing.
- **Interactive Argument Prompting**: If a command requires arguments (e.g., a filename), the parser will prompt the user for input.
- **Cross-Platform**: Detects Windows or Linux and selects the correct command syntax.
- **Extensible**: Add new commands or improve the reference file to expand capabilities.
- **Robust**: Handles missing dependencies gracefully and works in both interactive and non-interactive environments.

## Usage

1. **Install Requirements** (optional, for best NLP):
   ```sh
   pip install nltk
   ```
   The parser will still work without NLTK, but NLP matching will be less advanced.

2. **Run the Parser**:
   ```sh
   python command_parser.py
   ```
   You will be prompted for your objective (e.g., "list files", "copy a file").
   The parser will:
   - Find the best matching command.
   - Prompt for any required arguments.
   - Execute the command and display the output.

3. **Update Commands**:
   - Edit `commands_reference.md` to add, remove, or update commands.
   - The parser will automatically use the updated list on next run.

## Example

```
Enter your objective (or 'exit'): list files
[INFO] Executing: dir
... (output of dir command) ...

Enter your objective (or 'exit'): copy a file
Please provide value for 'source': file1.txt
Please provide value for 'destination': file2.txt
[INFO] Executing: copy file1.txt file2.txt
... (output of copy command) ...
```

## Customization & Extension

- To add new commands, simply append them to the appropriate section in `commands_reference.md` using the format:
  - `- `command syntax` - description`
- To improve NLP, ensure descriptions are clear and use common terminology.
- For advanced use, you can import and use `CommandParser` in your own Python scripts.

## Troubleshooting

- If you see errors about missing `nltk` or `wordnet`, install NLTK as above.
- If running in a non-interactive environment, the parser will use placeholder values for missing arguments.
- For best results, keep `commands_reference.md` up to date and well-structured.

## Use Cases

### 1. Automating System Administration
- Quickly execute common admin tasks (e.g., list users, check disk usage, manage services) by describing your intent in natural language.
- Example: `Show all running processes` → `tasklist` (Windows) or `ps aux` (Linux)

### 2. Teaching LLMs Command-Line Operations
- Use the parser as a training interface for LLMs to learn mapping between objectives and commands, including argument handling and error feedback.
- Example: `Delete a file` → prompts for filename, then runs `del <file>` (Windows) or `rm <file>` (Linux)

### 3. Rapid Prototyping and Scripting
- Integrate the parser into scripts to automate repetitive tasks with high-level instructions.
- Example: `Copy a file from A to B` → prompts for source and destination, then runs the correct command.

### 4. Cross-Platform Command Abstraction
- Write scripts or issue commands without worrying about OS-specific syntax; the parser handles translation.
- Example: `Show network configuration` → `ipconfig` (Windows) or `ifconfig` (Linux)

### 5. Interactive Learning and Troubleshooting
- Use the interactive CLI to experiment with commands, see real output, and learn correct usage.
- Example: `Find text in a file` → prompts for pattern and file, then runs `findstr` or `grep`.

## License

MIT License. See repository root for details.

---

For questions or contributions, see the main project README or open an issue.
