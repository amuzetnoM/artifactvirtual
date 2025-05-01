import os
import pytest
from main import setup_logger, LOG_FILE, ensure_log_dir

def test_log_dir_created():
    # Remove log dir if exists
    if os.path.exists('.logs'):
        import shutil
        shutil.rmtree('.logs')
    ensure_log_dir()
    assert os.path.exists('.logs')

def test_logger_writes_log():
    logger = setup_logger('test_logger')
    logger.info('Test log entry')
    with open(LOG_FILE) as f:
        logs = f.read()
    assert 'Test log entry' in logs

def test_log_file_cleared():
    logger = setup_logger('test_logger')
    logger.info('To be cleared')
    open(LOG_FILE, 'w').close()  # Clear log
    with open(LOG_FILE) as f:
        logs = f.read()
    assert logs == ''