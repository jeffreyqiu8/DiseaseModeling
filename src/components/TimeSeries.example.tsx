import React from 'react';
import { TimeSeries } from './TimeSeries';
import type { SimulationResult } from '../solvers/RK4Solver';

/**
 * Example usage of the TimeSeries component
 * This demonstrates how to use the component with sample simulation data
 */
export const TimeSeriesExample: React.FC = () => {
  // Sample simulation result data
  const sampleResult: SimulationResult = {
    t: Array.from({ length: 100 }, (_, i) => i),
    S: Array.from({ length: 100 }, (_, i) => 990 * Math.exp(-0.05 * i)),
    I: Array.from({ length: 100 }, (_, i) => 10 * Math.exp(0.03 * i) * Math.exp(-0.001 * i * i)),
    R: Array.from({ length: 100 }, (_, i) => 1000 - 990 * Math.exp(-0.05 * i) - 10 * Math.exp(0.03 * i) * Math.exp(-0.001 * i * i)),
  };

  return (
    <div>
      <h2>TimeSeries Component Example</h2>
      <TimeSeries simulationResult={sampleResult} showLegend={true} />
    </div>
  );
};
