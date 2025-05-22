# Command Manual for CMD and PowerShell
# This is a minimal example. Expand as needed.
COMMAND_MANUAL = {
    "dir": {"description": "List directory contents.", "usage": "dir [path]", "dependencies": []},
    "cd": {"description": "Change directory.", "usage": "cd [path]", "dependencies": []},
    "echo": {"description": "Display a message or variable value.", "usage": "echo [message]", "dependencies": []},
    "type": {"description": "Display contents of a file.", "usage": "type [file]", "dependencies": []},
    "copy": {"description": "Copy files.", "usage": "copy [source] [dest]", "dependencies": []},
    "move": {"description": "Move files.", "usage": "move [source] [dest]", "dependencies": []},
    "del": {"description": "Delete files.", "usage": "del [file]", "dependencies": []},
    "mkdir": {"description": "Create a new directory.", "usage": "mkdir [dir]", "dependencies": []},
    "powershell": {"description": "Run a PowerShell command.", "usage": "powershell [command]", "dependencies": []},
    "Get-Content": {"description": "Get content of a file (PowerShell).", "usage": "Get-Content [file]", "dependencies": []},
    "Set-Content": {"description": "Write content to a file (PowerShell).", "usage": "Set-Content [file] [content]", "dependencies": []},
    # ...add more commands as needed...
}
