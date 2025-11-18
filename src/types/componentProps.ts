import type { SIRModel, ModelParameters } from '../models/SIRModel';
import type { SimulationResult } from '../solvers/RK4Solver';

/**
 * Props for ModelSelector component
 */
export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelName: string) => void;
}

/**
 * Props for ParameterControls component
 */
export interface ParameterControlsProps {
  modelType: string;
  parameters: ModelParameters;
  onParameterChange: (param: string, value: number) => void;
  validationErrors: Record<string, string>;
}

/**
 * Props for PhasePortrait component
 */
export interface PhasePortraitProps {
  model: SIRModel;
  parameters: ModelParameters;
  numTrajectories: number;
}

/**
 * Props for TimeSeries component
 */
export interface TimeSeriesProps {
  simulationResult: SimulationResult;
  showLegend: boolean;
}

/**
 * Props for R0Display component
 */
export interface R0DisplayProps {
  r0Value: number;
  threshold: number;
}
