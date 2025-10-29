const axios = require('axios');
const logger = require('../utils/logger');

class TranslateService {
  constructor() {
    this.apiKey = process.env.TRANSLATE_API_KEY;
    this.baseURL = 'https://libretranslate.com/translate';
    this.detectURL = 'https://libretranslate.com/detect';
    this.languagesURL = 'https://libretranslate.com/languages';
  }

  async translateText(text, fromLang, toLang) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text'
        }
      );

      return {
        success: true,
        data: {
          translatedText: response.data.translatedText,
          detectedLanguage: fromLang,
          fromLang: fromLang,
          toLang: toLang
        }
      };
    } catch (error) {
      logger.error('LibreTranslate API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Translation API request failed'
      };
    }
  }

  async detectLanguage(text) {
    try {
      const response = await axios.post(
        this.detectURL,
        {
          q: text
        }
      );

      return {
        success: true,
        data: {
          language: response.data[0].language,
          confidence: response.data[0].confidence
        }
      };
    } catch (error) {
      logger.error('Language Detection API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Language detection failed'
      };
    }
  }

  async translateWithDetection(text, toLang) {
    try {
      // First detect the language
      const detectionResult = await this.detectLanguage(text);
      
      if (!detectionResult.success) {
        return detectionResult;
      }

      const fromLang = detectionResult.data.language;
      
      // If source and target languages are the same, return original text
      if (fromLang === toLang) {
        return {
          success: true,
          data: {
            translatedText: text,
            detectedLanguage: fromLang,
            fromLang: fromLang,
            toLang: toLang
          }
        };
      }

      // Translate the text
      return await this.translateText(text, fromLang, toLang);
    } catch (error) {
      logger.error('Translate with detection error:', error.message);
      return {
        success: false,
        error: 'Translation with detection failed'
      };
    }
  }

  async getSupportedLanguages() {
    try {
      const response = await axios.get(this.languagesURL);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Supported languages API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get supported languages'
      };
    }
  }
}

module.exports = new TranslateService();
