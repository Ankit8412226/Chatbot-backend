import { config } from '../config/env.js';

class LLMProvider {
  constructor() {
    this.apiKey = config.llm.apiKey;
    this.baseUrl = config.llm.baseUrl;
    this.defaultModel = config.llm.model;
  }

  async generateResponse(messages, options = {}) {
    try {
      const {
        model = this.defaultModel,
        temperature = 0.7,
        maxTokens = 500,
        systemPrompt = null
      } = options;

      // Prepare messages array
      const formattedMessages = [];
      
      if (systemPrompt) {
        formattedMessages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      // Add conversation history
      formattedMessages.push(...messages);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
        model: data.model,
        finishReason: data.choices[0].finish_reason
      };
    } catch (error) {
      console.error('LLM Provider error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async generateEmbedding(text) {
    try {
      // For now, return a simple hash-based embedding
      // In production, use a proper embedding model
      const hash = this.simpleHash(text);
      const embedding = new Array(384).fill(0).map((_, i) => 
        Math.sin(hash + i) * 0.1
      );
      
      return embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  async testConnection() {
    try {
      const response = await this.generateResponse([
        { role: 'user', content: 'Hello, this is a test message.' }
      ], { maxTokens: 50 });
      
      return {
        success: true,
        model: response.model,
        responseLength: response.content.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new LLMProvider();