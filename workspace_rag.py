"""
Workspace RAG Chain - A modular RAG implementation with access to the entire workspace.
Uses Ollama with Gemma 3 model and supports TTS/STT extensions.
"""

import os
import logging
import json
from typing import Dict, Any, List, Optional, Union, Tuple
from pathlib import Path

# LangChain imports
from langchain.chains import LLMChain, SimpleSequentialChain
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import (
    TextLoader, 
    DirectoryLoader, 
    PyPDFLoader,
    UnstructuredMarkdownLoader
)
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.llms import Ollama

# Import optional TTS/STT modules - will be importable if installed
try:
    from utils_tts import TTSProcessor
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    
try:
    from utils_stt import STTProcessor
    STT_AVAILABLE = True
except ImportError:
    STT_AVAILABLE = False

# Import config
from rag_config import RAG_CONFIG

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WorkspaceRAG")

class WorkspaceRAG:
    """
    A modular RAG implementation with access to the entire workspace.
    Integrates with Ollama (Gemma 3) and supports TTS/STT extensions.
    """
    
    def __init__(self, 
                workspace_path: Union[str, Path],
                embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
                llm_model: str = "llama2-uncensored",
                cache_dir: str = "./rag_cache",
                config: Optional[Dict[str, Any]] = None):
        """
        Initialize the WorkspaceRAG with the path to the workspace.
        
        Args:
            workspace_path: Path to the workspace directory
            embedding_model: HuggingFace embedding model to use
            llm_model: Ollama model to use (default: llama2-uncensored)
            cache_dir: Directory to store vector database cache
            config: Optional configuration overrides
        """
        self.workspace_path = Path(workspace_path)
        self.config = config or RAG_CONFIG
        self.cache_dir = cache_dir
        self.embedding_model = embedding_model
        self.llm_model = llm_model
        
        # Initialize components
        self.vector_store = None
        self.llm = None
        self.rag_chain = None
        
        # Optional TTS/STT components
        self.tts_processor = None
        self.stt_processor = None
        
        # Initialize system
        logger.info(f"Initializing WorkspaceRAG with workspace path: {self.workspace_path}")
        self._init_llm()
        self._init_vector_store()
        self._init_rag_chain()
        self._init_speech_components()
        
    def _init_llm(self):
        """Initialize the LLM using Ollama."""
        try:
            logger.info(f"Initializing Ollama LLM with model: {self.llm_model}")
            self.llm = Ollama(model=self.llm_model)
            logger.info("LLM initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            raise
            
    def _init_vector_store(self):
        """Initialize the vector store with the entire workspace."""
        # Check for a cached vector store
        os.makedirs(self.cache_dir, exist_ok=True)
        cache_path = os.path.join(self.cache_dir, "workspace_vectorstore")
        
        if os.path.exists(cache_path):
            try:
                logger.info("Loading vector store from cache...")
                self.embeddings = HuggingFaceEmbeddings(model_name=self.embedding_model)
                self.vector_store = FAISS.load_local(cache_path, self.embeddings)
                logger.info("Vector store loaded from cache")
                return
            except Exception as e:
                logger.warning(f"Failed to load vector store from cache: {str(e)}. Creating a new one.")
        
        # Create a new vector store if we can't load from cache
        try:
            logger.info(f"Creating new vector store from workspace: {self.workspace_path}")
            
            # Initialize embeddings
            self.embeddings = HuggingFaceEmbeddings(model_name=self.embedding_model)
            
            # Load and process documents from the workspace
            documents = self._load_workspace_documents()
            
            if not documents:
                logger.warning("No documents found in the workspace")
                return
                
            logger.info(f"Loaded {len(documents)} documents from workspace")
            
            # Create vector store
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
            
            # Save vector store for future use
            self.vector_store.save_local(self.cache_dir, index_name="workspace_vectorstore")
            logger.info("Vector store created and saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to create vector store: {str(e)}")
            raise
            
    def _load_workspace_documents(self) -> List[Document]:
        """Load and process documents from the workspace."""
        documents = []
        
        # Configure text splitter for document processing
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config["chunk_size"],
            chunk_overlap=self.config["chunk_overlap"]
        )
        
        # Helper function to safely load documents
        def safe_load_with_loader(loader_cls, file_path, **kwargs):
            try:
                loader = loader_cls(file_path, **kwargs)
                return loader.load()
            except Exception as e:
                logger.warning(f"Failed to load {file_path}: {str(e)}")
                return []
        
        # Walk through the workspace and process files
        exclude_dirs = set(self.config["exclude_dirs"])
        exclude_extensions = set(self.config["exclude_extensions"])
        
        for root, dirs, files in os.walk(self.workspace_path):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                file_path = os.path.join(root, file)
                extension = os.path.splitext(file)[1].lower()
                
                if extension in exclude_extensions:
                    continue
                    
                # Process file based on extension
                try:
                    if extension == '.md':
                        docs = safe_load_with_loader(UnstructuredMarkdownLoader, file_path)
                    elif extension == '.pdf':
                        docs = safe_load_with_loader(PyPDFLoader, file_path)
                    elif extension in ['.txt', '.py', '.js', '.ts', '.html', '.css', '.json']:
                        docs = safe_load_with_loader(TextLoader, file_path)
                    else:
                        # Skip other file types
                        continue
                        
                    # Split document into chunks
                    if docs:
                        split_docs = text_splitter.split_documents(docs)
                        documents.extend(split_docs)
                        
                except Exception as e:
                    logger.warning(f"Error processing file {file_path}: {str(e)}")
                    continue
                    
        return documents
        
    def _init_rag_chain(self):
        """Create the RAG chain for retrieving and generating responses."""
        if not self.vector_store:
            logger.error("Vector store not initialized, can't create RAG chain")
            return
            
        # Create a retriever from the vector store
        self.retriever = self.vector_store.as_retriever(
            search_kwargs={"k": self.config["retriever_k"]}
        )
        
        # Define prompt template for the RAG chain
        prompt_template = self.config["main_prompt_template"]
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "query"]
        )
        
        # Create the RAG chain
        self.rag_chain = (
            {"query": RunnablePassthrough()} 
            | {"context": lambda x: self._format_context(self.retriever.invoke(x["query"])),
               "query": lambda x: x["query"]}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        logger.info("RAG chain initialized successfully")
        
    def _format_context(self, docs: List[Document]) -> str:
        """Format retrieved documents into context string."""
        formatted_docs = []
        
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "Unknown")
            formatted_docs.append(f"Document {i+1} (from {source}):\n{doc.page_content}")
            
        return "\n\n".join(formatted_docs)
        
    def _init_speech_components(self):
        """Initialize TTS and STT components if available."""
        if TTS_AVAILABLE:
            try:
                self.tts_processor = TTSProcessor(**self.config.get("tts_config", {}))
                logger.info("TTS processor initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize TTS processor: {str(e)}")
                
        if STT_AVAILABLE:
            try:
                self.stt_processor = STTProcessor(**self.config.get("stt_config", {}))
                logger.info("STT processor initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize STT processor: {str(e)}")
                
    def query(self, query: str) -> str:
        """
        Query the RAG chain with a question about the workspace.
        
        Args:
            query: The query string
            
        Returns:
            Response from the RAG chain
        """
        if not self.rag_chain:
            raise ValueError("RAG chain not initialized")
            
        try:
            logger.info(f"Processing query: {query}")
            response = self.rag_chain.invoke({"query": query})
            return response
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return f"Error processing query: {str(e)}"
            
    def query_with_speech(self, audio_file: str) -> Tuple[str, str, Optional[str]]:
        """
        Process speech input, query the RAG chain, and optionally return speech output.
        
        Args:
            audio_file: Path to the audio file
            
        Returns:
            Tuple of (transcribed_text, response_text, output_audio_path)
        """
        if not STT_AVAILABLE:
            raise ValueError("STT module not available")
            
        # Transcribe audio to text
        transcribed_text = self.stt_processor.transcribe(audio_file)
        logger.info(f"Transcribed: {transcribed_text}")
        
        # Query RAG system
        response_text = self.query(transcribed_text)
        
        # Convert response to speech if TTS is available
        output_audio = None
        if TTS_AVAILABLE and self.tts_processor:
            output_audio = self.tts_processor.synthesize(response_text)
            
        return transcribed_text, response_text, output_audio
            
    def refresh_vector_store(self):
        """Rebuild the vector store from the workspace."""
        logger.info("Rebuilding vector store from workspace")
        # Remove cached store
        cache_path = os.path.join(self.cache_dir, "workspace_vectorstore")
        if os.path.exists(cache_path):
            import shutil
            shutil.rmtree(cache_path)
        
        # Reinitialize vector store
        self._init_vector_store()
        self._init_rag_chain()
        logger.info("Vector store refresh complete")
        
    def add_document(self, document_path: str) -> bool:
        """
        Add a specific document to the vector store.
        
        Args:
            document_path: Path to the document
            
        Returns:
            Success status
        """
        if not os.path.exists(document_path):
            logger.error(f"Document not found: {document_path}")
            return False
            
        extension = os.path.splitext(document_path)[1].lower()
        
        try:
            # Load document based on extension
            if extension == '.md':
                loader = UnstructuredMarkdownLoader(document_path)
            elif extension == '.pdf':
                loader = PyPDFLoader(document_path)
            elif extension in ['.txt', '.py', '.js', '.ts', '.html', '.css', '.json']:
                loader = TextLoader(document_path)
            else:
                logger.error(f"Unsupported file type: {extension}")
                return False
                
            docs = loader.load()
            
            # Split document
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config["chunk_size"],
                chunk_overlap=self.config["chunk_overlap"]
            )
            split_docs = text_splitter.split_documents(docs)
            
            # Add to vector store
            if self.vector_store:
                self.vector_store.add_documents(split_docs)
                
                # Save updated vector store
                self.vector_store.save_local(self.cache_dir, index_name="workspace_vectorstore")
                logger.info(f"Added document to vector store: {document_path}")
                return True
            else:
                logger.error("Vector store not initialized")
                return False
                
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            return False

    # Future extensibility - hooks for additional features
    def register_tool(self, tool_name: str, tool_function, description: str = None, parameters: dict = None):
        """
        Register a custom tool that RAG can use.
        This allows extending the system with domain-specific capabilities.
        
        Args:
            tool_name: Name of the tool (must be unique)
            tool_function: Function to execute when the tool is called
            description: Human-readable description of what the tool does
            parameters: Dictionary describing the parameters the tool accepts
        
        Returns:
            bool: True if registration was successful, False if not
        """
        if not hasattr(self, 'tools'):
            self.tools = {}
            
        if tool_name in self.tools:
            logger.warning(f"Tool '{tool_name}' already registered, overwriting")
            
        self.tools[tool_name] = {
            "function": tool_function,
            "description": description or "No description provided",
            "parameters": parameters or {}
        }
        
        logger.info(f"Registered tool '{tool_name}'")
        return True
        
    def list_tools(self):
        """
        List all registered tools.
        
        Returns:
            dict: Dictionary of available tools and their descriptions
        """
        if not hasattr(self, 'tools') or not self.tools:
            return {}
            
        return {name: {"description": tool["description"], "parameters": tool["parameters"]} 
                for name, tool in self.tools.items()}
    
    def execute_tool(self, tool_name: str, **kwargs):
        """
        Execute a registered tool with the provided parameters.
        
        Args:
            tool_name: Name of the tool to execute
            **kwargs: Parameters to pass to the tool
            
        Returns:
            Any: Result of the tool execution
        """
        if not hasattr(self, 'tools') or tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not registered")
            
        tool = self.tools[tool_name]
        try:
            logger.info(f"Executing tool '{tool_name}'")
            result = tool["function"](**kwargs)
            return result
        except Exception as e:
            logger.error(f"Error executing tool '{tool_name}': {str(e)}")
            raise

# Simple CLI interface if script is run directly
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Workspace RAG System')
    parser.add_argument('--query', '-q', help='Query to ask the RAG system')
    parser.add_argument('--workspace', '-w', help='Path to workspace', default='.')
    parser.add_argument('--refresh', '-r', action='store_true', help='Refresh the vector store')
    parser.add_argument('--add', '-a', help='Add document to vector store')
    
    args = parser.parse_args()
    
    # Create RAG instance
    rag = WorkspaceRAG(workspace_path=args.workspace)
    
    if args.refresh:
        rag.refresh_vector_store()
        
    if args.add:
        success = rag.add_document(args.add)
        print(f"Document add {'succeeded' if success else 'failed'}")
        
    if args.query:
        response = rag.query(args.query)
        print("\nQuery:", args.query)
        print("\nResponse:", response)