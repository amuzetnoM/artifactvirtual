from .cli_tool import CLITool
from .n8n_tool import N8NTool

# Tool registration and configuration system
class ToolRegistry:
    def __init__(self):
        self.tools = {}
        # Register default CLI and n8n tools
        self.register_tool('cli', CLITool('cli'))
        self.register_tool('n8n', N8NTool(base_url='http://localhost:5678'))

    def register_tool(self, name, tool_obj):
        self.tools[name] = tool_obj

    def get_tool(self, name):
        return self.tools.get(name)

    def list_tools(self):
        return list(self.tools.keys())
