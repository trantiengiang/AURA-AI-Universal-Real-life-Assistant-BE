const translationModel = require('../models/translationModel');
const translateService = require('../services/translateService');
const whisperService = require('../services/whisperService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'translate-audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

class TranslateController {
  async translateText(req, res) {
    try {
      const userId = req.user.id;
      const { inputText, fromLang, toLang } = req.body;

      // Validate required fields
      if (!inputText || !toLang) {
        return res.status(400).json({
          status: 'error',
          message: 'Input text and target language are required'
        });
      }

      // Translate text
      const translationResult = await translateService.translateWithDetection(inputText, toLang);

      if (!translationResult.success) {
        return res.status(400).json({
          status: 'error',
          message: translationResult.error
        });
      }

      // Save translation to database
      const saveResult = await translationModel.createTranslation(userId, {
        inputText,
        outputText: translationResult.data.translatedText,
        fromLang: translationResult.data.detectedLanguage,
        toLang: translationResult.data.toLang,
        isVoice: false
      });

      if (!saveResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to save translation'
        });
      }

      logger.info(`Text translated for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Text translated successfully',
        data: {
          translation: translationResult.data,
          record: saveResult.data
        }
      });
    } catch (error) {
      logger.error('Translate text error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Translation failed'
      });
    }
  }

  async translateAudio(req, res) {
    try {
      const userId = req.user.id;
      const { toLang } = req.body;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Audio file is required'
        });
      }

      if (!toLang) {
        return res.status(400).json({
          status: 'error',
          message: 'Target language is required'
        });
      }

      // Transcribe audio first
      const transcriptionResult = await whisperService.transcribeFile(req.file.path);

      if (!transcriptionResult.success) {
        return res.status(400).json({
          status: 'error',
          message: transcriptionResult.error
        });
      }

      const inputText = transcriptionResult.data.text;
      const fromLang = transcriptionResult.data.language;

      // Translate the transcribed text
      const translationResult = await translateService.translateText(inputText, fromLang, toLang);

      if (!translationResult.success) {
        return res.status(400).json({
          status: 'error',
          message: translationResult.error
        });
      }

      // Save translation to database
      const saveResult = await translationModel.createTranslation(userId, {
        inputText,
        outputText: translationResult.data.translatedText,
        fromLang: translationResult.data.detectedLanguage,
        toLang: translationResult.data.toLang,
        isVoice: true,
        audioUrl: `/uploads/audio/${req.file.filename}`
      });

      if (!saveResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to save translation'
        });
      }

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      logger.info(`Audio translated for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Audio translated successfully',
        data: {
          transcription: transcriptionResult.data,
          translation: translationResult.data,
          record: saveResult.data
        }
      });
    } catch (error) {
      logger.error('Translate audio error:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        status: 'error',
        message: 'Audio translation failed'
      });
    }
  }

  async getTranslations(req, res) {
    try {
      const userId = req.user.id;
      const { 
        limit = 10, 
        offset = 0, 
        fromLang, 
        toLang, 
        isVoice 
      } = req.query;

      const result = await translationModel.getTranslations(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        fromLang,
        toLang,
        isVoice: isVoice ? isVoice === 'true' : undefined
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Get translations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get translations'
      });
    }
  }

  async getTranslation(req, res) {
    try {
      const userId = req.user.id;
      const { translationId } = req.params;

      const result = await translationModel.getTranslationById(translationId, userId);

      if (!result.success) {
        return res.status(404).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Get translation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get translation'
      });
    }
  }

  async deleteTranslation(req, res) {
    try {
      const userId = req.user.id;
      const { translationId } = req.params;

      const result = await translationModel.deleteTranslation(translationId, userId);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Translation deleted: ${translationId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Delete translation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete translation'
      });
    }
  }

  async getTranslationStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const result = await translationModel.getTranslationStats(userId, period);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Get translation stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get translation statistics'
      });
    }
  }

  async searchTranslations(req, res) {
    try {
      const userId = req.user.id;
      const { q: query } = req.query;
      const { limit = 10, offset = 0, fromLang, toLang } = req.query;

      if (!query) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        });
      }

      const result = await translationModel.searchTranslations(userId, query, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        fromLang,
        toLang
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Search translations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search translations'
      });
    }
  }

  async getSupportedLanguages(req, res) {
    try {
      const result = await translateService.getSupportedLanguages();

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Get supported languages error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get supported languages'
      });
    }
  }

  async detectLanguage(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          status: 'error',
          message: 'Text is required for language detection'
        });
      }

      const result = await translateService.detectLanguage(text);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Detect language error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Language detection failed'
      });
    }
  }

  async getPopularLanguagePairs(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const result = await translationModel.getPopularLanguagePairs(userId, parseInt(limit));

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      logger.error('Get popular language pairs error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get popular language pairs'
      });
    }
  }
}

// Export both controller and upload middleware
module.exports = {
  controller: new TranslateController(),
  upload: upload.single('audio')
};




