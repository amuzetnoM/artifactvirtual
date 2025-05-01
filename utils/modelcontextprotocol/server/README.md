# Quasar MCP Server

A next-generation, modular, and secure Model Context Protocol (MCP) server optimized for advanced agent workflows and extensibility.

## Features
- **MCP-compliant**: Built on the official MCP Python SDK (`mcp[cli]`)
- **Modular Protocol/Tool Registry**: Easily add, remove, or update agent tools and protocols
- **API Key Security**: Simple API key check (can be extended for OAuth/JWT)
- **Advanced Logging**: Structured logs for audit and debugging
- **Production-Ready**: Designed for robust, real-world agent and LLM integration

## Quick Start

### 1. Prerequisites
- Python 3.10+
- Install MCP SDK:
  ```bash
  pip install "mcp[cli]"
  # or with uv (recommended)
  uv add "mcp[cli]"
  ```

### 2. Run the Quasar Server

```bash
python quasar_server.py
```

- The server will start and expose all registered protocols/tools via MCP.
- By default, the API key is `quasar-demo-key`. You can set your own via the `QUASAR_API_KEYS` environment variable (comma-separated for multiple keys).

### 3. Example Usage (from an MCP client)

```python
import requests

# Example call to the 'add' protocol/tool
payload = {
    "protocol": "add",
    "args": [2, 3],
    "kwargs": {},
    "api_key": "quasar-demo-key"
}
response = requests.post("http://localhost:8000/gateway", json=payload)
print(response.json())
```

### 4. Extending the Server
- Add new agent tools/protocols by defining a function and registering it in `_register_protocols()` in `quasar_server.py`.
- Example:
  ```python
  def quasar_subtract(a: int, b: int) -> int:
      return a - b
  # ...
  self.registry.register("subtract", quasar_subtract)
  ```

### 5. Security
- Change the API key(s) in production! Set the `QUASAR_API_KEYS` environment variable.
- For advanced security, integrate OAuth, JWT, or other authentication mechanisms.

### 6. Logging
- Logs are output to the console. Adjust `logging.basicConfig` in `quasar_server.py` for file logging or different verbosity.

### 7. References
- [Model Context Protocol (MCP) Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Documentation](https://modelcontextprotocol.io)

---

**Quasar MCP Server** is designed for next-gen agentic workflows, LLM integration, and secure, modular context serving.
