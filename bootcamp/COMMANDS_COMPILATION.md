# Cockpit Orchestrator: Command Manual Compilation

Below is a compilation of all commands and their usage examples currently included in the Cockpit Orchestrator's command manual (`command_manual.py`).

---

## CMD & PowerShell Commands

- **dir**
  - Description: List directory contents.
  - Usage: `dir [path]`
  - Example: `dir C:\Users\%USERNAME%\Documents`

- **cd**
  - Description: Change directory.
  - Usage: `cd [path]`
  - Example: `cd C:\Users\%USERNAME%\Desktop`

- **echo**
  - Description: Display a message or variable value.
  - Usage: `echo [message]`
  - Example: `echo Hello World`

- **type**
  - Description: Display contents of a file.
  - Usage: `type [file]`
  - Example: `type notes.txt`

- **copy**
  - Description: Copy files.
  - Usage: `copy [source] [dest]`
  - Example: `copy file.txt D:\Backup\file.txt`

- **move**
  - Description: Move files.
  - Usage: `move [source] [dest]`
  - Example: `move file.txt D:\Backup\file.txt`

- **del**
  - Description: Delete files.
  - Usage: `del [file]`
  - Example: `del oldfile.txt`

- **mkdir**
  - Description: Create a new directory.
  - Usage: `mkdir [dir]`
  - Example: `mkdir NewFolder`

- **powershell**
  - Description: Run a PowerShell command.
  - Usage: `powershell [command]`
  - Example: `powershell Get-Process`

- **New-Item**
  - Description: Create a new file or folder (PowerShell).
  - Usage: `New-Item -Path <path> -ItemType <File|Directory>`
  - Example: `New-Item -Path C:\Users\%USERNAME%\Desktop\MyFolder -ItemType Directory`

- **Move-Item**
  - Description: Move files or folders (PowerShell).
  - Usage: `Move-Item -Path <source> -Destination <dest>`
  - Example: `Move-Item -Path file.txt -Destination C:\Backup\`

- **Get-Content**
  - Description: Get content of a file (PowerShell).
  - Usage: `Get-Content [file]`
  - Example: `Get-Content notes.txt`

- **Set-Content**
  - Description: Write content to a file (PowerShell).
  - Usage: `Set-Content [file] [content]`
  - Example: `"Hello World" | Set-Content notes.txt`

- **Remove-Item**
  - Description: Delete files or folders (PowerShell).
  - Usage: `Remove-Item [path]`
  - Example: `Remove-Item oldfile.txt`

- **Start-Process**
  - Description: Start a process or open a file/application (PowerShell).
  - Usage: `Start-Process [application or file]`
  - Example: `Start-Process notepad.exe`

---

Expand this list in `command_manual.py` as you add more commands and capabilities to the Cockpit Orchestrator.
