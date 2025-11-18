import { describe, it, expect } from 'vitest';
import {
  validateParameter,
  validateInitialConditions,
  validateAllParameters,
  areAllValid,
  validateSimulationValues,
  validateSimulationResult,
  PARAMETER_RANGES,
} from './calculations';

describe('Parameter Validation', () => {
  describe('validateParameter', () => {
    it('should accept valid beta values', () => {
      const result = validateParameter('beta', 0.5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject beta below minimum', () => {
      const result = validateParameter('beta', 0.000001);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be between');
    });

    it('should reject beta above maximum', () => {
      const result = validateParameter('beta', 15);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be between');
    });

    it('should accept valid gamma values', () => {
      const result = validateParameter('gamma', 0.1);
      expect(result.isValid).toBe(true);
    });

    it('should accept mu at boundary values', () => {
      const resultMin = validateParameter('mu', 0);
      expect(resultMin.isValid).toBe(true);

      const resultMax = validateParameter('mu', 1);
      expect(resultMax.isValid).toBe(true);
    });

    it('should reject mu above maximum', () => {
      const result = validateParameter('mu', 1.5);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid alpha values', () => {
      const result = validateParameter('alpha', 0.05);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid N values', () => {
      const result = validateParameter('N', 1000);
      expect(result.isValid).toBe(true);
    });

    it('should reject N below minimum', () => {
      const result = validateParameter('N', 0);
      expect(result.isValid).toBe(false);
    });

    it('should reject N above maximum', () => {
      const result = validateParameter('N', 2000000);
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN values', () => {
      const result = validateParameter('beta', NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be a valid number');
    });

    it('should reject Infinity values', () => {
      const result = validateParameter('beta', Infinity);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be a valid number');
    });
  });

  describe('validateInitialConditions', () => {
    it('should accept valid initial conditions', () => {
      const result = validateInitialConditions(990, 10, 0, 1000);
      expect(result.isValid).toBe(true);
    });

    it('should accept initial conditions at boundary (sum = N)', () => {
      const result = validateInitialConditions(500, 300, 200, 1000);
      expect(result.isValid).toBe(true);
    });

    it('should reject when sum exceeds N', () => {
      const result = validateInitialConditions(600, 400, 200, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must not exceed total population');
    });

    it('should reject negative S0', () => {
      const result = validateInitialConditions(-10, 10, 0, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be non-negative');
    });

    it('should reject negative I0', () => {
      const result = validateInitialConditions(990, -10, 0, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be non-negative');
    });

    it('should reject negative R0', () => {
      const result = validateInitialConditions(990, 10, -5, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be non-negative');
    });

    it('should use default N=1 for normalized models', () => {
      const result = validateInitialConditions(0.99, 0.01, 0);
      expect(result.isValid).toBe(true);
    });

    it('should reject when normalized sum exceeds 1', () => {
      const result = validateInitialConditions(0.7, 0.4, 0.2);
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN values', () => {
      const result = validateInitialConditions(NaN, 10, 0, 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be valid numbers');
    });
  });

  describe('validateAllParameters', () => {
    it('should validate all BasicSIR parameters', () => {
      const params = { beta: 0.5, gamma: 0.1 };
      const required = ['beta', 'gamma'];
      const results = validateAllParameters(params, required);

      expect(results.beta.isValid).toBe(true);
      expect(results.gamma.isValid).toBe(true);
    });

    it('should detect missing parameters', () => {
      const params = { beta: 0.5 };
      const required = ['beta', 'gamma'];
      const results = validateAllParameters(params, required);

      expect(results.beta.isValid).toBe(true);
      expect(results.gamma.isValid).toBe(false);
      expect(results.gamma.error).toContain('is required');
    });

    it('should validate all NaturalDemographics parameters', () => {
      const params = { beta: 0.5, gamma: 0.1, mu: 0.01, N: 1000 };
      const required = ['beta', 'gamma', 'mu', 'N'];
      const results = validateAllParameters(params, required);

      expect(areAllValid(results)).toBe(true);
    });

    it('should detect invalid parameter values', () => {
      const params = { beta: 15, gamma: 0.1, mu: 0.01, N: 1000 };
      const required = ['beta', 'gamma', 'mu', 'N'];
      const results = validateAllParameters(params, required);

      expect(results.beta.isValid).toBe(false);
      expect(areAllValid(results)).toBe(false);
    });
  });

  describe('areAllValid', () => {
    it('should return true when all validations pass', () => {
      const results = {
        beta: { isValid: true },
        gamma: { isValid: true },
      };
      expect(areAllValid(results)).toBe(true);
    });

    it('should return false when any validation fails', () => {
      const results = {
        beta: { isValid: true },
        gamma: { isValid: false, error: 'Invalid' },
      };
      expect(areAllValid(results)).toBe(false);
    });
  });

  describe('validateSimulationValues', () => {
    it('should accept valid finite values', () => {
      const values = [0, 0.5, 1, 2, 3.5];
      const result = validateSimulationValues(values);
      expect(result.isValid).toBe(true);
    });

    it('should reject arrays containing NaN', () => {
      const values = [0, 0.5, NaN, 2];
      const result = validateSimulationValues(values);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid values');
    });

    it('should reject arrays containing Infinity', () => {
      const values = [0, 0.5, Infinity, 2];
      const result = validateSimulationValues(values);
      expect(result.isValid).toBe(false);
    });

    it('should reject arrays containing -Infinity', () => {
      const values = [0, 0.5, -Infinity, 2];
      const result = validateSimulationValues(values);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateSimulationResult', () => {
    it('should accept valid simulation results', () => {
      const result = {
        t: [0, 1, 2, 3],
        S: [0.99, 0.95, 0.90, 0.85],
        I: [0.01, 0.04, 0.08, 0.10],
        R: [0, 0.01, 0.02, 0.05],
      };
      const validation = validateSimulationResult(result);
      expect(validation.isValid).toBe(true);
    });

    it('should reject results with invalid time values', () => {
      const result = {
        t: [0, 1, NaN, 3],
        S: [0.99, 0.95, 0.90, 0.85],
        I: [0.01, 0.04, 0.08, 0.10],
        R: [0, 0.01, 0.02, 0.05],
      };
      const validation = validateSimulationResult(result);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Time values');
    });

    it('should reject results with invalid S values', () => {
      const result = {
        t: [0, 1, 2, 3],
        S: [0.99, Infinity, 0.90, 0.85],
        I: [0.01, 0.04, 0.08, 0.10],
        R: [0, 0.01, 0.02, 0.05],
      };
      const validation = validateSimulationResult(result);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Susceptible');
    });

    it('should reject results with invalid I values', () => {
      const result = {
        t: [0, 1, 2, 3],
        S: [0.99, 0.95, 0.90, 0.85],
        I: [0.01, 0.04, NaN, 0.10],
        R: [0, 0.01, 0.02, 0.05],
      };
      const validation = validateSimulationResult(result);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Infected');
    });

    it('should reject results with invalid R values', () => {
      const result = {
        t: [0, 1, 2, 3],
        S: [0.99, 0.95, 0.90, 0.85],
        I: [0.01, 0.04, 0.08, 0.10],
        R: [0, 0.01, -Infinity, 0.05],
      };
      const validation = validateSimulationResult(result);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Recovered');
    });
  });

  describe('PARAMETER_RANGES', () => {
    it('should define correct ranges for all parameters', () => {
      expect(PARAMETER_RANGES.beta).toEqual([0.00001, 10]);
      expect(PARAMETER_RANGES.gamma).toEqual([0.001, 10]);
      expect(PARAMETER_RANGES.mu).toEqual([0, 1]);
      expect(PARAMETER_RANGES.alpha).toEqual([0, 10]);
      expect(PARAMETER_RANGES.N).toEqual([1, 1000000]);
    });
  });
});
