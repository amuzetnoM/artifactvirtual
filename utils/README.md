# ArtifactVirtual Utilities

This directory contains core utility libraries and tools that power the ArtifactVirtual ecosystem.

## Overview

The utilities provided in this directory serve as fundamental building blocks for AI research, development, and deployment within ArtifactVirtual:

- **auto-round**: Advanced quantization for Large Language Models (LLMs)
- **configsystem**: Unified configuration management for ArtifactVirtual projects
- **debugdiag**: Diagnostic and bootstrap tools for system management
- **dspy**: Integration with the DSPy framework for declarative language processing
- **modelcontextprotocol**: Implementation of the Model Context Protocol (MCP) for standardized LLM context provision
- **workspace-rag**: Modular Retrieval Augmented Generation for local workspace data

## Auto-Round

[Auto-Round](./auto-round/) is an advanced quantization algorithm that delivers strong accuracy even at low bit precision (2-bit, 3-bit, 4-bit, and 8-bit). It supports multiple hardware platforms including CPU, Intel GPU, and CUDA.

### Key Features

- Preserves model accuracy during extreme compression
- Supports multiple export formats (AutoRound, GPTQ, AWQ, GGUF)
- Enables mixed-bit quantization for optimal performance
- Works with a wide range of LLM architectures

[Learn more about Auto-Round](./auto-round/README.md)

## ConfigSystem

[ConfigSystem](./configsystem/) provides a unified approach to configuration management across ArtifactVirtual projects, ensuring consistent handling of settings across different environments and components.

### Key Features

- Hierarchical configuration with inheritance and overrides
- Environment-specific settings management
- Validation of configuration values
- Support for multiple formats (YAML, JSON, TOML)
- Secrets management integration

## Debug-Diag

[Debug-Diag](./debugdiag/) is the primary diagnostic and bootstrap tool for ArtifactVirtual. It provides structured logging, system introspection, and workspace initialization.

### Key Features

- Unified entry point for system diagnostics and bootstrapping
- Structured logging to a `.logs/` directory
- Beautiful CLI output with Rich tables and formatting
- CUDA-aware diagnostics for GPU monitoring
- Extensible command system based on Click groups

[Learn more about Debug-Diag](./debugdiag/readme.md)

## DSPy

The [DSPy integration](./dspy/) provides support for declarative language processing within ArtifactVirtual.

### Key Features

- Programmatic composition of language models
- Optimizable LLM pipelines
- Integration with the Oracle CLI for interactive demonstrations

## Model Context Protocol (MCP)

The [Model Context Protocol implementation](./modelcontextprotocol/) provides a standardized way for applications to provide context to LLMs.

### Key Features

- Server frameworks for exposing resources, tools, and prompts
- Client libraries for connecting to MCP servers
- Support for multiple transports (stdio, SSE)
- Integration with Claude Desktop and other LLM platforms

[Learn more about MCP](./modelcontextprotocol/README.md)

## Workspace RAG

The [Workspace RAG](../workspace_rag.py) system provides a modular Retrieval Augmented Generation implementation that can access and reason about your entire workspace content through vector search.

### Key Features

- Indexes the entire workspace with intelligent file filtering
- Integrates with Ollama models (default: gemma3)
- Provides TTS/STT capabilities for voice interaction
- Includes a web interface for chat interactions
- Features an extensible tool registration system
- Supports embedding in other applications via Angular components

## Usage in ArtifactVirtual

These utilities are used throughout the ArtifactVirtual ecosystem:

1. **Auto-Round** is used to optimize models for deployment on resource-constrained environments
2. **ConfigSystem** manages configurations across projects consistently
3. **Debug-Diag** is used during bootstrap, development, and troubleshooting
4. **DSPy** supports advanced language processing pipelines
5. **MCP** provides standardized context to LLMs across different applications
6. **Workspace RAG** enables AI systems to reason about and leverage local workspace content

## Getting Started

Each utility includes its own detailed documentation. To get started with a specific tool:

1. Navigate to the tool's directory
2. Review the README.md file
3. Follow the installation and usage instructions
4. Refer to the examples for practical applications

---

## Workspace RAG, Web Chat, and Voice/Multimodal Capabilities

ArtifactVirtual includes a modular Retrieval-Augmented Generation (RAG) system that indexes the entire workspace for advanced search, reasoning, and chat. Key features:

- **Recursive indexing** of all relevant files with chunking and filtering
- **Web chat UI** (FastAPI + Gradio) for text and voice (TTS/STT) chat
- **Tool registry** for custom tool invocation from chat (e.g., `/tool calculate 2+2`)
- **Multimodal support** (image/audio input for supported models)
- **CLI interface** for direct RAG queries and management

### Usage
- Start the web chat: `python web_chat_server.py` (see [README.md](../README.md))
- Use the CLI: `python workspace_rag.py --query "..."`