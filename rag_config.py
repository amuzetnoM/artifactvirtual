"""
Configuration settings for the Workspace RAG system.
This file contains default parameters that control various aspects of the system.
"""

# Default RAG configuration
RAG_CONFIG = {
    # Document processing settings
    "chunk_size": 1000,
    "chunk_overlap": 200,
    
    # Retriever settings
    "retriever_k": 5,  # Number of documents to retrieve
    
    # Directories and file types to exclude from processing
    "exclude_dirs": [
        ".git",
        ".venv",
        "node_modules",
        "__pycache__",
        "rag_cache",
        ".github",
        "utils/n8n-master",
        "frontend",
        "datasets",
        "samples",
        "cookbooks",
        "projects"
    ],
    "exclude_extensions": [
        ".pyc",
        ".pyo",

        ".so",
        ".class",
        ".lock",
        ".json",
        ".md",
        ".txt"
    ],
    
    # Main prompt template for RAG
    "main_prompt_template": """You are a knowledgeable assistant with access to the Artifact Virtual workspace.
Your goal is to provide helpful, accurate, and relevant information based on the context provided.

Context:
{context}

User query: {query}

Please respond to the user query using the information provided in the context. If the context doesn't contain
sufficient information to answer the query, say so clearly rather than making up information. 
Format code blocks with appropriate syntax highlighting.
""",
    
    # TTS config settings (used if TTS module is available)
    "tts_config": {
        "model": "tts-1",  # Default TTS model
        "voice": "alloy",   # Default voice
        "output_dir": "./audio_output"
    },
    
    # STT config settings (used if STT module is available)
    "stt_config": {
        "model": "whisper-1",  # Default STT model
    },

    # Set the default LLM model to Qwen3
    "llm_model": "qwen3",
}