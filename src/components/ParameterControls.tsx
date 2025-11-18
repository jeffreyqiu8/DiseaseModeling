import React from 'react';
import './ParameterControls.css';

interface ParameterControlsProps {
  modelType: string;
  parameters: {
    beta: number;
    gamma: number;
    mu?: number;
    alpha?: number;
    N?: number;
  };
  initialState: {
    S: number;
    I: number;
    R: number;
  };
  onParameterChange: (param: string, value: number) => void;
  onInitialStateChange: (state: { S?: number; I?: number; R?: number }) => void;
  parameterErrors: Record<string, string>;
  initialStateError: string;
}

const ParameterControlsComponent: React.FC<ParameterControlsProps> = ({
  modelType,
  parameters,
  initialState,
  onParameterChange,
  onInitialStateChange,
  parameterErrors,
  initialStateError,
}) => {
  // Determine which parameters to show based on model type
  const showMuAndN = modelType === 'natural-demographics' || modelType === 'disease-deaths';
  const showAlpha = modelType === 'disease-deaths';

  const handleParameterChange = (param: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onParameterChange(param, value);
    }
  };

  const handleInitialStateChange = (key: 'S' | 'I' | 'R') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onInitialStateChange({ [key]: value });
    }
  };

  return (
    <div className="parameter-controls">
      <h3 className="parameter-controls-title">Parameters</h3>
      
      <div className="parameter-section">
        <h4 className="section-title">Model Parameters</h4>
        
        {/* Beta parameter - always visible */}
        <div className="parameter-input-group">
          <label htmlFor="beta" className="parameter-label">
            β (Beta) - Transmission Rate
          </label>
          <input
            id="beta"
            type="number"
            step="0.01"
            min="0.001"
            max="10"
            value={parameters.beta}
            onChange={handleParameterChange('beta')}
            className={`parameter-input ${parameterErrors.beta ? 'input-error' : ''}`}
          />
          {parameterErrors.beta && (
            <span className="error-message">{parameterErrors.beta}</span>
          )}
        </div>

        {/* Gamma parameter - always visible */}
        <div className="parameter-input-group">
          <label htmlFor="gamma" className="parameter-label">
            γ (Gamma) - Recovery Rate
          </label>
          <input
            id="gamma"
            type="number"
            step="0.01"
            min="0.001"
            max="10"
            value={parameters.gamma}
            onChange={handleParameterChange('gamma')}
            className={`parameter-input ${parameterErrors.gamma ? 'input-error' : ''}`}
          />
          {parameterErrors.gamma && (
            <span className="error-message">{parameterErrors.gamma}</span>
          )}
        </div>

        {/* Mu parameter - conditional */}
        {showMuAndN && (
          <div className="parameter-input-group">
            <label htmlFor="mu" className="parameter-label">
              μ (Mu) - Natural Birth/Death Rate
            </label>
            <input
              id="mu"
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={parameters.mu ?? 0.01}
              onChange={handleParameterChange('mu')}
              className={`parameter-input ${parameterErrors.mu ? 'input-error' : ''}`}
            />
            {parameterErrors.mu && (
              <span className="error-message">{parameterErrors.mu}</span>
            )}
          </div>
        )}

        {/* N parameter - conditional */}
        {showMuAndN && (
          <div className="parameter-input-group">
            <label htmlFor="N" className="parameter-label">
              N - Total Population
            </label>
            <input
              id="N"
              type="number"
              step="1"
              min="1"
              max="1000000"
              value={parameters.N ?? 1000}
              onChange={handleParameterChange('N')}
              className={`parameter-input ${parameterErrors.N ? 'input-error' : ''}`}
            />
            {parameterErrors.N && (
              <span className="error-message">{parameterErrors.N}</span>
            )}
          </div>
        )}

        {/* Alpha parameter - conditional */}
        {showAlpha && (
          <div className="parameter-input-group">
            <label htmlFor="alpha" className="parameter-label">
              α (Alpha) - Disease-Induced Death Rate
            </label>
            <input
              id="alpha"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={parameters.alpha ?? 0.05}
              onChange={handleParameterChange('alpha')}
              className={`parameter-input ${parameterErrors.alpha ? 'input-error' : ''}`}
            />
            {parameterErrors.alpha && (
              <span className="error-message">{parameterErrors.alpha}</span>
            )}
          </div>
        )}
      </div>

      <div className="parameter-section">
        <h4 className="section-title">Initial Conditions</h4>
        
        {/* S0 - Initial Susceptible */}
        <div className="parameter-input-group">
          <label htmlFor="S0" className="parameter-label">
            S₀ - Initial Susceptible
          </label>
          <input
            id="S0"
            type="number"
            step="0.01"
            min="0"
            value={initialState.S}
            onChange={handleInitialStateChange('S')}
            className={`parameter-input ${initialStateError ? 'input-error' : ''}`}
          />
        </div>

        {/* I0 - Initial Infected */}
        <div className="parameter-input-group">
          <label htmlFor="I0" className="parameter-label">
            I₀ - Initial Infected
          </label>
          <input
            id="I0"
            type="number"
            step="0.01"
            min="0"
            value={initialState.I}
            onChange={handleInitialStateChange('I')}
            className={`parameter-input ${initialStateError ? 'input-error' : ''}`}
          />
        </div>

        {/* R0 - Initial Recovered */}
        <div className="parameter-input-group">
          <label htmlFor="R0" className="parameter-label">
            R₀ - Initial Recovered
          </label>
          <input
            id="R0"
            type="number"
            step="0.01"
            min="0"
            value={initialState.R}
            onChange={handleInitialStateChange('R')}
            className={`parameter-input ${initialStateError ? 'input-error' : ''}`}
          />
        </div>

        {/* Show initial state error if present */}
        {initialStateError && (
          <div className="error-message-block">{initialStateError}</div>
        )}
      </div>
    </div>
  );
};

// Custom comparison function for React.memo
// Only re-render if actual values have changed, not just object references
const arePropsEqual = (
  prevProps: ParameterControlsProps,
  nextProps: ParameterControlsProps
): boolean => {
  // Check if model type changed
  if (prevProps.modelType !== nextProps.modelType) return false;
  
  // Check if parameters changed
  if (
    prevProps.parameters.beta !== nextProps.parameters.beta ||
    prevProps.parameters.gamma !== nextProps.parameters.gamma ||
    prevProps.parameters.mu !== nextProps.parameters.mu ||
    prevProps.parameters.alpha !== nextProps.parameters.alpha ||
    prevProps.parameters.N !== nextProps.parameters.N
  ) {
    return false;
  }
  
  // Check if initial state changed
  if (
    prevProps.initialState.S !== nextProps.initialState.S ||
    prevProps.initialState.I !== nextProps.initialState.I ||
    prevProps.initialState.R !== nextProps.initialState.R
  ) {
    return false;
  }
  
  // Check if errors changed
  if (
    JSON.stringify(prevProps.parameterErrors) !== JSON.stringify(nextProps.parameterErrors) ||
    prevProps.initialStateError !== nextProps.initialStateError
  ) {
    return false;
  }
  
  // Callbacks are memoized in parent, so we don't need to check them
  return true;
};

// Memoize component with custom comparison to prevent unnecessary re-renders
export const ParameterControls = React.memo(ParameterControlsComponent, arePropsEqual);
