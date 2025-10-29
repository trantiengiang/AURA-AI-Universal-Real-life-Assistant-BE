const express = require('express');
const chatController = require('../controllers/chatController');
const { validate } = require('../utils/validateIntent');
const { optionalAuth } = require('../utils/auth');

const router = express.Router();

// Chat routes (optional auth for public access)
router.post('/ask', validate(require('../utils/validateIntent').chatSchema), optionalAuth, chatController.askQuestion);
router.post('/analyze-intent', optionalAuth, chatController.analyzeIntent);

// Chat management
router.get('/models', chatController.getAvailableModels);
router.get('/history', chatController.getChatHistory);
router.delete('/history', chatController.clearChatHistory);

// System prompts
router.get('/prompts', chatController.getSystemPrompt);
router.put('/prompts', chatController.updateSystemPrompt);

module.exports = router;


