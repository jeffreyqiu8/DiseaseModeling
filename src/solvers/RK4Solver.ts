import type { ModelState, ModelParameters } from '../models/SIRModel';

/**
 * Result of a simulation run
 */
export interface SimulationResult {
  t: number[];  // Time points
  S: number[];  // Susceptible population over time
  I: number[];  // Infected population over time
  R: number[];  // Recovered population over time
}

/**
 * Interface for ODE solvers
 */
export interface ODESolver {
  solve(
    derivatives: (state: ModelState, params: ModelParameters) => ModelState,
    initialState: ModelState,
    params: ModelParameters,
    timeSpan: [number, number],
    timeStep: number
  ): SimulationResult;
}

/**
 * Runge-Kutta 4th order ODE solver
 */
export class RK4Solver implements ODESolver {
  private readonly defaultTimeStep = 0.01;
  private readonly defaultTimeSpan: [number, number] = [0, 100];

  /**
   * Solve a system of ODEs using the RK4 method
   * @param derivatives Function that computes derivatives given state and parameters
   * @param initialState Initial conditions (S₀, I₀, R₀)
   * @param params Model parameters
   * @param timeSpan Time interval [t_start, t_end] (default: [0, 100])
   * @param timeStep Integration step size (default: 0.01)
   * @returns Simulation result with time series data
   */
  solve(
    derivatives: (state: ModelState, params: ModelParameters) => ModelState,
    initialState: ModelState,
    params: ModelParameters,
    timeSpan: [number, number] = this.defaultTimeSpan,
    timeStep: number = this.defaultTimeStep
  ): SimulationResult {
    const [tStart, tEnd] = timeSpan;
    const numSteps = Math.floor((tEnd - tStart) / timeStep);
    
    // Initialize result arrays
    const t: number[] = [];
    const S: number[] = [];
    const I: number[] = [];
    const R: number[] = [];
    
    // Set initial conditions
    let currentState = { ...initialState };
    let currentTime = tStart;
    
    // Store initial values
    t.push(currentTime);
    S.push(currentState.S);
    I.push(currentState.I);
    R.push(currentState.R);
    
    // RK4 integration loop
    for (let step = 0; step < numSteps; step++) {
      currentState = this.rk4Step(derivatives, currentState, params, currentTime, timeStep);
      currentTime += timeStep;
      
      // Store results
      t.push(currentTime);
      S.push(currentState.S);
      I.push(currentState.I);
      R.push(currentState.R);
    }
    
    return { t, S, I, R };
  }

  /**
   * Perform a single RK4 integration step
   * @param derivatives Derivative function
   * @param state Current state
   * @param params Model parameters
   * @param t Current time
   * @param h Step size
   * @returns Next state
   */
  private rk4Step(
    derivatives: (state: ModelState, params: ModelParameters) => ModelState,
    state: ModelState,
    params: ModelParameters,
    _t: number,
    h: number
  ): ModelState {
    // k1 = f(t, y)
    const k1 = derivatives(state, params);
    
    // k2 = f(t + h/2, y + h*k1/2)
    const state2 = this.addScaled(state, k1, h / 2);
    const k2 = derivatives(state2, params);
    
    // k3 = f(t + h/2, y + h*k2/2)
    const state3 = this.addScaled(state, k2, h / 2);
    const k3 = derivatives(state3, params);
    
    // k4 = f(t + h, y + h*k3)
    const state4 = this.addScaled(state, k3, h);
    const k4 = derivatives(state4, params);
    
    // y_next = y + (h/6) * (k1 + 2*k2 + 2*k3 + k4)
    return {
      S: state.S + (h / 6) * (k1.S + 2 * k2.S + 2 * k3.S + k4.S),
      I: state.I + (h / 6) * (k1.I + 2 * k2.I + 2 * k3.I + k4.I),
      R: state.R + (h / 6) * (k1.R + 2 * k2.R + 2 * k3.R + k4.R),
    };
  }

  /**
   * Helper function to compute state + scale * derivative
   * @param state Current state
   * @param derivative Derivative values
   * @param scale Scaling factor
   * @returns Scaled state
   */
  private addScaled(state: ModelState, derivative: ModelState, scale: number): ModelState {
    return {
      S: state.S + scale * derivative.S,
      I: state.I + scale * derivative.I,
      R: state.R + scale * derivative.R,
    };
  }
}
