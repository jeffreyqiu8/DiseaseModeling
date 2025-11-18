import { useCallback } from 'react';
import './App.css';
import { useSimulation } from './hooks/useSimulation';
import { ModelSelector } from './components/ModelSelector';
import { ParameterControls } from './components/ParameterControls';
import { R0Display } from './components/R0Display';
import { TimeSeries } from './components/TimeSeries';
import { PhasePortrait } from './components/PhasePortrait';

function App() {
  const {
    selectedModel,
    model,
    parameters,
    initialState,
    simulationResult,
    r0Value,
    parameterErrors,
    initialStateError,
    setSelectedModel,
    setParameter,
    setInitialState,
  } = useSimulation();

  // Memoize handlers to prevent unnecessary re-renders of child components
  const handleModelChange = useCallback((modelName: string) => {
    setSelectedModel(modelName);
  }, [setSelectedModel]);

  const handleParameterChange = useCallback((param: string, value: number) => {
    setParameter(param, value);
  }, [setParameter]);

  const handleInitialStateChange = useCallback((state: { S?: number; I?: number; R?: number }) => {
    setInitialState(state);
  }, [setInitialState]);

  return (
    <div className="app">
      <div className="app-layout">
        {/* Controls Section */}
        <aside className="controls-section">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
          
          <ParameterControls
            modelType={selectedModel}
            parameters={parameters}
            initialState={initialState}
            onParameterChange={handleParameterChange}
            onInitialStateChange={handleInitialStateChange}
            parameterErrors={parameterErrors}
            initialStateError={initialStateError}
          />
          
          <R0Display r0Value={r0Value} />
        </aside>

        {/* Visualization Section */}
        <main className="visualization-section">
          <div className="visualization-grid">
            <div className="visualization-panel">
              <TimeSeries 
                simulationResult={simulationResult}
                showLegend={true}
                modelType={selectedModel}
              />
            </div>
            
            <div className="visualization-panel">
              <PhasePortrait
                model={model}
                parameters={parameters}
                numTrajectories={12}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
