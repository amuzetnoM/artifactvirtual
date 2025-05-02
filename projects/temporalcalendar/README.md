# 🌀 TheTemporalCalendar

The **Fibonacci-aware Artifact Calendar** — a CLI tool that lets you explore symbolic Fibonacci dates and visually map them in calendar views. Built with Python using Typer and Rich.

## ✨ Features

*   Describe any date in a unique Artifact + Fibonacci format (e.g., `A1W25-FibGap(11→12)-D119`).
*   View monthly calendars with days corresponding to Fibonacci days-of-the-year highlighted.

## 📦 Installation

1.  Navigate to the `temporalcalendar` directory in your terminal.
2.  Install the package and its dependencies:
    ```bash
    pip install .
    ```
    This will make the `thetemporalcalendar` command available.

## 🔧 Commands

*   `thetemporalcalendar describe <dd/mm/yyyy>`
    *   Calculates the day of the year (DOY).
    *   Outputs the date in the format `A1W<YY>-FibF(<N>)-D<DOY>` if the DOY is the Nth Fibonacci number.
    *   Outputs `A1W<YY>-FibGap(<A>→<B>)-D<DOY>` if the DOY falls between the Ath and Bth Fibonacci numbers.
*   `thetemporalcalendar calendar [--month M] [--year Y]`
    *   Shows a calendar for the specified month M and year Y.
    *   Defaults to the current month and year if not specified.
    *   Highlights days where the day of the year is a Fibonacci number.

## 🚀 Examples

**Describe a date:**

```bash
$ thetemporalcalendar describe 29/04/2025
🧭 Artifact Date: A1W25-FibGap(11→12)-D119
```

**Show the calendar for April 2025:**

```bash
$ thetemporalcalendar calendar --month 4 --year 2025
# (Output will be a formatted calendar table with relevant days highlighted)
```

---

Crafted by ArtifactVirtual — *for those who believe time has meaning.*