# ArtifactVirtual Utilities

This directory contains core utility libraries and tools that power the ArtifactVirtual ecosystem.

## Overview

The utilities provided in this directory serve as fundamental building blocks for AI research, development, and deployment within ArtifactVirtual:

- **auto-round**: Advanced quantization for Large Language Models (LLMs)
- **debugdiag**: Diagnostic and bootstrap tools for system management
- **dspy**: Integration with the DSPy framework for declarative language processing
- **modelcontextprotocol**: Implementation of the Model Context Protocol (MCP) for standardized LLM context provision

## Auto-Round

[Auto-Round](./auto-round/) is an advanced quantization algorithm that delivers strong accuracy even at low bit precision (2-bit, 3-bit, 4-bit, and 8-bit). It supports multiple hardware platforms including CPU, Intel GPU, and CUDA.

### Key Features

- Preserves model accuracy during extreme compression
- Supports multiple export formats (AutoRound, GPTQ, AWQ, GGUF)
- Enables mixed-bit quantization for optimal performance
- Works with a wide range of LLM architectures

[Learn more about Auto-Round](./auto-round/README.md)

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

## Usage in ArtifactVirtual

These utilities are used throughout the ArtifactVirtual ecosystem:

1. **Auto-Round** is used to optimize models for deployment on resource-constrained environments
2. **Debug-Diag** is used during bootstrap, development, and troubleshooting
3. **DSPy** supports advanced language processing pipelines
4. **MCP** provides standardized context to LLMs across different applications

## Getting Started

Each utility includes its own detailed documentation. To get started with a specific tool:

1. Navigate to the tool's directory
2. Review the README.md file
3. Follow the installation and usage instructions
4. Refer to the examples for practical applications

---

"ArtifactVirtual: Structured Knowledge Systems, AI Ecosystems, and Tools that Empower Creation."