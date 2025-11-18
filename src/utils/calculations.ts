// Parameter validation utilities for disease spread models

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ParameterRanges {
  beta: [number, number];
  gamma: [number, number];
  mu: [number, number];
  alpha: [number, number];
  N: [number, number];
}

// Define parameter ranges according to requirements
export const PARAMETER_RANGES: ParameterRanges = {
  beta: [0.00001, 10],  // Extended lower bound to support absolute population models
  gamma: [0.001, 10],
  mu: [0, 1],
  alpha: [0, 10],
  N: [1, 1000000],
};

/**
 * Validates a single parameter value against its defined range
 * @param paramName - Name of the parameter (beta, gamma, mu, alpha, N)
 * @param value - The value to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateParameter(
  paramName: keyof ParameterRanges,
  value: number
): ValidationResult {
  // Check if value is a valid number
  if (isNaN(value) || !isFinite(value)) {
    return {
      isValid: false,
      error: `${paramName} must be a valid number`,
    };
  }

  const [min, max] = PARAMETER_RANGES[paramName];

  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${paramName} must be between ${min} and ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates initial conditions constraint: S₀ + I₀ + R₀ ≤ N
 * @param S0 - Initial susceptible population
 * @param I0 - Initial infected population
 * @param R0 - Initial recovered population
 * @param N - Total population (optional, defaults to 1 for normalized models)
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateInitialConditions(
  S0: number,
  I0: number,
  R0: number,
  N: number = 1
): ValidationResult {
  // Check if values are valid numbers
  if (
    isNaN(S0) ||
    !isFinite(S0) ||
    isNaN(I0) ||
    !isFinite(I0) ||
    isNaN(R0) ||
    !isFinite(R0)
  ) {
    return {
      isValid: false,
      error: 'Initial conditions must be valid numbers',
    };
  }

  // Check if values are non-negative
  if (S0 < 0 || I0 < 0 || R0 < 0) {
    return {
      isValid: false,
      error: 'Initial conditions must be non-negative',
    };
  }

  // Check constraint: S₀ + I₀ + R₀ ≤ N
  // Add small tolerance for floating point precision
  const sum = S0 + I0 + R0;
  const tolerance = 1e-10;
  if (sum > N + tolerance) {
    return {
      isValid: false,
      error: `Sum of initial conditions (${sum.toFixed(2)}) must not exceed total population (${N})`,
    };
  }

  return { isValid: true };
}

/**
 * Validates all parameters for a given model
 * @param parameters - Object containing parameter values
 * @param requiredParams - Array of required parameter names for the model
 * @returns Record of parameter names to validation results
 */
export function validateAllParameters(
  parameters: Record<string, number>,
  requiredParams: string[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const param of requiredParams) {
    if (!(param in parameters)) {
      results[param] = {
        isValid: false,
        error: `${param} is required`,
      };
      continue;
    }

    if (param in PARAMETER_RANGES) {
      results[param] = validateParameter(
        param as keyof ParameterRanges,
        parameters[param]
      );
    }
  }

  return results;
}

/**
 * Checks if all validation results are valid
 * @param validationResults - Record of validation results
 * @returns true if all validations passed, false otherwise
 */
export function areAllValid(
  validationResults: Record<string, ValidationResult>
): boolean {
  return Object.values(validationResults).every((result) => result.isValid);
}

/**
 * Validates simulation results for NaN or Infinity values
 * @param values - Array of numerical values from simulation
 * @returns ValidationResult indicating if all values are finite
 */
export function validateSimulationValues(values: number[]): ValidationResult {
  const hasInvalidValue = values.some((v) => !isFinite(v));
  
  if (hasInvalidValue) {
    return {
      isValid: false,
      error: 'Simulation produced invalid values (NaN or Infinity). Try reducing β or increasing γ.',
    };
  }
  
  return { isValid: true };
}

/**
 * Validates an entire simulation result object
 * @param result - Simulation result with t, S, I, R arrays
 * @returns ValidationResult indicating if all values are valid
 */
export function validateSimulationResult(result: {
  t: number[];
  S: number[];
  I: number[];
  R: number[];
}): ValidationResult {
  // Check time values
  const timeValidation = validateSimulationValues(result.t);
  if (!timeValidation.isValid) {
    return {
      isValid: false,
      error: 'Time values are invalid',
    };
  }
  
  // Check S values
  const sValidation = validateSimulationValues(result.S);
  if (!sValidation.isValid) {
    return {
      isValid: false,
      error: 'Susceptible population values are invalid. ' + sValidation.error,
    };
  }
  
  // Check I values
  const iValidation = validateSimulationValues(result.I);
  if (!iValidation.isValid) {
    return {
      isValid: false,
      error: 'Infected population values are invalid. ' + iValidation.error,
    };
  }
  
  // Check R values
  const rValidation = validateSimulationValues(result.R);
  if (!rValidation.isValid) {
    return {
      isValid: false,
      error: 'Recovered population values are invalid. ' + rValidation.error,
    };
  }
  
  return { isValid: true };
}
