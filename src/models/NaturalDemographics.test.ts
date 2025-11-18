import { describe, it, expect } from 'vitest';
import { NaturalDemographics } from './NaturalDemographics';
import type { ModelState, ModelParameters } from './SIRModel';

describe('NaturalDemographics Model', () => {
  const model = new NaturalDemographics();

  describe('computeDerivatives', () => {
    it('should compute correct derivatives with natural demographics', () => {
      const state: ModelState = { S: 990, I: 10, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1, mu: 0.01, N: 1000 };

      const derivatives = model.computeDerivatives(state, params);

      // P = S + I + R = 990 + 10 + 0 = 1000
      // dS/dt = μP - βSI/N - μS = 0.01*1000 - 0.5*990*10/1000 - 0.01*990
      //       = 10 - 4.95 - 9.9 = -4.85
      expect(derivatives.S).toBeCloseTo(-4.85, 5);

      // dI/dt = βSI/N - γI - μI = 0.5*990*10/1000 - 0.1*10 - 0.01*10
      //       = 4.95 - 1 - 0.1 = 3.85
      expect(derivatives.I).toBeCloseTo(3.85, 5);

      // dR/dt = γI - μR = 0.1*10 - 0.01*0 = 1
      expect(derivatives.R).toBeCloseTo(1, 5);
    });

    it('should throw error when mu is missing', () => {
      const state: ModelState = { S: 990, I: 10, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1, N: 1000 };

      expect(() => model.computeDerivatives(state, params)).toThrow(
        'Natural Demographics model requires mu and N parameters'
      );
    });

    it('should throw error when N is missing', () => {
      const state: ModelState = { S: 990, I: 10, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1, mu: 0.01 };

      expect(() => model.computeDerivatives(state, params)).toThrow(
        'Natural Demographics model requires mu and N parameters'
      );
    });
  });

  describe('calculateR0', () => {
    it('should calculate R₀ = β/(γ + μ) correctly', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1, mu: 0.01 };
      const r0 = model.calculateR0(params);

      // R₀ = 0.5 / (0.1 + 0.01) = 0.5 / 0.11 ≈ 4.545
      expect(r0).toBeCloseTo(4.545, 3);
    });

    it('should return lower R₀ than BasicSIR due to natural mortality', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1, mu: 0.01 };
      const r0 = model.calculateR0(params);

      // Compare to BasicSIR: β/γ = 0.5/0.1 = 5
      const basicR0 = 0.5 / 0.1;
      expect(r0).toBeLessThan(basicR0);
    });

    it('should throw error when mu is missing', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      expect(() => model.calculateR0(params)).toThrow(
        'Natural Demographics model requires mu parameter for R₀ calculation'
      );
    });
  });

  describe('getRequiredParameters', () => {
    it('should return all required parameters', () => {
      const required = model.getRequiredParameters();

      expect(required).toEqual(['beta', 'gamma', 'mu', 'N']);
    });
  });
});
