# Artifact Virtual Workspace Context

## Overview

Artifact Virtual is a sovereign, modular, open-source platform for AI, blockchain, and Web3 development. It empowers developers, researchers, and creators to build autonomous, trustless, and innovative digital systems with a privacy-first design and decentralized infrastructure. This workspace context is exhaustive, serving as the primary knowledge base and operational guide for all contributors and AI agents.

---

## Workspace Structure

The workspace is organized for modularity, discoverability, and extensibility. Key directories and files:

- `.startup/`: Bootstrap scripts, environment setup, onboarding guides.
- `devcontainer/`: VS Code DevContainer config for reproducible, GPU-accelerated environments.
- `datasets/`: Curated knowledge foundations, open datasets, synthetic data generators, and data versioning utilities.
- `cookbooks/`: Ready-to-use patterns and best practices for AI, blockchain, and full-stack development. Includes RAG, agent, and optimization examples.
- `utils/`: Core utilities:
    - `auto-round/`: Model quantization (AutoRound)
    - `debugdiag/`: Diagnostics and troubleshooting
    - `modelcontextprotocol/`: Model Context Protocol (MCP) for standardized LLM context
    - `dspy/`, `configsystem/`, and more
- `projects/`: Main applications and pipelines:
    - `bedrock/`: Multi-chain blockchain development (Solidity, Vyper, Cairo, Plutus, Rust, Haskell)
    - `meteor-markdown-editor/`: AI-powered markdown editor
    - `oracle-ai-pipeline/`, `simulation-manager/`, `temporal-calendar/`: Each with their own source, tests, and docs
- `samples/`: Multi-language, multi-provider, and multimodal LLM examples
- `docs/`: Core documentation, troubleshooting, resources, diagrams, research notes, and whitepapers
- Root files: `README.md`, `CONTRIBUTING.md`, `LICENSE`, `package.json`, `requirements.txt`, `setup.py`, `startup.py`, etc.

---

## Key Technologies

Artifact Virtual leverages a broad spectrum of technologies:

- **Languages**: Python (3.11+), JavaScript/TypeScript (ES2022+), Rust, Solidity, Vyper, Cairo, Plutus, Haskell, Bash, YAML, TOML
- **Frontend**: React, Angular, Next.js, Electron, Astro
- **AI/ML**:
    - Ollama, Hugging Face, PyTorch, TensorFlow, ONNX
    - AutoRound for quantization (2-4 bit, INT8, QLoRA, ONNX/TensorRT export)
    - Model Context Protocol (MCP) for context-aware workflows
    - LangChain, DSPy, LlamaIndex
    - Workspace RAG for retrieval-augmented generation
- **Blockchain**:
    - Hardhat, Foundry, Truffle, Anchor, Cardano CLI, Solhint
    - Multi-chain: Ethereum, Solana, Polkadot, Cardano, Bitcoin, Cosmos
- **Tooling**:
    - ESLint, Prettier, Solhint, Mocha, Chai, Jest, Pytest, Rust test suites
    - Docker, Docker Compose, GitHub Actions, GitLab CI/CD
- **Dev Environment**:
    - VS Code DevContainer, automated setup scripts, remote/cloud workspace support

---

## Development Workflow

Artifact Virtual enforces a robust, reproducible, and collaborative workflow:

1. **Environment Setup**
    - Use `.startup` scripts or `startup.py` for bootstrapping
    - Activate Python venv, install dependencies via `requirements.txt`
    - Use Node.js/npm/yarn for frontend and blockchain tooling
    - Leverage DevContainer for consistency
2. **Project Development**
    - Develop smart contracts in `projects/bedrock/contracts/`
    - Implement protocol logic and dApp backends in Python, Rust, or TypeScript
    - Build frontend clients in React or Angular
    - Integrate AI models and quantization tools in `utils/` and `cookbooks/`
3. **Testing & Validation**
    - Write and run unit, integration, and end-to-end tests (Mocha/Chai, Jest, Pytest, Rust, etc.)
    - Use Hardhat, Foundry, and Anchor for blockchain contract testing
    - Validate AI models with synthetic and real datasets from `datasets/`
4. **Deployment**
    - Deploy contracts using Hardhat or chain-specific CLIs
    - Package and deploy frontend clients
    - Use Docker Compose for multi-service deployments
5. **CI/CD**
    - Automated pipelines for linting, testing, building, deploying
    - Versioning and changelog management
6. **Collaboration**
    - Use GitHub Issues, Discussions, and Projects
    - Follow contributing guidelines and code review best practices
    - Maintain clear commit messages and PR descriptions

---

## Documentation and Resources

Artifact Virtual prioritizes exhaustive documentation and knowledge sharing:

- **Root `README.md`**: Setup, usage, and architecture overview
- **Project READMEs**: E.g., `projects/bedrock/README.md`, `meteor-markdown-editor/README.md`
- **Guides**: Blockchain, AI, dApp, DevOps, CI/CD
- **API References**: Auto-generated/manual for all major modules
- **Troubleshooting**: `docs/troubleshooting.md`
- **Research Notes/Whitepapers**: `_backup/research/`, `docs/researchnotes/`
- **Architecture Diagrams**: `docs/diagrams/`
- **Component References**: See `frontend/starlight-docs/src/content/docs/guides/resources.mdx`
- **Changelogs**: Version history and upgrade notes
- **Resources**: `docs/resources.md` (official docs, learning, community, tools, research)

---

## Operational Responsibilities (Oracle & Manager Role)

- System monitoring, environment consistency, dependency management
- Feedback loops, onboarding, documentation maintenance
- Testing & validation, security & compliance

---

## Feedback Loop for Workspace Management

1. Monitor system health and dependencies
2. Apply updates and patches
3. Test for stability and compatibility
4. Document all changes and maintain changelogs
5. Support contributors and users
6. Plan enhancements and incorporate feedback

---

## AI Training and Knowledge Management

- Comprehensive coverage of all workspace components and workflows
- Structured data for AI parsing and knowledge extraction
- Change tracking and versioning
- Embedded best practices and coding standards
- Extensible as new technologies and projects are added

---

## Notes

- This file is the authoritative source of truth for Artifact Virtual workspace context
- Continuously updated to reflect upgrades, structure, and best practices
- All contributors and AI agents should reference this file first for workspace knowledge

---

*End of Artifact Virtual Workspace Context*

