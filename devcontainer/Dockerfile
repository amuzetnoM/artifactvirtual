FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Use a base image provided by dev container features for better compatibility
# The actual base image will be determined by the features used (e.g., Python feature)
# This Dockerfile now primarily handles OS packages and specific tools not covered by features.

# ARG VARIANT="focal" # Base image selection is now handled by features
# FROM buildpack-deps:${VARIANT}-curl # Base image selection is now handled by features

# Install OS-level dependencies not covered by features
# Features like Python, Node will handle their own core dependencies.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
    # For PostgreSQL client and libraries
    libpq-dev \
    postgresql-client \
    # For audio/video processing if needed by Python packages
    ffmpeg \
    sox \
    libsndfile1 \
    # Other utilities
    git \
    curl \
    wget \
    unzip \
    nano \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python, Node, Docker-in-Docker, common utils are installed via features in devcontainer.json

# Create working directory (usually /workspace or /workspaces/...) - Features might set this too.
# WORKDIR /workspace # Let devcontainer.json handle workspaceFolder

# Copy first-run notice if still desired
COPY first-run-notice.txt /usr/local/etc/vscode-dev-containers/

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Ollama models directory setup and server start will be handled by bootstrap.sh or manually

# Note: pip install -r requirements.txt is now handled by postCreateCommand in devcontainer.json

# Note: CMD is not needed as docker-compose uses 'sleep infinity'
