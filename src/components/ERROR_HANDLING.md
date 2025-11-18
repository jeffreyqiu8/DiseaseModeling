# Error Handling Implementation

This document describes the error handling and boundary implementation for the Disease Spread Modeling Application.

## Overview

The application implements comprehensive error handling at multiple levels:

1. **Error Boundaries** - React error boundaries catch rendering errors in visualization components
2. **Validation** - Parameter and simulation result validation prevents invalid states
3. **Graceful Degradation** - Components display user-friendly error messages instead of crashing
4. **Logging** - Detailed error information is logged to console for debugging

## Components

### ErrorBoundary Component

Location: `src/components/ErrorBoundary.tsx`

A React error boundary that catches JavaScript errors in child components and displays a fallback UI.

**Features:**
- Catches rendering errors in child components
- Logs detailed error information to console
- Displays user-friendly fallback UI
- Supports custom fallback UI via props
- Optional error callback for custom error handling

**Usage:**

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**With custom fallback:**

```tsx
<ErrorBoundary
  fallback={<div>Custom error message</div>}
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Error:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Validation Functions

Location: `src/utils/calculations.ts`

### validateSimulationValues(values: number[]): ValidationResult

Validates an array of numerical values for NaN or Infinity.

**Returns:**
- `isValid: true` if all values are finite
- `isValid: false` with error message if any value is NaN or Infinity

### validateSimulationResult(result): ValidationResult

Validates an entire simulation result object (t, S, I, R arrays).

**Returns:**
- `isValid: true` if all arrays contain only finite values
- `isValid: false` with descriptive error message indicating which array failed

## Component Error Handling

### TimeSeries Component

**Error Handling:**
1. Checks if simulationResult is null - displays "No simulation data available"
2. Validates simulation result for NaN/Infinity - displays error message with guidance
3. Wrapped in ErrorBoundary in parent component to catch rendering errors

**Error States:**
- **Null Result**: Shows empty state message
- **Invalid Values**: Shows error message with suggestion to adjust parameters
- **Rendering Error**: Caught by ErrorBoundary, shows fallback UI

### PhasePortrait Component

**Error Handling:**
1. Validates each trajectory for NaN/Infinity values
2. Skips invalid trajectories and continues with valid ones
3. Shows error if no valid trajectories can be computed
4. Wrapped in ErrorBoundary to catch rendering errors

**Error States:**
- **No Valid Trajectories**: Shows error message with parameter adjustment guidance
- **Computation Error**: Logs error and shows error message
- **Rendering Error**: Caught by ErrorBoundary, shows fallback UI

### useSimulation Hook

**Error Handling:**
1. Validates parameters before running simulation
2. Validates initial conditions before running simulation
3. Checks R₀ calculation for invalid values
4. Validates simulation results for NaN/Infinity
5. Prevents visualization updates when parameters are invalid
6. Logs detailed error messages to console

**Validation Flow:**
```
Parameter Change
  ↓
Validate Parameters
  ↓
Valid? → Run Simulation → Validate Results → Update State
  ↓
Invalid? → Set null result, log warning
```

## Error Messages

### User-Facing Messages

- **Invalid Parameters**: "Parameter must be between X and Y"
- **Invalid Initial Conditions**: "Sum of initial conditions must not exceed total population"
- **Simulation Failure**: "Simulation produced invalid values. Try reducing β or increasing γ."
- **No Trajectories**: "Unable to compute trajectories with current parameters. Try reducing β or increasing γ."
- **Rendering Error**: "Unable to render visualization. Please try different parameters."

### Console Logging

All errors are logged to console with detailed information:
- Error type and message
- Component stack trace (for ErrorBoundary)
- Parameter values that caused the error
- Validation failure details

## Best Practices

1. **Always wrap visualizations in ErrorBoundary** to prevent app crashes
2. **Validate inputs** before running expensive computations
3. **Check simulation results** for NaN/Infinity before rendering
4. **Provide helpful error messages** that guide users to fix the issue
5. **Log detailed errors** to console for debugging
6. **Disable updates** when parameters are invalid to prevent unnecessary computation

## Testing Error Handling

To test error handling:

1. **Invalid Parameters**: Set β or γ to very large values (> 10)
2. **Invalid Initial Conditions**: Set S₀ + I₀ + R₀ > N
3. **Numerical Instability**: Set β = 10, γ = 0.001 to cause overflow
4. **Empty State**: Clear all parameters

## Requirements Coverage

This implementation satisfies Requirement 2.7:
- ✅ Error boundary component around visualizations
- ✅ Detect NaN/Infinity in simulation results
- ✅ Show user-friendly error messages
- ✅ Display fallback UI when visualization rendering fails
- ✅ Disable visualization updates when parameters are invalid
- ✅ Log detailed errors to console for debugging
