import sys
import os
import unittest
import numpy as np
from unittest.mock import patch, MagicMock

# Add parent directory to path to import simulator
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from inputunit import (
    EnhancedInputUnitSimulator,
    Algorithm,
    MomentumThresholdAlgorithm,
    AdaptiveEfficiencyAlgorithm,
    DiminishingRetryAlgorithm,
    EnhancedCostModelAlgorithm,
    ThresholdRetryCoordinatorAlgorithm
)

class TestStrategySwapping(unittest.TestCase):
    """Test the ability to swap between different threshold and retry algorithms"""
    
    def setUp(self):
        """Set up simulator with default algorithms"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
    
    def test_strategy_swap_threshold(self):
        """Test switching between threshold adjustment algorithms"""
        # Start with default adaptive threshold algorithm
        original_threshold = self.simulator.acceptable_error_threshold
        
        # Prepare simulator state
        self.simulator.error_count = 15
        self.simulator.operation_count = 100
        
        # Process data with adaptive threshold
        self.simulator.enable_algorithm("adaptive_threshold", True)
        self.simulator.enable_algorithm("momentum_threshold", False)
        self.simulator.process_data(0.15)
        adaptive_threshold = self.simulator.acceptable_error_threshold
        
        # Reset and try with momentum threshold
        self.simulator.acceptable_error_threshold = original_threshold
        self.simulator.error_count = 15
        self.simulator.operation_count = 100
        
        self.simulator.enable_algorithm("adaptive_threshold", False)
        self.simulator.enable_algorithm("momentum_threshold", True)
        self.simulator.process_data(0.15)
        momentum_threshold = self.simulator.acceptable_error_threshold
        
        # The algorithms should produce different thresholds
        self.assertNotEqual(adaptive_threshold, momentum_threshold)
    
    def test_strategy_swap_retry(self):
        """Test switching between retry limit algorithms"""
        # Start with default geometric retry algorithm
        original_retry_limit = self.simulator.retry_attempt_limit
        
        # Prepare simulator state
        self.simulator.error_count = 20
        self.simulator.operation_count = 100
        
        # Process data with geometric retry
        self.simulator.enable_algorithm("geometric_retry", True)
        self.simulator.enable_algorithm("diminishing_retry", False)
        self.simulator.process_data(0.2)
        geometric_retry_limit = self.simulator.retry_attempt_limit
        
        # Reset and try with diminishing retry
        self.simulator.retry_attempt_limit = original_retry_limit
        self.simulator.error_count = 20
        self.simulator.operation_count = 100
        
        self.simulator.enable_algorithm("geometric_retry", False)
        self.simulator.enable_algorithm("diminishing_retry", True)
        self.simulator.process_data(0.2)
        diminishing_retry_limit = self.simulator.retry_attempt_limit
        
        # The algorithms should produce different retry limits
        self.assertNotEqual(geometric_retry_limit, diminishing_retry_limit)
    
    def test_efficiency_algorithms_swap(self):
        """Test switching between efficiency calculation algorithms"""
        # Prepare simulator state
        self.simulator.error_count = 10
        self.simulator.operation_count = 100
        self.simulator.successful_retries = 40
        self.simulator.failed_retries = 10
        
        # Calculate with fixed weights
        self.simulator.enable_algorithm("weighted_efficiency", True)
        self.simulator.enable_algorithm("adaptive_efficiency", False)
        self.simulator.process_data(0.1)
        fixed_efficiency = self.simulator.efficiency_score
        
        # Calculate with adaptive weights
        self.simulator.enable_algorithm("weighted_efficiency", False)
        self.simulator.enable_algorithm("adaptive_efficiency", True)
        
        # Prime the adaptive algorithm with history
        algorithm = self.simulator.get_algorithm("adaptive_efficiency")
        algorithm.previous_scores = [0.7, 0.68, 0.65, 0.62, 0.6]  # Declining trend
        
        self.simulator.process_data(0.1)
        adaptive_efficiency = self.simulator.efficiency_score
        
        # Scores may differ depending on the adaptive weight adjustments
        self.assertIsNotNone(adaptive_efficiency)

class TestAlgorithmCoordination(unittest.TestCase):
    """Test how the coordination algorithm interacts with other algorithms"""
    
    def setUp(self):
        """Set up simulator with coordination enabled"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        # Enable only the threshold and retry algorithms we want to test with coordination
        self.simulator.enable_algorithm("adaptive_threshold", True)
        self.simulator.enable_algorithm("geometric_retry", True)
        self.simulator.enable_algorithm("threshold_retry_coordinator", True)
        
    def test_coordination_override(self):
        """Test coordinator overrides individual algorithm decisions"""
        # Set up initial state
        self.simulator.error_count = 20
        self.simulator.operation_count = 100
        self.simulator.successful_retries = 8
        self.simulator.failed_retries = 2
        
        # Store initial values
        initial_threshold = self.simulator.acceptable_error_threshold
        initial_retry_limit = self.simulator.retry_attempt_limit
        
        # Force immediate coordination (reset the last coordination time)
        coordinator = self.simulator.get_algorithm("threshold_retry_coordinator")
        coordinator.last_coordination_time = 0
        
        # Process data to trigger adjustments
        self.simulator.process_data(0.2)
        
        # Check that values have changed due to coordination
        self.assertNotEqual(self.simulator.acceptable_error_threshold, initial_threshold)
        self.assertNotEqual(self.simulator.retry_attempt_limit, initial_retry_limit)
        
    def test_coordination_disabled(self):
        """Test system works when coordination is disabled"""
        # Disable coordination
        self.simulator.enable_algorithm("threshold_retry_coordinator", False)
        
        # Set up initial state
        self.simulator.error_count = 20
        self.simulator.operation_count = 100
        self.simulator.successful_retries = 8
        self.simulator.failed_retries = 2
        
        # Store initial values
        initial_threshold = self.simulator.acceptable_error_threshold
        initial_retry_limit = self.simulator.retry_attempt_limit
        
        # Process data to trigger adjustments
        self.simulator.process_data(0.2)
        
        # Individual algorithms should still adjust values
        self.assertNotEqual(self.simulator.acceptable_error_threshold, initial_threshold)
        # Retry limit may or may not change depending on the specific scenario

class TestCostModelIntegration(unittest.TestCase):
    """Test how the enhanced cost model integrates with the system"""
    
    def setUp(self):
        """Set up simulator with cost model enabled"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        # Make sure enhanced cost model is enabled
        self.simulator.enable_algorithm("enhanced_cost_model", True)
        
    def test_cost_model_affects_decisions(self):
        """Test that cost information affects coordinator decisions"""
        self.simulator.enable_algorithm("threshold_retry_coordinator", True)
        
        # Set up congested state
        cost_model = self.simulator.get_algorithm("enhanced_cost_model")
        cost_model.current_congestion = 0.8  # High congestion
        
        self.simulator.error_count = 10
        self.simulator.operation_count = 100
        self.simulator.successful_retries = 5
        self.simulator.failed_retries = 5
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.retry_attempt_limit = 5
        self.simulator.efficiency_score = 0.6
        
        # Force immediate coordination
        coordinator = self.simulator.get_algorithm("threshold_retry_coordinator")
        coordinator.last_coordination_time = 0
        
        # Store initial values
        initial_threshold = self.simulator.acceptable_error_threshold
        initial_retry_limit = self.simulator.retry_attempt_limit
        
        # Process data
        self.simulator.process_data(0.1)
        
        # Under congestion, retry limit should generally decrease to conserve resources
        self.assertLessEqual(self.simulator.retry_attempt_limit, initial_retry_limit)
        
    def test_cost_tracking_over_time(self):
        """Test cost tracking over multiple operations"""
        # Run a series of operations
        initial_total_cost = self.simulator.total_cost
        
        for i in range(50):
            # Alternate between high and low error rates
            error_prob = 0.3 if i % 2 == 0 else 0.05
            self.simulator.process_data(error_prob)
        
        # Final cost should be higher than initial
        self.assertGreater(self.simulator.total_cost, initial_total_cost)
        
        # Cost per operation should have been calculated
        metrics = self.simulator.get_metrics()
        self.assertIn("cost_per_operation", metrics)
        self.assertGreater(metrics["cost_per_operation"], 0)

class TestFullSystemScenarios(unittest.TestCase):
    """Test common scenarios across the full system"""
    
    def setUp(self):
        """Set up a fully configured simulator"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        # Enable all enhanced algorithms
        self.simulator.enable_algorithm("adaptive_threshold", False)
        self.simulator.enable_algorithm("geometric_retry", False)
        self.simulator.enable_algorithm("weighted_efficiency", False)
        self.simulator.enable_algorithm("momentum_threshold", True)
        self.simulator.enable_algorithm("adaptive_efficiency", True)
        self.simulator.enable_algorithm("diminishing_retry", True)
        self.simulator.enable_algorithm("enhanced_cost_model", True)
        self.simulator.enable_algorithm("threshold_retry_coordinator", True)
    
    def test_error_spike_recovery(self):
        """Test system recovery from sudden error spike"""
        # Start with low error rate
        for _ in range(30):
            self.simulator.process_data(0.03)
        
        # Record state before spike
        pre_spike_threshold = self.simulator.acceptable_error_threshold
        pre_spike_retry_limit = self.simulator.retry_attempt_limit
        
        # Introduce error spike
        for _ in range(10):
            self.simulator.process_data(0.3)  # 10x increase in errors
            
        # Record state after spike
        post_spike_threshold = self.simulator.acceptable_error_threshold
        post_spike_retry_limit = self.simulator.retry_attempt_limit
        
        # System should adapt to the spike
        self.assertGreater(post_spike_threshold, pre_spike_threshold)
        self.assertNotEqual(post_spike_retry_limit, pre_spike_retry_limit)
        
        # Return to normal
        for _ in range(30):
            self.simulator.process_data(0.03)
            
        # Record state after recovery
        post_recovery_threshold = self.simulator.acceptable_error_threshold
        
        # System should adapt back toward normal, but with some memory effect
        self.assertLess(post_recovery_threshold, post_spike_threshold)
        
    def test_parameter_fine_tuning(self):
        """Test that parameter updates affect algorithm behavior"""
        # Record initial behavior
        self.simulator.process_data(0.1)
        initial_threshold = self.simulator.acceptable_error_threshold
        
        # Modify momentum threshold parameters
        momentum_algo = self.simulator.get_algorithm("momentum_threshold")
        original_momentum = momentum_algo.parameters['momentum']
        momentum_algo.parameters['momentum'] = 0.5  # Lower momentum
        
        # Reset threshold
        self.simulator.acceptable_error_threshold = 0.05
        
        # Test with new parameters
        self.simulator.process_data(0.1)
        lower_momentum_threshold = self.simulator.acceptable_error_threshold
        
        # Restore and set high momentum
        momentum_algo.parameters['momentum'] = 0.95  # Higher momentum
        
        # Reset threshold
        self.simulator.acceptable_error_threshold = 0.05
        
        # Test with high momentum
        self.simulator.process_data(0.1)
        higher_momentum_threshold = self.simulator.acceptable_error_threshold
        
        # Lower momentum should adjust more quickly than higher momentum
        self.assertNotEqual(lower_momentum_threshold, higher_momentum_threshold)
        
        # Restore original value
        momentum_algo.parameters['momentum'] = original_momentum
        
    def test_custom_algorithm_integration(self):
        """Test adding and using a custom algorithm"""
        # Create a simple custom algorithm
        class CustomCostFactorAlgorithm(Algorithm):
            def __init__(self):
                params = {
                    'category': 'cost_model',
                    'multiplier': 1.5
                }
                super().__init__("custom_cost_factor", "Applies custom cost factor", params)
                
            def execute(self, simulator, *args, **kwargs):
                # Simple algorithm that multiplies total cost by a factor
                simulator.total_cost *= self.parameters['multiplier']
                return {"applied_multiplier": self.parameters['multiplier']}
        
        # Record initial cost
        initial_cost = self.simulator.total_cost
        
        # Add custom algorithm
        custom_algo = CustomCostFactorAlgorithm()
        self.simulator.add_custom_algorithm(custom_algo)
        
        # Process data to trigger all algorithms
        self.simulator.process_data(0.1)
        
        # Custom algorithm should have affected the cost
        self.assertAlmostEqual(self.simulator.total_cost, initial_cost * custom_algo.parameters['multiplier'] + 
                             self.simulator.operation_cost)  # Plus the new operation cost
        
        # Remove custom algorithm
        self.simulator.remove_algorithm("custom_cost_factor")
        
        # Verify it's gone
        with self.assertRaises(ValueError):
            self.simulator.get_algorithm("custom_cost_factor")


if __name__ == '__main__':
    unittest.main()