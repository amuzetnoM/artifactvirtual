import sys
import os

# Add parent directory to path so we can import the InputUnitSim module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from InputUnitSim.inputunit import EnhancedInputUnitSimulator
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np

def run_simulation(steps=1000):
    """Run the enhanced input unit simulator for the specified number of steps."""
    # Create simulator
    simulator = EnhancedInputUnitSimulator(
        initial_threshold=0.05,
        adjustment_step=0.001,
        initial_retry_limit=3,
        window_size=100
    )
    
    # Track metrics
    error_rates = []
    thresholds = [simulator.acceptable_error_threshold]
    retry_limits = [simulator.retry_attempt_limit]
    
    # Run simulation
    for i in range(steps):
        # Change error probability halfway through
        error_prob = 0.03 if i < steps/2 else 0.08
        simulator.process_data(error_prob)
        
        # Record metrics
        error_rates.append(simulator._calculate_current_error_rate())
        thresholds.append(simulator.acceptable_error_threshold)
        retry_limits.append(simulator.retry_attempt_limit)
    
    # Get final metrics
    metrics = simulator.get_metrics() if hasattr(simulator, "get_metrics") else {}
    
    return {
        "error_rates": error_rates,
        "thresholds": thresholds,
        "retry_limits": retry_limits,
        "metrics": metrics
    }

def create_plotly_visualization(results):
    """Create interactive Plotly visualization of simulation results."""
    # Create subplot layout
    fig = make_subplots(
        rows=2, cols=1, 
        subplot_titles=("Error Rate and Threshold", "Retry Limit Evolution"),
        vertical_spacing=0.15,
        shared_xaxes=True
    )
    
    # Extract data
    x = list(range(len(results["error_rates"])))
    
    # Add error rate trace
    fig.add_trace(
        go.Scatter(
            x=x,
            y=results["error_rates"],
            name="Error Rate",
            line=dict(color="red", width=2)
        ),
        row=1, col=1
    )
    
    # Add threshold trace
    fig.add_trace(
        go.Scatter(
            x=x,
            y=results["thresholds"][:-1],  # Adjust length to match
            name="Error Threshold",
            line=dict(color="blue", width=2, dash="dash")
        ),
        row=1, col=1
    )
    
    # Add vertical line where error probability changes
    change_point = len(x) // 2
    fig.add_vline(
        x=change_point,
        line_dash="dot",
        line_color="green",
        annotation_text="Error Rate Changed",
        annotation_position="top right",
        row=1, col=1
    )
    
    # Add retry limit trace
    fig.add_trace(
        go.Scatter(
            x=x,
            y=results["retry_limits"][:-1],  # Adjust length to match
            name="Retry Limit",
            line=dict(color="orange", width=2)
        ),
        row=2, col=1
    )
    
    # Update layout
    fig.update_layout(
        title_text="Input Unit Simulator Results",
        height=800,
        width=1000,
        hovermode="x unified",
        showlegend=True,
        template="plotly_white",
    )
    
    fig.update_xaxes(title_text="Simulation Steps", row=2, col=1)
    fig.update_yaxes(title_text="Rate", row=1, col=1)
    fig.update_yaxes(title_text="Count", row=2, col=1)
    
    # Add annotations for final values
    final_error_rate = results["error_rates"][-1]
    final_threshold = results["thresholds"][-2]  # Account for length difference
    final_retry_limit = results["retry_limits"][-2]
    
    annotations = [
        dict(
            x=len(x) - 1,
            y=final_error_rate,
            xref="x",
            yref="y",
            text=f"Final: {final_error_rate:.4f}",
            showarrow=True,
            arrowhead=2,
            ax=40,
            ay=-40
        ),
        dict(
            x=len(x) - 1,
            y=final_threshold,
            xref="x",
            yref="y",
            text=f"Final: {final_threshold:.4f}",
            showarrow=True,
            arrowhead=2,
            ax=-40,
            ay=-40
        ),
        dict(
            x=len(x) - 1,
            y=final_retry_limit,
            xref="x2",
            yref="y2",
            text=f"Final: {final_retry_limit}",
            showarrow=True,
            arrowhead=2,
            ax=30,
            ay=-30
        )
    ]
    
    fig.update_layout(annotations=annotations)
    
    return fig

if __name__ == "__main__":
    print("Running Input Unit Simulator with Plotly visualization...")
    results = run_simulation(steps=1000)
    fig = create_plotly_visualization(results)
    
    # To display in browser
    fig.show()
    
    # To save as HTML
    fig.write_html("input_unit_results.html")
    
    # To save as image
    fig.write_image("input_unit_results.png", scale=2)
    
    print("Simulation complete!")
    print("Results saved as 'input_unit_results.html' and 'input_unit_results.png'")