import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class CohereAdapter extends BaseAdapter {
  private supportedModels = [
    'command',
    'command-nightly',
    'command-light',
    'command-light-nightly'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.cohere.ai/v1');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      const response = await axios.post(
        `${this.baseUrl}/chat`,
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
      throw new Error(`Cohere API error: ${error.response?.data?.message || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // Transform to Cohere format
    const lastMessage = request.messages[request.messages.length - 1];
    const chatHistory = request.messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content
    }));

    return {
      model: request.model,
      message: lastMessage.content,
      chat_history: chatHistory,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      p: request.top_p,
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    // Transform Cohere response to OpenAI format
    return {
      id: response.generation_id || `cohere-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || response.model || 'command',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.text,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: response.meta?.billed_units?.input_tokens || 0,
        completion_tokens: response.meta?.billed_units?.output_tokens || 0,
        total_tokens: (response.meta?.billed_units?.input_tokens || 0) + (response.meta?.billed_units?.output_tokens || 0),
      },
    };
  }
}
