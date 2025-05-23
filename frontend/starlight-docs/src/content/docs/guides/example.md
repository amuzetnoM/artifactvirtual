---
title: WELCOME
description: A comprehensive guide to Artifact Virtual. An open-source platform for AI, blockchain, and Web3 development. Learn setup, workflows, and advanced tools for building decentralized digital systems.

---
Structured Knowledge Systems, AI and Web3 Ecosystems, Hardhat Blockchain Development, and Tools that Empower Creation.

  version: 2.0
  system: Linux
  status: Operational

Artifact Virtual is a sovereign platform for AI, blockchain, and Web3 development—open-source, modular, and built for the future. Designed for developers, researchers, and creators, Artifact provides a progressive development engine with advanced features that evolve with your needs. At its core, it seamlessly integrates artificial intelligence, decentralized infrastructure, and privacy-first design to enable the creation of autonomous, trustless, and innovative digital systems. Artifact empowers you to build with freedom, shape resilient technologies, and own your digital sovereignty.

---

## 🚦 Milestones

| Section                   | Milestone                        | Status    | Start Date   | End Date     |
|---------------------------|----------------------------------|-----------|--------------|--------------|
| **Bootstrap & Setup**     | Workspace Bootstrap              | ✅ Done   | 2022-08-01   | 2022-08-10   |
|                           | DevContainer Integration         | ✅ Done   | 2022-08-11   | 2022-08-20   |
|                           | Automated Diagnostics            | ✅ Done   | 2022-08-21   | 2022-09-01   |
| **Core Foundations**      | Knowledge Foundations            | ✅ Done   | 2022-09-02   | 2022-09-20   |
|                           | AutoRound Quantization           | ✅ Done   | 2022-09-21   | 2022-10-10   |
|                           | Model Context Protocol           | ✅ Done   | 2022-10-11   | 2022-10-25   |
| **Blockchain & Web3**     | Hardhat Integration              | ✅ Done   | 2024-06-01   | 2024-06-10   |
|                           | Smart Contract Templates         | 🚧 Active | 2024-06-11   | 2024-06-20   |
|                           | Decentralized Storage Upgrade    | 🕒 Planned| 2024-06-21   | 2024-07-01   |
|                           | zk-SNARKs & Privacy Modules      | 🕒 Planned| 2024-07-02   | 2024-07-15   |
| **Applications & Utilities** | Simulation Manager            | ✅ Done   | 2022-10-26   | 2022-11-10   |
|                           | Oracle CLI                       | ✅ Done   | 2022-11-11   | 2022-11-25   |
|                           | Meteor Markdown Editor           | 🚧 Active | 2022-11-26   | 2024-06-01   |
|                           | Temporal Calendar                | ✅ Done   | 2022-12-01   | 2022-12-15   |
| **Expansion & Community** | Cookbooks & Samples              | ✅ Done   | 2023-01-01   | 2023-01-20   |
|                           | Community Contributions          | 🚧 Active | 2023-01-21   | 2025-06-01   |
| **Research**              | LLM Fine-tuning Pipelines        | 🕒 Planned| 2024-06-15   | 2024-07-01   |
|                           | Distributed Agent Systems        | 🕒 Planned| 2024-07-02   | 2024-07-20   |
|                           | Research & Philosophy Docs       | 🕒 Planned| 2024-07-21   | 2024-08-01   |

---

## Quickstart

**Workspace Structure Overview**

- `.startup/` — Bootstrap scripts and setup
- `devcontainer/` — VS Code DevContainer configuration
- `datasets/` — Knowledge Foundations
- `cookbooks/` — Patterns & Recipes
- `utils/` — Core Utilities
- `projects/` — Apps & Pipelines
- `samples/` — Provider Demos
- `docs/` — Guides & Resources

**Typical Workflow:**

1. Start with `.startup` to bootstrap your environment.
2. Use the DevContainer for a pre-configured VS Code setup.
3. Develop and test in `projects/`, using resources from `datasets/`, `cookbooks/`, and `utils/`.
4. Explore `samples/` for provider demos.
5. Reference `docs/` for guides and documentation.

### Automated Setup

```bash
python startup.py
```
- Checks system, installs dependencies, boots core services, and welcomes you interactively.
- See [.startup/readme.md](.startup/readme.md) for details.

### DevContainer (Recommended for VS Code)

1. Open in VS Code, install Remote - Containers extension
2. "Reopen in Container" when prompted
3. Wait for the environment to build and initialize
- See [devcontainer/README.md](devcontainer/README.md) for advanced usage

---

## Project Navigation

- [Getting Started Guide](docs/gettingstarted.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Resources & References](docs/resources.md)
- [Cookbooks](cookbooks/README.md)
- [Datasets](datasets/README.md)
- [Samples](samples/README.md)
- [Utilities](utils/README.md)
- [Projects](projects/)
- [Research & Philosophy](backup/research/index.mdx)
- [Contributing](CONTRIBUTING.md)
- [License](LICENSE)

# Getting Started

This guide will help you set up your environment and get started with this comprehensive AI, blockchain, and Web3 development workspace.

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
   - [Blockchain & Hardhat](#blockchain--hardhat)
   - [Knowledge Foundations](#knowledge-foundations)
5. [First Steps](#first-steps)
   - [Running Your First Model](#running-your-first-model)
   - [Using the Oracle CLI](#using-the-oracle-cli)
   - [Model Quantization with AutoRound](#model-quantization-with-autoround)
   - [Deploying a Smart Contract](#deploying-a-smart-contract)
6. [Next Steps](#next-steps)

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.11+** and **pip**
- **Node.js 20+** and **npm** (required for JS samples and documentation site)
- **Git** and **Git LFS** (for version control and large file management)
- **curl** (for API samples)
- **CMake** (required for building some dependencies like sentencepiece)
- **Hardhat** (for blockchain development)

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
7. Set up Hardhat and blockchain templates

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

4. Install Hardhat (for blockchain development):

   ```bash
   npm install --global hardhat
   ```

5. Install Ollama (optional but recommended):
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
- Hardhat and blockchain tools
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

# Use the debugdiag utility to install or check packages
python utils/debugdiag/main.py diagnose packages
```

### LLM Integration

Artifact Virtual integrates with multiple LLM frameworks:

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

### Blockchain & Hardhat

Artifact Virtual now features robust blockchain and Web3 tooling:

- **Hardhat**: Develop, test, and deploy smart contracts

  ```bash
  # Initialize a new Hardhat project
  npx hardhat init

  # Compile contracts
  npx hardhat compile

  # Run tests
  npx hardhat test

  # Deploy to local network
  npx hardhat run scripts/deploy.js --network localhost
  ```

- **Smart Contract Templates**: Find ready-to-use templates in `projects/blockchain/contracts/`
- **Decentralized Storage**: Integrate with IPFS and Filecoin (see upcoming modules)
- **zk-SNARKs & Privacy**: Privacy-preserving modules coming soon

### Knowledge Foundations

Explore the curated datasets and knowledge libraries:

- `datasets/library/index.md`
- `datasets/core_facts.json`
- `datasets/reasoning_patterns.json`
- `datasets/language_primitives.json`
- `datasets/temporal_events.json`

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

### Deploying a Smart Contract

Get started with blockchain development:

```bash
# Initialize Hardhat in your project directory
npx hardhat init

# Compile and deploy a sample contract
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

## Next Steps

Now that you've set up Artifact Virtual and explored some core components, here are some suggestions for next steps:

1. **Explore the Samples**: Check out the various code samples in the `samples` folder for different LLM providers and blockchain contracts.
2. **Build with MCP**: Try creating your own MCP server that exposes custom resources and tools.
3. **Create a Quantized LLM Pipeline**: Combine AutoRound's quantization capabilities with Ollama for efficient LLM deployment.
4. **Develop Smart Contracts**: Use Hardhat and our templates to build and deploy your own contracts.
5. **Contribute**: Explore the codebase and consider contributing to the project.
6. **Documentation**: Browse the comprehensive documentation site:

   ```bash
   cd frontend/celestial-chaos
   npm run dev
   # Open http://localhost:4321 in your browser
   ```

For troubleshooting and additional resources, refer to the [Troubleshooting](docs/troubleshooting.md) and [Resources](docs/resources.md) guides.

---

> **Note**: This document is a work in progress. Please check back for updates and additional content. If you have suggestions or feedback, feel free to open an issue or pull request on GitHub. Your contributions are welcome! Please ensure to follow the contribution guidelines in the `CONTRIBUTING.md` file before making a contribution. Thank you for your support!
