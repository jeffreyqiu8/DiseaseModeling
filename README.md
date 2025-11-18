# Disease Spread Modeling Application

An interactive web-based tool for simulating and visualizing epidemic dynamics using three SIR model variants.

## Features

- **Three SIR Model Variants:**
  - Basic SIR: Classic susceptible-infected-recovered model
  - Natural Demographics: SIR with births and natural deaths
  - Disease Deaths: SIR with disease-induced mortality

- **Interactive Visualizations:**
  - Time series plots showing population dynamics
  - 3D phase portraits in S-I-R space
  - Real-time R₀ calculation and display

- **Parameter Controls:**
  - Adjustable transmission rate (β), recovery rate (γ)
  - Natural birth/death rate (μ), disease mortality rate (α)
  - Customizable initial conditions

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- Plotly.js for interactive visualizations
- Custom RK4 numerical solver
- Vitest for unit testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Deployment on Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite framework
6. Click "Deploy"

### Environment Variables

No environment variables are required for this application.

## Project Structure

```
src/
├── models/          # SIR model implementations
├── solvers/         # Numerical ODE solvers
├── components/      # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── App.tsx          # Main application component
```

## Model Equations

### Basic SIR
- dS/dt = -βSI
- dI/dt = βSI - γI
- dR/dt = γI
- R₀ = β/γ

### Natural Demographics
- dS/dt = μ(S+I+R) - βSI/N - μS
- dI/dt = βSI/N - γI - μI
- dR/dt = γI - μR
- R₀ = β/(γ + μ)

### Disease Deaths
- dS/dt = μ(S+I+R) - βSI/N - μS
- dI/dt = βSI/N - γI - μI - αI
- dR/dt = γI - μR
- R₀ = β/(γ + μ + α)

## License

MIT

## Author

Built with Kiro AI
