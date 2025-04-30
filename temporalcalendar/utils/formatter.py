from datetime import datetime
from utils.fib import get_fib_gap

def artifact_fib_date(date_str):
    dt = datetime.strptime(date_str, "%d/%m/%Y")
    year = dt.year % 100
    doy = dt.timetuple().tm_yday
    a, b = get_fib_gap(doy)
    if a == b:
        return f"A1W{year}-FibF({a})-D{doy}"
    else:
        return f"A1W{year}-FibGap({a}→{b})-D{doy}"