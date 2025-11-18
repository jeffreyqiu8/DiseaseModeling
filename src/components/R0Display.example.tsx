/**
 * Example usage of R0Display component
 * 
 * This file demonstrates how to integrate the R0Display component
 * with the useSimulation hook in your application.
 */

import React from 'react';
import { R0Display } from './R0Display';
import { useSimulation } from '../hooks/useSimulation';

export const R0DisplayExample: React.FC = () => {
  const { r0Value } = useSimulation();
  
  return (
    <div>
      <h2>R₀ Display Example</h2>
      <R0Display r0Value={r0Value} />
    </div>
  );
};

// Example with hardcoded values for testing
export const R0DisplayStatic: React.FC = () => {
  return (
    <div>
      <h2>Static Examples</h2>
      
      <h3>Epidemic Scenario (R₀ &gt; 1)</h3>
      <R0Display r0Value={2.5} />
      
      <h3>Controlled Scenario (R₀ ≤ 1)</h3>
      <R0Display r0Value={0.8} />
      
      <h3>Threshold (R₀ = 1)</h3>
      <R0Display r0Value={1.0} />
    </div>
  );
};
