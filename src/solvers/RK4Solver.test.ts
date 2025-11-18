import { describe, it, expect } from 'vitest';
import { RK4Solver } from './RK4Solver';
import type { ModelState, ModelParameters } from '../models/SIRModel';

describe('RK4Solver', () => {
  const solver = new RK4Solver();

  describe('solve', () => {
    it('should solve a simple exponential decay ODE accurately', () => {
      // Test with dy/dt = -y, which has analytical solution y(t) = y₀ * e^(-t)
      const derivatives = (state: ModelState) => ({
        S: -state.S,
        I: 0,
        R: 0,
      });

      const initialState: ModelState = { S: 1, I: 0, R: 0 };
      const params: ModelParameters = { beta: 0, gamma: 0 };
      const result = solver.solve(derivatives, initialState, params, [0, 1], 0.01);

      // At t=1, analytical solution is e^(-1) ≈ 0.3679
      const finalS = result.S[result.S.length - 1];
      expect(finalS).toBeCloseTo(Math.exp(-1), 3);
    });

    it('should solve a simple linear ODE accurately', () => {
      // Test with dy/dt = 1, which has analytical solution y(t) = y₀ + t
      const derivatives = () => ({
        S: 1,
        I: 0,
        R: 0,
      });

      const initialState: ModelState = { S: 0, I: 0, R: 0 };
      const params: ModelParameters = { beta: 0, gamma: 0 };
      const result = solver.solve(derivatives, initialState, params, [0, 5], 0.01);

      // At t=5, analytical solution is 0 + 5 = 5
      const finalS = result.S[result.S.length - 1];
      expect(finalS).toBeCloseTo(5, 2);
    });

    it('should produce correct number of time steps', () => {
      const derivatives = (state: ModelState) => ({
        S: -state.S,
        I: 0,
        R: 0,
      });

      const initialState: ModelState = { S: 1, I: 0, R: 0 };
      const params: ModelParameters = { beta: 0, gamma: 0 };
      const timeStep = 0.1;
      const timeSpan: [number, number] = [0, 10];
      
      const result = solver.solve(derivatives, initialState, params, timeSpan, timeStep);

      // Expected steps: (10 - 0) / 0.1 = 100, plus initial point = 101
      const expectedSteps = Math.floor((timeSpan[1] - timeSpan[0]) / timeStep) + 1;
      expect(result.t.length).toBe(expectedSteps);
      expect(result.S.length).toBe(expectedSteps);
      expect(result.I.length).toBe(expectedSteps);
      expect(result.R.length).toBe(expectedSteps);
    });

    it('should maintain conservation for BasicSIR model', () => {
      // For BasicSIR, S + I + R should remain constant
      const derivatives = (state: ModelState, params: ModelParameters) => {
        const { S, I } = state;
        const { beta, gamma } = params;
        return {
          S: -beta * S * I,
          I: beta * S * I - gamma * I,
          R: gamma * I,
        };
      };

      const initialState: ModelState = { S: 0.99, I: 0.01, R: 0 };
      const params: ModelParameters = { beta: 0.5, gamma: 0.1 };
      const result = solver.solve(derivatives, initialState, params, [0, 50], 0.01);

      // Check conservation at multiple time points
      const initialTotal = initialState.S + initialState.I + initialState.R;
      for (let i = 0; i < result.t.length; i++) {
        const total = result.S[i] + result.I[i] + result.R[i];
        expect(total).toBeCloseTo(initialTotal, 5);
      }
    });

    it('should handle default parameters correctly', () => {
      const derivatives = (state: ModelState) => ({
        S: -state.S,
        I: 0,
        R: 0,
      });

      const initialState: ModelState = { S: 1, I: 0, R: 0 };
      const params: ModelParameters = { beta: 0, gamma: 0 };
      
      // Call without timeSpan and timeStep to use defaults
      const result = solver.solve(derivatives, initialState, params);

      // Default timeSpan is [0, 100], default timeStep is 0.01
      expect(result.t[0]).toBe(0);
      expect(result.t[result.t.length - 1]).toBeCloseTo(100, 1);
    });
  });
});
