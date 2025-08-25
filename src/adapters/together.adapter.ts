import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class TogetherAdapter extends BaseAdapter {
  private supportedModels = [
    'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
    'togethercomputer/RedPajama-INCITE-7B-Chat',
    'togethercomputer/falcon-7b-instruct',
    'togethercomputer/falcon-40b-instruct',
    'meta-llama/Llama-2-7b-chat-hf',
    'meta-llama/Llama-2-13b-chat-hf',
    'meta-llama/Llama-2-70b-chat-hf',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    'openchat/openchat-3.5-1210',
    'teknium/OpenHermes-2.5-Mistral-7B'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.together.xyz/v1');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        transformedRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.transformResponse(response.data, request.model);
    } catch (error: any) {
      throw new Error(`Together API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // Together AI uses OpenAI-compatible format
    return {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature || 0.7,
      max_tokens: request.max_tokens || 512,
      top_p: request.top_p || 0.7,
      frequency_penalty: request.frequency_penalty || 0,
      presence_penalty: request.presence_penalty || 0,
      stream: request.stream || false,
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    // Together AI response is OpenAI-compatible
    return response;
  }
}
