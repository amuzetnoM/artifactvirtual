import sys
import os
from bootcamp.orchestrator import CockpitOrchestrator
from bootcamp.task_queue import Task  # Import Task directly

def main():
    print("\n=== Cockpit Orchestrator CLI ===\n")
    print("Type 'help' for commands, 'exit' to quit. Type 'qwen' for Qwen3 LLM-driven automation.\n")
    orchestrator = CockpitOrchestrator()
    while True:
        try:
            user_input = input("[Cockpit] > ").strip()
            if user_input.lower() in ("exit", "quit"):
                print("[Cockpit] Session ended.")
                break
            elif user_input.lower() == "help":
                print("""
Available commands:
  - Any natural language instruction (e.g. 'open documents', 'create file', etc.)
  - help: Show this help message
  - exit/quit: Exit the orchestrator
  - qwen: Enter Qwen3 LLM-driven automation mode
""")
                continue
            elif user_input.lower() == "qwen":
                orchestrator.chat_qwen()
                continue
            elif user_input == "":
                continue
            # Pass input to orchestrator chat loop
            orchestrator.chat_history.append({"role": "user", "content": user_input})
            intent = orchestrator._call_gemma3(user_input)
            print(f"[Intent Parser] Parsed intent: {intent}")
            # If multiple commands, split and queue
            commands = [c.strip() for c in intent.split(';') if c.strip()]
            # Use Task from bootcamp.task_queue, not from the TaskQueue instance
            tasks = [Task(command=cmd) for cmd in commands]
            for task in tasks:
                orchestrator.task_queue.add_task(task)
            while not orchestrator.task_queue.all_completed():
                ready_tasks = orchestrator.task_queue.get_ready_tasks()
                for task in ready_tasks:
                    cli_command = orchestrator._map_to_cli(task.command)
                    if cli_command:
                        cli_tool = orchestrator.tool_registry.get_tool('cli')
                        result = cli_tool.execute(cli_command)
                        print(f"[CLI Result] {result}")
                    elif 'n8n' in task.command.lower():
                        n8n_tool = orchestrator.tool_registry.get_tool('n8n')
                        result = n8n_tool.trigger_workflow('workflow_id', data={'step': task.command})
                        print(f"[n8n Result] {result}")
                    else:
                        print(f"[Tool Orchestrator] No tool matched for: {task.command}")
                    orchestrator.task_queue.mark_completed(task)
                    orchestrator.chat_history.append({"role": "system", "content": str(result)})
            print("[Cockpit] All tasks completed.\n")
        except KeyboardInterrupt:
            print("\n[Interrupted] Type 'exit' to quit.")
        except Exception as e:
            print(f"[Error] {e}")

if __name__ == "__main__":
    main()
