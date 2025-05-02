import random
import time
import numpy np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from typing import Dict, List, Tuple, Optional, Union, Any, Callable
import inspect

# Abstract algorithm class for modular, swappable components
class Algorithm:
    """
    Base class for swappable algorithms in the simulator.
    
    Provides a standardized interface for algorithms that can be dynamically 
    added, removed, or modified during simulation runtime.
    """
    def __init__(self, name: str, description: str, parameters: Dict[str, Any] = None):
        self.name = name
        self.description = description
        self.parameters = parameters or {}
        self.enabled = True
        
    def set_parameter(self, param_name: str, value: Any) -> None:
        """Set a parameter value for this algorithm"""
        if param_name not in self.parameters:
            raise ValueError(f"Parameter '{param_name}' is not defined for algorithm '{self.name}'")
        self.parameters[param_name] = value
    
    def get_parameter(self, param_name: str) -> Any:
        """Get a parameter value for this algorithm"""
        if param_name not in self.parameters:
            raise ValueError(f"Parameter '{param_name}' is not defined for this algorithm '{self.name}'")
        return self.parameters[param_name]
    
    def get_parameters(self) -> Dict[str, Any]:
        """Get all parameters for this algorithm"""
        return self.parameters.copy()
    
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> Any:
        """
        Execute this algorithm on the given simulator state.
        
        Must be implemented by subclasses.
        """
        raise NotImplementedError("Subclasses must implement the execute method")


class StrategyManager:
    """
    Manages algorithms and strategies for the simulation.
    
    This class provides a way to dynamically add, remove, and modify algorithms
    during simulation runtime, enabling fine-tuning and experimentation.
    """
    def __init__(self, simulator: 'EnhancedInputUnitSimulator'):
        self.simulator = simulator
        self.algorithms: Dict[str, Algorithm] = {}
        
    def register_algorithm(self, algorithm: Algorithm) -> None:
        """Register an algorithm with the strategy manager"""
        self.algorithms[algorithm.name] = algorithm
        
    def unregister_algorithm(self, name: str) -> None:
        """Remove an algorithm from the strategy manager"""
        if name in self.algorithms:
            del self.algorithms[name]
        
    def get_algorithm(self, name: str) -> Algorithm:
        """Get an algorithm by name"""
        if name not in self.algorithms:
            raise ValueError(f"Algorithm '{name}' not found")
        return self.algorithms[name]
    
    def execute_algorithm(self, name: str, *args, **kwargs) -> Any:
        """Execute a specific algorithm by name"""
        algorithm = self.get_algorithm(name)
        if algorithm.enabled:
            return algorithm.execute(self.simulator, *args, **kwargs)
        return None
    
    def execute_all(self, category: str = None, *args, **kwargs) -> Dict[str, Any]:
        """Execute all enabled algorithms, optionally filtered by category"""
        results = {}
        for name, algorithm in self.algorithms.items():
            if algorithm.enabled:
                if category is None or algorithm.parameters.get('category') == category:
                    results[name] = algorithm.execute(self.simulator, *args, **kwargs)
        return results
    
    def enable_algorithm(self, name: str, enabled: bool = True) -> None:
        """Enable or disable an algorithm"""
        algorithm = self.get_algorithm(name)
        algorithm.enabled = enabled
    
    def list_algorithms(self, category: str = None) -> Dict[str, Dict[str, Any]]:
        """List all algorithms with their parameters, optionally filtered by category"""
        result = {}
        for name, algorithm in self.algorithms.items():
            if category is None or algorithm.parameters.get('category') == category:
                result[name] = {
                    'description': algorithm.description,
                    'enabled': algorithm.enabled,
                    'parameters': algorithm.get_parameters()
                }
        return result


# Default algorithm implementations
class AdaptiveThresholdAlgorithm(Algorithm):
    """Algorithm for adaptive threshold adjustment"""
    def __init__(self):
        parameters = {
            'category': 'threshold_adjustment',
            'min_threshold': 0.001,
            'aggressive_factor': 10.0,
            'decrease_step_factor': 1.0,
            'upper_multiplier': 1.2,
            'lower_multiplier': 1.1
        }
        super().__init__(
            "adaptive_threshold", 
            "Adjusts threshold based on error rate with adaptive factors",
            parameters
        )
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> float:
        """
        Adjust threshold based on current error rate
        
        Returns the new threshold
        """
        current_error_rate = simulator._calculate_current_error_rate()
        error_gap = current_error_rate - simulator.acceptable_error_threshold
        
        # Use parameters for fine-tuning
        min_threshold = self.parameters['min_threshold']
        aggressive_factor = self.parameters['aggressive_factor']
        decrease_step_factor = self.parameters['decrease_step_factor']
        upper_multiplier = self.parameters['upper_multiplier']
        lower_multiplier = self.parameters['lower_multiplier']
        
        if error_gap > 0:  # Error rate is higher than threshold
            adjustment = simulator.adjustment_step * min(3.0, 1.0 + abs(error_gap) * aggressive_factor)
            simulator.acceptable_error_threshold = min(
                current_error_rate * upper_multiplier,
                simulator.acceptable_error_threshold + adjustment
            )
        else:  # Error rate is lower than or equal to threshold
            simulator.acceptable_error_threshold = max(
                current_error_rate * lower_multiplier,
                simulator.acceptable_error_threshold - simulator.adjustment_step * decrease_step_factor,
                min_threshold
            )
            
        # Calculate threshold stability
        if len(simulator.history_error_rates) > 10:
            recent_thresholds_variance = np.var(simulator.history_error_rates[-10:])
            simulator.threshold_stability = max(0.1, 1.0 - recent_thresholds_variance * 100)
            
        return simulator.acceptable_error_threshold


class GeometricRetryAlgorithm(Algorithm):
    """Algorithm for calculating optimal retry limits using geometric distribution"""
    def __init__(self):
        parameters = {
            'category': 'retry_adjustment',
            'target_success_probability': 0.99,
            'adjustment_speed': 1.0  # How quickly to move toward optimal value (1=immediate, 0.5=halfway)
        }
        super().__init__(
            "geometric_retry", 
            "Optimizes retry attempts based on geometric distribution",
            parameters
        )
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> int:
        """
        Adjust retry limit based on current error rates
        
        Returns the new retry limit
        """
        current_error_rate = simulator._calculate_current_error_rate()
        
        # Use parameters for fine-tuning
        target_success_prob = self.parameters['target_success_probability']
        adjustment_speed = self.parameters['adjustment_speed']
        
        if current_error_rate > 0:
            try:
                optimal_retries = min(
                    simulator.max_retry_limit,
                    max(
                        simulator.min_retry_limit,
                        int(np.ceil(np.log(1 - target_success_prob) / 
                                    np.log(current_error_rate)))
                    )
                )
            except (ValueError, ZeroDivisionError):
                optimal_retries = simulator.retry_attempt_limit
        else:
            optimal_retries = simulator.min_retry_limit
            
        # Apply adjustment speed factor
        if adjustment_speed >= 1.0:
            # Immediate change to optimal
            simulator.retry_attempt_limit = optimal_retries
        else:
            # Gradual change
            if simulator.retry_attempt_limit < optimal_retries:
                simulator.retry_attempt_limit = min(
                    simulator.max_retry_limit,
                    simulator.retry_attempt_limit + max(1, int((optimal_retries - simulator.retry_attempt_limit) * adjustment_speed))
                )
            elif simulator.retry_attempt_limit > optimal_retries:
                simulator.retry_attempt_limit = max(
                    simulator.min_retry_limit,
                    simulator.retry_attempt_limit - max(1, int((simulator.retry_attempt_limit - optimal_retries) * adjustment_speed))
                )
            
        return simulator.retry_attempt_limit


class WeightedEfficiencyAlgorithm(Algorithm):
    """Algorithm for calculating efficiency scores with configurable weights"""
    def __init__(self):
        parameters = {
            'category': 'metrics',
            'error_rate_weight': 0.4,
            'retry_success_weight': 0.4,
            'threshold_appropriateness_weight': 0.2
        }
        super().__init__(
            "weighted_efficiency", 
            "Calculates system efficiency with configurable weights",
            parameters
        )
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> float:
        """
        Calculate efficiency score with configurable weights
        
        Returns the efficiency score
        """
        error_rate = simulator._calculate_current_error_rate()
        retry_success_rate = (
            simulator.successful_retries / max(1, simulator.successful_retries + simulator.failed_retries)
        )
        
        # Use parameters for fine-tuning
        error_weight = self.parameters['error_rate_weight']
        retry_weight = self.parameters['retry_success_weight']
        threshold_weight = self.parameters['threshold_appropriateness_weight']
        
        # Normalize weights
        total_weight = error_weight + retry_weight + threshold_weight
        error_weight /= total_weight
        retry_weight /= total_weight
        threshold_weight /= total_weight
        
        threshold_appropriateness = min(
            1.0, 
            (simulator.acceptable_error_threshold + 0.001) / (error_rate + 0.001)
        )
        
        efficiency = (
            (1 - error_rate) * error_weight +
            retry_success_rate * retry_weight +
            threshold_appropriateness * threshold_weight
        )
        
        simulator.efficiency_score = efficiency
        return efficiency


class MomentumThresholdAlgorithm(Algorithm):
    """Algorithm for threshold adjustment with momentum for enhanced stability"""
    def __init__(self):
        parameters = {
            'category': 'threshold_adjustment',
            'min_threshold': 0.001,
            'momentum': 0.85,  # How much to retain previous adjustment direction (0-1)
            'max_aggressive_factor': 10.0,
            'smoothing_factor': 0.7,  # Weight for exponential smoothing
            'upper_multiplier': 1.2,
            'lower_multiplier': 1.1
        }
        super().__init__(
            "momentum_threshold", 
            "Adjusts threshold with momentum for increased stability",
            parameters
        )
        self.previous_adjustment = 0.0
        self.smoothed_error_rate = None
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> float:
        """
        Adjust threshold using momentum and exponential smoothing
        
        Returns the new threshold
        """
        current_error_rate = simulator._calculate_current_error_rate()
        
        # Use exponential smoothing to reduce the impact of sudden spikes
        if self.smoothed_error_rate is None:
            self.smoothed_error_rate = current_error_rate
        else:
            smoothing = self.parameters['smoothing_factor']
            self.smoothed_error_rate = smoothing * self.smoothed_error_rate + (1 - smoothing) * current_error_rate
        
        # Calculate error gap using smoothed rate
        error_gap = self.smoothed_error_rate - simulator.acceptable_error_threshold
        
        # Use parameters for fine-tuning
        min_threshold = self.parameters['min_threshold']
        momentum = self.parameters['momentum']
        max_aggressive_factor = self.parameters['max_aggressive_factor']
        upper_multiplier = self.parameters['upper_multiplier']
        lower_multiplier = self.parameters['lower_multiplier']
        
        # Determine base adjustment direction and magnitude
        if error_gap > 0:  # Error rate is higher than threshold
            base_adjustment = simulator.adjustment_step * min(3.0, 1.0 + abs(error_gap) * max_aggressive_factor)
        else:  # Error rate is lower than or equal to threshold
            base_adjustment = -simulator.adjustment_step
            
        # Apply momentum to smooth the adjustment
        adjustment = (1 - momentum) * base_adjustment + momentum * self.previous_adjustment
        self.previous_adjustment = adjustment
        
        # Apply the adjustment
        if adjustment > 0:
            simulator.acceptable_error_threshold = min(
                self.smoothed_error_rate * upper_multiplier,
                simulator.acceptable_error_threshold + adjustment
            )
        else:
            simulator.acceptable_error_threshold = max(
                self.smoothed_error_rate * lower_multiplier,
                simulator.acceptable_error_threshold + adjustment,  # Add negative adjustment
                min_threshold
            )
            
        # Calculate threshold stability based on recent changes and momentum
        if len(simulator.history_error_rates) > 10:
            recent_thresholds_variance = np.var(simulator.history_error_rates[-10:])
            # Higher stability when momentum is higher and variance is lower
            simulator.threshold_stability = max(
                0.1, 
                (1.0 - recent_thresholds_variance * 50) * (0.5 + 0.5 * momentum)
            )
            
        return simulator.acceptable_error_threshold


class AdaptiveEfficiencyAlgorithm(Algorithm):
    """Algorithm for calculating efficiency scores with weights that adapt to system goals"""
    def __init__(self):
        parameters = {
            'category': 'metrics',
            'initial_error_rate_weight': 0.4,
            'initial_retry_success_weight': 0.4,
            'initial_threshold_weight': 0.2,
            'adaptation_factor': 0.05,  # How quickly weights adapt
            'goal_emphasis_threshold': 0.5  # When performance falls below this, we adjust weights
        }
        super().__init__(
            "adaptive_efficiency", 
            "Calculates efficiency with weights that adapt based on system performance",
            parameters
        )
        self.weights = {
            'error_rate': parameters['initial_error_rate_weight'],
            'retry_success': parameters['initial_retry_success_weight'],
            'threshold': parameters['initial_threshold_weight']
        }
        self.min_weight = 0.05  # Ensure no weight drops too low
        self.previous_scores = []  # Track recent scores to detect trends
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> float:
        """
        Calculate efficiency score with adaptive weights
        
        Returns the efficiency score
        """
        error_rate = simulator._calculate_current_error_rate()
        retry_success_rate = (
            simulator.successful_retries / max(1, simulator.successful_retries + simulator.failed_retries)
        )
        threshold_appropriateness = min(
            1.0, 
            (simulator.acceptable_error_threshold + 0.001) / (error_rate + 0.001)
        )
        
        # Calculate component scores
        component_scores = {
            'error_rate': (1 - error_rate),
            'retry_success': retry_success_rate,
            'threshold': threshold_appropriateness
        }
        
        # Calculate weighted efficiency
        efficiency = sum(self.weights[component] * component_scores[component] 
                          for component in self.weights)
        
        # Track score for trend analysis
        self.previous_scores.append(efficiency)
        if len(self.previous_scores) > 20:  # Keep a reasonable history
            self.previous_scores.pop(0)
        
        # Adjust weights if performance is below goal or trending downward
        self._adapt_weights(component_scores, efficiency, simulator)
        
        simulator.efficiency_score = efficiency
        
        # Store the weights in the simulator for transparency
        simulator.efficiency_weights = self.weights.copy()
        
        return efficiency
    
    def _adapt_weights(self, component_scores, current_efficiency, simulator):
        """Adapt weights based on performance"""
        # Only adjust if we have enough history
        if len(self.previous_scores) < 5:
            return
        
        # Check if performance is below threshold or trending downward
        recent_trend = np.mean(self.previous_scores[-3:]) - np.mean(self.previous_scores[:-3])
        performance_concern = (current_efficiency < self.parameters['goal_emphasis_threshold'] or 
                              recent_trend < -0.05)
        
        if not performance_concern:
            return
            
        # Find the weakest component that's bringing down efficiency
        component_ranking = sorted(component_scores.items(), key=lambda x: x[1])
        weakest_component = component_ranking[0][0]
        strongest_component = component_ranking[-1][0]
        
        # Adjust weights to emphasize the weakest area
        adjustment = self.parameters['adaptation_factor']
        
        # Shift weight from strongest to weakest component
        self.weights[strongest_component] = max(
            self.min_weight,
            self.weights[strongest_component] - adjustment
        )
        self.weights[weakest_component] += adjustment
        
        # Normalize weights to ensure they sum to 1
        total_weight = sum(self.weights.values())
        for component in self.weights:
            self.weights[component] /= total_weight


class DiminishingRetryAlgorithm(Algorithm):
    """Algorithm for modeling retry attempts with diminishing returns"""
    def __init__(self):
        parameters = {
            'category': 'retry_adjustment',
            'target_success_probability': 0.99,
            'fatigue_factor': 0.15,  # How much each retry increases the error probability
            'recovery_factor': 0.05,  # How much the error probability can recover between retries
            'max_retry_growth': 3.0,  # Maximum multiplier for error probability
            'adjustment_speed': 0.7   # How quickly to adjust retry limit (0-1)
        }
        super().__init__(
            "diminishing_retry", 
            "Models retry attempts with diminishing returns due to retry fatigue",
            parameters
        )
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> int:
        """
        Calculate optimal retry limit considering diminishing returns
        
        Returns the new retry limit
        """
        base_error_rate = simulator._calculate_current_error_rate()
        
        # Use parameters for fine-tuning
        target_success_prob = self.parameters['target_success_probability']
        fatigue_factor = self.parameters['fatigue_factor']
        recovery_factor = self.parameters['recovery_factor']
        max_retry_growth = self.parameters['max_retry_growth']
        adjustment_speed = self.parameters['adjustment_speed']
        
        if base_error_rate <= 0:
            # No errors, no retries needed
            optimal_retries = simulator.min_retry_limit
        else:
            # Simulate a retry sequence with our model to find optimal retry count
            cumulative_success_prob = 0.0
            retry_count = 0
            current_error_prob = base_error_rate
            
            while (cumulative_success_prob < target_success_prob and 
                  retry_count < simulator.max_retry_limit):
                # Success on this retry
                retry_success_prob = 1.0 - current_error_prob
                # Update cumulative success probability
                cumulative_success_prob += (1.0 - cumulative_success_prob) * retry_success_prob
                
                # If we've reached target success probability, break
                if cumulative_success_prob >= target_success_prob:
                    break
                
                # Increase retry count
                retry_count += 1
                
                # Model retry fatigue: error probability increases with each attempt
                fatigue = min(max_retry_growth - 1.0, fatigue_factor * retry_count)
                recovery = recovery_factor * retry_count
                
                # New error probability with fatigue and recovery factored in
                current_error_prob = min(
                    0.99,  # Cap at 99% to avoid impossibility
                    base_error_rate * (1.0 + fatigue) * (1.0 - recovery)
                )
            
            # Add 1 since we're calculating the number of retries, not attempts
            optimal_retries = retry_count + 1
            
            # Ensure we respect min/max limits
            optimal_retries = min(simulator.max_retry_limit, max(simulator.min_retry_limit, optimal_retries))
        
        # Apply adjustment speed factor for smoother transitions
        if adjustment_speed >= 1.0:
            # Immediate change to optimal
            simulator.retry_attempt_limit = optimal_retries
        else:
            # Gradual change
            if simulator.retry_attempt_limit < optimal_retries:
                simulator.retry_attempt_limit = min(
                    simulator.max_retry_limit,
                    simulator.retry_attempt_limit + max(1, int((optimal_retries - simulator.retry_attempt_limit) * adjustment_speed))
                )
            elif simulator.retry_attempt_limit > optimal_retries:
                simulator.retry_attempt_limit = max(
                    simulator.min_retry_limit,
                    simulator.retry_attempt_limit - max(1, int((simulator.retry_attempt_limit - optimal_retries) * adjustment_speed))
                )
        
        return simulator.retry_attempt_limit


class EnhancedCostModelAlgorithm(Algorithm):
    """Algorithm for more sophisticated cost modeling"""
    def __init__(self):
        parameters = {
            'category': 'cost_model',
            'base_operation_cost': 1.0,
            'retry_cost_factor': 0.5,      # Base retry cost as a factor of operation cost
            'retry_fatigue_factor': 0.2,    # Additional cost per retry attempt due to resource contention
            'error_cost_factor': 5.0,       # Base error cost as a factor of operation cost
            'error_severity_factor': 0.5,   # How much error cost increases with error rate
            'latency_cost_factor': 0.3,     # Cost of retry delays
            'resource_usage_factor': 0.2,   # Resource usage cost per operation
            'congestion_threshold': 0.7     # When resource usage exceeds this, costs increase
        }
        super().__init__(
            "enhanced_cost_model", 
            "Advanced cost model considering multiple factors including latency and resource usage",
            parameters
        )
        self.current_congestion = 0.0  # Simulated resource congestion level
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> Dict[str, float]:
        """
        Calculate operation costs with a sophisticated model
        
        Returns a dictionary of different cost components and total cost
        """
        # Get parameters
        base_cost = self.parameters['base_operation_cost']
        retry_cost_factor = self.parameters['retry_cost_factor']
        retry_fatigue_factor = self.parameters['retry_fatigue_factor']
        error_cost_factor = self.parameters['error_cost_factor']
        error_severity_factor = self.parameters['error_severity_factor']
        latency_cost_factor = self.parameters['latency_cost_factor']
        resource_usage_factor = self.parameters['resource_usage_factor']
        congestion_threshold = self.parameters['congestion_threshold']
        
        # Base operation cost
        operation_cost = base_cost
        
        # Update simulated system congestion based on error rate and retry activity
        error_rate = simulator._calculate_current_error_rate()
        retry_activity = simulator.total_retry_attempts / max(1, simulator.operation_count)
        
        # Simulate resource congestion (0.0 to 1.0)
        # Higher error rates and retry activity increase congestion
        self.current_congestion = min(
            1.0,
            0.3 * self.current_congestion +  # Some persistence in congestion
            0.4 * error_rate +               # Error rate contribution
            0.3 * retry_activity             # Retry activity contribution
        )
        
        # Calculate congestion multiplier
        congestion_multiplier = 1.0
        if self.current_congestion > congestion_threshold:
            # Exponentially increasing costs when congestion exceeds threshold
            congestion_multiplier = 1.0 + ((self.current_congestion - congestion_threshold) / 
                                         (1.0 - congestion_threshold)) ** 2
        
        # Retry cost with fatigue factor (each retry costs more than the last)
        retry_cost_base = base_cost * retry_cost_factor
        retry_attempts_per_op = simulator.total_retry_attempts / max(1, simulator.operation_count)
        retry_cost = retry_cost_base * retry_attempts_per_op * (1.0 + retry_fatigue_factor * retry_attempts_per_op)
        
        # Error cost that increases with error severity (higher error rates = more severe)
        error_cost_base = base_cost * error_cost_factor
        error_severity = error_rate ** 2  # Quadratic increase in severity with error rate
        error_cost = error_cost_base * (simulator.failed_retries / max(1, simulator.operation_count)) * \
                    (1.0 + error_severity_factor * error_severity)
        
        # Latency cost (more retries = higher latency)
        latency_cost = base_cost * latency_cost_factor * retry_attempts_per_op
        
        # Resource usage cost (higher with more errors and retries)
        resource_cost = base_cost * resource_usage_factor * (1.0 + self.current_congestion)
        
        # Apply congestion multiplier to all costs
        operation_cost *= congestion_multiplier
        retry_cost *= congestion_multiplier
        error_cost *= congestion_multiplier
        latency_cost *= congestion_multiplier
        resource_cost *= congestion_multiplier
        
        # Total cost
        total_cost = operation_cost + retry_cost + error_cost + latency_cost + resource_cost
        
        # Store the cost breakdown in the simulator
        simulator.operation_cost = operation_cost
        simulator.retry_cost = retry_cost
        simulator.error_cost = error_cost
        simulator.latency_cost = latency_cost
        simulator.resource_cost = resource_cost
        simulator.total_cost += total_cost
        simulator.congestion_level = self.current_congestion
        
        # Return cost breakdown for detailed analysis
        return {
            'operation_cost': operation_cost,
            'retry_cost': retry_cost,
            'error_cost': error_cost,
            'latency_cost': latency_cost,
            'resource_cost': resource_cost,
            'congestion_level': self.current_congestion,
            'total_cost': total_cost
        }


class ThresholdRetryCoordinatorAlgorithm(Algorithm):
    """Algorithm that coordinates threshold and retry strategies for optimal resource usage"""
    def __init__(self):
        parameters = {
            'category': 'coordination',
            'coordination_strength': 0.7,   # How strongly to coordinate (0-1)
            'threshold_weight': 0.5,        # Balance between threshold and retry adjustments
            'resource_efficiency_target': 0.8,  # Target efficiency score
            'min_retry_per_threshold_ratio': 0.5,  # Minimum retry/threshold ratio
            'max_retry_per_threshold_ratio': 20.0   # Maximum retry/threshold ratio
        }
        super().__init__(
            "threshold_retry_coordinator", 
            "Coordinates threshold and retry strategies for optimal resource usage",
            parameters
        )
        self.last_coordination_time = 0
        
    def execute(self, simulator: 'EnhancedInputUnitSimulator', *args, **kwargs) -> Dict[str, Any]:
        """
        Coordinate threshold and retry strategies
        
        Returns a dictionary of coordination actions taken
        """
        # Only coordinate periodically to allow other algorithms to stabilize
        if simulator.operation_count - self.last_coordination_time < 20:
            return {"action": "none", "reason": "waiting for stabilization"}
            
        self.last_coordination_time = simulator.operation_count
        
        # Get parameters
        coordination_strength = self.parameters['coordination_strength']
        threshold_weight = self.parameters['threshold_weight']
        resource_efficiency_target = self.parameters['resource_efficiency_target']
        min_ratio = self.parameters['min_retry_per_threshold_ratio']
        max_ratio = self.parameters['max_retry_per_threshold_ratio']
        
        # Calculate current metrics
        error_rate = simulator._calculate_current_error_rate()
        retry_success_rate = simulator.successful_retries / max(1, simulator.successful_retries + simulator.failed_retries)
        current_threshold = simulator.acceptable_error_threshold
        current_retry_limit = simulator.retry_attempt_limit
        
        # Calculate the ideal ratio based on error rate and retry success
        # Low error rates -> fewer retries needed
        # High success rates -> retries are effective, can use more
        ideal_retry_threshold_ratio = 10 * error_rate * retry_success_rate
        
        # Normalize to acceptable range
        ideal_retry_threshold_ratio = max(min_ratio, min(max_ratio, ideal_retry_threshold_ratio))
        
        # Calculate current ratio
        current_ratio = current_retry_limit / (current_threshold + 0.001)  # Avoid division by zero
        
        # Determine if we need to adjust
        ratio_gap = ideal_retry_threshold_ratio - current_ratio
        
        # If the gap is small, no action needed
        if abs(ratio_gap) < 0.5:
            return {"action": "none", "reason": "ratio within acceptable range"}
            
        # Get congestion level if available from cost model
        congestion_level = getattr(simulator, 'congestion_level', 0.5)
        
        # Determine adjustment strategy based on congestion and efficiency
        efficiency_gap = resource_efficiency_target - simulator.efficiency_score
        is_congested = congestion_level > 0.7
        
        if is_congested and efficiency_gap > 0.1:
            # System is congested and inefficient - need more aggressive adjustment
            coordination_strength *= 1.5
            
        # Determine how to distribute the adjustment between threshold and retry limit
        # When error rates are high, favor threshold adjustments
        # When error rates are low, favor retry limit adjustments
        if error_rate > 0.1:  # High error rate
            threshold_adjustment_weight = max(0.7, threshold_weight + 0.2)
        elif error_rate < 0.03:  # Low error rate
            threshold_adjustment_weight = min(0.3, threshold_weight - 0.2)
        else:  # Medium error rate
            threshold_adjustment_weight = threshold_weight
            
        # Calculate adjustments for both parameters
        if ratio_gap > 0:  # Need to increase ratio (more retries or lower threshold)
            if threshold_adjustment_weight > 0.5:
                # Decrease threshold more than increase retries
                threshold_adjustment = -current_threshold * coordination_strength * threshold_adjustment_weight * 0.2
                retry_adjustment = coordination_strength * (1 - threshold_adjustment_weight) * 1.0
            else:
                # Increase retries more than decrease threshold
                threshold_adjustment = -current_threshold * coordination_strength * threshold_adjustment_weight * 0.1
                retry_adjustment = coordination_strength * (1 - threshold_adjustment_weight) * 2.0
        else:  # Need to decrease ratio (fewer retries or higher threshold)
            if threshold_adjustment_weight > 0.5:
                # Increase threshold more than decrease retries
                threshold_adjustment = current_threshold * coordination_strength * threshold_adjustment_weight * 0.2
                retry_adjustment = -coordination_strength * (1 - threshold_adjustment_weight) * 1.0
            else:
                # Decrease retries more than increase threshold 
                threshold_adjustment = current_threshold * coordination_strength * threshold_adjustment_weight * 0.1
                retry_adjustment = -coordination_strength * (1 - threshold_adjustment_weight) * 2.0
                
        # Apply adjustments, but ensure we respect limits
        new_threshold = max(0.001, min(0.5, current_threshold + threshold_adjustment))
        new_retry_limit = max(
            simulator.min_retry_limit,
            min(simulator.max_retry_limit, 
                int(current_retry_limit + retry_adjustment)
            )
        )
        
        # Apply changes
        simulator.acceptable_error_threshold = new_threshold
        simulator.retry_attempt_limit = new_retry_limit
        
        # Return info about coordination actions
        return {
            "action": "coordinated_adjustment",
            "threshold_before": current_threshold,
            "threshold_after": new_threshold,
            "retry_limit_before": current_retry_limit,
            "retry_limit_after": new_retry_limit,
            "ideal_ratio": ideal_retry_threshold_ratio,
            "threshold_adjustment_weight": threshold_adjustment_weight,
            "congestion_level": congestion_level
        }


class EnhancedInputUnitSimulator:
    """
    Simulator for an input unit with adaptive error handling capabilities.
    
    This simulator models how a system adapts to changing error rates by
    adjusting its error threshold and retry limits dynamically.
    """
    def __init__(
        self, 
        initial_threshold=0.05, 
        adjustment_step=0.001, 
        initial_retry_limit=3, 
        window_size=100,
        adaptation_rate=0.05,
        max_retry_limit=10,
        min_retry_limit=1
    ):
        # Core parameters
        self.acceptable_error_threshold = initial_threshold
        self.adjustment_step = adjustment_step
        self.retry_attempt_limit = initial_retry_limit
        self.window_size = window_size
        self.adaptation_rate = adaptation_rate  # How quickly to adapt to changing conditions
        self.max_retry_limit = max_retry_limit
        self.min_retry_limit = min_retry_limit
        
        # Tracking metrics
        self.error_count = 0
        self.operation_count = 0
        self.history_error_rates = []
        self.successful_retries = 0
        self.failed_retries = 0
        self.total_retry_attempts = 0
        self.recovery_times = []
        self.current_recovery_start = None
        self.error_spikes = []
        self.last_adjustment_time = 0
        
        # Advanced metrics
        self.threshold_stability = 1.0  # Measure of how stable our threshold is (1.0 = very stable)
        self.efficiency_score = 1.0     # Measure of operational efficiency
        self.error_variance = 0.0       # Variance in error rates over time
        
        # Cost model - tracks theoretical costs of operations
        self.operation_cost = 1.0       # Base cost of an operation
        self.retry_cost = 0.5           # Cost of a retry operation
        self.error_cost = 5.0           # Cost of an unrecovered error
        self.total_cost = 0.0           # Running total cost
        
        # Initialize strategy manager with default algorithms
        self.strategy_manager = StrategyManager(self)
        self._initialize_default_algorithms()
        
    def _initialize_default_algorithms(self):
        """Set up default algorithms"""
        # Initialize and register default algorithms
        self.strategy_manager.register_algorithm(AdaptiveThresholdAlgorithm())
        self.strategy_manager.register_algorithm(GeometricRetryAlgorithm())
        self.strategy_manager.register_algorithm(WeightedEfficiencyAlgorithm())
        self.strategy_manager.register_algorithm(MomentumThresholdAlgorithm())
        self.strategy_manager.register_algorithm(AdaptiveEfficiencyAlgorithm())
        self.strategy_manager.register_algorithm(DiminishingRetryAlgorithm())
        self.strategy_manager.register_algorithm(EnhancedCostModelAlgorithm())
        self.strategy_manager.register_algorithm(ThresholdRetryCoordinatorAlgorithm())
        
    def add_custom_algorithm(self, algorithm: Algorithm):
        """Add a custom algorithm to the simulator"""
        self.strategy_manager.register_algorithm(algorithm)
        
    def remove_algorithm(self, name: str):
        """Remove an algorithm from the simulator"""
        self.strategy_manager.unregister_algorithm(name)
        
    def get_algorithm(self, name: str) -> Algorithm:
        """Get an algorithm by name"""
        return self.strategy_manager.get_algorithm(name)
    
    def list_algorithms(self, category: str = None) -> Dict[str, Dict[str, Any]]:
        """List all algorithms with their parameters"""
        return self.strategy_manager.list_algorithms(category)
    
    def update_algorithm_parameter(self, algorithm_name: str, param_name: str, value: Any):
        """Update a parameter for a specific algorithm"""
        algorithm = self.strategy_manager.get_algorithm(algorithm_name)
        algorithm.set_parameter(param_name, value)
        
    def enable_algorithm(self, name: str, enabled: bool = True):
        """Enable or disable an algorithm"""
        self.strategy_manager.enable_algorithm(name, enabled)
        
    def process_data(self, error_probability: float) -> bool:
        """
        Simulates processing a single unit of data with a given error probability.
        
        Args:
            error_probability: Probability of an error occurring (0.0 to 1.0)
            
        Returns:
            bool: True if operation succeeded (no error or successful retry), False otherwise
        """
        self.operation_count += 1
        error_occurred = False
        operation_succeeded = True
        
        # Calculate base operation cost
        operation_cost = self.operation_cost
        
        # Simulate primary operation with potential for error
        if random.random() < error_probability:
            error_occurred = True
            self.error_count += 1
            retry_success = False
            
            # Enhanced retry tracking
            retry_attempts = 0
            for attempt in range(self.retry_attempt_limit):
                retry_attempts += 1
                self.total_retry_attempts += 1
                operation_cost += self.retry_cost  # Add cost for each retry
                
                # Try again with same error probability (could be refined to model retry behavior)
                if random.random() >= error_probability:
                    retry_success = True
                    self.successful_retries += 1
                    break
            
            if not retry_success:
                self.failed_retries += 1
                operation_succeeded = False
                operation_cost += self.error_cost  # Add cost for unrecovered error
                
            # Track error spikes
            current_error_rate = self._calculate_current_error_rate()
            if current_error_rate > self.acceptable_error_threshold and self.current_recovery_start is None:
                self.current_recovery_start = self.operation_count
                self.error_spikes.append(self.operation_count)
        
        # Track recovery from error spikes
        if self.current_recovery_start is not None:
            current_error_rate = self._calculate_current_error_rate()
            if current_error_rate <= self.acceptable_error_threshold:
                recovery_time = self.operation_count - self.current_recovery_start
                self.recovery_times.append(recovery_time)
                self.current_recovery_start = None
        
        # Update simulation state using algorithms
        self._update_history()
        
        # Use algorithms if they're registered and enabled, otherwise use default methods
        if 'adaptive_threshold' in self.strategy_manager.algorithms:
            self.strategy_manager.execute_algorithm('adaptive_threshold')
        else:
            self._adjust_threshold()
            
        if 'geometric_retry' in self.strategy_manager.algorithms:
            self.strategy_manager.execute_algorithm('geometric_retry')
        else:
            self._adjust_retry_limit()
            
        if 'weighted_efficiency' in self.strategy_manager.algorithms:
            self.strategy_manager.execute_algorithm('weighted_efficiency')
        else:
            self._update_advanced_metrics()
        
        if 'enhanced_cost_model' in self.strategy_manager.algorithms:
            self.strategy_manager.execute_algorithm('enhanced_cost_model')
        
        if 'threshold_retry_coordinator' in self.strategy_manager.algorithms:
            self.strategy_manager.execute_algorithm('threshold_retry_coordinator')
        
        # Update total cost
        self.total_cost += operation_cost
        
        return operation_succeeded

    def _update_history(self):
        """
        Keeps track of the error rate over the sliding window.
        Uses a rolling window approach to maintain recent error history.
        """
        current_error_rate = self._calculate_current_error_rate()
        self.history_error_rates.append(current_error_rate)
        
        if len(self.history_error_rates) > self.window_size:
            # Remove oldest data point from the window
            self.history_error_rates.pop(0)
            
            # Recalculate error_count based on actual errors, not rates
            # This is more accurate than the original implementation
            actual_errors_in_window = int(sum(self.history_error_rates))
            self.error_count = actual_errors_in_window
            self.operation_count = len(self.history_error_rates)

    def _calculate_current_error_rate(self) -> float:
        """
        Calculates the error rate based on the current operation count.
        
        Returns:
            float: Current error rate (0.0 to 1.0)
        """
        if self.operation_count > 0:
            return self.error_count / self.operation_count
        return 0.0

    def _adjust_threshold(self):
        """
        Adjusts the acceptable error threshold based on the current error rate.
        
        The adjustment uses an adaptive approach where the threshold moves toward the
        actual error rate, but with dampening to prevent wild oscillations.
        
        Mathematical model:
        threshold_t+1 = threshold_t + adjustment_step * direction * (1 - stability_factor)
        where:
        - direction is -1 if error_rate > threshold, +1 otherwise
        - stability_factor increases as the threshold approaches optimal value
        """
        current_error_rate = self._calculate_current_error_rate()
        
        # Calculate the gap between current error rate and threshold
        error_gap = current_error_rate - self.acceptable_error_threshold
        
        # Adjust threshold based on error rate and adaptation rate
        # adaptation_rate controls how quickly we adjust to new conditions
        if error_gap > 0:  # Error rate is higher than threshold
            # Increase threshold more aggressively when error rate is much higher
            adjustment = self.adjustment_step * min(3.0, 1.0 + abs(error_gap) * 10)
            self.acceptable_error_threshold = min(
                current_error_rate * 1.2,  # Don't go too far above error rate
                self.acceptable_error_threshold + adjustment
            )
        else:  # Error rate is lower than or equal to threshold
            # Decrease threshold gradually when error rate is lower
            self.acceptable_error_threshold = max(
                current_error_rate * 1.1,  # Stay slightly above error rate
                self.acceptable_error_threshold - self.adjustment_step,
                0.001  # Prevent threshold from reaching zero
            )
            
        # Calculate threshold stability based on recent changes
        if len(self.history_error_rates) > 10:
            recent_thresholds_variance = np.var(self.history_error_rates[-10:])
            self.threshold_stability = max(0.1, 1.0 - recent_thresholds_variance * 100)

    def _adjust_retry_limit(self):
        """
        Adjusts the retry attempt limit based on the current error rate and success patterns.
        
        Mathematical model:
        - If error_rate > threshold: increase retries based on success probability
        - If error_rate <= threshold: decrease retries to optimize performance
        - Success probability is estimated from the ratio of successful retries
        
        optimal_retries = ceil(-log(acceptable_failure_rate) / -log(1-error_probability))
        """
        current_error_rate = self._calculate_current_error_rate()
        
        # Calculate retry success rate
        retry_success_rate = (
            self.successful_retries / max(1, (self.successful_retries + self.failed_retries))
        )
        
        # Calculate optimal retry limit based on error rate and desired success probability
        # This uses the geometric distribution to model retry success probability
        target_success_prob = 0.99  # We aim for 99% success after retries
        
        if current_error_rate > 0:
            # Estimate optimal retries using geometric distribution
            # P(success within n trials) = 1 - (1-p)^n
            # Solving for n: n = log(1-target)/log(1-p)
            try:
                optimal_retries = min(
                    self.max_retry_limit,
                    max(
                        self.min_retry_limit,
                        int(np.ceil(np.log(1 - target_success_prob) / 
                                    np.log(current_error_rate)))
                    )
                )
            except (ValueError, ZeroDivisionError):
                optimal_retries = self.retry_attempt_limit  # Keep current if calculation fails
        else:
            optimal_retries = self.min_retry_limit
            
        # Adjust retry limit gradually towards the optimal value
        if self.retry_attempt_limit < optimal_retries:
            self.retry_attempt_limit = min(
                self.max_retry_limit,
                self.retry_attempt_limit + 1
            )
        elif self.retry_attempt_limit > optimal_retries:
            self.retry_attempt_limit = max(
                self.min_retry_limit,
                self.retry_attempt_limit - 1
            )

    def _update_advanced_metrics(self):
        """Update advanced performance metrics for the system."""
        # Calculate error variance over recent history
        if len(self.history_error_rates) > 10:
            self.error_variance = np.var(self.history_error_rates[-10:])
        
        # Calculate efficiency score based on retry success and error rates
        retry_success_rate = (
            self.successful_retries / max(1, self.successful_retries + self.failed_retries)
        )
        
        # Efficiency score combines multiple factors
        # - Higher when errors are low
        # - Higher when retries are successful
        # - Higher when threshold is appropriate (not too high)
        self.efficiency_score = (
            (1 - self._calculate_current_error_rate()) * 0.4 +
            retry_success_rate * 0.4 +
            min(1.0, (self.acceptable_error_threshold + 0.001) / 
                (self._calculate_current_error_rate() + 0.001)) * 0.2
        )

    def get_metrics(self) -> Dict[str, Any]:
        """
        Return a comprehensive set of metrics about the simulator's state.
        
        Returns:
            Dict: Dictionary containing various performance metrics
        """
        return {
            "current_error_rate": self._calculate_current_error_rate(),
            "acceptable_threshold": self.acceptable_error_threshold,
            "retry_limit": self.retry_attempt_limit,
            "retry_success_rate": self.successful_retries / max(1, (self.successful_retries + self.failed_retries)),
            "avg_recovery_time": np.mean(self.recovery_times) if self.recovery_times else 0,
            "error_spike_count": len(self.error_spikes),
            "operations": self.operation_count,
            "total_errors": self.error_count,
            "total_retry_attempts": self.total_retry_attempts,
            "successful_retries": self.successful_retries,
            "failed_retries": self.failed_retries,
            "efficiency_score": self.efficiency_score,
            "threshold_stability": self.threshold_stability,
            "error_variance": self.error_variance,
            "total_cost": self.total_cost,
            "cost_per_operation": self.total_cost / max(1, self.operation_count),
            "recovery_times": self.recovery_times
        }

    def reset(self):
        """Reset the simulator to initial state while preserving configuration."""
        self.error_count = 0
        self.operation_count = 0
        self.history_error_rates = []
        self.successful_retries = 0
        self.failed_retries = 0
        self.total_retry_attempts = 0
        self.recovery_times = []
        self.current_recovery_start = None
        self.error_spikes = []
        self.total_cost = 0.0


class SimulationRunner:
    """
    Manages and visualizes the simulation of the input unit.
    
    This class handles:
    - Running the simulation at configurable speeds
    - Visualization of metrics in real-time
    - Changing parameters during simulation
    """
    def __init__(
        self, 
        simulator: EnhancedInputUnitSimulator, 
        initial_error_probability=0.03, 
        step_delay=0.1
    ):
        self.simulator = simulator
        self.error_probability = initial_error_probability
        self.step_delay = step_delay  # seconds between steps
        self.running = False
        self.step_count = 0
        self.paused = False
        
        # Data for visualization
        self.error_rate_history = []
        self.threshold_history = [simulator.acceptable_error_threshold]
        self.retry_limit_history = [simulator.retry_attempt_limit]
        self.efficiency_history = [1.0]
        self.cost_history = [0.0]
        
        # Set up the plot
        self.fig = plt.figure(figsize=(14, 10))
        self.gs = plt.GridSpec(3, 2, height_ratios=[1, 1, 1])
        
        # Main error rate plot
        self.ax_error = self.fig.add_subplot(self.gs[0, :])
        
        # Retry metrics
        self.ax_retry = self.fig.add_subplot(self.gs[1, 0])
        
        # Efficiency score
        self.ax_efficiency = self.fig.add_subplot(self.gs[1, 1])
        
        # Cost plot
        self.ax_cost = self.fig.add_subplot(self.gs[2, 0])
        
        # Recovery time metrics
        self.ax_recovery = self.fig.add_subplot(self.gs[2, 1])
        
        self.setup_plots()
        
    def setup_plots(self):
        """Initialize plots with proper formatting and empty data series."""
        # Error rate plot
        self.ax_error.set_title("Error Rate vs Threshold")
        self.ax_error.set_ylabel("Rate")
        self.line_error, = self.ax_error.plot([], [], 'r-', label='Error Rate')
        self.line_threshold, = self.ax_error.plot([], [], 'b--', label='Threshold')
        self.ax_error.legend()
        self.ax_error.grid(True)
        
        # Retry plot
        self.ax_retry.set_title("Retry Statistics")
        self.ax_retry.set_ylabel("Count")
        self.ax_retry.set_xlabel("Simulation Steps")
        self.line_retry, = self.ax_retry.plot([], [], 'g-', label='Retry Limit')
        self.ax_retry.legend()
        self.ax_retry.grid(True)
        
        # Efficiency plot
        self.ax_efficiency.set_title("System Efficiency")
        self.ax_efficiency.set_ylabel("Score")
        self.ax_efficiency.set_xlabel("Simulation Steps")
        self.line_efficiency, = self.ax_efficiency.plot([], [], 'm-', label='Efficiency')
        self.ax_efficiency.set_ylim(0, 1.1)
        self.ax_efficiency.legend()
        self.ax_efficiency.grid(True)
        
        # Cost plot
        self.ax_cost.set_title("Operational Costs")
        self.ax_cost.set_ylabel("Cost")
        self.ax_cost.set_xlabel("Simulation Steps")
        self.line_cost, = self.ax_cost.plot([], [], 'k-', label='Cost per Op')
        self.ax_cost.legend()
        self.ax_cost.grid(True)
        
        # Recovery time plot
        self.ax_recovery.set_title("Error Recovery Profile")
        self.ax_recovery.set_ylabel("Count")
        self.ax_recovery.set_xlabel("Simulation Steps") 
        self.bar_recovery = self.ax_recovery.bar([0], [0], color='orange')
        self.ax_recovery.grid(True)
        
        self.fig.tight_layout()

    def start(self):
        """Start the simulation loop with animation."""
        self.running = True
        self.paused = False
        
        # Use FuncAnimation for the loop that can be sped up/slowed down
        self.animation = FuncAnimation(
            self.fig, self.update, interval=self.step_delay*1000, blit=False)
        plt.show()
        
    def stop(self):
        """Stop the simulation."""
        self.running = False
        if hasattr(self, 'animation'):
            self.animation.event_source.stop()
        
    def pause(self):
        """Pause/resume the simulation."""
        self.paused = not self.paused
        if hasattr(self, 'animation'):
            if self.paused:
                self.animation.event_source.stop()
            else:
                self.animation.event_source.start()
            
    def set_speed(self, delay):
        """
        Adjust the simulation speed (delay in seconds)
        
        Args:
            delay: Time between simulation steps in seconds
        """
        self.step_delay = delay
        if hasattr(self, 'animation'):
            self.animation.event_source.interval = delay * 1000
            
    def update_error_probability(self, new_probability):
        """
        Update the underlying error probability
        
        Args:
            new_probability: New error probability (0.0 to 1.0)
        """
        self.error_probability = new_probability
        
    def update(self, frame):
        """Update the simulation state and plots for each animation frame."""
        if not self.running or self.paused:
            return self.line_error, self.line_threshold, self.line_retry, self.line_efficiency
            
        # Run a simulation step
        self.simulator.process_data(self.error_probability)
        self.step_count += 1
        
        # Get latest metrics
        metrics = self.simulator.get_metrics()
        
        # Update histories
        self.error_rate_history.append(metrics["current_error_rate"])
        self.threshold_history.append(metrics["acceptable_threshold"])
        self.retry_limit_history.append(metrics["retry_limit"])
        self.efficiency_history.append(metrics["efficiency_score"])
        self.cost_history.append(metrics["cost_per_operation"])
        
        # Limit history length for performance
        max_history = 1000
        if len(self.error_rate_history) > max_history:
            self.error_rate_history = self.error_rate_history[-max_history:]
            self.threshold_history = self.threshold_history[-max_history:]
            self.retry_limit_history = self.retry_limit_history[-max_history:]
            self.efficiency_history = self.efficiency_history[-max_history:]
            self.cost_history = self.cost_history[-max_history:]
        
        # Update plot data
        x = range(len(self.error_rate_history))
        
        # Error rates
        self.line_error.set_data(x, self.error_rate_history)
        self.line_threshold.set_data(range(len(self.threshold_history)), self.threshold_history)
        
        # Retry limits
        self.line_retry.set_data(range(len(self.retry_limit_history)), self.retry_limit_history)
        
        # Efficiency score
        self.line_efficiency.set_data(range(len(self.efficiency_history)), self.efficiency_history)
        
        # Cost per operation
        self.line_cost.set_data(range(len(self.cost_history)), self.cost_history)
        
        # Recovery time histogram - update periodically to avoid performance issues
        if self.step_count % 20 == 0 and metrics["recovery_times"]:
            self.ax_recovery.clear()
            self.ax_recovery.set_title("Error Recovery Profile")
            self.ax_recovery.set_ylabel("Frequency")
            self.ax_recovery.set_xlabel("Recovery Time (steps)")
            self.ax_recovery.hist(
                metrics["recovery_times"], bins=min(20, len(metrics["recovery_times"])), 
                alpha=0.7, color='orange'
            )
            self.ax_recovery.grid(True)
            
        # Adjust axes limits
        self.ax_error.relim()
        self.ax_error.autoscale_view()
        self.ax_retry.relim()
        self.ax_retry.autoscale_view()
        self.ax_efficiency.relim()
        self.ax_efficiency.autoscale_view()
        self.ax_cost.relim()
        self.ax_cost.autoscale_view()
        
        return self.line_error, self.line_threshold, self.line_retry, self.line_efficiency


def run_interactive_simulation():
    """Run interactive simulation with a UI for controlling parameters."""
    # Create an enhanced simulator with default parameters
    simulator = EnhancedInputUnitSimulator(
        initial_threshold=0.05, 
        adjustment_step=0.001, 
        initial_retry_limit=3, 
        window_size=100,
        adaptation_rate=0.05
    )
    
    # Create the simulation runner
    runner = SimulationRunner(simulator, initial_error_probability=0.03, step_delay=0.1)
    
    # Add UI controls using matplotlib widgets
    from matplotlib.widgets import Slider, Button, CheckButtons
    
    # Create a new figure for controls
    control_fig, control_ax = plt.subplots(figsize=(8, 4))
    control_ax.set_title('Simulation Controls')
    control_ax.axis('off')
    
    # Error probability slider
    error_prob_ax = plt.axes([0.25, 0.8, 0.65, 0.03])
    error_prob_slider = Slider(
        ax=error_prob_ax, 
        label='Error Probability',
        valmin=0.001,
        valmax=0.2,
        valinit=0.03,
        valstep=0.001
    )
    
    # Speed slider
    speed_ax = plt.axes([0.25, 0.7, 0.65, 0.03])
    speed_slider = Slider(
        ax=speed_ax, 
        label='Simulation Speed',
        valmin=0.01,
        valmax=1.0,
        valinit=0.1,
        valstep=0.01
    )
    
    # Start/Pause button
    start_ax = plt.axes([0.3, 0.5, 0.2, 0.1])
    start_button = Button(start_ax, 'Start')
    
    # Reset button
    reset_ax = plt.axes([0.6, 0.5, 0.2, 0.1])
    reset_button = Button(reset_ax, 'Reset')

    def on_error_prob_change(val):
        runner.update_error_probability(val)
        
    def on_speed_change(val):
        runner.set_speed(val)
        
    def on_start_click(event):
        if not runner.running:
            runner.start()
            start_button.label.set_text('Pause')
        else:
            runner.pause()
            if runner.paused:
                start_button.label.set_text('Resume')
            else:
                start_button.label.set_text('Pause')
        control_fig.canvas.draw_idle()
            
    def on_reset_click(event):
        simulator.reset()
        if runner.running:
            runner.stop()
        start_button.label.set_text('Start')
        control_fig.canvas.draw_idle()
    
    # Connect callbacks
    error_prob_slider.on_changed(on_error_prob_change)
    speed_slider.on_changed(on_speed_change)
    start_button.on_clicked(on_start_click)
    reset_button.on_clicked(on_reset_click)
    
    plt.tight_layout()
    plt.show()
    
    return simulator, runner


if __name__ == "__main__":
    # Run the enhanced simulation with interactive controls
    simulator, runner = run_interactive_simulation()