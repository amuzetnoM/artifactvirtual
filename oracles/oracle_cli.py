# oracles/oracle_cli.py
import os
import sys
import traceback
import importlib
from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from langchain.llms import Ollama
from langchain.chains import SimpleSequentialChain
try:
    from langgraph.graph import StateGraph
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
try:
    import dspy
    DS_PY_AVAILABLE = True
except ImportError:
    DS_PY_AVAILABLE = False

console = Console()

MODELS = {
    "phi4-mini": lambda: Ollama(model="phi4-mini"),
    "gemma3": lambda: Ollama(model="gemma3"),
    "llava": lambda: Ollama(model="llava"),
}

# --- Utility: Dependency Checker ---
def check_and_install_dependency(module_name, pip_name=None):
    try:
        importlib.import_module(module_name)
        return True
    except ImportError:
        console.print(f"[yellow]Dependency '{module_name}' not found.[/yellow]")
        if Confirm.ask(f"Install '{pip_name or module_name}' now via pip?"):
            import subprocess
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name or module_name])
                console.print(f"[green]Installed '{pip_name or module_name}'. Please restart the CLI if issues persist.[/green]")
                return True
            except Exception as e:
                console.print(f"[red]Failed to install '{pip_name or module_name}': {e}[/red]")
        return False

# --- Plugin System for Extensibility ---
PLUGINS = {}
PLUGINS_PATH = os.path.join(os.path.dirname(__file__), "plugins")
if os.path.isdir(PLUGINS_PATH):
    sys.path.append(PLUGINS_PATH)
    for fname in os.listdir(PLUGINS_PATH):
        if fname.endswith(".py") and not fname.startswith("_"):
            modname = fname[:-3]
            try:
                mod = importlib.import_module(modname)
                PLUGINS[modname] = mod
                console.print(f"[green]Loaded plugin: {modname}[/green]")
            except Exception as e:
                console.print(f"[red]Failed to load plugin {modname}: {e}[/red]")

def print_header():
    console.print(Panel(Text("[b cyan]🧙 Oracle CLI: Multimodal LLM Playground[/b cyan]", justify="center"), style="bold magenta"))
    console.print("[green]Available models:[/green] phi4-mini, gemma3, llava\n")
    console.print("[yellow]Type 'exit' at any prompt to quit.[/yellow]\n")

def select_model():
    table = Table(title="Select a Model")
    table.add_column("Key", style="cyan", no_wrap=True)
    table.add_column("Model Name", style="magenta")
    for i, k in enumerate(MODELS.keys(), 1):
        table.add_row(str(i), k)
    console.print(table)
    while True:
        choice = Prompt.ask("Enter model key (1/2/3)")
        if choice.lower() == "exit":
            sys.exit(0)
        if choice in [str(i) for i in range(1, len(MODELS)+1)]:
            return list(MODELS.keys())[int(choice)-1]
        console.print("[red]Invalid choice. Try again.[/red]")

def chat_with_model(model_name):
    llm = MODELS[model_name]()
    console.print(Panel(f"[b]Chatting with [cyan]{model_name}[/cyan][/b]", style="blue"))
    while True:
        user_input = Prompt.ask("[bold green]You[/bold green]")
        if user_input.lower() == "exit":
            break
        try:
            response = llm.invoke(user_input)
            console.print(Panel(response, title=f"[b]{model_name}[/b]", style="magenta"))
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
            traceback.print_exc()

def chain_phi4_gemma3():
    phi4 = MODELS["phi4-mini"]()
    gemma = MODELS["gemma3"]()
    chain = SimpleSequentialChain(llms=[phi4, gemma])
    console.print(Panel("[b]Chaining: phi4-mini ➔ gemma3[/b]", style="yellow"))
    while True:
        user_input = Prompt.ask("[bold green]You[/bold green] (for chain)")
        if user_input.lower() == "exit":
            break
        try:
            result = chain.run(user_input)
            console.print(Panel(result, title="[b]Chain Output[/b]", style="magenta"))
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
            traceback.print_exc()

def multimodal_llava_gemma3():
    from PIL import Image
    llava = MODELS["llava"]()
    gemma = MODELS["gemma3"]()
    console.print(Panel("[b]Multimodal: LLaVA (image+text) ➔ Gemma-3[/b]", style="yellow"))
    while True:
        img_path = Prompt.ask("Enter image path (or 'exit')")
        if img_path.lower() == "exit":
            break
        if not os.path.exists(img_path):
            console.print("[red]File not found. Try again.[/red]")
            continue
        # --- Image Validation ---
        try:
            with Image.open(img_path) as img:
                img.verify()  # Validate image
        except Exception as e:
            console.print(f"[red]Invalid image file: {e}[/red]")
            continue
        prompt = Prompt.ask("Enter prompt for LLaVA (or 'exit')")
        if prompt.lower() == "exit":
            break
        try:
            image_description = llava.run(image=img_path, prompt=prompt)
            story = gemma.run(prompt=f"Write a story based on: {image_description}")
            console.print(Panel(story, title="[b]Gemma-3 Story[/b]", style="magenta"))
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
            traceback.print_exc()

def langgraph_demo():
    if not LANGGRAPH_AVAILABLE:
        console.print("[red]LangGraph is not installed. Skipping demo.[/red]")
        if check_and_install_dependency("langgraph"):
            console.print("[green]LangGraph installed. Please restart the CLI to use this feature.[/green]")
        else:
            console.print("[yellow]You can install it manually: pip install langgraph[/yellow]")
        return
    console.print(Panel("[b]LangGraph Demo (placeholder)[/b]", style="yellow"))
    console.print("[yellow]You can implement custom workflows here using LangGraph.[/yellow]")

def dspy_demo():
    if not DS_PY_AVAILABLE:
        console.print("[red]DSPy is not installed. Skipping demo.[/red]")
        if check_and_install_dependency("dspy", "dspy-ai"):
            console.print("[green]DSPy installed. Please restart the CLI to use this feature.[/green]")
        else:
            console.print("[yellow]You can install it manually: pip install dspy-ai[/yellow]")
        return
    console.print(Panel("[b]DSPy Demo (placeholder)[/b]", style="yellow"))
    console.print("[yellow]You can implement DSPy pipelines here.[/yellow]")

def main_menu():
    print_header()
    menu = Table(title="Main Menu")
    menu.add_column("Key", style="cyan", no_wrap=True)
    menu.add_column("Action", style="magenta")
    menu.add_row("1", "Chat with phi4-mini")
    menu.add_row("2", "Chat with gemma3")
    menu.add_row("3", "Chat with llava (text only)")
    menu.add_row("4", "Chain: phi4-mini ➔ gemma3 (LangChain)")
    menu.add_row("5", "Multimodal: LLaVA ➔ Gemma-3")
    menu.add_row("6", "LangGraph Workflow Demo")
    menu.add_row("7", "DSPy Workflow Demo")
    menu.add_row("0", "Exit")
    console.print(menu)
    # --- Plugin Menu ---
    if PLUGINS:
        console.print("[bold cyan]Plugins available:[/bold cyan] " + ", ".join(PLUGINS.keys()))
        for i, pname in enumerate(PLUGINS.keys(), 8):
            menu.add_row(str(i), f"Plugin: {pname}")
    while True:
        choice = Prompt.ask("Select an option")
        if choice == "0" or choice.lower() == "exit":
            console.print("[bold red]Goodbye![/bold red]")
            sys.exit(0)
        elif choice == "1":
            chat_with_model("phi4-mini")
        elif choice == "2":
            chat_with_model("gemma3")
        elif choice == "3":
            chat_with_model("llava")
        elif choice == "4":
            chain_phi4_gemma3()
        elif choice == "5":
            multimodal_llava_gemma3()
        elif choice == "6":
            langgraph_demo()
        elif choice == "7":
            dspy_demo()
        elif PLUGINS and choice in [str(i) for i in range(8, 8+len(PLUGINS))]:
            pname = list(PLUGINS.keys())[int(choice)-8]
            try:
                PLUGINS[pname].main(console=console)
            except Exception as e:
                console.print(f"[red]Plugin '{pname}' error: {e}[/red]")
                traceback.print_exc()
        else:
            console.print("[red]Invalid option. Try again.[/red]")

if __name__ == "__main__":
    main_menu()
