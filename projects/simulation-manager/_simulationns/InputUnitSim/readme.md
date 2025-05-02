# Artifact Virtual Simulation Manager

A modular, extensible simulation framework for interactive, real-time modeling, simulation, and analysis of adaptive error handling systems—supporting both quantum and classical domains.

---

## 🚀 Quick Start

1. **Install the environment**
  ```bash
  python setup.py
  ```

2. **Activate the virtual environment**
  - **Windows:**
    ```bash
    venv\Scripts\activate
    ```
  - **Unix/MacOS:**
    ```bash
    source venv/bin/activate
    ```

3. **Install dependencies**
  ```bash
  pip install -r requirements.txt
  ```

4. **Run the simulation**
  ```bash
  python InputUnitSim/inputunit.py
  # or with visualization
  python InputUnitSim/run_with_plotly.py
  ```

---

## 🛠️ Fine-Tuning & Dynamic Algorithm Management

The framework exposes all algorithm parameters for runtime adjustment and supports dynamic addition/removal of algorithms.

```python
# Get the simulator instance
simulator = EnhancedInputUnitSimulator()

# Adjust threshold algorithm parameters
simulator.update_algorithm_parameter("adaptive_threshold", "min_threshold", 0.0005)
simulator.update_algorithm_parameter("adaptive_threshold", "aggressive_factor", 15.0)

# Modify retry algorithm behavior
simulator.update_algorithm_parameter("geometric_retry", "target_success_probability", 0.995)
simulator.update_algorithm_parameter("geometric_retry", "adjustment_speed", 0.5)
```

**Adding/Removing Algorithms:**

```python
# Create a custom algorithm
class CustomErrorDetectionAlgorithm(Algorithm):
  def __init__(self):
    parameters = {
      'category': 'error_detection',
      'sensitivity': 0.8,
      'pattern_recognition': True
    }
    super().__init__(
      "custom_error_detection", 
      "Advanced error pattern detection algorithm",
      parameters
    )
  def execute(self, simulator, *args, **kwargs):
    # Custom implementation
    return detected_patterns

# Add to simulator
simulator.add_custom_algorithm(CustomErrorDetectionAlgorithm())

# Enable/disable algorithms
simulator.enable_algorithm("adaptive_threshold", False)

# Remove an algorithm
simulator.remove_algorithm("weighted_efficiency")
```

**Listing Algorithms:**

```python
# List all registered algorithms
print(simulator.list_algorithms())

# List by category
print(simulator.list_algorithms(category="threshold_adjustment"))
```

---

## ✨ Key Benefits

- **Modularity:** Swappable components for threshold adjustment, retry logic, and metrics.
- **Fine-Tunability:** All parameters are runtime-adjustable.
- **Extensibility:** Add new algorithms without modifying existing code.
- **Transparency:** Inspect all algorithms and parameters.

---

## 🏗️ Core Architecture

- **Simulation Models**
  - `EnhancedInputUnitSimulator`: Adaptive error handling.
  - `QuasarSimulationManager`: Quantum simulation orchestration.

- **Execution Engines**
  - `SimulationRunner`: Manages execution and timing.
  - Real-time parameter control.

- **Visualization Layer**
  - Matplotlib dashboards.
  - Plotly statistical visualizations.
  - Real-time metrics tracking.

- **Analysis Tools**
  - Cost modeling & efficiency scoring.
  - Recovery profiling.
  - Error pattern detection.

---

## 🔑 Features

### Adaptive Error Handling

- **Dynamic Threshold Adjustment:** Auto-tunes error thresholds.
- **Smart Retry Management:** Geometric probability-based retries.
- **Cost-Benefit Analysis:** Models operational costs of errors, retries, and successes.

### Real-Time Visualization

- **Interactive Parameter Control:** Adjust parameters with instant feedback.
- **Multi-dimensional Metrics:** Visualize error rates, thresholds, retry limits, costs, and efficiency.
- **Variable Speed Control:** Analyze at different simulation speeds.

### Novel Capabilities

- **Efficiency Scoring System:** Composite metric for error rates, retries, and thresholds.
- **Adaptive Mathematical Models:** Retry limit calculator using geometric distributions.
- **Error Recovery Profiling:** Visualize recovery from error spikes.
- **Cost Modeling:** Quantify operational cost impact.

---

## 🧬 Quantum Simulation Capabilities

- Quantum circuit simulation (multiple backends).
- Variational algorithms (VQE, QAOA).
- Noise modeling & error mitigation.
- Quantum benchmarking & resource estimation.

---

## 📈 Extended Capabilities

- **Scenario Testing:** Simulate under varied error conditions.
- **Performance Optimization:** Find optimal parameters for different profiles.
- **Comparative Analysis:** Benchmark strategies with standardized metrics.
- **Time-Series Analysis:** Track long-term system behavior.

---

## 🛤️ Future Extensions

- Quantum error correction integration.
- Machine learning-augmented optimization.
- Distributed simulation.
- Additional visualization/export options.

---

## 🧰 Technologies

- Python 3.8+
- NumPy/SciPy
- Matplotlib & Plotly
- Threading for parallelism

---

## 🆕 Updates & Enhancements

### Algorithm Abstraction

- **Algorithm base class:** Template for pluggable algorithms.
- **Dynamic enable/disable:** All algorithms configurable at runtime.

### Strategy Management

- **StrategyManager:** Coordinates algorithms, manages dependencies, and runtime changes.

### Default Algorithms

- **AdaptiveThresholdAlgorithm:** Configurable threshold adjustment.
- **GeometricRetryAlgorithm:** Probability-based retry limits.
- **WeightedEfficiencyAlgorithm:** Adjustable efficiency scoring.

---

## 🧠 Advanced Improvements

### 1. Momentum-Based Threshold Management

- **MomentumThresholdAlgorithm:** Exponential smoothing for stable threshold adjustment.
- **Features:** Dampens oscillation, maintains adjustment direction, smooth transitions.

### 2. Adaptive Efficiency Scoring

- **AdaptiveEfficiencyAlgorithm:** Dynamically adjusts weights based on performance trends.
- **Features:** Trend analysis, component ranking, dynamic weighting.

### 3. Enhanced Cost Model

- **EnhancedCostModelAlgorithm:** Sophisticated cost modeling (congestion, severity, retry fatigue, latency, resource usage).

### 4. Diminishing Returns for Retries

- **DiminishingRetryAlgorithm:** Models retry fatigue, recovery, and cumulative success probability.

### 5. Threshold-Retry Coordination

- **ThresholdRetryCoordinatorAlgorithm:** Coordinates threshold and retry settings for optimal resource usage.

### 6. Multi-Unit Scaling Potential

- **Architecture supports multi-unit coordination:** Extendable via a `SystemCoordinator` and cross-simulator algorithms.

---

## 💡 Example Use Cases

### A/B Testing Strategies

```python
# Swap threshold adjustment strategies
simulator.add_custom_algorithm(ConservativeThresholdAlgorithm())
simulator.add_custom_algorithm(AggressiveThresholdAlgorithm())

# Run with conservative
simulator.enable_algorithm("adaptive_threshold", False)
simulator.enable_algorithm("conservative_threshold", True)
# ...run simulation...

# Switch to aggressive
simulator.enable_algorithm("conservative_threshold", False)
simulator.enable_algorithm("aggressive_threshold", True)
# ...run simulation...
```

### Parameter Sensitivity Analysis

```python
for min_threshold in [0.001, 0.002, 0.005, 0.01]:
  simulator.update_algorithm_parameter("adaptive_threshold", "min_threshold", min_threshold)
  # ...run simulation and record results...
```

### Custom Metric Algorithm

```python
class CustomMetricAlgorithm(Algorithm):
  def __init__(self):
    parameters = {'category': 'metrics', 'weight': 1.0}
    super().__init__("custom_metric", "Custom metric algorithm", parameters)
  def execute(self, simulator, *args, **kwargs):
    # Calculate custom metrics
    return custom_value

simulator.add_custom_algorithm(CustomMetricAlgorithm())
```

---

## 📬 Feedback & Contributions

Contributions, feature requests, and feedback are welcome! Please open an issue or submit a pull request.

