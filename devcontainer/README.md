# ArtifactVirtual DevContainer

This directory contains the VS Code DevContainer configuration for ArtifactVirtual, providing a consistent, reproducible development environment with AI functionality and CUDA support.

## Overview

The ArtifactVirtual DevContainer offers:

- Pre-configured Python environment with all dependencies
- CUDA support for GPU acceleration
- Integrated PostgreSQL database for persistent storage
- Automated initialization via the debugdiag bootstrap system
- Extensions and tools for AI development

## Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Using the DevContainer

1. Clone the ArtifactVirtual repository
2. Open the folder in VS Code
3. When prompted, click "Reopen in Container"
4. Wait for the container to build and initialize

The container will automatically:
- Install all dependencies
- Initialize the database
- Run bootstrap scripts
- Set up the debugging and diagnostic tools

## Container Features

### Python Environment

- Python 3.11 with virtual environment
- PyTorch with CUDA support
- Transformers, LangChain, and other ML libraries
- AutoRound for model quantization
- Model Context Protocol for LLM interactions

### Database

- PostgreSQL 15 service (`pg-artifact`)
- Auto-initialized on container startup
- Default database: `artifact_db`
- Connection details:
  - Host: `localhost`
  - Port: `5432`
  - User: `postgres`
  - Password: See `.env` file

### Development Tools

- VS Code extensions for Python, Docker, and AI development
- Jupyter Notebook integration
- Git with GitHub integration
- CUDA tools for GPU optimization

## Configuration Files

### devcontainer.json

Defines the VS Code DevContainer configuration:
- Base image and Docker Compose setup
- VS Code settings and extensions
- Mount points and environment variables
- Post-creation commands

### Dockerfile

Extends the base image with:
- System dependencies
- Python packages
- Development tools
- Configuration files

### docker-compose.yml

Orchestrates services:
- Main development container
- PostgreSQL database
- Volume mounts for persistence

## Bootstrap Process

On container creation:

1. The `onCreateCommand` in devcontainer.json runs `python debugdiag/main.py bootstrap`
2. The bootstrap script checks the system and installs dependencies
3. PostgreSQL is initialized with the default database
4. The environment is prepared for development

## Customization

### Adding New Dependencies

To add Python packages:
1. Add the package to `requirements.txt`
2. Rebuild the container or run `pip install -r requirements.txt`

### Environment Variables

Environment variables can be set in:
- `.env` file (not committed to Git)
- `devcontainer.json` under `containerEnv`
- Docker Compose environment files

### GPU Configuration

For GPU support:
- Ensure Docker Desktop has GPU access enabled
- Check CUDA compatibility with `nvidia-smi` inside the container
- Adjust memory limits in Docker settings if needed

## Troubleshooting

### Container Fails to Build

- Check Docker service is running
- Ensure sufficient disk space
- Verify Docker has permission to access the filesystem

### GPU Not Detected

- Verify NVIDIA drivers are installed and up-to-date
- Check Docker GPU runtime configuration
- Run `python -c "import torch; print(torch.cuda.is_available())"` to test

### Database Connection Issues

- Check PostgreSQL service is running: `docker-compose ps`
- Verify connection details in application code
- Ensure ports are not in use by other services

## License

MIT © ArtifactVirtual (https://github.com/amuzetnoM/artifactvirtual)
