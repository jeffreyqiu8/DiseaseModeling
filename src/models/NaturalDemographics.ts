import type { SIRModel, ModelState, ModelParameters } from './SIRModel';

/**
 * SIR model with natural demographics (births and deaths)
 * 
 * Equations:
 * dS/dt = μN - βSI - μS
 * dI/dt = βSI - γI - μI
 * dR/dt = γI - μR
 * 
 * R₀ = β/(γ + μ)
 */
export class NaturalDemographics implements SIRModel {
  name = 'Natural Demographics';
  
  equations = [
    'dS/dt = μN - βSI - μS',
    'dI/dt = βSI - γI - μI',
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

    // Use frequency-dependent transmission: beta * S * I / N
    const dS = mu * N - (beta * S * I) / N - mu * S;
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

    return beta / (gamma + mu);
  }

  /**
   * Get the list of required parameters for this model
   * @returns Array of required parameter names
   */
  getRequiredParameters(): string[] {
    return ['beta', 'gamma', 'mu', 'N'];
  }
}
