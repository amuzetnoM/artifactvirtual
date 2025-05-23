# TXT Compiler for Library Folder

## Overview
This tool scans the entire `/library` folder (and all subfolders) for `.txt` files, cleans and normalizes their content for machine learning, and compiles them into a single unified text file: `compiled_library.txt`.

## Features
- Recursively finds all `.txt` files in `/library`.
- Cleans and normalizes text:
  - Removes markdown, code fences, HTML tags, and human formatting.
  - Collapses repeated blank lines and trims whitespace.
  - Optionally normalizes unicode and lowercases text (see `clean_text` function).
- Each file's content is separated and labeled with its relative path for traceability.
- Handles large numbers of files efficiently.

## Usage

1. **Install Python 3.7+** (if not already installed).
2. Place this script (`txt_compiler.py`) in the `/datasets` directory.
3. Run the script from the `/datasets` directory:

```powershell
python txt_compiler.py
```

4. The output file `compiled_library.txt` will be created in the `/datasets` directory.

## Output Example
```
--- FILE: Computer Hardware/example.txt ---
<cleaned contents of example.txt>

--- FILE: Medical texts/notes.txt ---
<cleaned contents of notes.txt>
```

## Customization
- To change the target folder, modify the `target_folder` variable in the script.
- To change the output file name, modify the `output_file` variable.
- Adjust the `clean_text` function for your specific ML requirements.

## License
See main project `LICENSE` file.
