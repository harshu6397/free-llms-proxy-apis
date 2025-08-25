import rateLimit from 'express-rate-limit';
import { config } from '../utils/config';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      type: 'rate_limit_exceeded',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
