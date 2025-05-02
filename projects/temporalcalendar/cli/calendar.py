import calendar
from datetime import datetime
from rich.console import Console
from rich.table import Table
from utils.fib import is_fibonacci
from utils.theming import highlight_day

def show_calendar(month=None, year=None):
    console = Console()
    now = datetime.now()
    year = year or now.year
    month = month or now.month

    cal = calendar.Calendar()
    month_days = cal.itermonthdays(year, month)
    day_of_year_offset = datetime(year, 1, 1).timetuple().tm_yday - 1

    table = Table(title=f"📅 {calendar.month_name[month]} {year}", show_lines=True)
    for day in ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]:
        table.add_column(day, justify="center")

    week = []
    for i, day in enumerate(month_days):
        if day == 0:
            week.append(" ")
        else:
            date_obj = datetime(year, month, day)
            day_of_year = date_obj.timetuple().tm_yday
            fib = is_fibonacci(day_of_year)
            week.append(highlight_day(day, fib))

        if len(week) == 7:
            table.add_row(*week)
            week = []

    if week:
        while len(week) < 7:
            week.append(" ")
        table.add_row(*week)

    console.print(table)