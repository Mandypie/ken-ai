export interface Engine {
  id: string;
  name: string;
  description: string;
  color: string;
  model: string;
}

export const engines: Engine[] = [
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free',
    description: 'Automatically routes to an available free model',
    color: '#FF6FB5',
    model: 'openrouter/free',
  },
];

export const DEFAULT_ENGINE = 'openrouter-free';
