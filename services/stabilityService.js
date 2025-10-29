const axios = require('axios');
const logger = require('../utils/logger');

class StabilityService {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.baseURL = 'https://api.stability.ai/v1';
  }

  async generateImage(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: options.cfgScale || 7,
          height: options.height || 1024,
          width: options.width || 1024,
          samples: options.samples || 1,
          steps: options.steps || 30,
          style_preset: options.style || 'photographic'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: {
          images: response.data.artifacts.map(artifact => ({
            base64: artifact.base64,
            seed: artifact.seed,
            finishReason: artifact.finishReason
          }))
        }
      };
    } catch (error) {
      logger.error('Stability AI API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Stability AI API request failed'
      };
    }
  }

  async generateHealthIllustration(healthData) {
    const prompt = `Create a health and wellness illustration showing:
    - Healthy lifestyle elements
    - Nutrition and exercise themes
    - Motivational and positive imagery
    - Clean, modern medical illustration style
    - Colors: blues, greens, and whites for health theme`;

    return await this.generateImage(prompt, {
      style: 'medical-illustration',
      width: 1024,
      height: 1024
    });
  }

  async generateFinanceChart(financeData) {
    const prompt = `Create a financial data visualization showing:
    - Modern infographic style
    - Charts and graphs elements
    - Professional business theme
    - Clean, minimalist design
    - Colors: blues, grays, and accent colors for financial theme`;

    return await this.generateImage(prompt, {
      style: 'infographic',
      width: 1024,
      height: 1024
    });
  }

  async generateNoteIllustration(noteContent) {
    const prompt = `Create an illustration representing the concept of:
    "${noteContent.substring(0, 100)}..."
    
    Style: clean, modern, minimalist
    Theme: productivity, organization, creativity
    Colors: warm and inspiring`;

    return await this.generateImage(prompt, {
      style: 'illustration',
      width: 1024,
      height: 1024
    });
  }
}

module.exports = new StabilityService();




