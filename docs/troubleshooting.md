# Troubleshooting Guide

This guide addresses common issues that you might encounter when setting up and using ArtifactVirtual.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Environment Setup Problems](#environment-setup-problems)
3. [LLM Integration Challenges](#llm-integration-challenges)
4. [GPU Acceleration Issues](#gpu-acceleration-issues)
5. [DevContainer Problems](#devcontainer-problems)
6. [Common Error Messages](#common-error-messages)
7. [Performance Optimization](#performance-optimization)
8. [Diagnostic Tools](#diagnostic-tools)

## Installation Issues

### Python Version Compatibility

**Issue**: Setup fails with Python version errors.

**Solution**: 
- Ensure you're using Python 3.11 or later
- Check your Python version with:
  ```bash
  python --version
  ```
- If using multiple Python versions, specify the correct one:
  ```bash
  python3.11 startup.py  # Or whatever version you have installed
  ```

### Package Installation Failures

**Issue**: `pip install` commands fail during setup.

**Solution**:
- Update pip to the latest version:
  ```bash
  python -m pip install --upgrade pip
  ```
- On Windows, ensure Microsoft C++ Build Tools are installed
- For specific package errors, install them individually:
  ```bash
  pip install packagename --verbose
  ```
- If a package has complex dependencies, check if wheel files are available:
  ```bash
  pip install packagename --prefer-binary
  ```

### Git LFS Issues

**Issue**: Large files fail to download or Git LFS errors appear.

**Solution**:
- Verify Git LFS is installed:
  ```bash
  git lfs version
  ```
- Install Git LFS if needed:
  ```bash
  git lfs install
  ```
- Pull files explicitly:
  ```bash
  git lfs pull
  ```

## Environment Setup Problems

### Virtual Environment Activation Failures

**Issue**: Virtual environment won't activate or commands not found.

**Solution**:
- On Windows, check execution policy:
  ```powershell
  Get-ExecutionPolicy
  ```
  If restricted:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Recreate the environment if corrupted:
  ```bash
  rm -rf .venv
  python -m venv .venv
  ```

### Node.js Dependency Issues

**Issue**: Node.js related errors when setting up the documentation site.

**Solution**:
- Verify Node.js and npm versions:
  ```bash
  node --version  # Should be 20.x or higher
  npm --version
  ```
- Clear npm cache:
  ```bash
  npm cache clean --force
  ```
- Try installing with exact versions:
  ```bash
  cd frontend/celestial-chaos
  npm ci
  ```

## LLM Integration Challenges

### Ollama Installation Problems

**Issue**: Ollama fails to install or run.

**Solution**:
- Check system compatibility at [ollama.ai/download](https://ollama.ai/download)
- Verify network settings if model downloads fail
- For Linux, ensure proper permissions:
  ```bash
  sudo systemctl status ollama  # Check service status
  ```
- For Docker environments, ensure proper port forwarding:
  ```bash
  docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
  ```

### AutoRound Compatibility Issues

**Issue**: AutoRound fails during model quantization.

**Solution**:
- Verify PyTorch installation:
  ```bash
  python -c "import torch; print(torch.__version__)"
  ```
- For GPU support, check CUDA:
  ```bash
  python -c "import torch; print(torch.cuda.is_available())"
  ```
- For Intel hardware, install Intel extensions:
  ```bash
  pip install intel-extension-for-pytorch
  ```
- Try lower bit precision if memory issues occur:
  ```bash
  auto-round --model [model_name] --bits 2 --group_size 128
  ```

### MCP Server Connection Issues

**Issue**: MCP client can't connect to server.

**Solution**:
- Verify server is running on expected address/port
- Check network settings and firewalls
- For localhost issues, try different transports:
  ```bash
  mcp dev server.py --transport stdio
  ```

## GPU Acceleration Issues

### CUDA Detection Problems

**Issue**: CUDA-capable GPU not detected.

**Solution**:
- Verify CUDA installation:
  ```bash
  nvcc --version
  ```
- Check GPU status:
  ```bash
  nvidia-smi
  ```
- Ensure PyTorch was installed with CUDA support:
  ```bash
  python -c "import torch; print(torch.version.cuda)"
  ```
- Reinstall PyTorch with CUDA support if needed:
  ```bash
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
  ```

### Out of Memory Errors

**Issue**: GPU runs out of memory during model loading or inference.

**Solution**:
- Reduce batch size or sequence length
- Use model offloading techniques:
  ```python
  model = AutoModelForCausalLM.from_pretrained(
      "model_name",
      device_map="auto",
      torch_dtype=torch.float16
  )
  ```
- Enable gradient checkpointing for training
- For large models, use quantization:
  ```bash
  auto-round --model [model] --bits 4 --group_size 128 --low_gpu_mem_usage
  ```

## DevContainer Problems

### Container Build Failures

**Issue**: DevContainer fails to build.

**Solution**:
- Check Docker installation and permissions
- Increase Docker resource limits (memory, CPU)
- Check network connectivity for downloading dependencies
- Rebuild with clean cache:
  ```bash
  docker-compose build --no-cache
  ```

### PostgreSQL Database Issues

**Issue**: Postgres service doesn't start or isn't accessible.

**Solution**:
- Check container logs:
  ```bash
  docker-compose logs pg-artifact
  ```
- Verify connection parameters:
  - Host: localhost
  - Port: 5432 (default)
  - Database: artifact_db
  - Username: postgres
- Restart the service:
  ```bash
  docker-compose restart pg-artifact
  ```

## Common Error Messages

### "ModuleNotFoundError: No module named 'X'"

**Issue**: Python can't find a required module.

**Solution**:
- Verify virtual environment is activated
- Install the missing module:
  ```bash
  pip install X
  ```
- If the module is custom, check your PYTHONPATH:
  ```bash
  export PYTHONPATH=$PYTHONPATH:/path/to/project
  ```

### "CUDA error: device-side assert triggered"

**Issue**: CUDA operations failing with assertions.

**Solution**:
- Reset your GPU context:
  ```python
  torch.cuda.empty_cache()
  ```
- Check input dimensions and model compatibility
- Try CPU fallback:
  ```python
  model = model.to('cpu')
  ```

### "RuntimeError: CUDA out of memory"

**Issue**: Not enough GPU memory.

**Solution**:
- Use gradient accumulation for training
- Reduce batch size
- Enable memory-efficient attention:
  ```python
  model = AutoModelForCausalLM.from_pretrained(
      "model_name",
      torch_dtype=torch.float16,
      attn_implementation="flash_attention_2"
  )
  ```

## Performance Optimization

### Slow Model Inference

**Issue**: Model inference is slower than expected.

**Solution**:
- Use PyTorch 2.0+ with torch.compile():
  ```python
  model = torch.compile(model)
  ```
- Enable Flash Attention if supported:
  ```python
  model = AutoModelForCausalLM.from_pretrained(
      "model_name",
      use_flash_attention_2=True
  )
  ```
- Use quantized models
- Optimize prompt length and batch processing

### High CPU/Memory Usage

**Issue**: System becomes sluggish during operations.

**Solution**:
- Monitor resources with debugdiag:
  ```bash
  python utils/debugdiag/main.py project status
  ```
- Check for memory leaks by monitoring over time
- Limit process resources:
  ```bash
  # Linux/macOS
  ulimit -m 8G  # Limit memory to 8GB
  
  # Windows PowerShell
  Start-Process -WindowStyle Minimized python -ArgumentList "your_script.py"
  ```

## Diagnostic Tools

### Using debugdiag for Troubleshooting

The built-in diagnostic tool can help identify issues:

```bash
# Check system status
python utils/debugdiag/main.py project status

# View logs for errors
python utils/debugdiag/main.py logs show --lines 50

# Test network connectivity
python utils/debugdiag/main.py diagnose ping --host github.com
```

### Getting Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/amuzetnoM/artifactvirtual/issues) to see if others have encountered the same problem
2. Run the diagnostic tool and include the output in your support request:
   ```bash
   python utils/debugdiag/main.py project status > system_info.txt
   ```
3. Include relevant logs:
   ```bash
   python utils/debugdiag/main.py logs show --lines 100 > logs.txt
   ```

---

## Troubleshooting: Workspace RAG, Web Chat, and Voice/Multimodal

### Web Chat Not Starting
- Ensure all dependencies are installed:
  ```powershell
  python -m pip install -r requirements.txt
  ```
- Check for missing packages: `gradio`, `sentence-transformers`, and any TTS/STT dependencies
- Run: `python web_chat_server.py` and check for errors in the terminal

### TTS/STT Not Working or Not Detected
- Ensure `utils_tts.py` and `utils_stt.py` are present in the workspace root
- **Supported TTS Providers:**
  - [Coqui TTS](https://github.com/coqui-ai/TTS)
  - [HuggingFace Transformers TTS](https://huggingface.co/docs/transformers/main/en/task_summary#text-to-speech)
  - [TorchAudio TTS](https://pytorch.org/audio/stable/index.html)
  - [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech)
  - Add your own: Implement a compatible `TTSProcessor` in `utils_tts.py`
- **Supported STT Providers:**
  - [OpenAI Whisper/WhisperX](https://github.com/openai/whisper)
  - [HuggingFace Transformers STT](https://huggingface.co/docs/transformers/main/en/task_summary#automatic-speech-recognition)
  - [Vosk](https://alphacephei.com/vosk/)
  - Add your own: Implement a compatible `STTProcessor` in `utils_stt.py`
- Install required packages for your chosen backend (see code comments in `utils_tts.py` and `utils_stt.py`)
- Check logs for initialization errors or missing model files
- To switch providers, update the config in `rag_config.py` or modify the processor instantiation in the utility files
- For custom models, ensure the processor class exposes a common interface: `synthesize(text)` for TTS, `transcribe(audio_file)` for STT

### RAG Indexing Issues
- Use `--refresh` with the CLI: `python workspace_rag.py --refresh`
- Ensure workspace path is correct
- Check for permission issues on files/folders

### Multimodal/Tool Use
- For image/audio input, see [samples/](../samples/) and [cookbooks/](../cookbooks/)
- For tool invocation, use `/tool [tool_name] [args]` in chat

### Diagnostics
- Use the diagnostic CLI:
  ```powershell
  python utils/debugdiag/main.py project status
  ```
- Check logs: `python utils/debugdiag/main.py logs show --lines 100`

### Extending TTS/STT
- To add a new TTS or STT provider:
  1. Implement a new processor class in `utils_tts.py` or `utils_stt.py` with the required interface
  2. Add provider selection logic (e.g., via config or environment variable)
  3. Document any new dependencies in `requirements.txt`
  4. Test with both CLI and web chat
- For advanced integration, see the comments and examples in the utility files

For more help, see the [main README](../README.md), [resources](resources.md), or open an issue on GitHub.

---

For additional resources and references, see the [Resources](resources.md) guide.