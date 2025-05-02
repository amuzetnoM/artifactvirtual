# Oracle CLI: Multimodal LLM Playground

The Oracle CLI provides an interactive playground for experimenting with multiple LLM models, including model chaining, multimodal processing, and advanced workflows using LangChain, LangGraph, and DSPy.

## Overview

Oracle CLI integrates with Ollama to provide a seamless interface for interacting with multiple local LLMs. Key features include:

- **Model Selection**: Choose from available models including phi4-mini, gemma3, llava, and more
- **Model Chaining**: Chain outputs from one model to another for complex processing
- **Multimodal Processing**: Process images and text together using models like LLaVA
- **Pluggable Architecture**: Extend functionality with custom plugins
- **Framework Integrations**: Support for LangChain, LangGraph, and DSPy workflows

## Prerequisites

- Python 3.11+
- [Ollama](https://ollama.ai/download) installed with required models
- Required Python packages (installed via `pip install -r requirements.txt`)

## Getting Started

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure Ollama is running with the necessary models:
   ```bash
   ollama pull phi4-mini
   ollama pull gemma3
   ollama pull llava
   ```

3. Run the Oracle CLI:
   ```bash
   python oracle_cli.py
   ```

## Features

### Chat with Individual Models

Choose from the available models to have direct conversations:
- phi4-mini: A small but powerful language model
- gemma3: Google's open language model
- llava: A multimodal model that can process images and text

### Model Chaining

The Oracle CLI supports chaining models together, where the output from one model becomes the input for another. For example:

```
phi4-mini (initial text processing) → gemma3 (content generation)
```

This enables sophisticated workflows where each model contributes its strengths.

### Multimodal Processing

Process images along with text using the LLaVA model:

1. Select the multimodal option
2. Provide an image path
3. Enter a prompt related to the image
4. Get a response from LLaVA describing the image
5. Generate a story based on the description using gemma3

### Advanced Framework Integrations

The CLI includes support for advanced AI frameworks:

- **LangChain Integration**: Used for sequential model chaining
- **LangGraph Support**: For building complex workflow graphs (requires installation)
- **DSPy Support**: For declarative language processing (requires installation)

### Plugin System

Extend Oracle CLI with custom plugins:

1. Create a Python file in the `plugins/` directory
2. Implement a `main(console)` function
3. Your plugin will automatically be discovered and added to the menu

## Command Reference

| Command | Description |
|---------|-------------|
| `1-3` | Chat with individual models (phi4-mini, gemma3, llava) |
| `4` | Chain phi4-mini to gemma3 |
| `5` | Multimodal processing with LLaVA and gemma3 |
| `6` | LangGraph workflow demo (if installed) |
| `7` | DSPy workflow demo (if installed) |
| `8+` | Custom plugins (if available) |
| `exit` | Exit the Oracle CLI |

## Dependency Management

The CLI includes a helpful dependency checker that will:
1. Detect missing dependencies
2. Offer to install them automatically
3. Provide guidance for troubleshooting

## Advanced Usage

### Creating Custom Model Chains

You can extend the built-in chains by modifying the `oracle_cli.py` file:

```python
def custom_chain():
    model1 = MODELS["model1"]()
    model2 = MODELS["model2"]()
    chain = SimpleSequentialChain(llms=[model1, model2])
    # Add your custom chain logic
```

### Plugin Development

Create powerful plugins by following this template:

```python
# plugins/my_plugin.py
def main(console):
    console.print("[bold cyan]My Custom Plugin[/bold cyan]")
    # Your plugin logic here
    return True
```

## Integration with ArtifactVirtual

Oracle CLI is designed to work seamlessly with the ArtifactVirtual ecosystem:

1. It leverages Ollama for efficient local model execution
2. It can access quantized models created with AutoRound
3. It supports the data exploration needs of the knowledge foundations
4. It serves as a testbed for the TemporalCalendar project

## License

This project is licensed under the MIT License - see the LICENSE file for details.