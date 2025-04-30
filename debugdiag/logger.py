import logging
import os

LOG_DIR = os.path.join(os.getcwd(), ".logs")
LOG_FILE = os.path.join(LOG_DIR, "debug.log")

def setup_logger():
    os.makedirs(LOG_DIR, exist_ok=True)
    logger = logging.getLogger("debugdiag")
    if not logger.handlers:
        handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
        fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
        handler.setFormatter(fmt)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)
    return logger
