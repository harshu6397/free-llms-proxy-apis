import axios from 'axios';
import { BaseAdapter } from './base.adapter';
import { ChatRequest, ChatResponse } from '../types/requests';

export class ReplicateAdapter extends BaseAdapter {
  private supportedModels = [
    'meta/llama-2-70b-chat',
    'meta/llama-2-13b-chat',
    'meta/llama-2-7b-chat',
    'mistralai/mistral-7b-instruct-v0.1',
    'mistralai/mixtral-8x7b-instruct-v0.1',
    'togethercomputer/RedPajama-INCITE-7B-Chat',
    'joehoover/falcon-40b-instruct',
    'stability-ai/stable-code-instruct-3b'
  ];

  constructor(apiKey: string) {
    super(apiKey, 'https://api.replicate.com/v1');
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const transformedRequest = this.transformRequest(request);
      
      // Start prediction
      const predictionResponse = await axios.post(
        `${this.baseUrl}/predictions`,
        transformedRequest,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Poll for completion
      const prediction = await this.pollPrediction(predictionResponse.data.id);
      
      return this.transformResponse(prediction, request.model);
    } catch (error: any) {
      throw new Error(`Replicate API error: ${error.response?.data?.detail || error.message}`);
    }
  }

  private async pollPrediction(predictionId: string, maxAttempts: number = 30): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(
        `${this.baseUrl}/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        }
      );

      const prediction = response.data;
      
      if (prediction.status === 'succeeded') {
        return prediction;
      } else if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Prediction timed out');
  }

  validateModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  protected transformRequest(request: ChatRequest): any {
    const prompt = request.messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n') + '\nassistant:';

    return {
      version: this.getModelVersion(request.model),
      input: {
        prompt,
        temperature: request.temperature || 0.7,
        max_length: request.max_tokens || 500,
        top_p: request.top_p || 0.9,
      },
    };
  }

  private getModelVersion(model: string): string {
    // Map model names to their latest versions
    const versionMap: Record<string, string> = {
      'meta/llama-2-70b-chat': 'a52e56fee2269a78c9279800ec88898cecb6c8f54c51c786c28a3909bdfb2c6f5',
      'meta/llama-2-13b-chat': 'f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d',
      'meta/llama-2-7b-chat': 'ac808388e2e9d8ed35a5bf2eaa7d83f0ad53f9e3df31a42e4eb0a0c3249b3165',
      'mistralai/mistral-7b-instruct-v0.1': '83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70',
    };
    
    return versionMap[model] || model;
  }

  protected transformResponse(response: any, model?: string): ChatResponse {
    let content = '';
    
    if (Array.isArray(response.output)) {
      content = response.output.join('');
    } else if (typeof response.output === 'string') {
      content = response.output;
    }

    return {
      id: `replicate-${response.id || Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || 'replicate-model',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: content.trim(),
          },
          finish_reason: response.status === 'succeeded' ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: 0, // Replicate doesn't provide token counts
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}
