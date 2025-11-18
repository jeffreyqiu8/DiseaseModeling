import type { SIRModel, ModelState, ModelParameters } from './SIRModel';

/**
 * Basic SIR model without demographic factors
 * 
 * Equations:
 * dS/dt = -βSI
 * dI/dt = βSI - γI
 * dR/dt = γI
 * 
 * R₀ = β/γ
 */
export class BasicSIR implements SIRModel {
  name = 'Basic SIR';
  
  equations = [
    'dS/dt = -βSI',
    'dI/dt = βSI - γI',
    'dR/dt = γI'
  ];

  /**
   * Compute the derivatives for the Basic SIR model
   * @param state Current state (S, I, R)
   * @param params Model parameters (beta, gamma)
   * @returns Derivatives (dS/dt, dI/dt, dR/dt)
   */
  computeDerivatives(state: ModelState, params: ModelParameters): ModelState {
    const { S, I } = state;
    const { beta, gamma } = params;

    const dS = -beta * S * I;
    const dI = beta * S * I - gamma * I;
    const dR = gamma * I;

    return { S: dS, I: dI, R: dR };
  }

  /**
   * Calculate the basic reproduction number R₀
   * @param params Model parameters (beta, gamma)
   * @returns R₀ = β/γ
   */
  calculateR0(params: ModelParameters): number {
    const { beta, gamma } = params;
    return beta / gamma;
  }

  /**
   * Get the list of required parameters for this model
   * @returns Array of required parameter names
   */
  getRequiredParameters(): string[] {
    return ['beta', 'gamma'];
  }
}
