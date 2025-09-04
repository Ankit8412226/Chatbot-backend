import dotenv from 'dotenv';

export const loadEnv = () => {
  dotenv.config();

  // Validate required environment variables
  const requiredForProd = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredForProd.filter(key => !process.env[key]);

  if (missing.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Missing required environment variables:', missing);
      process.exit(1);
    } else {
      console.warn('⚠️ Missing environment variables (development mode):', missing);
      // Provide safe defaults for development
      if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'dev-secret-change-me';
    }
  }

  console.log('✅ Environment variables loaded');
};

export const config = {
  mongodb: {
    uri: process.env.MONGO_URI
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d'
  },
  llm: {
    apiKey: process.env.SAMBANOVA_API_KEY,
    baseUrl: process.env.LLM_BASE_URL || 'https://api.sambanova.ai/v1',
    model: 'Meta-Llama-3.1-8B-Instruct'
  },
  server: {
    port: process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};
