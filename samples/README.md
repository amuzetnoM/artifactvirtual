# ArtifactVirtual Samples

This folder contains samples for interacting with various LLM providers through the ArtifactVirtual ecosystem. Each subfolder contains examples for a specific language: JavaScript, Python, and cURL.

## Languages

We provide samples in the following languages:

- [JavaScript](js/README.md)
- [Python](python/README.md)
- [cURL](curl/README.md)

## Available Model Providers

The samples demonstrate how to interact with various model providers:

- **OpenAI** - Examples using gpt-3.5-turbo, gpt-4, and other OpenAI models
- **MistralAI** - Examples using Mistral's models like Mistral-7B and Mixtral-8x7B
- **Azure AI** - Examples of Azure AI Inference and Azure AI Evaluation
- **Ollama** - Examples of using local models via Ollama

## Things to Try

Use this collection to experiment with various models and approaches:

### Try a Different Model

Try switching to a different model by finding a line like the one below and changing the model selected. You can find other models to try at [GitHub Marketplace](https://github.com/marketplace/models) or [Ollama Library](https://ollama.ai/library).

```json
"model": "gpt-4o-mini"
```

### Try a Different Prompt

Modify the input to the model by changing the text following `"content":` in the examples:

```json
{
    "role": "user",
    "content": "What is the capital of France?"
}
```

Some examples provide multiple turns of conversation history, which you can also modify.

### Change the System Prompt

Some models allow you to modify the "system prompt," which doesn't generate a response directly but changes the *way* the model responds:

```json
{
    "role": "system",
    "content": "You are a helpful assistant."
}
```

## Common Concepts

Across the different providers and languages, you'll find these common concepts:

### Chat Completion

Most examples demonstrate chat completion, where you provide:
- A system message (optional)
- One or more user messages
- Assistant responses (for multi-turn conversations)

### Streaming

Several examples show how to use streaming responses, where tokens are delivered incrementally rather than waiting for the complete response:

```javascript
// JavaScript streaming example
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

```python
# Python streaming example
for chunk in response:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
```

### Multimodality

Examples for models that support images, audio, or other modalities are provided:

```python
# Python multimodal example
response = client.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[
        {"role": "user", 
         "content": [
             {"type": "text", "text": "What's in this image?"},
             {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64_image}}
         ]}
    ],
    max_tokens=300
)
```

## Integration with ArtifactVirtual

These samples are designed to work seamlessly with the ArtifactVirtual ecosystem:

1. They can be run directly in the devcontainer environment
2. They demonstrate integration with quantized models via AutoRound
3. They can be used as reference for implementing MCP servers
4. They provide building blocks for the Oracle CLI

## Getting Started

1. Select a language subfolder based on your preference
2. Follow the README instructions for that language
3. Set up any required API keys or environment variables
4. Run the examples to see the results

For local models, ensure you have [Ollama](https://ollama.ai/download) installed and running.

---

For more detailed information, see the language-specific READMEs in each subfolder.
