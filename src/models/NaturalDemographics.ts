import type { SIRModel, ModelState, ModelParameters } from './SIRModel';

/**
 * SIR model with natural demographics (births and deaths)
 * 
 * Equations:
 * dS/dt = μ(S+I+R) - βSI/N - μS
 * dI/dt = βSI/N - γI - μI
 * dR/dt = γI - μR
 * 
 * Note: Births are proportional to living population μ(S+I+R)
 * With only natural deaths, total population remains constant
 * 
 * R₀ = β/(γ + μ)
 */
export class NaturalDemographics implements SIRModel {
  name = 'Natural Demographics';
  
  equations = [
    'dS/dt = μ(S+I+R) - βSI/N - μS',
    'dI/dt = βSI/N - γI - μI',
    'dR/dt = γI - μR'
  ];

  /**
   * Compute the derivatives for the Natural Demographics SIR model
   * @param state Current state (S, I, R)
   * @param params Model parameters (beta, gamma, mu, N)
   * @returns Derivatives (dS/dt, dI/dt, dR/dt)
   */
  computeDerivatives(state: ModelState, params: ModelParameters): ModelState {
    const { S, I, R } = state;
    const { beta, gamma, mu, N } = params;

    // Ensure required parameters are defined
    if (mu === undefined || N === undefined) {
      throw new Error('Natural Demographics model requires mu and N parameters');
    }

    // Total living population
    const P = S + I + R;
    
    // Use frequency-dependent transmission: beta * S * I / N
    // Births proportional to living population: mu * P
    const dS = mu * P - (beta * S * I) / N - mu * S;
    const dI = (beta * S * I) / N - gamma * I - mu * I;
    const dR = gamma * I - mu * R;

    return { S: dS, I: dI, R: dR };
  }

  /**
   * Calculate the basic reproduction number R₀
   * @param params Model parameters (beta, gamma, mu)
   * @returns R₀ = β/(γ + μ)
   */
  calculateR0(params: ModelParameters): number {
    const { beta, gamma, mu } = params;

    // Ensure required parameters are defined
    if (mu === undefined) {
      throw new Error('Natural Demographics model requires mu parameter for R₀ calculation');
    }

    const denominator = gamma + mu;
    
    // Handle edge case where gamma + mu = 0 (no recovery or death)
    if (denominator === 0) {
      return beta > 0 ? Infinity : 0;
    }

    return beta / denominator;
  }

  /**
   * Get the list of required parameters for this model
   * @returns Array of required parameter names
   */
  getRequiredParameters(): string[] {
    return ['beta', 'gamma', 'mu', 'N'];
  }
}
