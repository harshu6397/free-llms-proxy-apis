# LLM Proxy Server

A unified proxy server for multiple Large Language Model (LLM) providers, providing a consistent API interface regardless of the underlying provider.

## Features

- **Unified API**: Single API endpoint that works with multiple LLM providers
- **Multiple Providers**: Support for OpenAI, Cohere, Groq, and Corcel
- **Consistent Format**: Same input/output format regardless of provider
- **Type Safety**: Built with TypeScript for better development experience
- **Error Handling**: Comprehensive error handling and logging
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Validation**: Request/response validation using Zod
- **Extensible**: Easy to add new providers

## Supported Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo, and other OpenAI models
- **Cohere**: Command models for text generation
- **Groq**: LLaMA, Mixtral, and other high-speed inference models
- **Hugging Face**: Various open-source models (DialoGPT, Flan-T5, Mistral, etc.)
- **Ollama**: Local models (LLaMA2, CodeLLaMA, Mistral, Phi, Gemma, etc.)
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku, Claude 2.x
- **Replicate**: Meta LLaMA, Mistral, and other models via cloud inference
- **Together AI**: Various open-source models with fast inference
- **Corcel**: (Coming soon)

## Deployment

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd llm-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
./deploy.sh
```

Or manually:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard or CLI:
```bash
vercel env add OPENAI_API_KEY
vercel env add COHERE_API_KEY
# ... add other API keys
```

See `DEPLOY_VERCEL.md` for detailed deployment instructions.

## API Usage

### Chat Completion Examples

**OpenAI:**
```http
POST /api/v1/chat?service=openai
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

**Hugging Face:**
```http
POST /api/v1/chat?service=huggingface
Content-Type: application/json

{
  "model": "mistralai/Mistral-7B-Instruct-v0.1",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 200
}
```

**Ollama (Local):**
```http
POST /api/v1/chat?service=ollama
Content-Type: application/json

{
  "model": "llama2:7b",
  "messages": [
    {
      "role": "user",
      "content": "Write a Python function to calculate fibonacci"
    }
  ],
  "temperature": 0.5
}
```

**Anthropic Claude:**
```http
POST /api/v1/chat?service=anthropic
Content-Type: application/json

{
  "model": "claude-3-5-sonnet-20241022",
  "messages": [
    {
      "role": "user",
      "content": "Analyze this business proposal"
    }
  ],
  "max_tokens": 1000
}
```

### Get Supported Providers

```http
GET /api/v1/providers
```

### Get Supported Models for a Provider

```http
GET /api/v1/providers/openai/models
```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# LLM Provider API Keys
OPENAI_API_KEY=your_openai_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OLLAMA_API_KEY=not_required_for_local_ollama
ANTHROPIC_API_KEY=your_anthropic_api_key_here
REPLICATE_API_KEY=your_replicate_api_key_here
TOGETHER_API_KEY=your_together_api_key_here
```

## Request Format

All chat requests should follow this format:

```typescript
{
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}
```

## Response Format

All responses follow the OpenAI-compatible format:

```typescript
{
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## Development

### Project Structure

```
src/
├── adapters/           # Provider-specific adapters
├── controllers/        # API controllers
├── middleware/         # Express middleware
├── services/           # Business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── routes/             # API routes
└── app.ts              # Main application
```

### Adding a New Provider

1. Create a new adapter in `src/adapters/`
2. Extend the `BaseAdapter` class
3. Implement the required methods
4. Add the provider to the `AdapterFactory`
5. Update type definitions

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## License

MIT
