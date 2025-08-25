import { BaseAdapter } from '../adapters/base.adapter';
import { OpenAIAdapter } from '../adapters/openai.adapter';
import { CohereAdapter } from '../adapters/cohere.adapter';
import { GroqAdapter } from '../adapters/groq.adapter';
import { HuggingFaceAdapter } from '../adapters/huggingface.adapter';
import { OllamaAdapter } from '../adapters/ollama.adapter';
import { AnthropicAdapter } from '../adapters/anthropic.adapter';
import { ReplicateAdapter } from '../adapters/replicate.adapter';
import { TogetherAdapter } from '../adapters/together.adapter';
import { ProviderType } from '../types/providers';

export class AdapterFactory {
  static createAdapter(provider: ProviderType, apiKey: string): BaseAdapter {
    switch (provider) {
      case 'openai':
        return new OpenAIAdapter(apiKey);
      case 'cohere':
        return new CohereAdapter(apiKey);
      case 'groq':
        return new GroqAdapter(apiKey);
      case 'huggingface':
        return new HuggingFaceAdapter(apiKey);
      case 'ollama':
        return new OllamaAdapter(apiKey);
      case 'anthropic':
        return new AnthropicAdapter(apiKey);
      case 'replicate':
        return new ReplicateAdapter(apiKey);
      case 'together':
        return new TogetherAdapter(apiKey);
      case 'corcel':
        // TODO: Implement Corcel adapter
        throw new Error('Corcel adapter not implemented yet');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  static getSupportedProviders(): ProviderType[] {
    return ['openai', 'cohere', 'groq', 'huggingface', 'ollama', 'anthropic', 'replicate', 'together'];
  }
}
