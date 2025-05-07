# Artifact Virtual System Mapping

> **Scope:**
> This mapping covers the entire Artifact Virtual workspace, focusing on backend functions, API endpoints, startpoints, variables, UI triggers, and integration points. 
> **Ignored:**
> Cache, node_modules, pycache, venv, static assets, and other non-source or generated files.

---

## Table of Contents

1. [Workspace Structure](#workspace-structure)
2. [Backend Entry Points & Services](#backend-entry-points--services)
3. [API Endpoints & Routes](#api-endpoints--routes)
4. [Backend Functions & Variables](#backend-functions--variables)
5. [Frontend/UI Triggers & Integration](#frontendui-triggers--integration)
6. [Utilities & CLI Tools](#utilities--cli-tools)
7. [Data Models & Config](#data-models--config)
8. [Integration Points](#integration-points)
9. [Buttons, Variables, and UI Triggers (Backend & Frontend)](#buttons-variables-and-ui-triggers-backend--frontend)
10. [Enhancement Opportunities](#enhancement-opportunities)

---

## 1. Workspace Structure

```
/artifactvirtual/
├── AVA.py, AVA.ipynb
├── web_chat_server.py
├── workspace_rag.py
├── utils_tts.py, utils_stt.py
├── rag_config.py
├── startup.py, setup.py
├── frontend/
│   ├── astro-blog/
│   ├── dashboard32/
│   └── starlight-docs/
├── chat-component/
│   └── src/chat-widget/
├── projects/
│   ├── bedrock/
│   ├── cybertron-flow/            # Visual workflow automation platform
│   ├── meteor-markdown-editor/
│   ├── simulation-manager/
│   └── ...
├── utils/
│   ├── auto-round/
│   ├── configsystem/
│   ├── debugdiag/
│   ├── dspy/
│   └── modelcontextprotocol/
└── ...
```

---

## 2. Backend Entry Points & Services

| File                  | Entry Point(s) / Start Command                | Description                                 |
|-----------------------|-----------------------------------------------|---------------------------------------------|
| `web_chat_server.py`  | `python web_chat_server.py`                   | FastAPI + Gradio chat server                |
| `workspace_rag.py`    | CLI: `python workspace_rag.py --query ...`    | Modular RAG backend, CLI for RAG queries    |
| `utils_tts.py`        | Class: `TTSProcessor`                         | Text-to-speech utility                      |
| `utils_stt.py`        | Class: `STTProcessor`                         | Speech-to-text utility                      |
| `startup.py`          | CLI: `python startup.py`                      | Workspace bootstrap/init                    |
| `utils/debugdiag/`    | CLI: `python utils/debugdiag/main.py ...`     | Diagnostics, logs, project status, etc.     |

---

## 3. API Endpoints & Routes

### FastAPI (web_chat_server.py)

| Route         | Method | Handler/Function   | Description                        |
|---------------|--------|--------------------|------------------------------------|
| `/`           | GET    | `root`             | Serves main chat HTML page         |
| `/gradio/`    | GET    | Gradio mount       | Gradio chat UI (iframe endpoint)   |
| (Gradio UI)   | POST   | `handle_chat`      | Handles chat messages (backend)    |

#### Gradio Chatbot
- **Input:** User message (via textbox or submit)
- **Output:** Chatbot history (list of (message, response) tuples)
- **Buttons:** "Clear" (resets chat), "Submit" (sends message)

---

## 4. Backend Functions & Variables

### workspace_rag.py

- **Class:** `WorkspaceRAG`
  - **Constructor Args:** `workspace_path`, `embedding_model`, `llm_model`, `cache_dir`, `config`
  - **Key Methods:**
    - `_init_llm()`: Initializes LLM (Ollama)
    - `_init_vector_store()`: Loads/creates vector DB
    - `_load_workspace_documents()`: Loads/splits workspace files
    - `_init_rag_chain()`: Sets up retrieval-augmented generation chain
    - `query(query: str)`: Main RAG query interface
    - `query_with_speech(audio_file: str)`: STT+RAG+TTS pipeline
    - `refresh_vector_store()`: Rebuilds vector DB
    - `add_document(document_path: str)`: Adds doc to vector DB
    - `register_tool(name, func, ...)`: Register custom tool
    - `list_tools()`, `execute_tool(name, **kwargs)`: Tool registry

- **Variables:**
  - `self.llm_model`: Model name (from env/config)
  - `self.vector_store`: FAISS vector DB
  - `self.embeddings`: Embedding model
  - `self.rag_chain`: LangChain pipeline
  - `self.tts_processor`, `self.stt_processor`: Optional TTS/STT

### web_chat_server.py

- **Globals:**
  - `rag`: Instance of `WorkspaceRAG`
  - `llm_model`: Model name (from env or default)
  - `workspace_path`: Path to workspace
- **Functions:**
  - `handle_chat(message, history)`: Main chat handler (Gradio)
  - `calculate_tool(expression)`: Example tool (math eval)
  - `create_gradio_app()`: Sets up Gradio UI

---

## 5. Frontend/UI Triggers & Integration

### Chat Component (Angular, chat-component/src/chat-widget/)

- **UI Elements:**
  - Chat button (opens chat)
  - Chat container (iframe to `/gradio/`)
  - Header (title, minimize, close)
  - Textbox (user input)
  - Submit button (sends message)
  - Clear button (resets chat)
- **Variables/Props:**
  - `chatServerUrl`, `title`, `width`, `height`, `position`, `buttonColor`, `buttonIconColor`
- **Events:**
  - `chatOpened`, `chatClosed` (emit on open/close)
  - `onMinimize()`, `toggleChat()`, `startDrag()`
- **Integration:**
  - All chat is proxied via iframe to backend Gradio UI

---

## 6. Utilities & CLI Tools

| Tool/Script                  | Entry/Command Example                        | Description                        |
|------------------------------|----------------------------------------------|------------------------------------|
| `utils/debugdiag/main.py`    | `python ... project status`                  | System diagnostics, logs, etc.     |
| `utils_tts.py`               | Class: `TTSProcessor`                        | TTS (HuggingFace, Torch, Coqui)    |
| `utils_stt.py`               | Class: `STTProcessor`                        | STT (HuggingFace, WhisperX, etc.)  |
| `utils/auto-round/`          | Various scripts                              | Model rounding, quantization       |
| `utils/modelcontextprotocol/`| MCP server, protocol tools                   | Model context protocol utilities   |
| `projects/cybertron-flow/`   | Angular app: `ng serve`                      | Visual workflow automation platform|

---

## 7. Data Models & Config

### rag_config.py

- **RAG_CONFIG:** Dict with:
  - `chunk_size`, `chunk_overlap`
  - `retriever_k`
  - `exclude_dirs`, `exclude_extensions`
  - `main_prompt_template`
  - `tts_config`, `stt_config`

### workspace_rag.py

- **Document:** LangChain Document objects (with metadata)
- **Tool Registry:** Dict of tool name → function, description, params

---

## 8. Integration Points

- **Ollama:** Local LLM inference (model name from config/env)
- **Gradio:** Chat UI, Python backend
- **Angular Chat Widget:** Embeds Gradio UI via iframe
- **TTS/STT:** HuggingFace, Torch, Coqui, WhisperX, etc.
- **CLI Tools:** Diagnostics, project bootstrap, config, etc.
- **Cybertron Flow:** Workflow automation with external service integrations

---

## 9. Buttons, Variables, and UI Triggers (Backend & Frontend)

- **Backend:**
  - Gradio: "Submit" (calls `handle_chat`), "Clear" (resets history)
  - CLI: Various commands for diagnostics, RAG queries, etc.
- **Frontend:**
  - Chat widget: Open, close, minimize, drag, send, clear
  - All user input is routed to backend via iframe

---

## 10. Enhancement Opportunities

- **Add OpenAPI docs for all FastAPI endpoints**
- **Auto-generate function/endpoint mapping from codebase**
- **Expose backend tool registry to frontend for dynamic tool UIs**
- **Add more granular logging and tracing for all user actions**
- **Document all CLI commands and their arguments in a central place**

---

## Projects

### Cybertron Flow

**Description:** A powerful node-based workflow automation platform built with Angular that enables users to visually design and execute complex workflows by connecting different types of nodes.

**Architecture:**
- **Frontend:** Angular 16+ with TypeScript
- **Key Libraries:** ngx-graph (visualization), FontAwesome (icons), VM2 (secure sandboxing)
- **State Management:** RxJS Observables/Subjects
- **Core Components:**
  - **CybertronNode Models:** Strongly typed interfaces for different node types
  - **OrchestratorService:** Handles workflow execution and state management
  - **Node Settings Components:** Type-specific configuration UI
  - **Visual Designer:** Graph-based canvas for workflow design

**Node Types:**
- **Chat Agent:** Integrates with LLMs (GPT-4, Claude, local models)
- **Integration:** Connects to external APIs (REST, GraphQL, Webhooks)
- **Scheduler:** Executes workflows on schedules (cron, interval, one-time)
- **Task:** Runs custom JavaScript code in a secure VM2 sandbox
- **Report:** Generates reports in multiple formats and destinations
- **Pinned Input:** Stores and reuses static input values

**Features:**
- Visual workflow designer with drag-and-drop interface
- Secure script execution in sandboxed environments
- Real-time workflow execution with state tracking
- Import/export functionality for workflow sharing
- Role-based permissions model
- Responsive design with modern UI/UX

**Integration Points:**
- Can connect to external APIs and services
- VM2 secure sandbox for JavaScript execution
- Potential integration with AVA and other Artifact Virtual components

**Entry Point:** Angular application served via `ng serve`

---

# Summary

This mapping provides a meticulous, end-to-end view of the Artifact Virtual workspace, covering every backend function, route, endpoint, variable, and UI trigger, and cross-linking backend/frontend integration points. It is designed for extensibility and can be updated as the workspace evolves.
