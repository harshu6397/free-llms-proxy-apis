import { Request, Response } from 'express';
import { LLMService } from '../services/llm.service';
import { ChatRequest } from '../types/requests';
import { ProviderType } from '../types/providers';
import { asyncHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';

const llmService = new LLMService();

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const provider: ProviderType = req.body.provider;
  const chatRequest: ChatRequest = req.body;

  logger.info('Chat request received', {
    provider,
    model: chatRequest.model,
    messageCount: chatRequest.messages.length,
  });

  const startTime = Date.now();
  
  try {
    const response = await llmService.chat(provider, chatRequest);
    
    const duration = Date.now() - startTime;
    
    logger.info('Chat request completed', {
      provider,
      model: chatRequest.model,
      duration,
      tokensUsed: response.usage.total_tokens,
    });

    res.json(response);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    logger.error('Chat request failed', {
      provider,
      model: chatRequest.model,
      duration,
      error: error.message,
    });

    throw error;
  }
});

export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  const providers = llmService.getSupportedProviders();
  res.json({ providers });
});

export const getModels = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider as ProviderType;
  const models = llmService.getSupportedModels(provider);
  res.json({ provider, models });
});
