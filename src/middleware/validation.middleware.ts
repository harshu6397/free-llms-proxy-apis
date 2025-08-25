import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/error-handler';

const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});

const ChatRequestSchema = z.object({
  model: z.string().min(1),
  messages: z.array(ChatMessageSchema).min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(4000).optional(),
  top_p: z.number().min(0).max(1).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  stream: z.boolean().optional(),
});

const ProviderSchema = z.enum(['openai', 'cohere', 'groq', 'corcel', 'huggingface', 'ollama', 'anthropic', 'replicate', 'together']);

export const validateChatRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validate query parameter
    const provider = ProviderSchema.parse(req.query.service);

    // Validate request body
    const validatedBody = ChatRequestSchema.parse(req.body);
    
    // Add the provider to the validated body
    req.body = {
      ...validatedBody,
      provider
    };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new AppError(`Validation error: ${errorMessage}`, 400);
    }
    throw error;
  }
};
