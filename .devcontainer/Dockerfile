# Use CUDA-ready base or fallback to base if unavailable
ARG VARIANT="focal"
FROM buildpack-deps:${VARIANT}-curl

LABEL dev.containers.features="common"
ENV DEBIAN_FRONTEND=noninteractive

# System Essentials
RUN apt-get update && apt-get install -y \
    build-essential \
    software-properties-common \
    curl wget git unzip nano \
    libpq-dev postgresql-client \
    ffmpeg sox libsndfile1 \
    python3 python3-pip python3-venv python3-dev \
    nodejs npm \
    && apt-get clean

# Create working directory
WORKDIR /workspace

# First-run notice
COPY first-run-notice.txt /usr/local/etc/vscode-dev-containers/

# Upgrade Python tooling
RUN pip3 install --upgrade pip setuptools wheel

# Install Python AI stack
RUN pip3 install \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    transformers \
    sentence-transformers \
    langchain \
    chromadb \
    psycopg2-binary \
    fastapi \
    uvicorn[standard] \
    rich \
    pydantic \
    jupyterlab

# Optional: Node tools for frontend or devtools
RUN npm install -g serve yarn

# Optional: Whisper alternative or TTS
RUN pip3 install faster-whisper TTS

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Make bootstrap script executable
# Note: Ensure bootstrap.sh exists in .devcontainer before building
RUN chmod +x /workspace/.devcontainer/bootstrap.sh

# CUDA fallback environment check (set during runtime)
ENV CUDA_VISIBLE_DEVICES=0

CMD ["bash"] VARIANT="focal"
FROM buildpack-deps:${VARIANT}-curl

LABEL dev.containers.features="common"

COPY first-run-notice.txt /tmp/scripts/

# Move first run notice to right spot
RUN mkdir -p "/usr/local/etc/vscode-dev-containers/" \
    && mv -f /tmp/scripts/first-run-notice.txt /usr/local/etc/vscode-dev-containers/

# Remove scripts now that we're done with them
RUN rm -rf /tmp/scripts
