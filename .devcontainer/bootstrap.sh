#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Starting bootstrap process..."

# Create Ollama models directory if it doesn't exist
MODELS_DIR="/workspace/.devcontainer/.ollama"
echo "Ensuring Ollama models directory exists: $MODELS_DIR"
mkdir -p "$MODELS_DIR"
echo "Ollama models directory ensured."

# Set Ollama environment variables for this script session
# These are also set globally via devcontainer.json, but setting here ensures they are available during this script's execution
export OLLAMA_HOST="0.0.0.0"
export OLLAMA_MODELS="$MODELS_DIR"
echo "Ollama environment variables set for bootstrap."

# Start Ollama server in the background
echo "Starting Ollama server in the background..."
# Ensure OLLAMA_MODELS is respected by the server process
OLLAMA_MODELS="$MODELS_DIR" ollama serve &
OLLAMA_PID=$!
echo "Ollama server started with PID $OLLAMA_PID."

# Wait a few seconds for the server to initialize
echo "Waiting for Ollama server to become responsive..."
sleep 5

# Check if Ollama server is running
if ! ps -p $OLLAMA_PID > /dev/null; then
  echo "Error: Ollama server failed to start. Check logs if available."
  # Attempt to show logs (path might vary or not exist)
  # cat /root/.ollama/logs/server.log || echo "Could not retrieve Ollama logs."
  exit 1
fi
echo "Ollama server appears to be running."

# Pull the specified model
MODEL_NAME="llama3.2:1b"
echo "Pulling Ollama model: $MODEL_NAME..."
# Use timeout in case pulling hangs indefinitely
timeout 600 ollama pull "$MODEL_NAME" || { echo "Error: Failed to pull model $MODEL_NAME within 10 minutes."; exit 1; }
echo "Model $MODEL_NAME pulled successfully."

# Run the original Python bootstrap script
echo "Running original Python bootstrap script..."
python /workspace/debugdiag/main.py bootstrap
echo "Original Python bootstrap script finished."

echo "Bootstrap process completed successfully."
# The background 'ollama serve &' process will continue running.
