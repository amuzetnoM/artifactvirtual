import os
import logging
from typing import Dict, Any, List, Optional
import torch
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MellumRagChain:
    """
    RAGChain implementation using the JetBrains Mellum model with a second support model
    for enhancing code completions with context from documentation and code examples.
    """
    
    def __init__(self, 
                code_docs_path: str, 
                blockchain_docs_path: str,
                cache_dir: str = "./vector_db_cache"):
        """
        Initialize the RAG chain with paths to code and blockchain documentation.
        
        Args:
            code_docs_path: Path to directory containing code examples and documentation
            blockchain_docs_path: Path to directory containing blockchain-specific documentation
            cache_dir: Directory to store vector database cache
        """
        self.code_docs_path = code_docs_path
        self.blockchain_docs_path = blockchain_docs_path
        self.cache_dir = cache_dir
        self.vector_store = None
        self.primary_model = None
        self.support_model = None
        self.primary_tokenizer = None
        self.support_tokenizer = None
        
        # Initialize models and vector store
        self._init_models()
        self._init_vector_store()
        
        # Create the RAG chain
        self._create_rag_chain()
        
    def _init_models(self):
        """Initialize the primary and support models."""
        logger.info("Initializing Mellum model and support model...")
        
        # Primary model (Mellum)
        try:
            self.primary_tokenizer = AutoTokenizer.from_pretrained("JetBrains/Mellum-4b-sft-python")
            self.primary_model = AutoModelForCausalLM.from_pretrained(
                "JetBrains/Mellum-4b-sft-python",
                torch_dtype=torch.float16,
                device_map="auto"
            )
            
            # Create HuggingFacePipeline for primary model
            pipe = pipeline(
                "text-generation",
                model=self.primary_model,
                tokenizer=self.primary_tokenizer,
                max_new_tokens=512,
                temperature=0.5,
                top_p=0.95,
                pad_token_id=self.primary_tokenizer.eos_token_id
            )
            self.primary_llm = HuggingFacePipeline(pipeline=pipe)
            
            logger.info("Primary model (Mellum) initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize primary model: {str(e)}")
            raise
            
        # Support model (can be another model or the same one with different parameters)
        # For now, we'll use the same model with different parameters
        try:
            self.support_tokenizer = self.primary_tokenizer
            self.support_model = self.primary_model
            
            # Create HuggingFacePipeline for support model with different parameters
            support_pipe = pipeline(
                "text-generation",
                model=self.support_model,
                tokenizer=self.support_tokenizer,
                max_new_tokens=256,
                temperature=0.2,  # Lower temperature for more focused responses
                top_p=0.8,
                pad_token_id=self.support_tokenizer.eos_token_id
            )
            self.support_llm = HuggingFacePipeline(pipeline=support_pipe)
            
            logger.info("Support model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize support model: {str(e)}")
            raise
            
    def _init_vector_store(self):
        """Initialize the vector store with code and blockchain documentation."""
        # Check if vector store cache exists
        os.makedirs(self.cache_dir, exist_ok=True)
        cache_path = os.path.join(self.cache_dir, "vector_store.faiss")
        index_path = os.path.join(self.cache_dir, "index.pkl")
        
        # Use cached vector store if it exists
        if os.path.exists(cache_path) and os.path.exists(index_path):
            logger.info("Loading vector store from cache...")
            try:
                self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
                self.vector_store = FAISS.load_local(
                    self.cache_dir, 
                    self.embeddings, 
                    index_name="vector_store"
                )
                logger.info("Vector store loaded successfully from cache")
                return
            except Exception as e:
                logger.error(f"Failed to load vector store from cache: {str(e)}")
                # Continue to create a new vector store
                
        logger.info("Creating new vector store...")
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # Load and process documents
        documents = self._load_documents()
        
        # Create vector store
        self.vector_store = FAISS.from_documents(documents, self.embeddings)
        
        # Save vector store for future use
        self.vector_store.save_local(self.cache_dir, index_name="vector_store")
        logger.info("Vector store created and saved successfully")
        
    def _load_documents(self) -> List[Document]:
        """Load and process documents from code and blockchain documentation."""
        logger.info("Loading documents...")
        documents = []
        
        # Text splitter for chunking documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Load code documentation if path exists
        if os.path.exists(self.code_docs_path):
            logger.info(f"Loading code documentation from {self.code_docs_path}")
            try:
                code_loader = DirectoryLoader(
                    self.code_docs_path, 
                    glob="**/*.{md,py,js,ts,sol}",  # Load markdown, Python, JavaScript, TypeScript, and Solidity files
                    loader_cls=TextLoader
                )
                code_docs = code_loader.load()
                code_chunks = text_splitter.split_documents(code_docs)
                documents.extend(code_chunks)
                logger.info(f"Loaded {len(code_chunks)} code document chunks")
            except Exception as e:
                logger.error(f"Failed to load code documentation: {str(e)}")
        
        # Load blockchain documentation if path exists
        if os.path.exists(self.blockchain_docs_path):
            logger.info(f"Loading blockchain documentation from {self.blockchain_docs_path}")
            try:
                blockchain_loader = DirectoryLoader(
                    self.blockchain_docs_path,
                    glob="**/*.{md,rst,txt,sol}",  # Load markdown, RST, text, and Solidity files
                    loader_cls=TextLoader
                )
                blockchain_docs = blockchain_loader.load()
                blockchain_chunks = text_splitter.split_documents(blockchain_docs)
                documents.extend(blockchain_chunks)
                logger.info(f"Loaded {len(blockchain_chunks)} blockchain document chunks")
            except Exception as e:
                logger.error(f"Failed to load blockchain documentation: {str(e)}")
                
        logger.info(f"Total documents loaded: {len(documents)}")
        return documents
        
    def _create_rag_chain(self):
        """Create the RAG chain that combines retrieval with code generation."""
        # Define the prompt template for code completion with context
        template = """You are an expert blockchain developer assistant. 
Given the following context and the user's query, provide code and explanations that are helpful, accurate, and follow best practices.

Context:
{context}

User query: {query}

Your response should prioritize correctness and security, especially for smart contracts. 
Include explanations where appropriate to help the user understand the code.

Response:"""

        # Create the prompt template
        prompt = PromptTemplate(
            template=template,
            input_variables=["context", "query"]
        )
        
        # Create the retriever
        self.retriever = self.vector_store.as_retriever(
            search_kwargs={"k": 5}  # Retrieve top 5 most relevant documents
        )
        
        # Create the RAG chain
        self.rag_chain = (
            {"query": RunnablePassthrough()} 
            | {"context": lambda x: self._format_context(self.retriever.invoke(x["query"])),
               "query": lambda x: x["query"]}
            | prompt
            | self.primary_llm
            | StrOutputParser()
        )
        
        # Create a support chain for enhancing or validating primary model outputs
        support_template = """You are a code reviewer tasked with analyzing and improving code. 
Given the original request and the generated code, identify any issues or improvements that could be made.

Original request: {query}
Generated code: {generated_code}

Your response should focus on:
1. Identifying bugs or security issues
2. Suggesting optimizations or best practices
3. Adding any missing functionality

Response:"""

        support_prompt = PromptTemplate(
            template=support_template,
            input_variables=["query", "generated_code"]
        )
        
        self.support_chain = LLMChain(
            llm=self.support_llm,
            prompt=support_prompt
        )
        
    def _format_context(self, docs: List[Document]) -> str:
        """Format retrieved documents into context string."""
        formatted_docs = []
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "Unknown")
            content = doc.page_content.strip()
            formatted_docs.append(f"[Document {i+1}] From {source}:\n{content}\n")
        return "\n".join(formatted_docs)
        
    async def generate_code(self, query: str, language: str = "python") -> Dict[str, Any]:
        """
        Generate code based on the user query with RAG enhancement.
        
        Args:
            query: The user's code-related query
            language: The programming language for the code
            
        Returns:
            Dictionary containing the generated code and metadata
        """
        try:
            # Enhance query with language information
            enhanced_query = f"Write {language} code for: {query}"
            
            # Generate initial code response using the RAG chain
            logger.info(f"Generating code for query: {enhanced_query}")
            primary_response = self.rag_chain.invoke({"query": enhanced_query})
            
            # Use support model to enhance/validate the primary response
            logger.info("Enhancing primary response with support model")
            support_input = {
                "query": enhanced_query,
                "generated_code": primary_response
            }
            support_response = self.support_chain.run(**support_input)
            
            # Combine the responses
            final_response = self._combine_responses(primary_response, support_response)
            
            return {
                "code": final_response,
                "language": language,
                "model": "JetBrains/Mellum-4b-sft-python",
                "used_rag": True
            }
            
        except Exception as e:
            logger.error(f"Failed to generate code: {str(e)}")
            # Fallback to direct query to primary model
            try:
                direct_response = self.primary_llm(enhanced_query)
                return {
                    "code": direct_response,
                    "language": language,
                    "model": "JetBrains/Mellum-4b-sft-python",
                    "used_rag": False,
                    "fallback": True
                }
            except Exception as fallback_error:
                logger.error(f"Fallback generation failed: {str(fallback_error)}")
                raise
                
    def _combine_responses(self, primary: str, support: str) -> str:
        """
        Combine primary and support model responses intelligently.
        Simple implementation for now - can be enhanced with more logic.
        """
        # Check if support response provides substantial improvements
        if len(support) < 50 or "No issues found" in support:
            return primary
            
        # Otherwise, return both with separation
        return f"{primary}\n\n--- CODE REVIEW ---\n{support}"
        
    def update_vector_store(self, new_documents: List[str], metadata: Optional[List[Dict[str, Any]]] = None):
        """
        Update the vector store with new documents.
        
        Args:
            new_documents: List of new document strings to add
            metadata: Optional list of metadata dictionaries for each document
        """
        if metadata is None:
            metadata = [{"source": "user_added"} for _ in new_documents]
            
        # Convert strings to Document objects
        docs = [Document(page_content=text, metadata=meta) 
                for text, meta in zip(new_documents, metadata)]
                
        # Add documents to vector store
        self.vector_store.add_documents(docs)
        
        # Save updated vector store
        self.vector_store.save_local(self.cache_dir, index_name="vector_store")
        logger.info(f"Added {len(docs)} new documents to vector store")