import React from 'react';
import { PhasePortrait } from './PhasePortrait';
import { BasicSIR } from '../models/BasicSIR';

/**
 * Example usage of PhasePortrait component
 */
export const PhasePortraitExample: React.FC = () => {
  const model = new BasicSIR();
  const parameters = {
    beta: 0.5,
    gamma: 0.1,
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Phase Portrait Example</h2>
      <PhasePortrait 
        model={model} 
        parameters={parameters}
        numTrajectories={12}
      />
    </div>
  );
};
