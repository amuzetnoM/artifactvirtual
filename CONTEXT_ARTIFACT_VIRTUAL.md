# Artifact Virtual Workspace Context

## Overview

Artifact Virtual is a sovereign, modular, open-source platform purpose-built for AI, blockchain, and Web3 development. It empowers developers, researchers, and creators to build autonomous, trustless, and innovative digital systems with a privacy-first design and decentralized infrastructure. The workspace is designed to be exhaustive, serving as a comprehensive knowledge base and operational guide for all contributors and AI agents interacting with the Artifact Virtual ecosystem.

---

## Workspace Structure

The workspace is organized to maximize modularity, discoverability, and extensibility. Each directory and file serves a specific function in the development, deployment, and maintenance lifecycle.

- `.startup/`: Bootstrap scripts, environment setup utilities, and onboarding guides. Includes shell scripts, Python initializers, and configuration templates for rapid environment provisioning.
- `devcontainer/`: VS Code DevContainer configuration, including Dockerfiles, extension recommendations, and settings for reproducible development environments.
- `datasets/`: Curated knowledge foundations, open datasets, synthetic data generators, and data versioning utilities. Supports AI/ML training, benchmarking, and reproducibility.
- `cookbooks/`: Patterns, recipes, and best practices for development. Contains code snippets, workflow templates, and automation scripts for common tasks in AI, blockchain, and full-stack development.
- `utils/`: Core utilities, including:
    - AI model quantization tools (e.g., AutoRound)
    - Debugging and profiling utilities
    - Model Context Protocol (MCP) implementations
    - Data transformation and validation scripts
- `projects/`: Main applications and pipelines, including:
    - `bedrock/`: Comprehensive blockchain development environment supporting multiple chains and languages. Contains smart contracts, protocol implementations, and integration tests.
    - Other projects: `meteor-markdown-editor`, `oracle-ai-pipeline`, `simulation-manager`, `temporal-calendar`, each with their own substructure for source, tests, and documentation.
- `samples/`: Provider demos and reference implementations showcasing integrations with various AI, blockchain, and Web3 services.
- `docs/`: Extensive documentation, including:
    - Setup and usage guides
    - API references
    - Troubleshooting and FAQ
    - Research notes and whitepapers
    - Architecture diagrams and design documents
- Root files:
    - `README.md`: High-level overview and quickstart instructions
    - `package.json`, `setup.py`, `requirements.txt`: Dependency management for JavaScript/TypeScript and Python
    - `startup.py`: Unified entry point for environment setup
    - License and contributing guidelines

---

## Key Technologies

Artifact Virtual leverages a broad spectrum of technologies to support its modular, cross-domain architecture:

- **Languages**: Python (3.11+), JavaScript/TypeScript (ES2022+), Rust, Solidity, Vyper, Cairo, Plutus, Haskell, Bitcoin Script, Bash, YAML, TOML.
- **Frontend**:
    - React (root-level UI components, dashboards, and admin panels)
    - Angular (Bedrock IDE frontend, dApp scaffolding)
    - Next.js and Electron (for cross-platform desktop clients)
- **AI/ML**:
    - Integration with Ollama LLMs and other open-source models
    - AutoRound for model quantization and optimization
    - Model Context Protocol (MCP) for context-aware AI workflows
    - Hugging Face Transformers, PyTorch, TensorFlow, ONNX
- **Blockchain**:
    - Hardhat for Ethereum development
    - Multi-chain support: Solana (Anchor), Polkadot (Substrate), Cardano (Plutus), Bitcoin (Script), Cosmos (CosmWasm)
    - Foundry, Truffle, Anchor, Cardano CLI, Solhint
- **Tooling**:
    - ESLint, Prettier, Solhint for code quality
    - Mocha, Chai, Karma, Jest, Pytest, Rust test suites for testing
    - Docker, Docker Compose for containerization
    - GitHub Actions, GitLab CI/CD for automation
- **Dev Environment**:
    - VS Code DevContainer with pre-configured extensions and dependencies
    - Automated setup scripts for cross-platform compatibility (Linux, macOS, Windows)
    - Remote development and cloud workspace support

---

## Development Workflow

Artifact Virtual enforces a robust, reproducible, and collaborative workflow:

1. **Environment Setup**
     - Use `.startup` scripts or `startup.py` for initial environment bootstrapping.
     - Activate Python virtual environment and install dependencies via `requirements.txt`.
     - Use Node.js and npm/yarn for frontend and blockchain tooling.
     - Leverage DevContainer for consistent development environments.

2. **Project Development**
     - Develop smart contracts in `projects/bedrock/contracts/` using Solidity, Vyper, Cairo, Plutus, or Haskell.
     - Implement protocol logic and dApp backends in Python, Rust, or TypeScript.
     - Build frontend clients in React or Angular under `projects/bedrock/clients/` or `bedrock-ide-angular`.
     - Integrate AI models and quantization tools in `utils/` and `cookbooks/`.

3. **Testing & Validation**
     - Write and run unit, integration, and end-to-end tests using Mocha/Chai, Jest, Pytest, or Rust test suites.
     - Use Hardhat, Foundry, and Anchor for blockchain contract testing.
     - Validate AI models with synthetic and real datasets from `datasets/`.

4. **Deployment**
     - Deploy contracts using Hardhat scripts or chain-specific CLIs.
     - Package and deploy frontend clients to cloud or desktop targets.
     - Use Docker Compose for orchestrating multi-service deployments.

5. **Continuous Integration/Continuous Deployment (CI/CD)**
     - Automated pipelines for linting, testing, building, and deploying.
     - Versioning and changelog management for all major components.

6. **Collaboration**
     - Use GitHub Issues, Discussions, and Projects for task tracking.
     - Follow contributing guidelines and code review best practices.
     - Maintain clear commit messages and PR descriptions.

---

## Documentation and Resources

Artifact Virtual prioritizes exhaustive documentation and knowledge sharing:

- **Root-level `README.md`**: Comprehensive setup, usage, and architecture overview.
- **Project-specific READMEs**: Detailed instructions for each subproject (e.g., `projects/bedrock/README.md`, `bedrock-ide-angular/README.md`).
- **Guides**:
    - Blockchain development (multi-chain, contract patterns, security)
    - AI integration (model training, quantization, deployment)
    - Full-stack dApp creation (frontend, backend, smart contracts)
    - DevOps and CI/CD setup
- **API References**: Auto-generated and manually curated API docs for all major modules.
- **Troubleshooting**: Common issues, error codes, and resolution steps under `docs/troubleshooting.md`.
- **Research Notes and Whitepapers**: In `_backup/research/` and `docs/researchnotes/`, covering protocol design, AI safety, cryptography, and decentralized governance.
- **Architecture Diagrams**: Visual representations of system components, data flows, and integration points.
- **Changelogs**: Version history and upgrade notes for all major releases.

---

## Operational Responsibilities (Oracle & Manager Role)

The Oracle & Manager role is critical for maintaining workspace integrity and operational excellence:

- **System Monitoring**: Track core services, dependency health, and resource utilization.
- **Environment Consistency**: Enforce reproducible setups via DevContainer and automated scripts.
- **Dependency Management**: Monitor and update AI models, blockchain tools, and frontend libraries.
- **Feedback Loops**: Collect, triage, and address issues from contributors and users.
- **Onboarding**: Guide new developers through setup, best practices, and project conventions.
- **Documentation Maintenance**: Ensure all guides, READMEs, and references are current and accurate.
- **Testing & Validation**: Coordinate and oversee testing of new features, integrations, and upgrades.
- **Security & Compliance**: Enforce security best practices, manage secrets, and ensure compliance with open-source licenses.

---

## Feedback Loop for Workspace Management

Artifact Virtual employs a continuous feedback loop to ensure quality, stability, and innovation:

1. **Monitor**: Regularly check system health, dependency versions, and service statuses using automated tools and manual audits.
2. **Update**: Apply security patches, upgrade AI models, refresh blockchain tooling, and update documentation as needed.
3. **Test**: Run automated and manual tests to verify stability, performance, and compatibility across all supported platforms.
4. **Document**: Record all changes, update guides, maintain changelogs, and communicate updates to the team.
5. **Support**: Address issues, provide troubleshooting, and assist developers via chat, forums, and documentation.
6. **Plan**: Propose enhancements, prioritize roadmap items, and incorporate feedback from users and contributors.

---

## AI Training and Knowledge Management

This context file is designed to serve as a primary source of truth for both human contributors and AI agents:

- **Comprehensive Coverage**: All workspace components, workflows, and operational procedures are documented for AI training and inference.
- **Structured Data**: Use of consistent headings, lists, and code blocks to facilitate parsing and knowledge extraction by AI models.
- **Change Tracking**: All updates are logged, with clear versioning and rationale for changes, enabling AI agents to reason about workspace evolution.
- **Best Practices**: Embeds coding standards, security guidelines, and architectural patterns to guide AI-generated code and recommendations.
- **Extensibility**: Designed to be updated as new technologies, workflows, and projects are added to the workspace.

---

## Notes

- This context file is the authoritative, exhaustive source of truth for the Artifact Virtual workspace.
- It is continuously updated to reflect new upgrades, structural changes, operational procedures, and best practices.
- The workspace oracle and manager are responsible for maintaining and leveraging this context to ensure Artifact Virtual remains functional, efficient, and innovative.
- All contributors and AI agents should reference this file as the first point of contact for workspace knowledge and operational guidance.

---

*End of Artifact Virtual Workspace Context*

