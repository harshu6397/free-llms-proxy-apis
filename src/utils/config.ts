import dotenv from 'dotenv';
import { ProviderType } from '../types/providers';

dotenv.config();

export const getApiKey = (provider: ProviderType): string | undefined => {
  const envVarMap: Record<ProviderType, string> = {
    openai: 'OPENAI_API_KEY',
    cohere: 'COHERE_API_KEY',
    groq: 'GROQ_API_KEY',
    corcel: 'CORCEL_API_KEY',
    huggingface: 'HUGGINGFACE_API_KEY',
    ollama: 'OLLAMA_API_KEY', // Usually not needed for local Ollama
    anthropic: 'ANTHROPIC_API_KEY',
    replicate: 'REPLICATE_API_KEY',
    together: 'TOGETHER_API_KEY',
  };

  const envVar = envVarMap[provider];
  return process.env[envVar];
};

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
};
