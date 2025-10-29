const axios = require('axios');
const logger = require('../utils/logger');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: options.systemPrompt || 'You are a helpful AI assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.choices[0].message.content
      };
    } catch (error) {
      logger.error('Groq API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Groq API request failed'
      };
    }
  }

  async analyzeIntent(message) {
    const prompt = `Analyze the following user message and determine the intent and required actions:
    Message: "${message}"
    
    Return a JSON object with:
    - intent: primary intent (health, finance, notes, translate, chat, image, orchestrator)
    - actions: array of required actions
    - confidence: confidence score (0-1)
    - entities: extracted entities from the message
    
    Example:
    {
      "intent": "health",
      "actions": ["analyze_food_image", "provide_nutrition_advice"],
      "confidence": 0.9,
      "entities": {"food_type": "pizza", "image_present": true}
    }`;

    const result = await this.generateText(prompt, {
      systemPrompt: 'You are an intent analysis AI. Always return valid JSON.'
    });

    if (result.success) {
      try {
        const parsed = JSON.parse(result.data);
        return {
          success: true,
          data: parsed
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse intent analysis result'
        };
      }
    }

    return result;
  }

  async quickResponse(message) {
    return await this.generateText(message, {
      model: 'llama3-8b-8192',
      maxTokens: 500,
      temperature: 0.7
    });
  }
}

module.exports = new GroqService();


