# Main entry point for Cockpit Orchestrator
from .orchestrator import CockpitOrchestrator

if __name__ == "__main__":
    orchestrator = CockpitOrchestrator()
    orchestrator.run()
