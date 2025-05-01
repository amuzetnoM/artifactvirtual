# REGEN

And so it begins...

### Debugging & Diagnostics CLI

### Project Start Log
- **Date Started:** April 28, 2025
- **Operating System:** Linux
- **Workspace:** /workspaces/worxpace

### Initial Setup
- Ensure **Python 3.11+** and **pip** are installed.
- Ensure **Node.js 20+** and **npm** are installed (for JS samples and the documentation site).
- Ensure **Git** and **Git LFS** are installed.
- Ensure **curl** is available (for curl samples).
- Create and activate a Python virtual environment (recommended):
  ```bash
  python -m venv .venv
  source .venv/bin/activate # Linux/macOS
  # .venv\Scripts\activate # Windows
  ```
- Install all Python dependencies:
  ```bash
  pip install -r requirements.txt
  ```
  *This includes libraries for core AI/ML (PyTorch, Transformers, MosaicML CLI, einops), PDF processing (PyPDF2, pdfplumber), image handling (Pillow), web scraping (BeautifulSoup4), CLI tools (Typer, Rich, Click), evaluation (Azure AI Evaluation), and more.*
- Install Node.js dependencies for the root project (used by some samples):
  ```bash
  npm install
  ```
- Install Node.js dependencies for the documentation site:
  ```bash
  cd celestial-chaos
  npm install
  cd ..
  ```

### Development Container with AI & CUDA Support
- A pre-configured Dev Container is available (`.devcontainer/`) which handles all setup steps automatically.
- Developed a robust development container for reproducible environments.
- Integrated AI functionality for advanced workflows.
- Updated the container to support CUDA, enabling GPU acceleration for machine learning and deep learning tasks.
- **Includes PostgreSQL Database:** A PostgreSQL 15 service (`pg-artifact`) is managed via Docker Compose, automatically initialized on container startup with the database `artifact_db`.

### Debugging & Diagnostic Tool
- Built a comprehensive debugging and diagnostic tool with its own CLI interface.
- Utilizes Python's `logging` module for scalable, reproducible logs.
- Logs are stored in a dedicated `.logs` directory.
- Logger is initialized at project start and used throughout the CLI.

### CLI Terminal
- CLI built using `click` and `rich` for structured commands and enhanced output.
- Organized into groups: `project`, `logs`, and `diagnose`.
- Commands include:
     - `project status`: Shows system and project status.
     - `logs show`: Displays the last 20 log entries.
     - `logs clear`: Clears the debug log.
     - `diagnose ping`: Checks connectivity to a host (default: 8.8.8.8).

### Testing Workflows
- Added `pytest` for automated testing (included in `requirements.txt`).
- Run `pytest` to execute all tests and validate the debugging tool and CLI workflows.
- Test files should be named `test_*.py` for automatic discovery.

### TemporalCalendar Test Program
- Developed `temporalcalendar`, a test program to verify workspace setup and readiness for advanced research and development.
- Ensures the environment is correctly configured for further experimentation.

### Knowledge Foundations & Datasets
- Extensively researched intelligence and the data that constitutes intelligence.
- Distilled findings into a curated library of fundamental truths and knowledge foundations.
- The cumulative dataset is located in the `datasets` folder.

### Datasets Overview

Each dataset was selected for its foundational value in understanding intelligence and supporting reproducible research:

- **core_facts.json**  
     *Origin:* Curated from encyclopedic sources and foundational scientific literature.  
     *Content:* Contains universally accepted facts across mathematics, physics, biology, and logic.  
     *Purpose:* Serves as the backbone for reasoning and inference tasks.

- **reasoning_patterns.json**  
     *Origin:* Synthesized from cognitive science and AI research papers.  
     *Content:* Catalogs common reasoning templates and logical deduction patterns.  
     *Purpose:* Enables the system to generalize and apply structured reasoning.

- **language_primitives.json**  
     *Origin:* Extracted from linguistic corpora and language model benchmarks.  
     *Content:* Lists essential language constructs, grammar rules, and semantic primitives.  
     *Purpose:* Supports robust natural language understanding and generation.

- **temporal_events.json**  
     *Origin:* Aggregated from historical datasets and time-series research.  
     *Content:* Documents key events, timelines, and temporal relationships.  
     *Purpose:* Facilitates temporal reasoning and event-based diagnostics.

- **custom_annotations.json**  
     *Origin:* Manually annotated during project development and research sprints.  
     *Content:* Contains project-specific insights, edge cases, and experimental findings.  
     *Purpose:* Captures evolving knowledge and supports continuous improvement.

All datasets are versioned and documented for absolute clarity, reproducibility, and educational value.
Each dataset was selected for its foundational value in understanding intelligence and supporting reproducible research.

### Python, CMake, and AutoRound for LLM Quantization

- **Python**: The workspace uses the latest Python 3.11+ (system-wide upgrade recommended).
- **CMake**: CMake is required for building some dependencies (e.g., sentencepiece) and is now installed system-wide.
- **AutoRound**: Intel's AutoRound is installed for advanced quantization and inference of large language models (LLMs) and vision-language models (VLMs), supporting 2, 3, 4, and 8-bit quantization.

#### AutoRound Installation
- Installed via PyPI or from source:
  ```bash
  # For GPU (CUDA/Intel GPU)
  pip install auto-round
  # For CPU only
  pip install auto-round[cpu]
  # Or from source (in auto-round directory):
  pip install .
  ```
- Requires Python 3.9+ and CMake (system PATH).

#### AutoRound CLI Example (4-bit Quantization)
```bash
auto-round \
    --model Qwen/Qwen3-0.6B \
    --bits 4 \
    --group_size 128 \
    --format "auto_gptq,auto_awq,auto_round" \
    --output_dir ./tmp_autoround
```

#### AutoRound Python API Example
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from auto_round import AutoRound

model_name = "Qwen/Qwen3-0.6B"
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto")
tokenizer = AutoTokenizer.from_pretrained(model_name)

bits, group_size, sym = 4, 128, True
autoround = AutoRound(model, tokenizer, bits=bits, group_size=group_size, sym=sym)
autoround.quantize_and_save("./tmp_autoround", format='auto_round')
```

#### Inference with Quantized Models
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from auto_round import AutoRoundConfig

quantized_model_path = "./tmp_autoround"
model = AutoModelForCausalLM.from_pretrained(quantized_model_path, device_map="auto", torch_dtype="auto")
tokenizer = AutoTokenizer.from_pretrained(quantized_model_path)
text = "There is a girl who likes adventure,"
inputs = tokenizer(text, return_tensors="pt").to(model.device)
print(tokenizer.decode(model.generate(**inputs, max_new_tokens=50)[0]))
```

- AutoRound supports export to AutoRound, GPTQ, AWQ, and GGUF formats.
- Integrated with HuggingFace Transformers (v4.51.3+).
- Supports CPU, Intel GPU, CUDA, and HPU backends.
- See `auto-round/README.md` for full documentation, recipes, and supported models.

#### Achievements So Far
- Automated Python environment setup and dependency management.
- Established a robust, extensible logging system.
- Developed a modular, user-friendly CLI for debugging and diagnostics.
- Built a CUDA-enabled development container with integrated AI functionality.
- Created a comprehensive debugging and diagnostic tool with its own CLI.
- Developed the `temporalcalendar` test program to validate workspace readiness.
- Curated and documented foundational datasets for intelligence research.
- Ensured all steps and changes are documented and reproducible.

---

> **Note:** Continue to update this documentation and the debug log as new features, commands, or changes are introduced. This ensures full reproducibility and transparency for all project activities.

---


