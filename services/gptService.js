const axios = require('axios');
const logger = require('../utils/logger');

class GPTService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || 'gpt-4',
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
      logger.error('GPT API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'GPT API request failed'
      };
    }
  }

  async analyzeImage(imageUrl, prompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
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
      logger.error('GPT Vision API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'GPT Vision API request failed'
      };
    }
  }

  async generateHealthAdvice(healthData) {
    const prompt = `Based on the following health data, provide personalized advice:
    Weight: ${healthData.weight || 'Not provided'} kg
    Height: ${healthData.height || 'Not provided'} cm
    Calories: ${healthData.calories || 'Not provided'}
    Sleep: ${healthData.sleep || 'Not provided'} hours
    Exercise: ${healthData.exercise || 'Not provided'}
    
    Please provide specific, actionable health advice.`;

    return await this.generateText(prompt, {
      systemPrompt: 'You are a professional health advisor. Provide evidence-based, personalized health advice.'
    });
  }

  async generateFinanceInsight(financeData) {
    const prompt = `Analyze the following financial data and provide insights:
    ${JSON.stringify(financeData, null, 2)}
    
    Please provide spending patterns, recommendations, and financial insights.`;

    return await this.generateText(prompt, {
      systemPrompt: 'You are a financial advisor. Provide practical financial insights and recommendations.'
    });
  }
}

module.exports = new GPTService();




