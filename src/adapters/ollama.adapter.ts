import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class OllamaAdapter extends BaseAdapter {
  private supportedModels = [
    'llama2',
    'llama2:7b',
    'llama2:13b',
    'codellama',
    'codellama:7b',
    'codellama:13b',
    'mistral',
    'mistral:7b',
    'neural-chat',
    'starling-lm',
    'dolphin-mixtral',
    'phi',
    'gemma:2b',
    'gemma:7b'
  ];

  constructor(apiKey: string = '', baseUrl: string = 'http://localhost:11434') {
    super(apiKey, baseUrl);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        transformedRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return this.transformResponse(response.data, request.model);
    } catch (error: any) {
      throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    return {
      model: request.model,
      messages: request.messages,
      stream: false,
      options: {
        temperature: request.temperature || 0.7,
        num_predict: request.max_tokens || -1,
        top_p: request.top_p || 0.9,
      },
    };
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    return {
      id: `ollama-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || response.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: response.message?.content || '',
          },
          finish_reason: response.done ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: response.prompt_eval_count || 0,
        completion_tokens: response.eval_count || 0,
        total_tokens: (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
    };
  }
}
