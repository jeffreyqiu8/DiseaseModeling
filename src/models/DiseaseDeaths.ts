import type { SIRModel, ModelState, ModelParameters } from './SIRModel';

/**
 * SIR model with natural demographics and disease-induced mortality
 * 
 * Equations:
 * dS/dt = μN - βSI - μS
 * dI/dt = βSI - γI - μI - αI
 * dR/dt = γI - μR
 * 
 * R₀ = β/(γ + μ + α)
 */
export class DiseaseDeaths implements SIRModel {
  name = 'Disease Deaths';
  
  equations = [
    'dS/dt = μN - βSI - μS',
    'dI/dt = βSI - γI - μI - αI',
    'dR/dt = γI - μR'
  ];

  /**
   * Compute the derivatives for the Disease Deaths SIR model
   * @param state Current state (S, I, R)
   * @param params Model parameters (beta, gamma, mu, alpha, N)
   * @returns Derivatives (dS/dt, dI/dt, dR/dt)
   */
  computeDerivatives(state: ModelState, params: ModelParameters): ModelState {
    const { S, I, R } = state;
    const { beta, gamma, mu, alpha, N } = params;

    // Ensure required parameters are defined
    if (mu === undefined || alpha === undefined || N === undefined) {
      throw new Error('Disease Deaths model requires mu, alpha, and N parameters');
    }

    // Use frequency-dependent transmission: beta * S * I / N
    const dS = mu * N - (beta * S * I) / N - mu * S;
    const dI = (beta * S * I) / N - gamma * I - mu * I - alpha * I;
    const dR = gamma * I - mu * R;

    return { S: dS, I: dI, R: dR };
  }

  /**
   * Calculate the basic reproduction number R₀
   * @param params Model parameters (beta, gamma, mu, alpha)
   * @returns R₀ = β/(γ + μ + α)
   */
  calculateR0(params: ModelParameters): number {
    const { beta, gamma, mu, alpha } = params;

    // Ensure required parameters are defined
    if (mu === undefined || alpha === undefined) {
      throw new Error('Disease Deaths model requires mu and alpha parameters for R₀ calculation');
    }

    return beta / (gamma + mu + alpha);
  }

  /**
   * Get the list of required parameters for this model
   * @returns Array of required parameter names
   */
  getRequiredParameters(): string[] {
    return ['beta', 'gamma', 'mu', 'alpha', 'N'];
  }
}
