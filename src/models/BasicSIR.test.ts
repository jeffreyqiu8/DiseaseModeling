import { describe, it, expect } from 'vitest';
import { BasicSIR } from './BasicSIR';
import type { ModelState, ModelParameters } from './SIRModel';

describe('BasicSIR Model', () => {
  const model = new BasicSIR();

  describe('computeDerivatives', () => {
    it('should compute correct derivatives for basic SIR equations', () => {
      const state: ModelState = { S: 0.99, I: 0.01, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      const derivatives = model.computeDerivatives(state, params);

      // dS/dt = -βSI = -0.5 * 0.99 * 0.01 = -0.00495
      expect(derivatives.S).toBeCloseTo(-0.00495, 5);

      // dI/dt = βSI - γI = 0.5 * 0.99 * 0.01 - 0.1 * 0.01 = 0.00495 - 0.001 = 0.00395
      expect(derivatives.I).toBeCloseTo(0.00395, 5);

      // dR/dt = γI = 0.1 * 0.01 = 0.001
      expect(derivatives.R).toBeCloseTo(0.001, 5);
    });

    it('should have zero derivatives when I = 0', () => {
      const state: ModelState = { S: 1, I: 0, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      const derivatives = model.computeDerivatives(state, params);

      expect(Math.abs(derivatives.S)).toBe(0);
      expect(Math.abs(derivatives.I)).toBe(0);
      expect(Math.abs(derivatives.R)).toBe(0);
    });

    it('should conserve total population (dS + dI + dR = 0)', () => {
      const state: ModelState = { S: 0.7, I: 0.2, R: 0.1 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };

      const derivatives = model.computeDerivatives(state, params);
      const sum = derivatives.S + derivatives.I + derivatives.R;

      expect(sum).toBeCloseTo(0, 10);
    });
  });

  describe('calculateR0', () => {
    it('should calculate R₀ = β/γ correctly', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };
      const r0 = model.calculateR0(params);

      expect(r0).toBe(5);
    });

    it('should return R₀ > 1 for epidemic conditions', () => {
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };
      const r0 = model.calculateR0(params);

      expect(r0).toBeGreaterThan(1);
    });

    it('should return R₀ < 1 for non-epidemic conditions', () => {
      const params: ModelParameters = { beta: 0.05, gamma: 0.1 };
      const r0 = model.calculateR0(params);

      expect(r0).toBeLessThan(1);
    });

    it('should return R₀ = 1 at epidemic threshold', () => {
      const params: ModelParameters = { beta: 0.1, gamma: 0.1 };
      const r0 = model.calculateR0(params);

      expect(r0).toBe(1);
    });
  });

  describe('getRequiredParameters', () => {
    it('should return beta and gamma as required parameters', () => {
      const required = model.getRequiredParameters();

      expect(required).toEqual(['beta', 'gamma']);
    });
  });
});
