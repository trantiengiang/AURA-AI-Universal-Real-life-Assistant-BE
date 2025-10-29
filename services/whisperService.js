const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');

class WhisperService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY; // Whisper uses OpenAI API
    this.baseURL = 'https://api.openai.com/v1';
  }

  async transcribeAudio(audioBuffer, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav'
      });
      formData.append('model', options.model || 'whisper-1');
      formData.append('language', options.language || 'en');
      formData.append('response_format', options.responseFormat || 'json');

      const response = await axios.post(
        `${this.baseURL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          }
        }
      );

      return {
        success: true,
        data: {
          text: response.data.text,
          language: response.data.language
        }
      };
    } catch (error) {
      logger.error('Whisper API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Whisper API request failed'
      };
    }
  }

  async transcribeFile(filePath, options = {}) {
    try {
      const audioBuffer = fs.readFileSync(filePath);
      return await this.transcribeAudio(audioBuffer, options);
    } catch (error) {
      logger.error('File read error:', error.message);
      return {
        success: false,
        error: 'Failed to read audio file'
      };
    }
  }

  async transcribeVoiceNote(audioBuffer, language = 'en') {
    return await this.transcribeAudio(audioBuffer, {
      model: 'whisper-1',
      language: language,
      responseFormat: 'json'
    });
  }
}

module.exports = new WhisperService();




