import React, { Suspense, lazy } from 'react';
import type { PlotParams } from 'react-plotly.js';

// Lazy load Plotly.js to reduce initial bundle size
const Plot = lazy(() => import('react-plotly.js'));

interface LazyPlotProps extends PlotParams {
  loadingMessage?: string;
}

/**
 * LazyPlot component wraps react-plotly.js with lazy loading
 * to improve initial page load performance
 */
export const LazyPlot: React.FC<LazyPlotProps> = ({ 
  loadingMessage = 'Loading visualization...', 
  ...plotProps 
}) => {
  return (
    <Suspense 
      fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          {loadingMessage}
        </div>
      }
    >
      <Plot {...plotProps} />
    </Suspense>
  );
};
