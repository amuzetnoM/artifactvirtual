# Cockpit Orchestrator Bootcamp Documentation

## Overview
The Cockpit Orchestrator is an advanced, modular system designed to empower LLMs (Large Language Models) with deep, OS-level control and automation capabilities. It enables natural language interaction for executing commands, managing files, automating workflows, and reasoning about system operations—effectively acting as an intelligent operating system assistant.

## Features
- **Natural Language Command Execution:** Parse and execute user instructions as Windows CMD/PowerShell commands or n8n automations.
- **Command Manual & Reasoning:** Built-in command manual for Windows and PowerShell, with logic for LLMs to learn, reason, and select the best command for a given intent.
- **Task Queue & Dependency Management:** Queue and execute single or multi-step tasks, with dependency resolution and history tracking.
- **Script Generation:** Automatically generate and save PowerShell scripts for complex, multi-step tasks.
- **Chat-Based Interface:** Interactive chat loop for ongoing conversation, clarification, and feedback.
- **Extensible Tool Registry:** Easily add new tools (CLI, n8n, etc.) and integrate with external systems.
- **Error Handling & Feedback:** Captures command output, errors, and provides actionable feedback.

## Directory Structure
- `cockpit.py` — Entry point for the orchestrator.
- `orchestrator.py` — Core orchestration logic, chat interface, command mapping, reasoning, and scripting.
- `tool_registry.py` — Tool registration and management.
- `cli_tool.py` — CLI command execution wrapper.
- `n8n_tool.py` — n8n automation integration.
- `model_loader.py` — LLM/model loading and management.
- `command_manual.py` — Comprehensive manual of Windows and PowerShell commands, usage, and examples.
- `task_queue.py` — Task and queue management with dependency support.
- `requirements.txt` — Python dependencies for the bootcamp.
- `cockpit_build_checklist.md` — Step-by-step build and implementation checklist.
- `cockpit_overview.md` — High-level architecture and flow overview.

## How It Works
1. **User Interaction:**
   - User enters a prompt in natural language (e.g., "create a folder on the desktop and move all .txt files into it").
   - The orchestrator parses the intent, consults the command manual, and reasons about the best command(s) to use.
2. **Command Mapping & Reasoning:**
   - The system matches the intent to known commands, suggests usage examples, and can generate scripts for multi-step tasks.
   - If the task is complex, a PowerShell script is generated and saved.
3. **Task Queue & Execution:**
   - Commands are queued and executed in order, with dependency management.
   - Output and errors are captured and shown to the user.
4. **Learning & Extensibility:**
   - The LLM can "learn" from the command manual and adapt to new tools or commands.
   - The system is modular, allowing easy integration of new capabilities.

## Example Usage
- **Single Command:**
  - User: `create summary.txt and populate it with hello world`
  - System: Creates `summary.txt` with the content `hello world`.
- **Multi-Step Task:**
  - User: `create a folder on the desktop; move all .txt files into it`
  - System: Generates and saves a PowerShell script to perform both steps.
- **Open Folders/Files:**
  - User: `open music`
  - System: Opens the Music folder in Explorer.
- **Edit Files:**
  - User: `edit notes.txt`
  - System: Opens `notes.txt` in Notepad.

## Extending the System
- **Add New Commands:**
  - Update `command_manual.py` with new commands, usage, and examples.
- **Add New Tools:**
  - Register new tools in `tool_registry.py` and implement their wrappers.
- **Integrate New LLMs:**
  - Extend `model_loader.py` to support additional models.
- **Enhance Reasoning:**
  - Improve `_reason_about_command` in `orchestrator.py` for smarter command selection.

## Best Practices
- Always test new commands/scripts in a safe environment.
- Review and expand the command manual regularly for better LLM performance.
- Use the chat interface for iterative, conversational automation.

## Troubleshooting
- If a command fails, check the error output for details.
- Ensure all dependencies in `requirements.txt` are installed.
- For PowerShell-specific issues, verify your shell and permissions.

## Contributing
See `CONTRIBUTING.md` in the project root for guidelines on contributing to the Cockpit Orchestrator Bootcamp.

## [2025-05-22] Llama-3, DSPy, and Persistent Memory Integration
- Llama-3 (via Ollama) is now the default LLM for logic, reasoning, and chat. To use, run: `ollama pull llama3`.
- DSPy is installed and integrated for advanced intent parsing and logic translation.
- Persistent memory is provided by PostgreSQL + pgvector, with fail-safe management via pm2.
- The orchestrator is now modular, robust, and ready for advanced system automation and reasoning.
- The full LLM system manual is used as the system prompt for the LLM, ensuring it understands all system commands and logic.
- `.env` file is used to manage the system prompt externally for easy updates.
- See `bootcamp/LLM_SYSTEM_MANUAL.md` for the full system prompt and command reference.

---

For further details, see the architecture and checklist markdown files in this directory.
