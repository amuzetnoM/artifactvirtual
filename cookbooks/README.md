# ArtifactVirtual Cookbooks

This directory contains cookbooks and reference implementations for integrating various AI frameworks and models with ArtifactVirtual. These cookbooks provide practical guidance and code examples for common use cases and advanced patterns.

## Overview

ArtifactVirtual cookbooks offer ready-to-use patterns and examples for:

- Integrating different LLM providers (OpenAI, Mistral, etc.)
- Using different AI frameworks (LangChain, LlamaIndex, etc.)
- Implementing advanced techniques (RAG, agents, fine-tuning, etc.)
- Optimizing model performance and cost

## Available Cookbooks

### Python

- **LangChain Cookbook**: Examples of using LangChain for agents, chains, and memory
- **LlamaIndex Cookbook**: Document indexing, retrieval, and knowledge graphs
- **OpenAI Cookbook**: Advanced patterns with OpenAI models
- **MistralAI Cookbook**: Working with Mistral's models

### JavaScript

- **LangChainJS Cookbook**: Examples using LangChain in JavaScript
- **OpenAI Node.js Cookbook**: Advanced patterns with the OpenAI Node.js client

## Common Patterns

### Retrieval-Augmented Generation (RAG)

Examples that demonstrate how to:
- Index documents from various sources
- Create embeddings for semantic search
- Retrieve relevant context based on user queries
- Augment prompts with retrieved information
- Generate accurate, grounded responses

```python
# RAG with LangChain example
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA

# Load and process documents
documents = load_documents("path/to/documents")
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Create embeddings and vector store
embeddings = OpenAIEmbeddings()
db = Chroma.from_documents(texts, embeddings)

# Create a retrieval QA chain
qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=db.as_retriever()
)

# Query the system
query = "What are the key concepts of reinforcement learning?"
qa.run(query)
```

### Agent Systems

Examples demonstrating how to create autonomous agents that can:
- Reason about problems step-by-step
- Use tools to accomplish tasks
- Chain multiple capabilities together
- Maintain memory across interactions

```python
# Agent with tools example
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI

tools = [
    Tool(
        name="Search",
        func=search_function,
        description="Useful for searching information on the internet"
    ),
    Tool(
        name="Calculator",
        func=calculator_function,
        description="Useful for performing calculations"
    )
]

llm = OpenAI(temperature=0)
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)
agent.run("What is the population of Canada multiplied by the square root of 2?")
```

### Model Optimization

Examples showing how to:
- Optimize prompts for better performance
- Fine-tune models on specific tasks
- Quantize models with AutoRound
- Evaluate model performance

```python
# Quantizing a model with AutoRound
from auto_round import AutoRound
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "mistralai/Mistral-7B-v0.1" 
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

quantizer = AutoRound(model, tokenizer, bits=4, group_size=128)
quantized_model = quantizer.quantize()

# Save the quantized model
quantized_model.save_pretrained("./quantized_mistral")
tokenizer.save_pretrained("./quantized_mistral")
```

## Integration with ArtifactVirtual

These cookbooks integrate seamlessly with other ArtifactVirtual components:

1. They leverage the diagnostic tools from `debugdiag` for monitoring and troubleshooting
2. They work with the quantized models produced by AutoRound
3. They demonstrate how to incorporate the knowledge foundations from the datasets
4. They can be extended with Model Context Protocol (MCP) for standardized context provision

## Usage

Each cookbook includes:
- Step-by-step examples
- Requirements and dependencies
- Expected outputs
- Performance considerations
- Best practices

To use a cookbook:

1. Navigate to the desired cookbook directory
2. Install any required dependencies
3. Follow the documented examples
4. Adapt the patterns to your specific use case

## Contributing

To contribute a new cookbook:

1. Create a new folder with a descriptive name
2. Include a comprehensive README.md with documentation
3. Provide working, well-commented code examples
4. Include requirements.txt or package.json as appropriate
5. Submit a pull request

---

For questions and support, please refer to the individual cookbook documentation.
