import { ChatRequest, ChatResponse } from '../types/requests';
import { ProviderType } from '../types/providers';
import { AdapterFactory } from './adapter.factory';
import { getApiKey } from '../utils/config';

export class LLMService {
  async chat(provider: ProviderType, request: ChatRequest): Promise<ChatResponse> {
    // Get API key for the provider
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    // Create adapter for the provider
    const adapter = AdapterFactory.createAdapter(provider, apiKey);

    // Validate model
    if (!adapter.validateModel(request.model)) {
      throw new Error(
        `Model '${request.model}' is not supported by ${provider}. ` +
        `Supported models: ${adapter.getSupportedModels().join(', ')}`
      );
    }

    // Make the chat request
    return await adapter.chat(request);
  }

  getSupportedProviders(): ProviderType[] {
    return AdapterFactory.getSupportedProviders();
  }

  getSupportedModels(provider: ProviderType): string[] {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return [];
    }

    try {
      const adapter = AdapterFactory.createAdapter(provider, apiKey);
      return adapter.getSupportedModels();
    } catch {
      return [];
    }
  }
}
