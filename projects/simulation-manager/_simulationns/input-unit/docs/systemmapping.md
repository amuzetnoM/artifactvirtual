# InputUnitSim System Mapping

## Architecture Overview

The InputUnitSim system follows a modular, component-based architecture designed for flexibility, extensibility, and runtime customization. This document provides a comprehensive reference of all system components, their interactions, and integration points for external systems.

```
┌─────────────────────────────────────────────────────────────────┐
│                   EnhancedInputUnitSimulator                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐       ┌───────────────┐       ┌────────────┐ │
│  │ Core Simulator│       │  Strategy     │       │ Algorithms │ │
│  │ Engine        │◄─────►│  Manager      │◄─────►│            │ │
│  └───────────────┘       └───────────────┘       └────────────┘ │
│         ▲                                                       │
│         │                                                       │
│  ┌──────┴────────┐       ┌───────────────┐       ┌────────────┐ │
│  │ Metrics       │       │ Visualization │       │ External   │ │
│  │ Collection    │─────► │ Module        │─────► │ Dashboards │ │
│  └───────────────┘       └───────────────┘       └────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Core Components

### 1.1 EnhancedInputUnitSimulator

The primary class that orchestrates the simulation of input processing with adaptive error handling.

#### Key Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `acceptable_error_threshold` | float | Maximum acceptable error rate | 0.05 |
| `adjustment_step` | float | How quickly the threshold adapts | 0.001 |
| `retry_attempt_limit` | int | Maximum retry attempts per operation | 3 |
| `window_size` | int | History window for calculating error rates | 100 |
| `adaptation_rate` | float | Overall adaptation speed | 0.05 |
| `max_retry_limit` | int | Maximum allowed retry attempts | 10 |
| `min_retry_limit` | int | Minimum allowed retry attempts | 1 |

#### Key Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `process_data` | `error_probability: float` | `bool` | Process a single unit of data with given error probability |
| `get_metrics` | None | `Dict[str, Any]` | Return comprehensive metrics about simulator state |
| `reset` | None | None | Reset simulator to initial state while preserving configuration |
| `add_custom_algorithm` | `algorithm: Algorithm` | None | Add a custom algorithm to the simulator |
| `remove_algorithm` | `name: str` | None | Remove an algorithm by name |
| `enable_algorithm` | `name: str, enabled: bool` | None | Enable or disable an algorithm |
| `update_algorithm_parameter` | `algorithm_name: str, param_name: str, value: Any` | None | Update a parameter for a specific algorithm |

### 1.2 StrategyManager

Manages the collection of algorithms that can be dynamically added, removed, or modified during simulation runtime.

#### Key Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `register_algorithm` | `algorithm: Algorithm` | None | Register an algorithm with the manager |
| `unregister_algorithm` | `name: str` | None | Remove an algorithm from the manager |
| `get_algorithm` | `name: str` | `Algorithm` | Get algorithm by name |
| `execute_algorithm` | `name: str, *args, **kwargs` | `Any` | Execute a specific algorithm by name |
| `execute_all` | `category: str = None, *args, **kwargs` | `Dict[str, Any]` | Execute all enabled algorithms, optionally filtered by category |
| `list_algorithms` | `category: str = None` | `Dict[str, Dict[str, Any]]` | List all algorithms with their parameters |

### 1.3 Algorithm Base Class

Abstract base class for all pluggable algorithms in the system.

#### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | str | Unique identifier for the algorithm |
| `description` | str | Human-readable description |
| `parameters` | Dict[str, Any] | Configuration parameters |
| `enabled` | bool | Whether the algorithm is active |

#### Key Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `execute` | `simulator: EnhancedInputUnitSimulator, *args, **kwargs` | `Any` | Execute algorithm logic on simulator state |
| `set_parameter` | `param_name: str, value: Any` | None | Set a parameter value |
| `get_parameter` | `param_name: str` | `Any` | Get a parameter value |
| `get_parameters` | None | `Dict[str, Any]` | Get all parameters |

## 2. Algorithm Implementations

### 2.1 Threshold Adjustment Algorithms

Algorithms that dynamically adjust the acceptable error threshold based on observed error patterns.

#### 2.1.1 AdaptiveThresholdAlgorithm

Adjusts threshold based on error rate with adaptive factors.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_threshold` | float | 0.001 | Minimum allowed threshold |
| `aggressive_factor` | float | 10.0 | How aggressively threshold increases with high error rates |
| `decrease_step_factor` | float | 1.0 | Controls threshold decrease speed |
| `upper_multiplier` | float | 1.2 | Maximum threshold as multiplier of error rate |
| `lower_multiplier` | float | 1.1 | Minimum threshold as multiplier of error rate |

#### 2.1.2 MomentumThresholdAlgorithm

Adjusts threshold with momentum for increased stability.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_threshold` | float | 0.001 | Minimum allowed threshold |
| `momentum` | float | 0.85 | How much to retain previous adjustment direction (0-1) |
| `max_aggressive_factor` | float | 10.0 | Maximum factor for aggressive increases |
| `smoothing_factor` | float | 0.7 | Weight for exponential smoothing |
| `upper_multiplier` | float | 1.2 | Maximum threshold as multiplier of error rate |
| `lower_multiplier` | float | 1.1 | Minimum threshold as multiplier of error rate |

### 2.2 Retry Limit Algorithms

Optimize retry attempt limits based on error rates and success probabilities.

#### 2.2.1 GeometricRetryAlgorithm

Optimizes retry limits based on geometric distribution.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target_success_probability` | float | 0.99 | Desired probability of success after retries |
| `adjustment_speed` | float | 1.0 | How quickly to move toward optimal value (1=immediate) |

#### 2.2.2 DiminishingRetryAlgorithm

Models retry attempts with diminishing returns.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target_success_probability` | float | 0.99 | Desired probability of success after retries |
| `fatigue_factor` | float | 0.15 | How much each retry increases error probability |
| `recovery_factor` | float | 0.05 | How much error probability can recover between retries |
| `max_retry_growth` | float | 3.0 | Maximum multiplier for error probability |
| `adjustment_speed` | float | 0.7 | How quickly to adjust retry limit (0-1) |

### 2.3 Efficiency Algorithms

Calculate system efficiency using configurable metrics and weights.

#### 2.3.1 WeightedEfficiencyAlgorithm

Calculates efficiency with configurable weights.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `error_rate_weight` | float | 0.4 | Weight of error rate in efficiency calculation |
| `retry_success_weight` | float | 0.4 | Weight of retry success rate in efficiency calculation |
| `threshold_appropriateness_weight` | float | 0.2 | Weight of threshold appropriateness in efficiency calculation |

#### 2.3.2 AdaptiveEfficiencyAlgorithm

Calculates efficiency with weights that adapt based on system performance.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initial_error_rate_weight` | float | 0.4 | Initial weight of error rate |
| `initial_retry_success_weight` | float | 0.4 | Initial weight of retry success rate |
| `initial_threshold_weight` | float | 0.2 | Initial weight of threshold appropriateness |
| `adaptation_factor` | float | 0.05 | How quickly weights adapt |
| `goal_emphasis_threshold` | float | 0.5 | Performance threshold that triggers weight adaptation |

### 2.4 Cost Model Algorithms

Calculate the theoretical costs of operations, retries, and errors.

#### 2.4.1 EnhancedCostModelAlgorithm

Advanced cost model considering multiple factors including latency and resource usage.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `base_operation_cost` | float | 1.0 | Base cost of an operation |
| `retry_cost_factor` | float | 0.5 | Base retry cost as a factor of operation cost |
| `retry_fatigue_factor` | float | 0.2 | Additional cost per retry attempt |
| `error_cost_factor` | float | 5.0 | Base error cost as a factor of operation cost |
| `error_severity_factor` | float | 0.5 | How much error cost increases with error rate |
| `latency_cost_factor` | float | 0.3 | Cost of retry delays |
| `resource_usage_factor` | float | 0.2 | Resource usage cost per operation |
| `congestion_threshold` | float | 0.7 | When resource usage exceeds this, costs increase |

### 2.5 Coordination Algorithms

Coordinate multiple strategies to optimize overall system performance.

#### 2.5.1 ThresholdRetryCoordinatorAlgorithm

Coordinates threshold and retry strategies for optimal resource usage.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `coordination_strength` | float | 0.7 | How strongly to coordinate (0-1) |
| `threshold_weight` | float | 0.5 | Balance between threshold and retry adjustments |
| `resource_efficiency_target` | float | 0.8 | Target efficiency score |
| `min_retry_per_threshold_ratio` | float | 0.5 | Minimum retry/threshold ratio |
| `max_retry_per_threshold_ratio` | float | 20.0 | Maximum retry/threshold ratio |

## 3. Visualization and Reporting

### 3.1 SimulationRunner

Manages and visualizes the simulation of the input unit.

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `simulator` | EnhancedInputUnitSimulator | The simulator instance | Required |
| `error_probability` | float | Probability of errors in operations | 0.03 |
| `step_delay` | float | Seconds between simulation steps | 0.1 |
| `running` | bool | Whether simulation is running | False |
| `paused` | bool | Whether simulation is paused | False |

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `start` | `run_for: int = None` | None | Start simulation, optionally for limited steps |
| `stop` | None | None | Stop simulation |
| `pause` | None | None | Pause simulation |
| `resume` | None | None | Resume simulation |
| `step` | None | None | Advance simulation by one step |
| `save_results` | `filename: str` | None | Save simulation results to file |
| `create_visualization` | None | Figure | Create visualization of simulation results |

## 4. Integration Endpoints

### 4.1 Dashboard Integration

The simulator provides multiple endpoints for real-time monitoring and analysis through external dashboards.

#### 4.1.1 Metrics API

| Endpoint | Data Format | Update Frequency | Description |
|----------|-------------|------------------|-------------|
| `/metrics/current` | JSON | Real-time | Current state of all metrics |
| `/metrics/history` | JSON | Real-time | Historical metrics over time |
| `/metrics/efficiency` | JSON | Real-time | Efficiency scores and component values |
| `/metrics/cost` | JSON | Real-time | Cost breakdown by operation type |

#### 4.1.2 Control API

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/control/start` | POST | `steps: int` (optional) | Start simulation |
| `/control/stop` | POST | None | Stop simulation |
| `/control/pause` | POST | None | Pause simulation |
| `/control/resume` | POST | None | Resume simulation |
| `/control/reset` | POST | None | Reset simulation |
| `/control/config` | PUT | Configuration parameters | Update simulation configuration |

#### 4.1.3 Algorithm Management API

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/algorithms` | GET | None | List all available algorithms |
| `/algorithms/{name}` | GET | None | Get algorithm details |
| `/algorithms/{name}` | PUT | Algorithm parameters | Update algorithm parameters |
| `/algorithms/{name}/enable` | POST | `enabled: bool` | Enable or disable algorithm |
| `/algorithms/register` | POST | Algorithm definition | Register a new algorithm |
| `/algorithms/{name}` | DELETE | None | Remove algorithm |

### 4.2 Data Formats

#### 4.2.1 Metrics Data

```json
{
  "timestamp": "2023-11-10T15:30:00Z",
  "current_error_rate": 0.035,
  "acceptable_threshold": 0.042,
  "retry_limit": 5,
  "retry_success_rate": 0.87,
  "avg_recovery_time": 53.4,
  "error_spike_count": 3,
  "operations": 1500,
  "total_errors": 52,
  "total_retry_attempts": 115,
  "successful_retries": 100,
  "failed_retries": 15,
  "efficiency_score": 0.92,
  "threshold_stability": 0.88,
  "error_variance": 0.0012,
  "total_cost": 2354.7,
  "cost_per_operation": 1.57,
  "congestion_level": 0.32
}
```

#### 4.2.2 Algorithm Configuration

```json
{
  "name": "adaptive_threshold",
  "description": "Adjusts threshold based on error rate with adaptive factors",
  "enabled": true,
  "parameters": {
    "min_threshold": 0.001,
    "aggressive_factor": 12.0,
    "decrease_step_factor": 1.0,
    "upper_multiplier": 1.2,
    "lower_multiplier": 1.1
  }
}
```

## 5. Extending the System

### 5.1 Creating Custom Algorithms

To create a custom algorithm for the InputUnitSim system:

1. Create a new class that inherits from the `Algorithm` base class
2. Implement the required `execute()` method
3. Define parameters in the constructor
4. Register the algorithm with the simulator using `add_custom_algorithm()`

#### Example of a Custom Algorithm

```python
class MyCustomAlgorithm(Algorithm):
    def __init__(self):
        parameters = {
            'category': 'custom',
            'parameter1': 1.0,
            'parameter2': 0.5
        }
        super().__init__(
            "my_custom_algorithm", 
            "My custom algorithm description",
            parameters
        )
        
    def execute(self, simulator, *args, **kwargs):
        # Algorithm logic goes here
        parameter1 = self.parameters['parameter1']
        parameter2 = self.parameters['parameter2']
        
        # Perform calculations based on simulator state
        result = parameter1 * simulator._calculate_current_error_rate() / parameter2
        
        # Update simulator state if needed
        simulator.some_property = result
        
        # Return result
        return result
```

### 5.2 Integration with External Systems

The InputUnitSim system supports integration with external systems through:

1. **REST API**: Provides JSON endpoints for metrics and control
2. **Message Queue**: Publishes events to configured message brokers
3. **File Export**: Exports metrics and results to CSV/JSON for offline analysis
4. **WebSocket**: Enables real-time streaming of simulation state
5. **Custom Adapters**: Extensible adapter framework for specialized integrations

## 6. Mathematical Models

### 6.1 Adaptive Error Threshold Adjustment

The adaptive threshold algorithm uses the following model:

```
If error_rate > threshold:
    adjustment = adjustment_step * min(3.0, 1.0 + |error_gap| * aggressive_factor)
    threshold = min(error_rate * upper_multiplier, threshold + adjustment)
Else:
    threshold = max(error_rate * lower_multiplier, threshold - adjustment_step, min_threshold)
```

Where:
- `error_gap = error_rate - threshold`
- `adjustment_step` controls the speed of adaptation
- `aggressive_factor` controls how aggressively the threshold increases when error rates are high

### 6.2 Geometric Retry Model

The geometric retry algorithm calculates the optimal retry limit using:

```
optimal_retries = ceil(log(1 - target_success_prob) / log(error_rate))
```

Where:
- `target_success_prob` is the desired probability of success after retries
- `error_rate` is the current observed error rate

### 6.3 Diminishing Returns Model

The diminishing returns retry model accounts for retry fatigue:

```
For each retry i:
    fatigue = min(max_retry_growth - 1.0, fatigue_factor * i)
    recovery = recovery_factor * i
    error_prob_i = min(0.99, error_rate * (1.0 + fatigue) * (1.0 - recovery))
    
    retry_success_prob = 1.0 - error_prob_i
    cumulative_success_prob += (1.0 - cumulative_success_prob) * retry_success_prob
```

### 6.4 Weighted Efficiency Calculation

System efficiency is calculated as:

```
efficiency = (1 - error_rate) * w1 + retry_success_rate * w2 + threshold_appropriateness * w3
```

Where:
- `w1`, `w2`, and `w3` are configurable weights
- `threshold_appropriateness = min(1.0, (threshold + 0.001) / (error_rate + 0.001))`

## 7. Performance Considerations

### 7.1 Memory Usage

The simulator maintains historical data in memory for calculating error rates and other metrics. For long-running simulations, consider:

- Using smaller `window_size` values to limit memory consumption
- Using the `reset()` method periodically to clear history while preserving configuration
- Exporting metrics to external systems for long-term storage and analysis

### 7.2 Computational Complexity

Algorithm computational complexity varies:

| Algorithm | Time Complexity | Space Complexity | Notes |
|-----------|----------------|-----------------|-------|
| AdaptiveThreshold | O(1) | O(1) | Very efficient |
| MomentumThreshold | O(1) | O(1) | Additional state for momentum |
| GeometricRetry | O(1) | O(1) | Logarithmic calculations |
| DiminishingRetry | O(n) | O(1) | Linear in retry limit |
| WeightedEfficiency | O(1) | O(1) | Simple weighted average |
| AdaptiveEfficiency | O(k) | O(k) | k = history size for trend detection |
| EnhancedCostModel | O(1) | O(1) | Multiple cost components |
| ThresholdRetryCoordinator | O(1) | O(1) | Periodic execution only |

### 7.3 Parallelization

The simulator is designed for single-threaded operation by default, but supports:

- Batch simulation mode for parallel execution of multiple scenarios
- External process execution for compute-intensive scenarios
- Distributed simulation for large-scale parameter sweeps

## 8. Appendices

### 8.1 Configuration Parameters

| Parameter | Description | Default | Range | Impact |
|-----------|-------------|---------|-------|--------|
| `initial_threshold` | Starting error threshold | 0.05 | 0.001-0.5 | Higher values allow more errors before adaptation |
| `adjustment_step` | How quickly threshold adapts | 0.001 | 0.0001-0.01 | Higher values cause more aggressive adaptation |
| `initial_retry_limit` | Starting retry attempt limit | 3 | 1-10 | Higher values improve success but increase resource usage |
| `window_size` | History window for error rate calculation | 100 | 10-1000 | Larger windows provide more stable metrics but slower response |
| `adaptation_rate` | Overall adaptation speed | 0.05 | 0.01-0.2 | Higher values cause faster adaptation to changing conditions |
| `max_retry_limit` | Maximum allowed retry attempts | 10 | 1-100 | Upper bound on retry attempts |
| `min_retry_limit` | Minimum allowed retry attempts | 1 | 1-10 | Lower bound on retry attempts |

### 8.2 Error Patterns

The simulator handles several common error patterns:

1. **Constant Error Rate**: Stable error probability
2. **Step Changes**: Sudden jumps in error probability
3. **Gradual Drift**: Slowly changing error probability
4. **Periodic Variations**: Cyclical changes in error probability
5. **Random Spikes**: Intermittent error probability spikes
6. **Correlated Errors**: Errors that cluster together

### 8.3 Sample Code

#### Basic Simulation

```python
from InputUnitSim.inputunit import EnhancedInputUnitSimulator

# Create simulator with custom parameters
simulator = EnhancedInputUnitSimulator(
    initial_threshold=0.04,
    adjustment_step=0.0005,
    initial_retry_limit=5
)

# Run simulation with varying error probabilities
for i in range(1000):
    # Simulate changing conditions
    error_prob = 0.02 if i < 500 else 0.08
    success = simulator.process_data(error_prob)
    
    # Output metrics every 100 operations
    if i % 100 == 0:
        metrics = simulator.get_metrics()
        print(f"Step {i}: Error Rate = {metrics['current_error_rate']:.4f}, "
              f"Threshold = {metrics['acceptable_threshold']:.4f}")
```

#### Custom Algorithm Example

```python
from InputUnitSim.inputunit import EnhancedInputUnitSimulator, Algorithm

# Create custom algorithm
class PredictiveThresholdAlgorithm(Algorithm):
    def __init__(self):
        parameters = {
            'category': 'threshold_adjustment',
            'prediction_window': 10,
            'adjustment_factor': 0.5
        }
        super().__init__(
            "predictive_threshold", 
            "Adjusts threshold based on predicted future error rates",
            parameters
        )
        self.error_history = []
        
    def execute(self, simulator, *args, **kwargs):
        # Record current error rate
        current_error_rate = simulator._calculate_current_error_rate()
        self.error_history.append(current_error_rate)
        
        # Keep history limited to prediction window
        if len(self.error_history) > self.parameters['prediction_window']:
            self.error_history.pop(0)
            
        # Simple linear prediction (could be more sophisticated)
        if len(self.error_history) >= 2:
            slope = (self.error_history[-1] - self.error_history[0]) / len(self.error_history)
            predicted_rate = current_error_rate + slope * 5  # Predict 5 steps ahead
            
            # Adjust threshold based on prediction
            adj_factor = self.parameters['adjustment_factor']
            if predicted_rate > current_error_rate:
                # Error rate increasing - prepare by raising threshold
                simulator.acceptable_error_threshold = max(
                    simulator.acceptable_error_threshold,
                    current_error_rate * (1.0 + (predicted_rate/current_error_rate - 1.0) * adj_factor)
                )
            else:
                # Error rate decreasing - can lower threshold
                simulator.acceptable_error_threshold = min(
                    simulator.acceptable_error_threshold,
                    current_error_rate * (1.0 + (predicted_rate/current_error_rate - 1.0) * adj_factor)
                )
                
        return simulator.acceptable_error_threshold

# Create simulator and add custom algorithm
simulator = EnhancedInputUnitSimulator()
simulator.add_custom_algorithm(PredictiveThresholdAlgorithm())
simulator.enable_algorithm("adaptive_threshold", False)  # Disable default
simulator.enable_algorithm("predictive_threshold", True)  # Enable custom
```