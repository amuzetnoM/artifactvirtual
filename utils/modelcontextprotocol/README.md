# Model Context Protocol (MCP) for ArtifactVirtual

This module implements the Model Context Protocol (MCP), a standardized way for applications to provide context to Large Language Models (LLMs).

## Overview

The Model Context Protocol allows applications to provide context for LLMs in a standardized way, separating the concerns of providing context from the actual LLM interaction. The ArtifactVirtual implementation includes:

- Client libraries for connecting to MCP servers
- Server frameworks for exposing resources, tools, and prompts
- Support for multiple transports (stdio, SSE)
- Integration with Claude Desktop and other LLM platforms

## Installation

```bash
# Install the core MCP package
pip install mcp

# For CLI tools
pip install "mcp[cli]"
```

## Quickstart

### Create a Simple MCP Server

```python
# server.py
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Demo")

# Add an addition tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

# Add a dynamic greeting resource
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"
```

### Test Your Server

```bash
# Run the server with the development inspector
mcp dev server.py

# Install in Claude Desktop for immediate interaction
mcp install server.py
```

## Core Concepts

### Resources

Resources expose data to LLMs, similar to GET endpoints in a REST API:

```python
@mcp.resource("config://app")
def get_config() -> str:
    """Static configuration data"""
    return "App configuration here"

@mcp.resource("users://{user_id}/profile")
def get_user_profile(user_id: str) -> str:
    """Dynamic user data"""
    return f"Profile data for user {user_id}"
```

### Tools

Tools let LLMs take actions through your server:

```python
@mcp.tool()
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate BMI given weight in kg and height in meters"""
    return weight_kg / (height_m**2)
```

### Prompts

Prompts are reusable templates for LLM interactions:

```python
@mcp.prompt()
def review_code(code: str) -> str:
    return f"Please review this code:\n\n{code}"
```

## Running MCP Servers

### Development Mode

```bash
mcp dev server.py
```

### Claude Desktop Integration

```bash
mcp install server.py --name "My MCP Server"
```

### Custom Deployments

```bash
# Run directly
python server.py

# Use the MCP CLI
mcp run server.py
```

## Examples

Explore the examples directory for complete working examples:

- [Simple Tool Server](examples/servers/simple-tool/README.md)
- [Simple Resource Server](examples/servers/simple-resource/README.md)
- [Simple Prompt Server](examples/servers/simple-prompt/README.md)

## Integration with ArtifactVirtual

Within ArtifactVirtual, MCP serves as a bridge between LLMs and various data sources and tools:

1. **Knowledge Access**: MCP resources provide structured access to the knowledge foundations in `datasets/`
2. **LLM Tools**: MCP tools enable LLMs to interact with the diagnostic utilities and AutoRound quantization
3. **Standardized Interfaces**: MCP creates consistent interfaces for interacting with different LLM providers

## Documentation

- [Model Context Protocol documentation](https://modelcontextprotocol.io)
- [Model Context Protocol specification](https://spec.modelcontextprotocol.io)
- [Claude Desktop Integration Guide](CLAUDE.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
