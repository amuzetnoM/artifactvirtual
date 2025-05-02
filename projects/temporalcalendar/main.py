import typer
from cli.calendar import show_calendar
from cli.describe import describe_date

app = typer.Typer(help="🌀 TheTemporalCalendar — The Fibonacci-aware Artifact Calendar CLI")

@app.command()
def describe(date: str):
    """Describe a date in Artifact + Fibonacci format."""
    describe_date(date)

@app.command()
def calendar(month: int = None, year: int = None):
    """Show a calendar with Fibonacci days highlighted."""
    show_calendar(month, year)

if __name__ == "__main__":
    app()