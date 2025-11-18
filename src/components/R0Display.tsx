import React from 'react';
import './R0Display.css';

interface R0DisplayProps {
  r0Value: number;
}

/**
 * R0Display component shows the basic reproduction number (R₀)
 * with visual feedback based on epidemic threshold
 * 
 * - Red background when R₀ > 1 (epidemic will occur)
 * - Green background when R₀ ≤ 1 (disease will die out)
 */
const R0DisplayComponent: React.FC<R0DisplayProps> = ({ r0Value }) => {
  // Handle undefined or invalid r0Value
  const safeR0Value = typeof r0Value === 'number' && isFinite(r0Value) ? r0Value : 0;

  // Determine background color based on epidemic threshold
  const isEpidemic = safeR0Value > 1;
  const displayClass = isEpidemic ? 'r0-display epidemic' : 'r0-display safe';

  // Format R₀ to 3 decimal places
  const formattedR0 = safeR0Value.toFixed(3);

  return (
    <div className={displayClass}>
      <div className="r0-label">Basic Reproduction Number</div>
      <div className="r0-value">
        R₀ = {formattedR0}
      </div>
      <div className="r0-interpretation">
        {isEpidemic ? 'Epidemic threshold exceeded' : 'Disease will die out'}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const R0Display = React.memo(R0DisplayComponent);
