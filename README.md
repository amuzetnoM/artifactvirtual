# ![Artifact Development Engine](https://img.shields.io/badge/ARTIFACT%20DEVELOPMENT%20ENGINE-black?style=flat&labelColor=black&color=white)

```mermaid
flowchart TD
    A[Root Project]
    subgraph Core
        B1[requirements.txt]
        B2[setup.py]
        B3[startup.py]
        B4[README.md]
    end
    subgraph Oracles System
        C1[oracles/]
        C2[oracle_cli.py]
        C3[requirements.txt]
        C4[guide]
        C5[plugins/]
    end
    subgraph Datasets
        D1[datasets/]
        D2[core_facts.json]
        D3[reasoning_patterns.json]
        D4[language_primitives.json]
        D5[temporal_events.json]
        D6[custom_annotations.json]
    end
    subgraph Cookbooks & Samples
        E1[cookbooks/]
        E2[samples/]
        E3[python/]
        E4[js/]
        E5[curl/]
    end
    subgraph Utils
        F1[utils/]
        F2[auto-round/]
        F3[debugdiag/]
        F4[dspy/]
        F5[modelcontextprotocol/]
    end
    subgraph Frontend
        G1[frontend/]
        G2[celestial-chaos/]
        G3[av-next/]
    end
    subgraph TemporalCalendar
        H1[temporalcalendar/]
        H2[main.py]
        H3[cli/]
    end
    A -->|Core| Core
    A -->|Oracles| Oracles System
    A -->|Datasets| Datasets
    A -->|Cookbooks & Samples| Cookbooks & Samples
    A -->|Utils| Utils
    A -->|Frontend| Frontend
    A -->|TemporalCalendar| TemporalCalendar
    Oracles System --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    Datasets --> D1
    D1 --> D2
    D1 --> D3
    D1 --> D4
    D1 --> D5
    D1 --> D6
    Cookbooks & Samples --> E1
    Cookbooks & Samples --> E2
    E1 --> E3
    E1 --> E4
    E2 --> E5
    Utils --> F1
    F1 --> F2
    F1 --> F3
    F1 --> F4
    F1 --> F5
    Frontend --> G1
    G1 --> G2
    G1 --> G3
    TemporalCalendar --> H1
    H1 --> H2
    H1 --> H3
```


ADE is a portable, self-initializing AI workspace for research, development, and creative exploration. It now includes a powerful multimodal LLM playground (the Oracles System) for advanced model orchestration, chaining, and multimodal workflows.

---

### Quickstart

1. **Clone the repository**
2. **Run the bootstrap:**
   ```bash
   python startup.py
   ```
   This will:
   - Check your system (Python, CUDA, PostgreSQL, Ollama, etc.)
   - Install all dependencies
   - Download and verify core Ollama models (phi4-mini, gemma3, llava)
   - Set up AutoRound, LangChain, LangGraph, DSPy, and more
   - Welcome you with an interactive prompt

3. **Oracles CLI (Multimodal LLM Playground):**
   ```bash
   cd oracles
   pip install -r requirements.txt
   python oracle_cli.py
   ```
   - Chat with phi4-mini, gemma3, or llava
   - Chain models (LangChain, LangGraph, DSPy)
   - Run multimodal (image+text) pipelines
   - Use plugins for extensibility
   - Enjoy robust error handling and dependency checks

---

### Features
- **Self-initializing:** Automated setup, dependency management, and service orchestration
- **Oracles System:** Unified CLI for LLMs (phi4-mini, gemma3, llava) with chaining, multimodal, and plugin support
- **Extensible:** Plugin system for new models/workflows (drop Python files in oracles/plugins)
- **Robust error handling:** Informative errors, tracebacks, and dependency auto-install
- **AutoRound:** Advanced quantization for LLMs/VLMs
- **LangChain, LangGraph, DSPy:** For complex AI pipelines and workflows
- **Datasets:** Curated knowledge and reasoning datasets in /datasets
- **TemporalCalendar:** Advanced time reasoning demo

---

### Documentation
- [oracles/guide](oracles/guide): Full details on using the Oracles CLI, chaining, multimodal, plugins, and advanced workflows
- [cookbooks/](cookbooks/): Example notebooks and code for LangChain, LlamaIndex, OpenAI, and more
- [samples/](samples/): Bash, Python, and JS samples for API and model usage

---

#### For more, switch to the <research> branch.


