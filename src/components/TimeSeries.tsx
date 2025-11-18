import React from 'react';
import { LazyPlot } from './LazyPlot';
import type { SimulationResult } from '../solvers/RK4Solver';
import { validateSimulationResult } from '../utils/calculations';
import './TimeSeries.css';

interface TimeSeriesProps {
  simulationResult: SimulationResult | null;
  showLegend?: boolean;
  modelType?: string;
}

/**
 * TimeSeries component displays the time evolution of S, I, R populations
 * using Plotly.js for interactive visualization
 */
const TimeSeriesComponent: React.FC<TimeSeriesProps> = ({ 
  simulationResult, 
  showLegend = true,
  modelType = 'basic-sir'
}) => {
  // Handle null simulation result
  if (!simulationResult) {
    return (
      <div className="timeseries-container">
        <div className="timeseries-empty">
          <p>No simulation data available. Please check your parameters.</p>
        </div>
      </div>
    );
  }
  
  // Validate simulation result for NaN/Infinity
  const validation = validateSimulationResult(simulationResult);
  if (!validation.isValid) {
    console.error('Invalid simulation result:', validation.error);
    return (
      <div className="timeseries-container">
        <div className="timeseries-error">
          <h4>Simulation Error</h4>
          <p>{validation.error}</p>
        </div>
      </div>
    );
  }
  // Calculate total population for models with vital dynamics
  const hasVitalDynamics = modelType === 'natural-demographics' || modelType === 'disease-deaths';
  const totalPopulation = hasVitalDynamics 
    ? simulationResult.S.map((s, i) => s + simulationResult.I[i] + simulationResult.R[i])
    : null;
  
  // Create traces for S(t), I(t), R(t), and optionally N(t)
  const traces: Plotly.Data[] = [
    {
      x: simulationResult.t,
      y: simulationResult.S,
      type: 'scatter',
      mode: 'lines',
      name: 'Susceptible (S)',
      line: { color: '#2563eb', width: 2 },
      hovertemplate: '<b>S(t)</b><br>Time: %{x:.2f}<br>Population: %{y:.2f}<extra></extra>',
    },
    {
      x: simulationResult.t,
      y: simulationResult.I,
      type: 'scatter',
      mode: 'lines',
      name: 'Infected (I)',
      line: { color: '#dc2626', width: 2 },
      hovertemplate: '<b>I(t)</b><br>Time: %{x:.2f}<br>Population: %{y:.2f}<extra></extra>',
    },
    {
      x: simulationResult.t,
      y: simulationResult.R,
      type: 'scatter',
      mode: 'lines',
      name: 'Recovered (R)',
      line: { color: '#16a34a', width: 2 },
      hovertemplate: '<b>R(t)</b><br>Time: %{x:.2f}<br>Population: %{y:.2f}<extra></extra>',
    },
  ];
  
  // Add total population trace for models with vital dynamics
  if (hasVitalDynamics && totalPopulation) {
    traces.push({
      x: simulationResult.t,
      y: totalPopulation,
      type: 'scatter',
      mode: 'lines',
      name: 'Total Population (N)',
      line: { color: '#f59e0b', width: 2, dash: 'dash' },
      hovertemplate: '<b>N(t) = S+I+R</b><br>Time: %{x:.2f}<br>Population: %{y:.2f}<extra></extra>',
    });
  }

  // Configure plot layout with dark theme
  const layout: Partial<Plotly.Layout> = {
    title: {
      text: 'Population Dynamics Over Time',
      font: { size: 18, family: 'Arial, sans-serif', color: '#e2e8f0' },
    },
    xaxis: {
      title: {
        text: 'Time',
        font: { size: 14, color: '#cbd5e1' },
      },
      gridcolor: '#334155',
      showgrid: true,
      color: '#94a3b8',
    },
    yaxis: {
      title: {
        text: 'Population',
        font: { size: 14, color: '#cbd5e1' },
      },
      gridcolor: '#334155',
      showgrid: true,
      color: '#94a3b8',
    },
    showlegend: showLegend,
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1,
      bgcolor: 'rgba(15, 23, 42, 0.9)',
      bordercolor: '#475569',
      borderwidth: 1,
      font: { color: '#e2e8f0' },
    },
    hovermode: 'closest',
    plot_bgcolor: '#0f172a',
    paper_bgcolor: '#0f172a',
    margin: { l: 60, r: 40, t: 60, b: 60 },
  };

  // Configure plot options
  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  };

  return (
    <div className="timeseries-container">
      <LazyPlot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        loadingMessage="Loading time series plot..."
      />
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const TimeSeries = React.memo(TimeSeriesComponent);
