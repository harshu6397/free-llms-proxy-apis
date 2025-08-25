import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { errorHandler } from './utils/error-handler';
import chatRoutes from './routes/chat.routes';

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

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`LLM Proxy server is running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

export default app;
