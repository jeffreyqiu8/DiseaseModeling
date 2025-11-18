/**
 * Example usage of ParameterControls component
 * 
 * This file demonstrates how to integrate ParameterControls with the useSimulation hook
 */

import React from 'react';
import { ParameterControls } from './ParameterControls';
import { useSimulation } from '../hooks/useSimulation';

export const ParameterControlsExample: React.FC = () => {
  const {
    selectedModel,
    parameters,
    initialState,
    parameterErrors,
    initialStateError,
    setParameter,
    setInitialState,
  } = useSimulation();

  return (
    <ParameterControls
      modelType={selectedModel}
      parameters={parameters}
      initialState={initialState}
      onParameterChange={setParameter}
      onInitialStateChange={setInitialState}
      parameterErrors={parameterErrors}
      initialStateError={initialStateError}
    />
  );
};
