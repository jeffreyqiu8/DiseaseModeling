import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SIRModel, ModelParameters, ModelState } from '../models/SIRModel';
import { BasicSIR } from '../models/BasicSIR';
import { NaturalDemographics } from '../models/NaturalDemographics';
import { DiseaseDeaths } from '../models/DiseaseDeaths';
import { RK4Solver, type SimulationResult } from '../solvers/RK4Solver';
import {
  validateInitialConditions,
  validateAllParameters,
  areAllValid,
} from '../utils/calculations';

// Model registry
const MODELS: Record<string, SIRModel> = {
  'basic-sir': new BasicSIR(),
  'natural-demographics': new NaturalDemographics(),
  'disease-deaths': new DiseaseDeaths(),
};

// Default parameter values
const DEFAULT_PARAMETERS: ModelParameters = {
  beta: 0.5,
  gamma: 0.1,
  mu: 0.01,
  alpha: 0.05,
  N: 1000,
};

// Default initial conditions (normalized for Basic SIR)
const DEFAULT_INITIAL_STATE: ModelState = {
  S: 0.99,
  I: 0.01,
  R: 0,
};

export interface UseSimulationReturn {
  // Current state
  selectedModel: string;
  model: SIRModel;
  parameters: ModelParameters;
  initialState: ModelState;
  simulationResult: SimulationResult | null;
  r0Value: number;
  
  // Validation
  parameterErrors: Record<string, string>;
  initialStateError: string;
  isValid: boolean;
  
  // Actions
  setSelectedModel: (modelName: string) => void;
  setParameter: (paramName: string, value: number) => void;
  setInitialState: (state: Partial<ModelState>) => void;
  runSimulation: () => void;
}

/**
 * Custom hook for managing simulation state and orchestrating model execution
 * 
 * Features:
 * - Manages selected model, parameters, initial conditions
 * - Validates parameters and initial conditions
 * - Automatically recalculates simulation with 300ms debounce
 * - Preserves applicable parameters when switching models
 * - Calculates and updates R₀ value
 */
export function useSimulation(): UseSimulationReturn {
  // Core state
  const [selectedModel, setSelectedModelState] = useState<string>('basic-sir');
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [initialState, setInitialStateState] = useState<ModelState>(DEFAULT_INITIAL_STATE);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [r0Value, setR0Value] = useState<number>(0);
  
  // Validation state
  const [parameterErrors, setParameterErrors] = useState<Record<string, string>>({});
  const [initialStateError, setInitialStateError] = useState<string>('');
  
  // Refs for debouncing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solverRef = useRef(new RK4Solver());
  
  // Get current model instance
  const model = MODELS[selectedModel];
  
  /**
   * Validate all current parameters for the selected model
   */
  const validateCurrentParameters = useCallback((): boolean => {
    const requiredParams = model.getRequiredParameters();
    // Convert ModelParameters to Record<string, number> for validation
    const paramsRecord: Record<string, number> = { ...parameters } as Record<string, number>;
    const validationResults = validateAllParameters(paramsRecord, requiredParams);
    
    // Convert validation results to error messages
    const errors: Record<string, string> = {};
    for (const [param, result] of Object.entries(validationResults)) {
      if (!result.isValid && result.error) {
        errors[param] = result.error;
      }
    }
    
    setParameterErrors(errors);
    return areAllValid(validationResults);
  }, [model, parameters]);
  
  /**
   * Validate initial conditions
   */
  const validateCurrentInitialState = useCallback((): boolean => {
    // Use N parameter if the model requires it, otherwise default to 1 for normalized models
    const requiredParams = model.getRequiredParameters();
    const N = requiredParams.includes('N') ? (parameters.N || 1) : 1;
    
    const result = validateInitialConditions(
      initialState.S,
      initialState.I,
      initialState.R,
      N
    );
    
    setInitialStateError(result.isValid ? '' : result.error || '');
    return result.isValid;
  }, [initialState, parameters.N, model]);
  
  /**
   * Run the simulation with current parameters and initial conditions
   */
  const runSimulation = useCallback(() => {
    // Validate before running
    const paramsValid = validateCurrentParameters();
    const initialStateValid = validateCurrentInitialState();
    
    if (!paramsValid || !initialStateValid) {
      console.warn('Skipping simulation due to invalid parameters or initial conditions');
      setSimulationResult(null);
      setR0Value(0);
      return;
    }
    
    try {
      // Calculate R₀
      const r0 = model.calculateR0(parameters);
      
      // Check if R₀ is valid
      if (!isFinite(r0)) {
        console.error('R₀ calculation produced invalid value:', r0);
        setR0Value(0);
        setSimulationResult(null);
        return;
      }
      
      setR0Value(r0);
      
      // Use longer time span for models with vital dynamics
      const requiredParams = model.getRequiredParameters();
      const hasVitalDynamics = requiredParams.includes('mu');
      const timeSpan: [number, number] = hasVitalDynamics ? [0, 500] : [0, 100];
      const timeStep = hasVitalDynamics ? 0.1 : 0.01;
      
      // Run simulation
      const result = solverRef.current.solve(
        (state, params) => model.computeDerivatives(state, params),
        initialState,
        parameters,
        timeSpan,
        timeStep
      );
      
      // Validate simulation result for NaN/Infinity
      const hasNaN = result.S.some(v => !isFinite(v)) ||
                     result.I.some(v => !isFinite(v)) ||
                     result.R.some(v => !isFinite(v));
      
      if (hasNaN) {
        console.error('Simulation produced NaN or Infinity values. Try reducing β or increasing γ.');
        setSimulationResult(null);
        return;
      }
      
      setSimulationResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Simulation error:', errorMessage, error);
      setSimulationResult(null);
      setR0Value(0);
    }
  }, [model, parameters, initialState, validateCurrentParameters, validateCurrentInitialState]);
  
  /**
   * Debounced simulation trigger
   */
  const triggerDebouncedSimulation = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for 300ms debounce
    debounceTimerRef.current = setTimeout(() => {
      runSimulation();
    }, 300);
  }, [runSimulation]);
  
  /**
   * Set a parameter value with validation
   * Memoized to prevent unnecessary re-renders
   */
  const setParameter = useCallback((paramName: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value,
    }));
  }, []);
  
  /**
   * Set initial state values
   * Memoized to prevent unnecessary re-renders
   */
  const setInitialState = useCallback((state: Partial<ModelState>) => {
    setInitialStateState(prev => ({
      ...prev,
      ...state,
    }));
  }, []);
  
  /**
   * Switch model and preserve applicable parameters
   */
  const setSelectedModel = useCallback((modelName: string) => {
    if (!(modelName in MODELS)) {
      console.error(`Unknown model: ${modelName}`);
      return;
    }
    
    const newModel = MODELS[modelName];
    const requiredParams = newModel.getRequiredParameters();
    const oldModel = MODELS[selectedModel];
    const oldRequiredParams = oldModel.getRequiredParameters();
    
    // Preserve parameters that are required by the new model
    const preservedParams: ModelParameters = {
      beta: parameters.beta,
      gamma: parameters.gamma,
    };
    
    // Add optional parameters if required by new model
    if (requiredParams.includes('mu')) {
      preservedParams.mu = parameters.mu ?? DEFAULT_PARAMETERS.mu;
    }
    if (requiredParams.includes('alpha')) {
      preservedParams.alpha = parameters.alpha ?? DEFAULT_PARAMETERS.alpha;
    }
    if (requiredParams.includes('N')) {
      preservedParams.N = parameters.N ?? DEFAULT_PARAMETERS.N;
    }
    
    // Scale initial conditions when switching between normalized and absolute population models
    const oldHasN = oldRequiredParams.includes('N');
    const newHasN = requiredParams.includes('N');
    
    if (!oldHasN && newHasN) {
      // Switching from normalized (Basic SIR) to absolute population model
      const N = preservedParams.N ?? DEFAULT_PARAMETERS.N ?? 1000;
      
      setInitialStateState({
        S: initialState.S * N,
        I: initialState.I * N,
        R: initialState.R * N,
      });
    } else if (oldHasN && !newHasN) {
      // Switching from absolute population to normalized model
      const oldN = parameters.N ?? DEFAULT_PARAMETERS.N ?? 1000;
      
      setInitialStateState({
        S: initialState.S / oldN,
        I: initialState.I / oldN,
        R: initialState.R / oldN,
      });
    }
    
    setParameters(preservedParams);
    setSelectedModelState(modelName);
  }, [parameters, selectedModel, initialState]);
  
  // Auto-recalculate when parameters or initial state change
  useEffect(() => {
    triggerDebouncedSimulation();
    
    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [parameters, initialState, selectedModel, triggerDebouncedSimulation]);
  
  // Calculate if current state is valid (memoized for performance)
  const isValid = useMemo(
    () => Object.keys(parameterErrors).length === 0 && initialStateError === '',
    [parameterErrors, initialStateError]
  );
  
  return {
    selectedModel,
    model,
    parameters,
    initialState,
    simulationResult,
    r0Value,
    parameterErrors,
    initialStateError,
    isValid,
    setSelectedModel,
    setParameter,
    setInitialState,
    runSimulation,
  };
}
