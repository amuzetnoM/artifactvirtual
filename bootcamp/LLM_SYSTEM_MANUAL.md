# Cockpit Orchestrator LLM System Manual

## Introduction
This manual is designed to help any LLM (Large Language Model) or agent fully understand, reason about, and operate the Cockpit Orchestrator system as a power user or administrator. It covers the system's architecture, command mapping, scripting, automation, and a comprehensive set of Windows and PowerShell administrator commands with usage patterns and best practices.

---

## 1. System Overview
- The Cockpit Orchestrator enables natural language control of a Windows system, including file/folder management, process control, scripting, and automation.
- It uses a command manual, mapping logic, and a task queue to translate user intent into safe, effective system actions.
- The system supports multi-step tasks, script generation, and integration with external tools (e.g., n8n).

---

## 2. Command Mapping & Reasoning
- User prompts are parsed and mapped to the most appropriate Windows CMD or PowerShell command using a comprehensive command manual.
- The LLM can look up command descriptions, usage, and examples to reason about the best action for a given intent.
- For complex or multi-step tasks, the system generates and saves PowerShell scripts.

---

## 3. Administrator Command Reference

### File & Folder Management
- **Create Folder:**
  - `mkdir <foldername>` (CMD)
  - `New-Item -Path <path> -ItemType Directory` (PowerShell)
- **Delete Folder:**
  - `rmdir <foldername>` (CMD)
  - `Remove-Item <foldername> -Recurse` (PowerShell)
- **Create File:**
  - `echo <content> > <filename>` (CMD)
  - `New-Item -Path <filename> -ItemType File` (PowerShell)
  - `"content" | Set-Content <filename>` (PowerShell)
- **Delete File:**
  - `del <filename>` (CMD)
  - `Remove-Item <filename>` (PowerShell)
- **Copy/Move Files:**
  - `copy <source> <dest>` (CMD)
  - `move <source> <dest>` (CMD)
  - `Copy-Item <source> <dest>` (PowerShell)
  - `Move-Item <source> <dest>` (PowerShell)
- **List Files/Folders:**
  - `dir <path>` (CMD)
  - `Get-ChildItem <path>` (PowerShell)
- **Read File:**
  - `type <filename>` (CMD)
  - `Get-Content <filename>` (PowerShell)
- **Edit File:**
  - `notepad <filename>` (CMD/PowerShell)

### System & Process Management
- **View Running Processes:**
  - `tasklist` (CMD)
  - `Get-Process` (PowerShell)
- **Kill Process:**
  - `taskkill /PID <pid> /F` (CMD)
  - `Stop-Process -Id <pid>` (PowerShell)
- **Start Application:**
  - `start <appname>` (CMD)
  - `Start-Process <appname>` (PowerShell)
- **Shutdown/Restart:**
  - `shutdown /s /t 0` (CMD)
  - `shutdown /r /t 0` (CMD)
  - `Restart-Computer` (PowerShell)
  - `Stop-Computer` (PowerShell)

### User & Permission Management
- **List Users:**
  - `net user` (CMD)
  - `Get-LocalUser` (PowerShell)
- **Add User:**
  - `net user <username> <password> /add` (CMD)
  - `New-LocalUser -Name <username> -Password (ConvertTo-SecureString <password> -AsPlainText -Force)` (PowerShell)
- **Delete User:**
  - `net user <username> /delete` (CMD)
  - `Remove-LocalUser -Name <username>` (PowerShell)
- **Change User Group:**
  - `net localgroup <group> <username> /add` (CMD)
  - `Add-LocalGroupMember -Group <group> -Member <username>` (PowerShell)

### Networking
- **View IP Config:**
  - `ipconfig` (CMD)
  - `Get-NetIPAddress` (PowerShell)
- **Ping Host:**
  - `ping <host>` (CMD)
  - `Test-Connection <host>` (PowerShell)
- **View Network Connections:**
  - `netstat -an` (CMD)
  - `Get-NetTCPConnection` (PowerShell)

### Security & System Info
- **Firewall:**
  - `netsh advfirewall show allprofiles` (CMD)
  - `Get-NetFirewallProfile` (PowerShell)
- **System Info:**
  - `systeminfo` (CMD)
  - `Get-ComputerInfo` (PowerShell)
- **Event Logs:**
  - `eventvwr` (CMD)
  - `Get-EventLog -LogName <log>` (PowerShell)

### Registry
- **Query Registry:**
  - `reg query <key>` (CMD)
  - `Get-ItemProperty -Path <key>` (PowerShell)
- **Add/Edit/Delete Registry Key:**
  - `reg add <key> /v <name> /t <type> /d <data>` (CMD)
  - `Set-ItemProperty -Path <key> -Name <name> -Value <data>` (PowerShell)
  - `Remove-ItemProperty -Path <key> -Name <name>` (PowerShell)

### Automation & Scripting
- **Run PowerShell Script:**
  - `powershell -ExecutionPolicy Bypass -File <script.ps1>`
- **Schedule Task:**
  - `schtasks /create /tn <taskname> /tr <command> /sc <schedule>` (CMD)
  - `Register-ScheduledTask` (PowerShell)

### Miscellaneous
- **Environment Variables:**
  - `set` (CMD)
  - `$env:VAR = "value"` (PowerShell)
- **Clipboard:**
  - `clip < file.txt` (CMD)
  - `Get-Clipboard` / `Set-Clipboard` (PowerShell)
- **System Paths:**
  - `echo %PATH%` (CMD)
  - `$env:PATH` (PowerShell)

---

## 4. Best Practices for LLMs
- Always check the command manual for the safest and most effective command for a given intent.
- For multi-step or complex tasks, generate a PowerShell script and execute it as a batch.
- When in doubt, ask the user for clarification or suggest a command with usage examples.
- Use full paths for file/folder operations to avoid ambiguity.
- Handle errors gracefully and provide feedback to the user.

---

## 5. Example Prompts & Mappings
- "Create a folder on the desktop and move all .txt files into it."
  - Map to:
    - `New-Item -Path C:\Users\%USERNAME%\Desktop\MyFolder -ItemType Directory`
    - `Move-Item -Path *.txt -Destination C:\Users\%USERNAME%\Desktop\MyFolder`
- "List all running processes and kill notepad.exe if running."
  - Map to:
    - `Get-Process`
    - `Stop-Process -Name notepad`
- "Add a new user called 'admin' with password 'P@ssw0rd' and add to Administrators group."
  - Map to:
    - `net user admin P@ssw0rd /add`
    - `net localgroup Administrators admin /add`

---

## 6. Extending the Manual
- Add new commands, usage, and examples to `command_manual.py` as the system evolves.
- Regularly review and update this manual to ensure the LLM has the most up-to-date knowledge for system administration.

---

This manual should be provided to any LLM or agent integrated with the Cockpit Orchestrator to ensure full, safe, and effective system control.
