from rich.text import Text

def highlight_day(day, is_fib):
    if is_fib:
        return Text(str(day), style="bold yellow")
    return Text(str(day), style="dim")