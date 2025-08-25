import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class OpenAIAdapter extends BaseAdapter {
  private supportedModels = [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-4o',
    'gpt-4o-mini'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.openai.com/v1');
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

      return this.transformResponse(response.data);
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // OpenAI format is already our standard format
    return {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      frequency_penalty: request.frequency_penalty,
      presence_penalty: request.presence_penalty,
      stream: request.stream || false,
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    // OpenAI response is already our standard format
    return response;
  }
}
