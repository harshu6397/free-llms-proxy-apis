import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class AnthropicAdapter extends BaseAdapter {
  private supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.anthropic.com/v1');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        transformedRequest,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
        }
      );

      return this.transformResponse(response.data, request.model);
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // Separate system messages from user/assistant messages
    const systemMessages = request.messages.filter(msg => msg.role === 'system');
    const conversationMessages = request.messages.filter(msg => msg.role !== 'system');

    return {
      model: request.model,
      max_tokens: request.max_tokens || 1000,
      system: systemMessages.length > 0 ? systemMessages[0].content : undefined,
      messages: conversationMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature,
      top_p: request.top_p,
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    const content = response.content?.[0]?.text || '';
    
    return {
      id: response.id || `anthropic-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || response.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
          },
          finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
        total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  }
}
