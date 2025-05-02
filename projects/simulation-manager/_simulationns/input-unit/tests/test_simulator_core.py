import sys
import os
import unittest
import numpy as np
from unittest.mock import patch

# Add parent directory to path to import simulator
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from inputunit import EnhancedInputUnitSimulator

class TestSimulatorCore(unittest.TestCase):
    """Test core functionality of the EnhancedInputUnitSimulator"""
    
    def setUp(self):
        """Set up a simulator instance before each test"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
    
    def test_initialization(self):
        """Test simulator initialization with default parameters"""
        self.assertEqual(self.simulator.acceptable_error_threshold, 0.05)
        self.assertEqual(self.simulator.adjustment_step, 0.001)
        self.assertEqual(self.simulator.retry_attempt_limit, 3)
        self.assertEqual(self.simulator.window_size, 100)
        self.assertEqual(self.simulator.error_count, 0)
        self.assertEqual(self.simulator.operation_count, 0)
        self.assertEqual(len(self.simulator.history_error_rates), 0)
        
    def test_process_data_success(self):
        """Test processing data with no error"""
        with patch('random.random', return_value=0.5):  # Ensure no error
            result = self.simulator.process_data(0.3)
            self.assertTrue(result)  # Operation should succeed
            self.assertEqual(self.simulator.operation_count, 1)
            self.assertEqual(self.simulator.error_count, 0)
    
    def test_process_data_error_with_successful_retry(self):
        """Test processing data with error but successful retry"""
        random_values = [0.2, 0.4]  # First value causes error, second retry succeeds
        with patch('random.random', side_effect=lambda: random_values.pop(0) if random_values else 0.5):
            result = self.simulator.process_data(0.3)
            self.assertTrue(result)  # Operation should succeed after retry
            self.assertEqual(self.simulator.operation_count, 1)
            self.assertEqual(self.simulator.error_count, 1)
            self.assertEqual(self.simulator.successful_retries, 1)
            self.assertEqual(self.simulator.total_retry_attempts, 1)
    
    def test_process_data_error_with_failed_retry(self):
        """Test processing data with error and all retries fail"""
        # All random values below error threshold of 0.3 to ensure all retries fail
        random_values = [0.2, 0.1, 0.15, 0.25]
        with patch('random.random', side_effect=lambda: random_values.pop(0) if random_values else 0.5):
            result = self.simulator.process_data(0.3)
            self.assertFalse(result)  # Operation should fail
            self.assertEqual(self.simulator.operation_count, 1)
            self.assertEqual(self.simulator.error_count, 1)
            self.assertEqual(self.simulator.failed_retries, 1)
            self.assertEqual(self.simulator.total_retry_attempts, 3)  # Default retry limit is 3
    
    def test_error_rate_calculation(self):
        """Test error rate calculation"""
        # Process multiple operations with varying outcomes
        with patch('random.random', side_effect=[0.1, 0.6, 0.2, 0.6, 0.9]):
            self.simulator.process_data(0.5)  # Error 
            self.simulator.process_data(0.5)  # No error
            self.simulator.process_data(0.5)  # Error
            self.simulator.process_data(0.5)  # No error
            self.simulator.process_data(0.5)  # No error
            
            # Expected error rate is 2/5 = 0.4
            self.assertAlmostEqual(self.simulator._calculate_current_error_rate(), 0.4)
    
    def test_update_history(self):
        """Test updating error rate history"""
        # Fill history with dummy values
        self.simulator.history_error_rates = [0.1] * (self.simulator.window_size - 1)
        self.simulator.error_count = self.simulator.window_size - 1
        self.simulator.operation_count = self.simulator.window_size - 1
        
        # Add one more
        self.simulator._update_history()
        
        # History size should still be within window
        self.assertEqual(len(self.simulator.history_error_rates), self.simulator.window_size)
        
        # Add one more to trigger window sliding
        self.simulator._update_history()
        
        # History size should be maintained at window size
        self.assertEqual(len(self.simulator.history_error_rates), self.simulator.window_size)
    
    def test_reset(self):
        """Test simulator reset"""
        # Process some data to change state
        with patch('random.random', return_value=0.2):
            for _ in range(10):
                self.simulator.process_data(0.3)
        
        # Values should have changed
        self.assertNotEqual(self.simulator.error_count, 0)
        self.assertNotEqual(self.simulator.operation_count, 0)
        self.assertNotEqual(len(self.simulator.history_error_rates), 0)
        
        # Reset simulator
        self.simulator.reset()
        
        # Values should be reset
        self.assertEqual(self.simulator.error_count, 0)
        self.assertEqual(self.simulator.operation_count, 0)
        self.assertEqual(len(self.simulator.history_error_rates), 0)

    def test_threshold_adjustment(self):
        """Test threshold adjustment logic"""
        # Save original threshold
        original_threshold = self.simulator.acceptable_error_threshold
        
        # Case 1: Error rate higher than threshold
        self.simulator.error_count = 15
        self.simulator.operation_count = 100
        # Error rate = 0.15, threshold = 0.05, so should increase
        self.simulator._adjust_threshold()
        self.assertGreater(self.simulator.acceptable_error_threshold, original_threshold)
        
        # Case 2: Error rate lower than threshold
        self.simulator.acceptable_error_threshold = 0.1
        self.simulator.error_count = 5
        self.simulator.operation_count = 100
        # Error rate = 0.05, threshold = 0.1, so should decrease
        self.simulator._adjust_threshold()
        self.assertLess(self.simulator.acceptable_error_threshold, 0.1)
    
    def test_retry_limit_adjustment(self):
        """Test retry limit adjustment logic"""
        # Save original retry limit
        original_retry_limit = self.simulator.retry_attempt_limit
        
        # Create conditions for increased retry limit
        self.simulator.error_count = 20
        self.simulator.operation_count = 100
        # Error rate = 0.2, higher than threshold, should increase retries
        self.simulator._adjust_retry_limit()
        
        # Retry limit should change based on error rate
        self.assertNotEqual(self.simulator.retry_attempt_limit, original_retry_limit)
        
    def test_metrics_capture(self):
        """Test metrics collection"""
        # Process data with various outcomes
        with patch('random.random', side_effect=[0.1, 0.6, 0.1, 0.1, 0.1, 0.7, 0.8]):
            self.simulator.process_data(0.5)  # Error, retry success
            self.simulator.process_data(0.5)  # No error
            self.simulator.process_data(0.3)  # Error, all retries fail
            
        metrics = self.simulator.get_metrics()
        
        # Verify essential metrics are captured
        self.assertIn("current_error_rate", metrics)
        self.assertIn("acceptable_threshold", metrics)
        self.assertIn("retry_limit", metrics)
        self.assertIn("efficiency_score", metrics)
        self.assertIn("total_cost", metrics)
        self.assertIn("cost_per_operation", metrics)
        
if __name__ == '__main__':
    unittest.main()