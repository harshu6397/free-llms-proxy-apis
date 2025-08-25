import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class GroqAdapter extends BaseAdapter {
  private supportedModels = [
    'llama2-70b-4096',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'llama3-8b-8192',
    'llama3-70b-8192'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.groq.com/openai/v1');
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
      throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // Groq uses OpenAI-compatible format
    return {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      stream: request.stream || false,
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    // Groq response is OpenAI-compatible
    return response;
  }
}
