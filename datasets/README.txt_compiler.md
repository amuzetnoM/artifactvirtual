# TXT Compiler for Library Folder

## Overview
This tool scans the entire `/library` folder (and all subfolders) for `.txt` files and compiles them into a single unified text file: `compiled_library.txt`.

## Usage

1. **Install Python 3.7+** (if not already installed).
2. Place this script (`txt_compiler.py`) in the `/datasets` directory.
3. Run the script from the `/datasets` directory:

```powershell
python txt_compiler.py
```

4. The output file `compiled_library.txt` will be created in the `/datasets` directory.

## Features
- Recursively finds all `.txt` files in `/library`.
- Each file's content is separated and labeled with its relative path.
- Handles large numbers of files efficiently.

## Output Example
```
--- FILE: Computer Hardware/example.txt ---
<contents of example.txt>

--- FILE: Medical texts/notes.txt ---
<contents of notes.txt>
```

## Customization
- To change the target folder, modify the `target_folder` variable in the script.
- To change the output file name, modify the `output_file` variable.

## License
See main project `LICENSE` file.
