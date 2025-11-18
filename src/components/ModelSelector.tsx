import React from 'react';
import './ModelSelector.css';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelName: string) => void;
}

interface ModelOption {
  name: string;
  displayName: string;
  equations: string[];
}

const modelOptions: ModelOption[] = [
  {
    name: 'basic-sir',
    displayName: 'Basic SIR',
    equations: [
      'dS/dt = -βSI',
      'dI/dt = βSI - γI',
      'dR/dt = γI'
    ]
  },
  {
    name: 'natural-demographics',
    displayName: 'Natural Demographics',
    equations: [
      'dS/dt = μN - βSI - μS',
      'dI/dt = βSI - γI - μI',
      'dR/dt = γI - μR'
    ]
  },
  {
    name: 'disease-deaths',
    displayName: 'Disease Deaths',
    equations: [
      'dS/dt = μN - βSI - μS',
      'dI/dt = βSI - γI - μI - αI',
      'dR/dt = γI - μR'
    ]
  }
];

const ModelSelectorComponent: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onModelChange(event.target.value);
  };

  return (
    <div className="model-selector">
      <h3 className="model-selector-title">Select Model</h3>
      <div className="model-options">
        {modelOptions.map((model) => (
          <div key={model.name} className="model-option">
            <label className="model-option-label">
              <input
                type="radio"
                name="model"
                value={model.name}
                checked={selectedModel === model.name}
                onChange={handleChange}
                className="model-radio"
              />
              <span className="model-name">{model.displayName}</span>
            </label>
            <div className="model-equations">
              {model.equations.map((equation, index) => (
                <div key={index} className="equation">
                  {equation}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const ModelSelector = React.memo(ModelSelectorComponent);
