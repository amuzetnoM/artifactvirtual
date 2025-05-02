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

class TestAlgorithmBase(unittest.TestCase):
    """Test the base Algorithm class"""
    
    def test_algorithm_initialization(self):
        """Test creating an algorithm instance"""
        params = {'param1': 1.0, 'param2': 'value'}
        algorithm = Algorithm("test_algorithm", "Test Description", params)
        
        self.assertEqual(algorithm.name, "test_algorithm")
        self.assertEqual(algorithm.description, "Test Description")
        self.assertEqual(algorithm.parameters, params)
        self.assertTrue(algorithm.enabled)
    
    def test_parameter_getset(self):
        """Test getting and setting parameters"""
        params = {'param1': 1.0, 'param2': 'value'}
        algorithm = Algorithm("test_algorithm", "Test Description", params)
        
        # Get existing parameter
        self.assertEqual(algorithm.get_parameter("param1"), 1.0)
        
        # Set parameter
        algorithm.set_parameter("param1", 2.0)
        self.assertEqual(algorithm.get_parameter("param1"), 2.0)
        
        # Try to get non-existent parameter
        with self.assertRaises(ValueError):
            algorithm.get_parameter("nonexistent")
        
        # Try to set non-existent parameter
        with self.assertRaises(ValueError):
            algorithm.set_parameter("nonexistent", 10)
    
    def test_execute_not_implemented(self):
        """Test that execute method raises NotImplementedError"""
        algorithm = Algorithm("test_algorithm", "Test Description", {})
        
        with self.assertRaises(NotImplementedError):
            algorithm.execute(None)


class TestMomentumThresholdAlgorithm(unittest.TestCase):
    """Test MomentumThresholdAlgorithm implementation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        self.algorithm = MomentumThresholdAlgorithm()
    
    def test_initialization(self):
        """Test algorithm initialization"""
        self.assertEqual(self.algorithm.name, "momentum_threshold")
        self.assertEqual(self.algorithm.parameters['category'], "threshold_adjustment")
        self.assertIsNone(self.algorithm.smoothed_error_rate)
        self.assertEqual(self.algorithm.previous_adjustment, 0.0)
    
    def test_exponential_smoothing(self):
        """Test exponential smoothing of error rates"""
        # Mock simulator with error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        
        # First execution should initialize smoothed_error_rate
        self.algorithm.execute(self.simulator)
        self.assertEqual(self.algorithm.smoothed_error_rate, 0.1)
        
        # Change error rate and execute again
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.2)
        self.algorithm.execute(self.simulator)
        
        # Smoothed value should be between 0.1 and 0.2 based on smoothing_factor
        smoothing = self.algorithm.parameters['smoothing_factor']
        expected = smoothing * 0.1 + (1 - smoothing) * 0.2
        self.assertAlmostEqual(self.algorithm.smoothed_error_rate, expected)
    
    def test_momentum_application(self):
        """Test application of momentum to threshold adjustments"""
        # Mock simulator with specific error rate and threshold
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.history_error_rates = [0.08, 0.09, 0.1, 0.11, 0.09, 0.08, 0.1, 0.11, 0.1, 0.09]
        
        # First execution
        self.algorithm.execute(self.simulator)
        first_adjustment = self.algorithm.previous_adjustment
        
        # Error rate is higher than threshold, so adjustment should be positive
        self.assertGreater(first_adjustment, 0)
        
        # Execute again with same conditions
        self.algorithm.execute(self.simulator)
        second_adjustment = self.algorithm.previous_adjustment
        
        # Due to momentum, second adjustment should be affected by first
        # The difference should be smaller than if no momentum was applied
        momentum = self.algorithm.parameters['momentum']
        self.assertAlmostEqual(second_adjustment, 
                             (1 - momentum) * first_adjustment + momentum * first_adjustment)
    
    def test_threshold_stability_calculation(self):
        """Test threshold stability calculation"""
        # Mock simulator with history and prepare for stability calculation
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.history_error_rates = [0.09, 0.095, 0.1, 0.105, 0.09, 0.08, 0.085, 0.09, 0.095, 0.1]
        
        # Execute algorithm
        self.algorithm.execute(self.simulator)
        
        # Stability should be calculated based on variance and momentum
        # Higher stability when momentum is higher and variance is lower
        self.assertTrue(0 < self.simulator.threshold_stability <= 1.0)


class TestAdaptiveEfficiencyAlgorithm(unittest.TestCase):
    """Test AdaptiveEfficiencyAlgorithm implementation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        self.algorithm = AdaptiveEfficiencyAlgorithm()
    
    def test_initialization(self):
        """Test algorithm initialization"""
        self.assertEqual(self.algorithm.name, "adaptive_efficiency")
        self.assertEqual(self.algorithm.parameters['category'], "metrics")
        
        # Initial weights should match configuration
        self.assertEqual(self.algorithm.weights['error_rate'], 
                        self.algorithm.parameters['initial_error_rate_weight'])
        self.assertEqual(self.algorithm.weights['retry_success'], 
                        self.algorithm.parameters['initial_retry_success_weight'])
        self.assertEqual(self.algorithm.weights['threshold'], 
                        self.algorithm.parameters['initial_threshold_weight'])
    
    def test_efficiency_calculation(self):
        """Test basic efficiency calculation"""
        # Mock simulator methods used in efficiency calculation
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        self.simulator.successful_retries = 8
        self.simulator.failed_retries = 2
        self.simulator.acceptable_error_threshold = 0.12
        
        # Expected component scores
        error_rate_score = 1 - 0.1  # 0.9
        retry_success_score = 8 / (8 + 2)  # 0.8
        threshold_score = min(1.0, (0.12 + 0.001) / (0.1 + 0.001))  # 1.0
        
        # Expected weighted score based on algorithm's current weights
        expected_score = (
            self.algorithm.weights['error_rate'] * error_rate_score +
            self.algorithm.weights['retry_success'] * retry_success_score +
            self.algorithm.weights['threshold'] * threshold_score
        )
        
        # Execute algorithm
        result = self.algorithm.execute(self.simulator)
        
        # Verify results
        self.assertAlmostEqual(result, expected_score)
        self.assertAlmostEqual(self.simulator.efficiency_score, expected_score)
    
    def test_weight_adaptation(self):
        """Test weight adaptation for poor performance"""
        # Mock simulator to represent poor performance in error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.3)  # High error rate
        self.simulator.successful_retries = 8
        self.simulator.failed_retries = 2
        self.simulator.acceptable_error_threshold = 0.15
        self.simulator.efficiency_score = 0.4  # Below goal
        
        # Store initial weights
        initial_weights = self.algorithm.weights.copy()
        
        # Add previous scores history to trigger adaptation
        self.algorithm.previous_scores = [0.45, 0.44, 0.42, 0.41, 0.4]
        
        # Execute algorithm
        self.algorithm.execute(self.simulator)
        
        # Since error_rate is the weakest component, its weight should increase
        self.assertGreater(self.algorithm.weights['error_rate'], initial_weights['error_rate'])
        
        # Sum of weights should still be 1.0
        self.assertAlmostEqual(sum(self.algorithm.weights.values()), 1.0)
    
    def test_minimum_weight_enforcement(self):
        """Test minimum weight is enforced"""
        # Manually set weights to force adjustment
        self.algorithm.weights = {
            'error_rate': 0.1,
            'retry_success': 0.85,
            'threshold': 0.05  # At minimum already
        }
        
        # Mock simulator with scores that make retry_success strongest, threshold weakest
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        self.simulator.successful_retries = 95
        self.simulator.failed_retries = 5
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.efficiency_score = 0.45  # Below goal
        
        # Add previous scores history to trigger adaptation
        self.algorithm.previous_scores = [0.5, 0.48, 0.47, 0.46, 0.45]
        
        # Execute algorithm multiple times to force weight redistribution
        for _ in range(5):
            self.algorithm.execute(self.simulator)
        
        # Even with repeated adaptations, threshold weight should not go below min_weight
        self.assertGreaterEqual(self.algorithm.weights['threshold'], self.algorithm.min_weight)


class TestDiminishingRetryAlgorithm(unittest.TestCase):
    """Test DiminishingRetryAlgorithm implementation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        self.algorithm = DiminishingRetryAlgorithm()
    
    def test_initialization(self):
        """Test algorithm initialization"""
        self.assertEqual(self.algorithm.name, "diminishing_retry")
        self.assertEqual(self.algorithm.parameters['category'], "retry_adjustment")
        self.assertEqual(self.algorithm.parameters['target_success_probability'], 0.99)
    
    def test_diminishing_returns_model(self):
        """Test the diminishing returns retry model"""
        # For a given error rate, see how retry attempts are calculated
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.2)
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 10
        
        # Set adjustment speed to 1.0 for immediate change
        self.algorithm.parameters['adjustment_speed'] = 1.0
        
        # Execute algorithm
        retry_limit = self.algorithm.execute(self.simulator)
        
        # With 0.2 error rate and target 0.99 success, should need multiple retries
        self.assertGreater(retry_limit, 1)
        
        # Verify it's using our model by testing with higher error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.4)
        higher_retry_limit = self.algorithm.execute(self.simulator)
        
        # Higher error rate should require more retries
        self.assertGreater(higher_retry_limit, retry_limit)
    
    def test_fatigue_factor(self):
        """Test that retry fatigue increases error probability"""
        # Mock simulator with specific error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.3)
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 10
        
        # Increase fatigue factor to make effect more pronounced
        original_fatigue = self.algorithm.parameters['fatigue_factor']
        self.algorithm.parameters['fatigue_factor'] = 0.3
        
        # Execute algorithm
        retry_limit_high_fatigue = self.algorithm.execute(self.simulator)
        
        # Reset fatigue factor to 0 (no fatigue)
        self.algorithm.parameters['fatigue_factor'] = 0
        
        # Execute algorithm again
        retry_limit_no_fatigue = self.algorithm.execute(self.simulator)
        
        # With fatigue, retry limit should be higher as each retry is less effective
        self.assertGreater(retry_limit_high_fatigue, retry_limit_no_fatigue)
        
        # Restore original value
        self.algorithm.parameters['fatigue_factor'] = original_fatigue
    
    def test_gradual_adjustment(self):
        """Test gradual adjustment of retry limit"""
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.1)
        
        # Start with retry limit far from optimal
        self.simulator.retry_attempt_limit = 10
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 15
        
        # Set slow adjustment speed
        self.algorithm.parameters['adjustment_speed'] = 0.2
        
        # Execute algorithm
        self.algorithm.execute(self.simulator)
        
        # Retry limit should move toward optimal but not reach it immediately
        self.assertLess(self.simulator.retry_attempt_limit, 10)
        self.assertGreater(self.simulator.retry_attempt_limit, 1)


class TestEnhancedCostModelAlgorithm(unittest.TestCase):
    """Test EnhancedCostModelAlgorithm implementation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        self.algorithm = EnhancedCostModelAlgorithm()
    
    def test_initialization(self):
        """Test algorithm initialization"""
        self.assertEqual(self.algorithm.name, "enhanced_cost_model")
        self.assertEqual(self.algorithm.parameters['category'], "cost_model")
        self.assertEqual(self.algorithm.current_congestion, 0.0)
    
    def test_cost_components(self):
        """Test that all cost components are calculated"""
        # Set up simulator state
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.15)
        self.simulator.operation_count = 100
        self.simulator.total_retry_attempts = 50
        self.simulator.failed_retries = 10
        
        # Execute algorithm
        cost_breakdown = self.algorithm.execute(self.simulator)
        
        # Verify all cost components are present
        self.assertIn('operation_cost', cost_breakdown)
        self.assertIn('retry_cost', cost_breakdown)
        self.assertIn('error_cost', cost_breakdown)
        self.assertIn('latency_cost', cost_breakdown)
        self.assertIn('resource_cost', cost_breakdown)
        self.assertIn('total_cost', cost_breakdown)
        
        # Verify total cost is sum of components
        component_sum = (
            cost_breakdown['operation_cost'] + 
            cost_breakdown['retry_cost'] + 
            cost_breakdown['error_cost'] + 
            cost_breakdown['latency_cost'] + 
            cost_breakdown['resource_cost']
        )
        self.assertAlmostEqual(cost_breakdown['total_cost'], component_sum)
    
    def test_congestion_modeling(self):
        """Test congestion level affects costs"""
        # Set up simulator state
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.15)
        self.simulator.operation_count = 100
        self.simulator.total_retry_attempts = 50
        self.simulator.failed_retries = 10
        
        # First run with low congestion
        self.algorithm.current_congestion = 0.2
        low_congestion_costs = self.algorithm.execute(self.simulator)
        
        # Second run with high congestion
        self.algorithm.current_congestion = 0.9  # Above threshold
        high_congestion_costs = self.algorithm.execute(self.simulator)
        
        # High congestion should result in higher costs
        self.assertGreater(high_congestion_costs['total_cost'], low_congestion_costs['total_cost'])
    
    def test_retry_fatigue_cost(self):
        """Test retry fatigue increases costs"""
        # Set up simulator state
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.15)
        self.simulator.operation_count = 100
        
        # First run with few retry attempts
        self.simulator.total_retry_attempts = 10
        low_retry_costs = self.algorithm.execute(self.simulator)
        
        # Second run with many retry attempts
        self.simulator.total_retry_attempts = 100
        high_retry_costs = self.algorithm.execute(self.simulator)
        
        # More retries should result in higher retry costs
        self.assertGreater(high_retry_costs['retry_cost'], low_retry_costs['retry_cost'])
    
    def test_error_severity_cost(self):
        """Test error severity affects costs"""
        # Set up simulator state
        self.simulator.operation_count = 100
        self.simulator.total_retry_attempts = 50
        self.simulator.failed_retries = 10
        
        # First run with low error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.05)
        low_error_costs = self.algorithm.execute(self.simulator)
        
        # Second run with high error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.3)
        high_error_costs = self.algorithm.execute(self.simulator)
        
        # Higher error rate should result in higher error costs
        self.assertGreater(high_error_costs['error_cost'], low_error_costs['error_cost'])


class TestThresholdRetryCoordinatorAlgorithm(unittest.TestCase):
    """Test ThresholdRetryCoordinatorAlgorithm implementation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = EnhancedInputUnitSimulator(
            initial_threshold=0.05,
            adjustment_step=0.001,
            initial_retry_limit=3,
            window_size=100
        )
        self.algorithm = ThresholdRetryCoordinatorAlgorithm()
    
    def test_initialization(self):
        """Test algorithm initialization"""
        self.assertEqual(self.algorithm.name, "threshold_retry_coordinator")
        self.assertEqual(self.algorithm.parameters['category'], "coordination")
        self.assertEqual(self.algorithm.last_coordination_time, 0)
    
    def test_coordination_timing(self):
        """Test coordination only happens periodically"""
        # Set up simulator state
        self.simulator.operation_count = 10
        self.algorithm.last_coordination_time = 0
        
        # First execution should coordinate
        result1 = self.algorithm.execute(self.simulator)
        self.assertEqual(result1['action'], "coordinated_adjustment")
        
        # Next execution should wait
        result2 = self.algorithm.execute(self.simulator)
        self.assertEqual(result2['action'], "none")
        self.assertEqual(result2['reason'], "waiting for stabilization")
    
    def test_ratio_calculation(self):
        """Test retry/threshold ratio calculation"""
        # Set up simulator state that requires adjustment
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.2)
        self.simulator.successful_retries = 8
        self.simulator.failed_retries = 2
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.retry_attempt_limit = 2
        self.simulator.efficiency_score = 0.7
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 10
        self.simulator.operation_count = 100
        self.algorithm.last_coordination_time = 0
        
        # Execute algorithm
        result = self.algorithm.execute(self.simulator)
        
        # Verify result structure
        self.assertEqual(result['action'], "coordinated_adjustment")
        self.assertIn('threshold_before', result)
        self.assertIn('threshold_after', result)
        self.assertIn('retry_limit_before', result)
        self.assertIn('retry_limit_after', result)
        self.assertIn('ideal_ratio', result)
        
        # Initial ratio is 2/0.05 = 40, ideal ratio should be different
        # Since error rate is high, coordinator should increase threshold or decrease retries
        initial_ratio = 2 / 0.05
        new_ratio = result['retry_limit_after'] / result['threshold_after']
        
        # With high error rate and good retry success, ratio should decrease
        self.assertNotEqual(initial_ratio, new_ratio)
    
    def test_high_error_rate_adjustment(self):
        """Test adjustments with high error rate"""
        # Set up simulator with high error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.3)
        self.simulator.successful_retries = 5
        self.simulator.failed_retries = 5
        self.simulator.acceptable_error_threshold = 0.05
        self.simulator.retry_attempt_limit = 3
        self.simulator.efficiency_score = 0.6
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 10
        self.simulator.operation_count = 100
        self.algorithm.last_coordination_time = 0
        
        # Store initial values
        initial_threshold = self.simulator.acceptable_error_threshold
        
        # Execute algorithm
        result = self.algorithm.execute(self.simulator)
        
        # With high error rate, threshold should increase more than retry limit decreases
        self.assertGreater(result['threshold_after'], initial_threshold)
    
    def test_low_error_rate_adjustment(self):
        """Test adjustments with low error rate"""
        # Set up simulator with low error rate
        self.simulator._calculate_current_error_rate = MagicMock(return_value=0.01)
        self.simulator.successful_retries = 9
        self.simulator.failed_retries = 1
        self.simulator.acceptable_error_threshold = 0.1
        self.simulator.retry_attempt_limit = 5
        self.simulator.efficiency_score = 0.8
        self.simulator.min_retry_limit = 1
        self.simulator.max_retry_limit = 10
        self.simulator.operation_count = 100
        self.algorithm.last_coordination_time = 0
        
        # Store initial values
        initial_retry_limit = self.simulator.retry_attempt_limit
        
        # Execute algorithm
        result = self.algorithm.execute(self.simulator)
        
        # With low error rate, retry limit might decrease
        self.assertLessEqual(result['retry_limit_after'], initial_retry_limit)

        
if __name__ == '__main__':
    unittest.main()