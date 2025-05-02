from utils.formatter import artifact_fib_date
from rich import print

def describe_date(date_str: str):
    try:
        result = artifact_fib_date(date_str)
        print(f"[bold green]🧭 Artifact Date:[/bold green] {result}")
    except Exception as e:
        print(f"[bold red]❌ Error:[/bold red] {e}")