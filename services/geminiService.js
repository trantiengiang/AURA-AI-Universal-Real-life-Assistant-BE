const axios = require('axios');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7
          }
        }
      );

      return {
        success: true,
        data: response.data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      logger.error('Gemini API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Gemini API request failed'
      };
    }
  }

  async analyzeImage(imageBase64, prompt) {
    try {
      const response = await axios.post(
        `${this.baseURL}/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        }
      );

      return {
        success: true,
        data: response.data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      logger.error('Gemini Vision API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Gemini Vision API request failed'
      };
    }
  }

  async translateText(text, fromLang, toLang) {
    const prompt = `Translate the following text from ${fromLang} to ${toLang}:
    "${text}"
    
    Return only the translated text without any additional formatting or explanation.`;

    return await this.generateText(prompt);
  }

  async analyzeFoodImage(imageBase64) {
    const prompt = `Analyze this food image and provide:
    1. Food items identified
    2. Estimated calories
    3. Nutritional information (protein, carbs, fat)
    4. Health rating (1-10)
    5. Recommendations for improvement
    
    Be specific and detailed in your analysis.`;

    return await this.analyzeImage(imageBase64, prompt);
  }
}

module.exports = new GeminiService();


