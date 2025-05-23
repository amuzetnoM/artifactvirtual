"""
Web Chat Server for Artifact Virtual RAG System

This module provides a web interface for interacting with the Workspace RAG system.
It uses FastAPI for the backend API and Gradio for the chat UI.
"""

import os
import logging
import gradio as gr
from fastapi import FastAPI, Request
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
app = FastAPI(title="Artifact Virtual RAG", description="Chat with Artifact Virtual's RAG system")

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
# Get LLM model from config or environment
from rag_config import RAG_CONFIG
llm_model = RAG_CONFIG.get("llm_model") or os.environ.get("LLM_MODEL", "qwen3")

# Create static files directory if it doesn't exist
os.makedirs(os.path.join(workspace_path, "static"), exist_ok=True)

# Create templates directory if it doesn't exist
templates_dir = os.path.join(workspace_path, "templates")
os.makedirs(templates_dir, exist_ok=True)

# Create a basic HTML template for embedding the chat interface
with open(os.path.join(templates_dir, "chat.html"), "w", encoding="utf-8") as f:
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
                background-color: #121212;
            }
            .container {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
                background-color: #121212;
            }
            .header {
                display: none; /* Hide the header completely */
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
            <!-- Removed header completely -->
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
logger.info("Initializing RAG with model %s and workspace %s", llm_model, workspace_path)
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
        # Log incoming message for debugging
        logger.info(f"Received message: '{message}'")
        logger.info(f"Current history: {history}")
        
        # Check if the message is a tool command
        if message.startswith("/tool "):
            parts = message[6:].strip().split(" ", 1)
            if len(parts) == 2:
                tool_name, args = parts
                if tool_name in rag.list_tools():
                    result = rag.execute_tool(tool_name, expression=args)
                    logger.info(f"Tool result: {result}")
                    history.append((message, result))
                    return history
                else:
                    result = f"Tool '{tool_name}' not found. Available tools: {', '.join(rag.list_tools().keys())}"
                    logger.info(f"Tool not found: {result}")
                    history.append((message, result))
                    return history
            else:
                result = f"Usage: /tool [tool_name] [arguments]. Available tools: {', '.join(rag.list_tools().keys())}"
                logger.info(f"Invalid tool format: {result}")
                history.append((message, result))
                return history
        
        # Regular RAG query
        logger.info("Processing as regular RAG query")
        response = rag.query(message)
        logger.info(f"RAG response: {response[:100]}...")  # Log first 100 chars of response
        
        # Update history with the new message pair
        history.append((message, response))
        return history
    except Exception as e:
        logger.error(f"Error handling chat message: {str(e)}", exc_info=True)
        history.append((message, f"Error: {str(e)}"))
        return history

# Create Gradio chat interface
def create_gradio_app():
    """Create and configure the Gradio chat interface."""
    # Add custom CSS to force dark mode in the Gradio interface
    custom_css = """
    body, .gradio-container {
        background-color: #121212 !important;
        color: white !important;
    }
    
    h1, h2, h3, p {
        color: white !important;
    }
    
    .dark\:bg-gray-950, .dark\:text-gray-50 {
        background-color: #121212 !important;
        color: white !important;
    }
    
    .footer {
        background-color: #121212 !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #888 !important;
    }
    
    input, textarea, button {
        background-color: #2d2d2d !important;
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    /* Remove any purple accent colors */
    .gradio-container *, .primary-500, [style*="rgb(79, 70, 229)"] {
        color: white !important;
    }
    
    h2 {
        color: #000 !important;
    }
    """
    
    with gr.Blocks(css=custom_css, theme=gr.themes.Soft(
        primary_hue="gray",
        secondary_hue="gray",
        neutral_hue="gray",
        spacing_size="sm",
        radius_size="sm",
        text_size="md"
    )) as demo:
        gr.Markdown("## Artifact Virtual RAG Chat", elem_id="title")
        gr.Markdown("Ask questions about the workspace or use tools with `/tool [tool_name] [args]`")
        
        chatbot = gr.Chatbot(height=500)
        msg = gr.Textbox(placeholder="Enter your message...")
        clear = gr.Button("Clear")
        
        # Handle chat
        msg.submit(handle_chat, [msg, chatbot], [chatbot])
        
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
    
    return demo

# Create and mount the Gradio app
gradio_app = create_gradio_app()
app = gr.mount_gradio_app(app, gradio_app, path="/gradio")

if __name__ == "__main__":
    # Run the FastAPI app
    port = int(os.environ.get("PORT", 3010))  # Changed default port to 3010
    host = os.environ.get("HOST", "0.0.0.0")
    logger.info("Starting web chat server on %s:%s", host, port)
    logger.info("Web chat UI available at: http://localhost:%s (open in your browser)", port)
    print("\n==============================")
    print(f"Artifact Virtual Web Chat running!")
    print(f"Access the chat UI at: http://localhost:{port}")
    print("==============================\n")
    uvicorn.run(app, host=host, port=port)