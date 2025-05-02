FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    cmake \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir llama-cpp-python
