import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class HuggingFaceAdapter extends BaseAdapter {
  private supportedModels = [
    'microsoft/DialoGPT-medium',
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill',
    'facebook/blenderbot-1B-distill',
    'google/flan-t5-base',
    'google/flan-t5-large',
    'mistralai/Mistral-7B-Instruct-v0.1',
    'meta-llama/Llama-2-7b-chat-hf',
    'HuggingFaceH4/zephyr-7b-beta'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api-inference.huggingface.co/models');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      const response = await axios.post(
        `${this.baseUrl}/${request.model}`,
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
      throw new Error(`HuggingFace API error: ${error.response?.data?.error || error.message}`);
    }
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    // Convert messages to a single prompt for most HF models
    const prompt = request.messages
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n') + '\nAssistant:';

    return {
      inputs: prompt,
      parameters: {
        temperature: request.temperature || 0.7,
        max_new_tokens: request.max_tokens || 150,
        top_p: request.top_p || 0.9,
        return_full_text: false,
      },
    };
  }

  protected transformResponse(response: any, model: string): ChatResponse {
    let content = '';
    
    if (Array.isArray(response) && response.length > 0) {
      content = response[0].generated_text || response[0].text || '';
    } else if (response.generated_text) {
      content = response.generated_text;
    } else if (response.text) {
      content = response.text;
    }

    return {
      id: `hf-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: content.trim(),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 0, // HF doesn't provide token counts
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}
