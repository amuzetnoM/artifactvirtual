# Getting Started with ArtifactVirtual

Welcome to ArtifactVirtual! This guide will help you set up your environment and get started with this comprehensive AI development workspace.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
   - [Automated Setup](#automated-setup)
   - [Manual Setup](#manual-setup)
3. [Development Environment](#development-environment)
   - [VS Code DevContainer](#vs-code-devcontainer)
   - [Local Development](#local-development)
4. [Core Components](#core-components)
   - [Debugging & Diagnostics](#debugging--diagnostics)
   - [LLM Integration](#llm-integration)
   - [Knowledge Foundations](#knowledge-foundations)
5. [First Steps](#first-steps)
   - [Running Your First Model](#running-your-first-model)
   - [Using the Oracle CLI](#using-the-oracle-cli)
   - [Model Quantization with AutoRound](#model-quantization-with-autoround)
6. [Next Steps](#next-steps)

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.11+** and **pip**
- **Node.js 20+** and **npm** (required for JS samples and documentation site)
- **Git** and **Git LFS** (for version control and large file management)
- **curl** (for API samples)
- **CMake** (required for building some dependencies like sentencepiece)

For GPU acceleration (optional but recommended):
- **CUDA Toolkit 11.8+** for NVIDIA GPUs
- **ROCm** for AMD GPUs
- **OneAPI** for Intel GPUs

## Installation

### Automated Setup

The fastest way to get started is with our automated setup script:

```bash
python startup.py
```

This script will:
1. Check your system for required dependencies
2. Create a Python virtual environment (`.venv`)
3. Install all Python dependencies
4. Set up Ollama with required models
5. Initialize AutoRound for model quantization
6. Prepare the development environment

### Manual Setup

If you prefer to set things up manually or the automated setup encounters issues:

1. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   
   # Activate on Windows
   .venv\Scripts\activate
   
   # Activate on macOS/Linux
   source .venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies (for documentation):
   ```bash
   cd frontend/celestial-chaos
   npm install
   cd ../..
   ```

4. Install Ollama (optional but recommended):
   - [Ollama installation instructions](https://ollama.ai/download)
   - After installation, pull the required models:
     ```bash
     ollama pull phi4-mini
     ollama pull gemma3
     ```

## Development Environment

### VS Code DevContainer

For the most seamless setup, we recommend using VS Code with our pre-configured DevContainer:

1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open the ArtifactVirtual folder in VS Code
4. When prompted, click "Reopen in Container"
5. The container will be built and configured automatically

The DevContainer includes:
- All required Python packages
- Node.js and npm
- CUDA support for GPU acceleration
- PostgreSQL database
- Pre-configured extensions

### Local Development

If you prefer local development:

1. Activate the virtual environment:
   ```bash
   # On Windows
   .venv\Scripts\activate
   
   # On macOS/Linux
   source .venv/bin/activate
   ```

2. Run the debugging and diagnostic tool to verify your setup:
   ```bash
   python utils/debugdiag/main.py project status
   ```

## Core Components

### Debugging & Diagnostics

The `debugdiag` CLI tool is your primary diagnostic and bootstrap utility:

```bash
# Show current system status
python utils/debugdiag/main.py project status

# View log entries
python utils/debugdiag/main.py logs show

# Check connectivity to a host
python utils/debugdiag/main.py diagnose ping --host github.com
```

### LLM Integration

ArtifactVirtual integrates with multiple LLM frameworks:

1. **Ollama**: Local LLM server with multiple models
   ```bash
   # Check available models
   ollama list
   
   # Pull a new model
   ollama pull llava
   ```

2. **AutoRound**: Advanced model quantization
   ```bash
   # Quantize a model to 4 bits
   python -m auto_round --model Qwen/Qwen3-0.6B --bits 4 --group_size 128
   ```

3. **Model Context Protocol (MCP)**: Standardized context provision
   ```bash
   # Run an MCP server
   cd utils/modelcontextprotocol/examples/servers/simple-prompt
   python server.py
   ```

### Knowledge Foundations

Explore the curated datasets and knowledge libraries:

1. Library of Immutable Knowledge:
   ```
   datasets/library/index.md
   ```

2. Foundations datasets:
   ```
   datasets/core_facts.json
   datasets/reasoning_patterns.json
   datasets/language_primitives.json
   datasets/temporal_events.json
   ```

## First Steps

### Running Your First Model

Let's start by running a simple interaction with a model:

```bash
# Start the Oracle CLI
python oracles/oracle_cli.py

# Select option 1 (Chat with phi4-mini)
# Enter a prompt, e.g., "Tell me about artificial intelligence"
```

### Using the Oracle CLI

The Oracle CLI provides a multimodal LLM playground:

1. Try chaining models together:
   - Select option 4 (Chain: phi4-mini ➔ gemma3)
   - Enter a complex query that benefits from multiple perspectives

2. Try multimodal processing:
   - Select option 5 (Multimodal: LLaVA ➔ Gemma-3)
   - Provide an image and a prompt about the image

### Model Quantization with AutoRound

Experience the power of AutoRound by quantizing a model:

```bash
# Navigate to utils/auto-round
cd utils/auto-round

# Ensure dependencies are installed
pip install -e .

# Quantize a model (this will download the model if not already present)
auto-round --model microsoft/phi-2 --bits 4 --group_size 128 --format auto_round
```

## Next Steps

Now that you've set up ArtifactVirtual and explored some core components, here are some suggestions for next steps:

1. **Explore the Samples**: Check out the various code samples in the `samples` folder for different LLM providers.

2. **Build with MCP**: Try creating your own MCP server that exposes custom resources and tools.

3. **Create a Quantized LLM Pipeline**: Combine AutoRound's quantization capabilities with Ollama for efficient LLM deployment.

4. **Contribute**: Explore the codebase and consider contributing to the project.

5. **Documentation**: Browse the comprehensive documentation site:
   ```bash
   cd frontend/celestial-chaos
   npm run dev
   # Open http://localhost:4321 in your browser
   ```

For troubleshooting and additional resources, refer to the [Troubleshooting](troubleshooting.md) and [Resources](resources.md) guides.

---

> "ArtifactVirtual: Structured Knowledge Systems, AI Ecosystems, and Tools that Empower Creation."