import { ErrorBoundary } from './ErrorBoundary';
import { TimeSeries } from './TimeSeries';
import { PhasePortrait } from './PhasePortrait';
import { useSimulation } from '../hooks/useSimulation';

/**
 * Example demonstrating how to use ErrorBoundary with visualization components
 * 
 * The ErrorBoundary wraps visualization components to catch rendering errors
 * and display a fallback UI instead of crashing the entire application.
 */
export function ErrorBoundaryExample() {
  const simulation = useSimulation();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Error Boundary Example</h2>
      
      {/* Wrap TimeSeries with ErrorBoundary */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('TimeSeries error caught by boundary:', error);
          console.error('Component stack:', errorInfo.componentStack);
        }}
      >
        <TimeSeries 
          simulationResult={simulation.simulationResult}
          showLegend={true}
        />
      </ErrorBoundary>

      {/* Wrap PhasePortrait with ErrorBoundary */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('PhasePortrait error caught by boundary:', error);
          console.error('Component stack:', errorInfo.componentStack);
        }}
      >
        <PhasePortrait
          model={simulation.model}
          parameters={simulation.parameters}
          numTrajectories={12}
        />
      </ErrorBoundary>

      {/* Example with custom fallback UI */}
      <ErrorBoundary
        fallback={
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <h3>Custom Fallback UI</h3>
            <p>Something went wrong with this visualization.</p>
            <button onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        }
      >
        <TimeSeries 
          simulationResult={simulation.simulationResult}
        />
      </ErrorBoundary>
    </div>
  );
}
