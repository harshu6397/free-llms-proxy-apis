import { ChatRequest, ChatResponse } from '../types/requests';

export abstract class BaseAdapter {
  protected apiKey: string;
  protected baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract chat(request: ChatRequest): Promise<ChatResponse>;
  abstract validateModel(model: string): boolean;
  abstract getSupportedModels(): string[];
  
  protected abstract transformRequest(request: ChatRequest): any;
  protected abstract transformResponse(response: any, model?: string): ChatResponse;
}
