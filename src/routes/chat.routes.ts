import { Router } from 'express';
import { chat, getProviders, getModels } from '../controllers/chat.controller';
import { validateChatRequest } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply rate limiting to all routes
router.use(rateLimitMiddleware);

// Chat endpoint
router.post('/chat', validateChatRequest, chat);

// Get supported providers
router.get('/providers', getProviders);

// Get supported models for a provider
router.get('/providers/:provider/models', getModels);

export default router;
