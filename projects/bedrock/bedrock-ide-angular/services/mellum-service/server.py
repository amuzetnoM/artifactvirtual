from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import logging
import asyncio
from rag_chain import MellumRagChain

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Mellum Code Assistant API", 
              description="API for BedrockIDE's AI code assistant powered by JetBrains Mellum",
              version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RAG chain instance is initialized lazily
rag_chain = None

# Define request/response models
class CompletionRequest(BaseModel):
    prompt: str
    language: str = "python"
    max_tokens: int = 512
    temperature: float = 0.5
    context: Optional[List[str]] = None

class CompletionResponse(BaseModel):
    completion: str
    model: str = "JetBrains/Mellum-4b-sft-python"
    
class DocumentUpdateRequest(BaseModel):
    documents: List[str]
    metadata: Optional[List[Dict[str, Any]]] = None
    
# Initialize RAG chain
def init_rag_chain():
    global rag_chain
    try:
        logger.info("Initializing Mellum RAG chain...")
        
        # Set paths for code and blockchain documentation
        # These will typically be part of your project or mounted in a container
        code_docs_path = os.environ.get("CODE_DOCS_PATH", "../../../contracts")
        blockchain_docs_path = os.environ.get("BLOCKCHAIN_DOCS_PATH", "../../../docs")
        cache_dir = os.environ.get("VECTOR_DB_CACHE", "./vector_db_cache")
        
        rag_chain = MellumRagChain(
            code_docs_path=code_docs_path,
            blockchain_docs_path=blockchain_docs_path,
            cache_dir=cache_dir
        )
        logger.info("RAG chain initialization complete!")
    except Exception as e:
        logger.error(f"Failed to initialize RAG chain: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    # Using asyncio to avoid blocking the startup
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, init_rag_chain)

@app.get("/")
async def root():
    return {"message": "Mellum Code Assistant API", "status": "running"}

@app.get("/health")
async def health_check():
    if rag_chain is None:
        raise HTTPException(status_code=503, detail="RAG chain not initialized")
    return {"status": "healthy", "model": "JetBrains/Mellum-4b-sft-python"}

@app.post("/completions", response_model=CompletionResponse)
async def get_completion(request: CompletionRequest):
    if rag_chain is None:
        init_rag_chain()
    
    try:
        # Use the RAG chain to generate code
        result = await rag_chain.generate_code(
            query=request.prompt,
            language=request.language
        )
        
        return CompletionResponse(completion=result["code"])
    except Exception as e:
        logger.error(f"Completion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-documents")
async def update_documents(request: DocumentUpdateRequest):
    """Update the vector store with new documents."""
    if rag_chain is None:
        init_rag_chain()
        
    try:
        rag_chain.update_vector_store(
            new_documents=request.documents,
            metadata=request.metadata
        )
        return {"status": "success", "message": f"Added {len(request.documents)} documents to vector store"}
    except Exception as e:
        logger.error(f"Failed to update documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)