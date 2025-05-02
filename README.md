# ArtifactVirtual: Advanced AI Development Workspace

[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/amuzetnoM/artifactvirtual)
[![Python](https://img.shields.io/badge/Python-3.11+-brightgreen)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ArtifactVirtual provides a seamless, self-initializing AI development workspace designed for research, experimentation, and deployment of advanced AI systems. This project combines powerful local LLM capabilities with comprehensive quantization tools, diagnostics utilities, and structured knowledge systems.

## 🚀 Quickstart

### Prerequisites
- Python 3.11+ with pip
- Node.js 20+ with npm (for JS samples and documentation)
- Git and Git LFS
- Curl (for samples)

### One-Command Setup
```bash
python startup.py
```

This initializes your environment automatically:
1. Verifies system requirements and dependencies
2. Sets up a Python virtual environment
3. Installs required packages (PyTorch, Transformers, LangChain, etc.)
4. Configures Ollama with required models
5. Sets up AutoRound for model quantization
6. Presents an interactive welcome prompt

## 🧠 Key Components

- **Self-Initializing Bootstrap**: Cross-platform startup system that works natively on Windows, macOS, and Linux
- **Debugging & Diagnostics CLI**: `debugdiag` tool for system introspection, logging, and troubleshooting
- **LLM Integration**:
  - **Ollama**: Local LLM server setup and management
  - **AutoRound**: Advanced quantization for LLMs with 2, 3, 4, and 8-bit precision
  - **Model Context Protocol (MCP)**: Standardized way to provide context to LLMs
- **Oracle CLI**: Multimodal LLM playground with model chaining and plugin system
- **Knowledge Foundations**: Comprehensive datasets and knowledge libraries
- **Sample Code**: Examples for various LLM providers (OpenAI, MistralAI, etc.)
- **Documentation**: Beautiful documentation site built with Astro/Starlight

## 📚 Documentation

- [Getting Started](docs/gettingstarted.md): Complete setup and first steps
- [Troubleshooting](docs/troubleshooting.md): Common issues and solutions
- [Resources](docs/resources.md): Additional resources and references

## 📊 Project Structure

```
artifactvirtual/
├── .startup/               # Bootstrap initialization scripts
├── backup/                 # Backup of documentation and research
├── cookbooks/              # LLM integration examples (LlamaIndex, LangChain, etc.)
├── datasets/               # Knowledge foundations and curated resources
├── devcontainer/           # VS Code devcontainer configuration 
├── docs/                   # Core documentation
├── frontend/               # Documentation site (Astro/Starlight)
├── oracles/                # LLM playground CLI with model chaining
├── samples/                # Code samples for various LLM providers
├── temporalcalendar/       # Test program for workspace validation
├── utils/                  # Utility tools
│   ├── auto-round/         # LLM model quantization
│   ├── debugdiag/          # Debugging and diagnostic tools
│   └── modelcontextprotocol/ # MCP implementation
├── README.md               # Project overview
├── requirements.txt        # Core Python dependencies
├── setup.py               # Package configuration
└── startup.py             # Main bootstrap script
```

## 🛠️ Development

### Setting up a Development Environment

1. Clone the repository:
```bash
git clone https://github.com/amuzetnoM/artifactvirtual.git
cd artifactvirtual
```

2. Run the automated setup:
```bash
python startup.py
```

3. Activate the virtual environment:
```bash
# On Windows
.venv\Scripts\activate

# On macOS/Linux
source .venv/bin/activate
```

### Running the Diagnostic Tools

```bash
# Show system status
python utils/debugdiag/main.py project status

# View logs
python utils/debugdiag/main.py logs show

# Check connectivity
python utils/debugdiag/main.py diagnose ping
```

### Working with LLMs

```bash
# Start the Oracle CLI
python oracles/oracle_cli.py

# Quantize a model with AutoRound
python -m auto_round --model Qwen/Qwen3-0.6B --bits 4 --group_size 128
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Connect

- [GitHub](https://github.com/amuzetnoM/artifactvirtual)

---

ArtifactVirtual: Structured Knowledge Systems, AI Ecosystems, and Tools that Empower Creation.