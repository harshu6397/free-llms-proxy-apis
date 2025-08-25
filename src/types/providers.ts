export type ProviderType = 'openai' | 'cohere' | 'groq' | 'corcel' | 'huggingface' | 'ollama' | 'anthropic' | 'replicate' | 'together';

export interface ProviderConfig {
  baseUrl: string;
  apiKeyEnvVar: string;
  defaultModel: string;
  supportedModels: string[];
}

export interface ProviderConfigs {
  [key: string]: ProviderConfig;
}
