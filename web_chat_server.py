"""
Web Chat Server for Artifact Virtual RAG System

This module provides a web interface for interacting with the Workspace RAG system.
It uses FastAPI for the backend API and Gradio for the chat UI.
"""

import os
import logging
import gradio as gr
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from workspace_rag import WorkspaceRAG
from rag_config import RAG_CONFIG

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WebChatServer")

# Initialize FastAPI app
app = FastAPI(title="Artifact Virtual RAG Chat", description="Chat with Artifact Virtual's RAG system")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG system
workspace_path = os.environ.get("WORKSPACE_PATH", os.path.dirname(os.path.abspath(__file__)))
llm_model = os.environ.get("LLM_MODEL", "gemma3")

# Create static files directory if it doesn't exist
os.makedirs(os.path.join(workspace_path, "static"), exist_ok=True)

# Create templates directory if it doesn't exist
templates_dir = os.path.join(workspace_path, "templates")
os.makedirs(templates_dir, exist_ok=True)

# Create a basic HTML template for embedding the chat interface
with open(os.path.join(templates_dir, "chat.html"), "w") as f:
    f.write("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artifact Virtual Chat</title>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .container {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
            }
            .header {
                background-color: #000;
                color: #fff;
                padding: 10px 20px;
                display: flex;
                align-items: center;
            }
            .header h1 {
                margin: 0;
                font-size: 1.2rem;
            }
            .chat-container {
                flex: 1;
                border: none;
                width: 100%;
                height: 100%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Artifact Virtual Chat</h1>
            </div>
            <iframe id="gradio-app" class="chat-container" src="/gradio/" frameborder="0" allow="microphone"></iframe>
        </div>
    </body>
    </html>
    """)

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(workspace_path, "static")), name="static")

# Setup templates
templates = Jinja2Templates(directory=templates_dir)

# Initialize RAG system
logger.info(f"Initializing RAG with model {llm_model} and workspace {workspace_path}")
rag = WorkspaceRAG(
    workspace_path=workspace_path,
    llm_model=llm_model,
    cache_dir=os.path.join(workspace_path, "rag_cache"),
    config=RAG_CONFIG
)

# Define routes
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the main page with embedded chat interface."""
    return templates.TemplateResponse("chat.html", {"request": request})

# Custom tools for demonstration
def calculate_tool(expression: str) -> str:
    """A sample tool that evaluates simple mathematical expressions."""
    try:
        # Limit to safe operations
        allowed_chars = set("0123456789+-*/() .")
        if not all(c in allowed_chars for c in expression):
            return "Error: Expression contains invalid characters"
        
        result = eval(expression, {"__builtins__": {}})
        return f"Calculated result: {result}"
    except Exception as e:
        return f"Error calculating: {str(e)}"

# Register some example tools
rag.register_tool(
    "calculate", 
    calculate_tool,
    "Calculate a mathematical expression",
    {"expression": "The mathematical expression to evaluate"}
)

def handle_chat(message, history):
    """Handle chat messages for Gradio."""
    try:
        # Check if the message is a tool command
        if message.startswith("/tool "):
            parts = message[6:].strip().split(" ", 1)
            if len(parts) == 2:
                tool_name, args = parts
                if tool_name in rag.list_tools():
                    result = rag.execute_tool(tool_name, expression=args)
                    return result
                else:
                    return f"Tool '{tool_name}' not found. Available tools: {', '.join(rag.list_tools().keys())}"
            else:
                return f"Usage: /tool [tool_name] [arguments]. Available tools: {', '.join(rag.list_tools().keys())}"
        
        # Regular RAG query
        response = rag.query(message)
        return response
    except Exception as e:
        logger.error(f"Error handling chat message: {str(e)}")
        return f"Error: {str(e)}"

# Create Gradio chat interface
def create_gradio_app():
    """Create and configure the Gradio chat interface."""
    with gr.Blocks(css="footer {visibility: hidden}") as demo:
        gr.Markdown("## Artifact Virtual RAG Chat")
        gr.Markdown("Ask questions about the workspace or use tools with `/tool [tool_name] [args]`")
        
        chatbot = gr.Chatbot(height=500)
        msg = gr.Textbox(placeholder="Enter your message...", container=False)
        clear = gr.Button("Clear")
        
        # Handle chat
        msg.submit(
            handle_chat,
            [msg, chatbot],
            [chatbot],
            clear_input=True,
        )
        
        # Clear chat history
        clear.click(lambda: None, None, chatbot, queue=False)
        
        # Add examples
        gr.Examples(
            examples=[
                "What is Artifact Virtual?",
                "Tell me about AutoRound.",
                "How can I use the MCP system?",
                "/tool calculate 5 * (3 + 2)",
            ],
            inputs=msg,
        )
        
        # Add voice input if STT is available
        from workspace_rag import STT_AVAILABLE
        if STT_AVAILABLE:
            with gr.Row():
                audio_input = gr.Audio(sources=["microphone"], type="filepath")
                
                def process_audio(audio_file):
                    """Process audio input using STT."""
                    if not audio_file:
                        return "No audio detected."
                    
                    transcribed_text, response_text, _ = rag.query_with_speech(audio_file)
                    return f"Transcribed: {transcribed_text}\n\nResponse: {response_text}"
                
                audio_input.change(process_audio, [audio_input], [msg])
    
    return demo

# Create and mount the Gradio app
gradio_app = create_gradio_app()
app = gr.mount_gradio_app(app, gradio_app, path="/gradio")

if __name__ == "__main__":
    # Run the FastAPI app
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting web chat server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)