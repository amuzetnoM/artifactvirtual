#!/usr/bin/env python3
"""
WELCOME TO ADE

"""

import os
import socket
import platform
from datetime import datetime

import click
import psutil
from rich.console import Console
from rich.table import Table

from logger import setup_logger

console = Console()
logger = setup_logger()


@click.group()
def cli():
    """Artifact CLI - diagnostics, environment setup, and DevContainer bootstrap"""
    pass


# --------------------
# PROJECT STATUS
# --------------------
@cli.group()
def project():
    """System and project status"""
    pass


@project.command()
def status():
    """Show current system and project environment"""
    table = Table(title="ArtifactVirtual Environment")
    table.add_column("Property", style="cyan")
    table.add_column("Value", style="magenta")

    table.add_row("OS", platform.system())
    table.add_row("Python", platform.python_version())
    table.add_row("Hostname", socket.gethostname())
    table.add_row("CPU Cores", str(psutil.cpu_count()))
    table.add_row("Memory (GB)", f"{psutil.virtual_memory().total / 1e9:.2f}")
    table.add_row("Uptime", str(datetime.now() - datetime.fromtimestamp(psutil.boot_time())))

    try:
        import torch
        cuda = torch.cuda.is_available()
        name = torch.cuda.get_device_name(0) if cuda else "None"
        table.add_row("CUDA", f"{cuda} ({name})")
    except ImportError:
        table.add_row("CUDA", "torch not installed")

    console.print(table)
    logger.info("Checked system status")


# --------------------
# DIAGNOSE
# --------------------
@cli.group()
def diagnose():
    """Diagnose tools (ping, env, etc)"""
    pass


@diagnose.command()
@click.option("--host", default="8.8.8.8", help="Host to ping")
def ping(host):
    """Ping a network host"""
    success = os.system(f"ping -c 1 {host} > /dev/null 2>&1")
    if success == 0:
        console.print(f"[green]✓ Reachable:[/] {host}")
    else:
        console.print(f"[red]✗ Unreachable:[/] {host}")
    logger.info(f"Ping test: {host} — {'Success' if success == 0 else 'Fail'}")


# --------------------
# LOGS
# --------------------
@cli.group()
def logs():
    """Log management"""
    pass


@logs.command("show")
@click.option("--lines", default=20, help="Number of lines to show")
def show_logs(lines):
    """Show recent log entries"""
    logfile = logger.handlers[0].baseFilename
    if not os.path.exists(logfile):
        console.print("[red]Log file not found[/]")
        return
    with open(logfile, "r") as f:
        for line in f.readlines()[-lines:]:
            console.print(line.rstrip())
    logger.info("Viewed logs")


@logs.command("clear")
def clear_logs():
    """Clear all logs"""
    logfile = logger.handlers[0].baseFilename
    open(logfile, "w").close()
    console.print("[yellow]Log file cleared[/]")
    logger.info("Logs cleared")


# --------------------
# BOOTSTRAP (DevContainer entrypoint)
# --------------------
@cli.command()
def bootstrap():
    """Initialize the development environment"""
    console.rule("[bold cyan]Artifact DevContainer Bootstrap")
    logger.info("Starting bootstrap")

    # Example checks
    os.makedirs("/workspace/.data", exist_ok=True)
    console.print("[green]✓ Workspace folders verified")
    logger.info("Created /workspace/.data")

    # Future: load models, init DB, etc
    console.print("[green]✓ Bootstrap complete")
    logger.info("Bootstrap finished")


# --------------------
# MAIN ENTRY
# --------------------
if __name__ == "__main__":
    cli()
