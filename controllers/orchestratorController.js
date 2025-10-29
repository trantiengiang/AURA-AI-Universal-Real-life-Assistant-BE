const orchestratorService = require('../services/orchestratorService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for multi-modal uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(__dirname, '../uploads/images');
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath = path.join(__dirname, '../uploads/audio');
    } else {
      uploadPath = path.join(__dirname, '../uploads/misc');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'orchestrator-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 3 // Maximum 3 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed'), false);
    }
  }
});

class OrchestratorController {
  async processComplexRequest(req, res) {
    try {
      const userId = req.user.id;
      const { message, context = {} } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      const result = await orchestratorService.processComplexRequest(message, userId, context);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Complex request processed for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Complex request processed successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Process complex request error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to process complex request'
      });
    }
  }

  async processMultiModalRequest(req, res) {
    try {
      const userId = req.user.id;
      const { text } = req.body;
      const files = req.files || [];

      if (!text && files.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Text message or files are required'
        });
      }

      // Process files
      let imageBuffer = null;
      let audioBuffer = null;

      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          imageBuffer = fs.readFileSync(file.path);
        } else if (file.mimetype.startsWith('audio/')) {
          audioBuffer = fs.readFileSync(file.path);
        }
      }

      const result = await orchestratorService.processMultiModalRequest(
        text,
        imageBuffer,
        audioBuffer,
        userId
      );

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      // Clean up uploaded files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      logger.info(`Multi-modal request processed for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Multi-modal request processed successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Process multi-modal request error:', error);
      
      // Clean up files on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to process multi-modal request'
      });
    }
  }

  async getOrchestratorCapabilities(req, res) {
    try {
      const capabilities = {
        supportedIntents: [
          'health',
          'finance',
          'notes',
          'translate',
          'chat',
          'image',
          'orchestrator'
        ],
        supportedActions: [
          'analyze_food_image',
          'provide_nutrition_advice',
          'analyze_finance',
          'translate_text',
          'generate_image',
          'transcribe_audio',
          'create_note',
          'quick_response',
          'intent_analysis'
        ],
        supportedFileTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'audio/mpeg',
          'audio/wav',
          'audio/mp3',
          'audio/ogg'
        ],
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
        maxFiles: 3,
        supportedLanguages: [
          'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'
        ]
      };

      res.json({
        status: 'success',
        data: capabilities
      });
    } catch (error) {
      logger.error('Get orchestrator capabilities error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get orchestrator capabilities'
      });
    }
  }

  async getOrchestratorStatus(req, res) {
    try {
      const status = {
        service: 'AURA Orchestrator',
        version: '1.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        services: {
          groq: 'operational',
          gpt: 'operational',
          gemini: 'operational',
          stability: 'operational',
          whisper: 'operational',
          translate: 'operational'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
      };

      res.json({
        status: 'success',
        data: status
      });
    } catch (error) {
      logger.error('Get orchestrator status error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get orchestrator status'
      });
    }
  }

  async testOrchestrator(req, res) {
    try {
      const testMessage = 'Test the orchestrator with a simple health question: What are the benefits of regular exercise?';
      const userId = req.user?.id || 'test-user';

      const result = await orchestratorService.processComplexRequest(testMessage, userId, {});

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Orchestrator test completed for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Orchestrator test completed successfully',
        data: {
          testMessage,
          result: result.data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Test orchestrator error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Orchestrator test failed'
      });
    }
  }
}

// Export both controller and upload middleware
module.exports = {
  controller: new OrchestratorController(),
  upload: upload.array('files', 3)
};




