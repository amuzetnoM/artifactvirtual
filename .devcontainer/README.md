Virtual DevCon

Overview
The Future-Ready Developer Environment
A GPU/CPU-adaptive, modular, preconfigured container for building AI agents, voice interfaces, LangChain RAG apps, visual reasoning pipelines, and more — powered by Python, Node.js, and CUDA.

Features
- Zero-Config Setup: Automatic environment provisioning using `.devcontainer/bootstrap`.
- LangChain + Vector DBs: Built-in LangChain, ChromaDB, FAISS, Transformers, Sentence Transformers.
- Speech & Voice Ready: Whisper-compatible STT, `faster-whisper`, NVIDIA Riva-ready, and TTS.
- PostgreSQL Integration: Autocreates local `artifact_db` if not present, with secure fallback.
- CUDA Fallback: CPU-first build with CUDA toggle via DevContainer features.
- Multi-Language Stack: Python 3.11.9, Node.js 20+, PostgreSQL client, Torch, FastAPI, Pydantic.
- Integrated DevTools: VS Code extensions, port forwarding (Jupyter, Gradio, Streamlit), GitHub CLI.
Folder Structure

.devcontainer/
├── devcontainer.json   # Core configuration
├── Dockerfile          # Environment provisioning
└── bootstrap           # On-create initialization (installs, DB setup)


Getting Started
1. Open in VS Code with Dev Containers
   - Ensure Docker Desktop is running (or Codespaces)
   - Requires VS Code with Dev Containers extension

2. Container Auto-Setup
   - Installs dependencies
   - Initializes DB if needed
   - Caches models
   - Prints logs

3. Run assistant:
   `python3 assistant.py`
Ports
7860 - Gradio UI
8888 - Jupyter Lab
5000 - API Server
8501 - Streamlit
   
Requirements
- Docker or Codespaces
- GitHub DevContainer support
- Optional GPU for CUDA inference
Environment Variables
POSTGRES_HOST=postgres
POSTGRES_DB=artifact_db
POSTGRES_USER=artifact
POSTGRES_PASSWORD=virtual
PORT=5000
Roadmap
- Voice-activated command agents
- Real-time file and project visualizers
- Deploy-ready HuggingFace endpoints
- LangGraph / CrewAI multi-agent support
License
MIT © ArtifactVirtual (https://github.com/amuzetnoM/artifactvirtual)
