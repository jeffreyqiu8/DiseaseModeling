import React, { useMemo, useEffect, useRef } from 'react';
import { LazyPlot } from './LazyPlot';
import type { SIRModel, ModelParameters } from '../models/SIRModel';
import { RK4Solver } from '../solvers/RK4Solver';
import { validateSimulationResult } from '../utils/calculations';
import './PhasePortrait.css';

interface PhasePortraitProps {
  model: SIRModel;
  parameters: ModelParameters;
  numTrajectories?: number;
}

/**
 * PhasePortrait component displays trajectories in S-I-R phase space
 * using Plotly.js for interactive 3D visualization
 */
const PhasePortraitComponent: React.FC<PhasePortraitProps> = ({ 
  model, 
  parameters,
  numTrajectories = 12
}) => {
  const solverRef = useRef(new RK4Solver());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [plotData, setPlotData] = React.useState<Plotly.Data[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Generate uniformly sampled initial conditions
   * Samples points where S + I + R = constant (normalized to 1)
   */
  const generateInitialConditions = useMemo(() => {
    const conditions = [];
    const N = parameters.N || 1;
    
    // Generate varied initial conditions
    // Sample uniformly across the simplex S + I + R = N
    for (let i = 0; i < numTrajectories; i++) {
      // Use different sampling strategies for variety
      let S, I, R;
      
      if (i < numTrajectories / 3) {
        // High susceptible, varying infected
        S = 0.7 + (i / (numTrajectories / 3)) * 0.25;
        I = 0.01 + (i / (numTrajectories / 3)) * 0.2;
        R = 1 - S - I;
      } else if (i < 2 * numTrajectories / 3) {
        // Medium susceptible, varying infected
        const idx = i - numTrajectories / 3;
        S = 0.4 + (idx / (numTrajectories / 3)) * 0.3;
        I = 0.05 + (idx / (numTrajectories / 3)) * 0.3;
        R = 1 - S - I;
      } else {
        // Lower susceptible, varying infected
        const idx = i - 2 * numTrajectories / 3;
        S = 0.2 + (idx / (numTrajectories / 3)) * 0.2;
        I = 0.1 + (idx / (numTrajectories / 3)) * 0.4;
        R = 1 - S - I;
      }
      
      // Ensure valid conditions
      if (S >= 0 && I >= 0 && R >= 0 && Math.abs(S + I + R - 1) < 0.01) {
        conditions.push({
          S: S * N,
          I: I * N,
          R: R * N,
        });
      }
    }
    
    return conditions;
  }, [numTrajectories, parameters.N]);

  /**
   * Compute trajectories with debouncing
   */
  const computeTrajectories = useMemo(() => {
    return () => {
      try {
        setError(null);
        const traces: Plotly.Data[] = [];
        const colors = [
          '#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6',
          '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
          '#14b8a6', '#a855f7', '#ef4444', '#10b981', '#f43f5e'
        ];
        
        let validTrajectoryCount = 0;
        
        // Use longer time span for models with vital dynamics
        const requiredParams = model.getRequiredParameters();
        const hasVitalDynamics = requiredParams.includes('mu');
        const timeSpan: [number, number] = hasVitalDynamics ? [0, 500] : [0, 100];
        const timeStep = hasVitalDynamics ? 0.5 : 0.1;
        
        generateInitialConditions.forEach((initialState, index) => {
          // Solve for this trajectory
          const result = solverRef.current.solve(
            (state, params) => model.computeDerivatives(state, params),
            initialState,
            parameters,
            timeSpan,
            timeStep
          );
          
          // Validate simulation result
          const validation = validateSimulationResult(result);
          if (!validation.isValid) {
            console.warn(`Trajectory ${index + 1} failed validation:`, validation.error);
            return; // Skip this trajectory
          }
          
          validTrajectoryCount++;
          
          // Create 3D trace
          traces.push({
            x: result.S,
            y: result.I,
            z: result.R,
            type: 'scatter3d',
            mode: 'lines',
            name: `Trajectory ${index + 1}`,
            line: {
              color: colors[index % colors.length],
              width: 3,
            },
            hovertemplate: '<b>Trajectory ' + (index + 1) + '</b><br>' +
                          'S: %{x:.2f}<br>' +
                          'I: %{y:.2f}<br>' +
                          'R: %{z:.2f}<extra></extra>',
            showlegend: false,
          });
          
          // Add starting point marker
          traces.push({
            x: [result.S[0]],
            y: [result.I[0]],
            z: [result.R[0]],
            type: 'scatter3d',
            mode: 'markers',
            name: `Start ${index + 1}`,
            marker: {
              size: 6,
              color: colors[index % colors.length],
              symbol: 'circle',
              line: {
                color: '#000000',
                width: 1,
              },
            },
            hovertemplate: '<b>Start Point</b><br>' +
                          'S₀: %{x:.2f}<br>' +
                          'I₀: %{y:.2f}<br>' +
                          'R₀: %{z:.2f}<extra></extra>',
            showlegend: false,
          });
        });
        
        // Check if we have any valid trajectories
        if (validTrajectoryCount === 0) {
          setError('Unable to compute trajectories with current parameters. Try reducing β or increasing γ.');
          setPlotData([]);
        } else {
          setPlotData(traces);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error computing phase portrait:', error);
        setError(`Failed to compute phase portrait: ${errorMessage}`);
        setPlotData([]);
      }
    };
  }, [model, parameters, generateInitialConditions]);

  /**
   * Debounced effect for parameter changes
   */
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for 300ms debounce
    debounceTimerRef.current = setTimeout(() => {
      computeTrajectories();
    }, 300);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [computeTrajectories]);

  // Configure plot layout with dark theme
  const layout: Partial<Plotly.Layout> = {
    title: {
      text: 'Phase Portrait: S-I-R Space',
      font: { size: 18, family: 'Arial, sans-serif', color: '#e2e8f0' },
    },
    scene: {
      xaxis: {
        title: {
          text: 'Susceptible (S)',
          font: { size: 12, color: '#cbd5e1' },
        },
        gridcolor: '#334155',
        showgrid: true,
        backgroundcolor: '#0f172a',
        color: '#94a3b8',
      },
      yaxis: {
        title: {
          text: 'Infected (I)',
          font: { size: 12, color: '#cbd5e1' },
        },
        gridcolor: '#334155',
        showgrid: true,
        backgroundcolor: '#0f172a',
        color: '#94a3b8',
      },
      zaxis: {
        title: {
          text: 'Recovered (R)',
          font: { size: 12, color: '#cbd5e1' },
        },
        gridcolor: '#334155',
        showgrid: true,
        backgroundcolor: '#0f172a',
        color: '#94a3b8',
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.3 },
      },
      bgcolor: '#0f172a',
    },
    showlegend: false,
    hovermode: 'closest',
    paper_bgcolor: '#0f172a',
    margin: { l: 0, r: 0, t: 40, b: 0 },
  };

  // Configure plot options
  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  };

  // Show error state if present
  if (error) {
    return (
      <div className="phase-portrait-container">
        <div className="phase-portrait-error">
          <h4>Phase Portrait Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Show empty state if no data
  if (plotData.length === 0) {
    return (
      <div className="phase-portrait-container">
        <div className="phase-portrait-empty">
          <p>Computing trajectories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-portrait-container">
      <LazyPlot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        loadingMessage="Loading phase portrait..."
      />
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PhasePortrait = React.memo(PhasePortraitComponent);
