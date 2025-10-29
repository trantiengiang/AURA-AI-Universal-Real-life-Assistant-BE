const notesModel = require('../models/notesModel');
const whisperService = require('../services/whisperService');
const gptService = require('../services/gptService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Configure multer for file uploads
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
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
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

class NotesController {
  async createNote(req, res) {
    try {
      const userId = req.user.id;
      const { title, content, tags, isVoice } = req.body;

      // Validate required fields
      if (!title || !content) {
        return res.status(400).json({
          status: 'error',
          message: 'Title and content are required'
        });
      }

      const result = await notesModel.createNote(userId, {
        title,
        content,
        tags: tags ? JSON.parse(tags) : [],
        isVoice: isVoice === 'true'
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Note created for user: ${userId}`);

      res.status(201).json({
        status: 'success',
        message: 'Note created successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Create note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create note'
      });
    }
  }

  async getNotes(req, res) {
    try {
      const userId = req.user.id;
      const { 
        limit = 10, 
        offset = 0, 
        search, 
        tags, 
        isVoice 
      } = req.query;

      const result = await notesModel.getNotes(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        tags: tags ? tags.split(',') : undefined,
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
      logger.error('Get notes error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notes'
      });
    }
  }

  async getNote(req, res) {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;

      const result = await notesModel.getNoteById(noteId, userId);

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
      logger.error('Get note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get note'
      });
    }
  }

  async updateNote(req, res) {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;
      const { title, content, tags } = req.body;

      const result = await notesModel.updateNote(noteId, userId, {
        title,
        content,
        tags: tags ? JSON.parse(tags) : undefined
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Note updated: ${noteId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Update note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update note'
      });
    }
  }

  async deleteNote(req, res) {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;

      const result = await notesModel.deleteNote(noteId, userId);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Note deleted: ${noteId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Delete note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete note'
      });
    }
  }

  async searchNotes(req, res) {
    try {
      const userId = req.user.id;
      const { q: query } = req.query;
      const { limit = 10, offset = 0, tags } = req.query;

      if (!query) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required'
        });
      }

      const result = await notesModel.searchNotes(userId, query, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        tags: tags ? tags.split(',') : undefined
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
      logger.error('Search notes error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to search notes'
      });
    }
  }

  async getNoteStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await notesModel.getNoteStats(userId);

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
      logger.error('Get note stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get note statistics'
      });
    }
  }

  async transcribeAudio(req, res) {
    try {
      const userId = req.user.id;
      const { title, tags } = req.body;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Audio file is required'
        });
      }

      // Transcribe audio using Whisper
      const transcriptionResult = await whisperService.transcribeFile(req.file.path);

      if (!transcriptionResult.success) {
        return res.status(400).json({
          status: 'error',
          message: transcriptionResult.error
        });
      }

      // Create note with transcription
      const result = await notesModel.createNote(userId, {
        title: title || 'Voice Note',
        content: transcriptionResult.data.text,
        tags: tags ? JSON.parse(tags) : [],
        isVoice: true,
        audioUrl: `/uploads/audio/${req.file.filename}`
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      logger.info(`Audio transcribed and note created for user: ${userId}`);

      res.status(201).json({
        status: 'success',
        message: 'Audio transcribed and note created successfully',
        data: {
          note: result.data,
          transcription: transcriptionResult.data
        }
      });
    } catch (error) {
      logger.error('Transcribe audio error:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to transcribe audio'
      });
    }
  }

  async summarizeNote(req, res) {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;

      // Get the note
      const noteResult = await notesModel.getNoteById(noteId, userId);

      if (!noteResult.success) {
        return res.status(404).json({
          status: 'error',
          message: noteResult.error
        });
      }

      // Generate summary using GPT
      const summaryResult = await gptService.generateText(
        `Please provide a concise summary of the following note:\n\n${noteResult.data.content}`,
        {
          systemPrompt: 'You are a helpful assistant that creates concise summaries of notes.',
          maxTokens: 200
        }
      );

      if (!summaryResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to generate summary'
        });
      }

      logger.info(`Note summarized: ${noteId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Note summarized successfully',
        data: {
          originalContent: noteResult.data.content,
          summary: summaryResult.data
        }
      });
    } catch (error) {
      logger.error('Summarize note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to summarize note'
      });
    }
  }

  async getPopularTags(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const result = await notesModel.getPopularTags(userId, parseInt(limit));

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
      logger.error('Get popular tags error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get popular tags'
      });
    }
  }
}

// Export both controller and upload middleware
module.exports = {
  controller: new NotesController(),
  upload: upload.single('audio')
};


