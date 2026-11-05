export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  engine: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  displayName: string;
  theme: 'system' | 'light' | 'dark';
  defaultEngine: string;
  openRouterApiKey: string;
  customInstructions: string;
  liteMode: boolean;
  reduceMotion: boolean;
  animationOverride: boolean; // user manually turned animation on
}

export const DEFAULT_SETTINGS: Settings = {
  displayName: '',
  theme: 'system',
  defaultEngine: 'openrouter-free',
  openRouterApiKey: '',
  customInstructions: '',
  liteMode: false,
  reduceMotion: false,
  animationOverride: false,
};
