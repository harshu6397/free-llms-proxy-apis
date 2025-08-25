import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../src/utils/error-handler';
import chatRoutes from '../src/routes/chat.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'llm-proxy'
  });
});

// API routes
app.use('/api/v1', chatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      type: 'not_found',
    },
  });
});

// Global error handler
app.use(errorHandler);

// Export as serverless function
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
