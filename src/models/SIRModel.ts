/**
 * Parameters for SIR model variants
 */
export interface ModelParameters {
  beta: number;    // Transmission rate (β)
  gamma: number;   // Recovery rate (γ)
  mu?: number;     // Natural birth/death rate (μ) - optional
  alpha?: number;  // Disease-induced death rate (α) - optional
  N?: number;      // Total population - optional
}

/**
 * State of the SIR model at a given time
 */
export interface ModelState {
  S: number;  // Susceptible population
  I: number;  // Infected population
  R: number;  // Recovered population
}

/**
 * Interface for SIR model variants
 */
export interface SIRModel {
  name: string;
  equations: string[];
  computeDerivatives(state: ModelState, params: ModelParameters): ModelState;
  calculateR0(params: ModelParameters): number;
  getRequiredParameters(): string[];
}
