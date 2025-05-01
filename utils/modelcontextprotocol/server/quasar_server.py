import logging
from typing import Any, Dict, Callable
from mcp.server.fastmcp import FastMCP
import os

# --- Quasar Server: Next-Gen MCP Server ---

# Advanced logging setup
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger("QuasarServer")

# API key management (can be extended for OAuth/JWT)
API_KEYS = set(os.environ.get("QUASAR_API_KEYS", "quasar-demo-key").split(","))

def require_api_key(func):
    def wrapper(*args, api_key: str = "", **kwargs):
        if api_key not in API_KEYS:
            logger.warning(f"Unauthorized access attempt with key: {api_key}")
            raise PermissionError("Invalid API key.")
        return func(*args, **kwargs)
    return wrapper

class ProtocolRegistry:
    """Registry for protocol/tool handlers."""
    def __init__(self):
        self.protocols: Dict[str, Callable] = {}

    def register(self, name: str, handler: Callable):
        if name in self.protocols:
            logger.warning(f"Protocol '{name}' is already registered. Overwriting.")
        self.protocols[name] = handler
        logger.info(f"Registered protocol: {name}")

    def get(self, name: str) -> Callable:
        handler = self.protocols.get(name)
        if not handler:
            logger.error(f"Protocol '{name}' not found.")
            raise ValueError(f"Protocol '{name}' not found.")
        return handler

# Example: Quasar agent core logic (can be extended)
def quasar_analyze(data: dict) -> dict:
    # Placeholder for advanced agent logic
    logger.info(f"Quasar analyzing data: {data}")
    return {"summary": f"Processed {len(data)} fields.", "input": data}

def quasar_echo(message: str) -> str:
    return f"[quasar] {message}"

def quasar_add(a: int, b: int) -> int:
    return a + b

class QuasarServer:
    def __init__(self, name: str = "QuasarAgentServer"):
        self.mcp = FastMCP(name)
        self.registry = ProtocolRegistry()
        self._register_protocols()

    def _register_protocols(self):
        self.registry.register("analyze", quasar_analyze)
        self.registry.register("echo", quasar_echo)
        self.registry.register("add", quasar_add)
        # Add more tools/protocols as needed

    @require_api_key
    def handle(self, protocol: str, *args, **kwargs) -> Any:
        handler = self.registry.get(protocol)
        return handler(*args, **kwargs)

    def expose(self):
        @self.mcp.tool()
        def quasar_gateway(protocol: str, args: list = [], kwargs: dict = {}, api_key: str = "") -> Any:
            return self.handle(protocol, *args, api_key=api_key, **kwargs)

    def run(self):
        self.expose()
        logger.info("Quasar MCP server is starting...")
        self.mcp.run()

if __name__ == "__main__":
    QuasarServer().run()
