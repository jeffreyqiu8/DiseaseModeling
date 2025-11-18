import { describe, it, expect } from 'vitest';
import { DiseaseDeaths } from './DiseaseDeaths';
import type { ModelState, ModelParameters } from './SIRModel';

describe('DiseaseDeaths Model', () => {
  const model = new DiseaseDeaths();

  describe('computeDerivatives', () => {
    it('should compute correct derivatives with disease-induced mortality', () => {
      const state: ModelState = { S: 990, I: 10, R: 0 };
      const params: ModelParameters = { 
        beta: 0.5, 
        gamma: 0.1, 
        mu: 0.01, 
        alpha: 0.05, 
        N: 1000 
      };

      const derivatives = model.computeDerivatives(state, params);

      // P = S + I + R = 990 + 10 + 0 = 1000
      // dS/dt = μP - βSI/N - μS = 0.01*1000 - 0.5*990*10/1000 - 0.01*990
      //       = 10 - 4.95 - 9.9 = -4.85
      expect(derivatives.S).toBeCloseTo(-4.85, 5);

      // dI/dt = βSI/N - γI - μI - αI = 0.5*990*10/1000 - 0.1*10 - 0.01*10 - 0.05*10
      //       = 4.95 - 1 - 0.1 - 0.5 = 3.35
      expect(derivatives.I).toBeCloseTo(3.35, 5);

      // dR/dt = γI - μR = 0.1*10 - 0.01*0 = 1
      expect(derivatives.R).toBeCloseTo(1, 5);
    });

    it('should have more negative dI/dt than NaturalDemographics due to disease deaths', () => {
      const state: ModelState = { S: 500, I: 100, R: 400 };
      const params: ModelParameters = { 
        beta: 0.1, 
        gamma: 0.1, 
        mu: 0.01, 
        alpha: 0.05, 
        N: 1000 
      };

      const derivatives = model.computeDerivatives(state, params);

      // With alpha, dI/dt should be more negative (faster decline in infected)
      // dI/dt = βSI/N - γI - μI - αI
      const expectedDI = (0.1 * 500 * 100) / 1000 - 0.1 * 100 - 0.01 * 100 - 0.05 * 100;
      expect(derivatives.I).toBeCloseTo(expectedDI, 5);
    });

    it('should throw error when required parameters are missing', () => {
      const state: ModelState = { S: 990, I: 10, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      expect(() => model.computeDerivatives(state, params)).toThrow(
        'Disease Deaths model requires mu, alpha, and N parameters'
      );
    });
  });

  describe('calculateR0', () => {
    it('should calculate R₀ = β/(γ + μ + α) correctly', () => {
      const params: ModelParameters = { 
        beta: 0.5, 
        gamma: 0.1, 
        mu: 0.01, 
        alpha: 0.05 
      };
      const r0 = model.calculateR0(params);

      // R₀ = 0.5 / (0.1 + 0.01 + 0.05) = 0.5 / 0.16 = 3.125
      expect(r0).toBeCloseTo(3.125, 3);
    });

    it('should return lower R₀ than NaturalDemographics due to disease mortality', () => {
      const params: ModelParameters = { 
        beta: 0.5, 
        gamma: 0.1, 
        mu: 0.01, 
        alpha: 0.05 
      };
      const r0 = model.calculateR0(params);

      // Compare to NaturalDemographics: β/(γ + μ) = 0.5/(0.1 + 0.01) ≈ 4.545
      const naturalDemographicsR0 = 0.5 / (0.1 + 0.01);
      expect(r0).toBeLessThan(naturalDemographicsR0);
    });

    it('should throw error when required parameters are missing', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      expect(() => model.calculateR0(params)).toThrow(
        'Disease Deaths model requires mu and alpha parameters for R₀ calculation'
      );
    });
  });

  describe('population dynamics', () => {
    it('should cause total population to decline due to disease deaths', () => {
      const state: ModelState = { S: 500, I: 100, R: 400 };
      const params: ModelParameters = { 
        beta: 0.1, 
        gamma: 0.1, 
        mu: 0.01, 
        alpha: 0.05, 
        N: 1000 
      };

      const derivatives = model.computeDerivatives(state, params);

      // Total population change: dP/dt = dS/dt + dI/dt + dR/dt
      const dP = derivatives.S + derivatives.I + derivatives.R;
      
      // With disease deaths (αI), dP/dt = -αI = -0.05*100 = -5
      // (births μP cancel with natural deaths μS + μI + μR = μP)
      expect(dP).toBeCloseTo(-5, 5);
      expect(dP).toBeLessThan(0); // Population should decline
    });
  });

  describe('getRequiredParameters', () => {
    it('should return all required parameters', () => {
      const required = model.getRequiredParameters();

      expect(required).toEqual(['beta', 'gamma', 'mu', 'alpha', 'N']);
    });
  });
});
