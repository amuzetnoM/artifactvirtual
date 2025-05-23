from langchain.tools import Tool
from command_parser import run_objective

def run_objective_tool(objective: str) -> str:
    if objective.strip().lower() in ["help", "commands", "list commands"]:
        # Return a list of available commands
        parser = __import__('command_parser').CommandParser()
        return "Available commands: " + ", ".join(parser.command_map.keys())
    return run_objective(objective, non_interactive=True)

command_tool = Tool(
    name="CommandParserTool",
    func=run_objective_tool,
    description=(
        "Executes high-level system objectives by mapping them to OS commands and returning output. "
        "Example objectives: 'list files', 'open documents', 'show network configuration', 'copy a file', 'restart computer', 'add user', 'open control panel'. "
        "Type 'help' to see all available commands."
    )
)
