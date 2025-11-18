/**
 * Performance monitoring utilities for tracking render performance
 * and ensuring 60 FPS interactions
 */

/**
 * Throttle function to limit execution rate
 * Useful for high-frequency events like scroll or resize
 * 
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true;
      func.apply(this, args);
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Debounce function to delay execution until after a period of inactivity
 * Already implemented in useSimulation hook (300ms)
 * 
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return function(this: any, ...args: Parameters<T>): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Request animation frame wrapper for smooth 60 FPS updates
 * 
 * @param callback Function to execute on next frame
 * @returns Request ID for cancellation
 */
export function requestAnimationFramePolyfill(callback: FrameRequestCallback): number {
  return window.requestAnimationFrame(callback);
}

/**
 * Cancel animation frame
 * 
 * @param id Request ID to cancel
 */
export function cancelAnimationFramePolyfill(id: number): void {
  window.cancelAnimationFrame(id);
}

/**
 * Measure component render time (development only)
 * 
 * @param componentName Name of the component
 * @param callback Function to measure
 */
export function measureRenderTime(componentName: string, callback: () => void): void {
  if (import.meta.env.DEV) {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Log if render takes longer than 16ms (60 FPS threshold)
    if (renderTime > 16) {
      console.warn(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (target: <16ms for 60 FPS)`
      );
    }
  } else {
    callback();
  }
}
