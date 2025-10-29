const groqService = require('../services/groqService');
const gptService = require('../services/gptService');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

class ChatController {
  async askQuestion(req, res) {
    try {
      const { message, aiModel = 'gpt-4', context } = req.body;

      // Validate required fields
      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      let response;

      // Route to appropriate AI service based on model
      switch (aiModel.toLowerCase()) {
        case 'groq':
        case 'llama':
          response = await groqService.quickResponse(message);
          break;
        
        case 'gemini':
          response = await geminiService.generateText(message);
          break;
        
        case 'gpt-4':
        case 'gpt-3.5':
        default:
          response = await gptService.generateText(message, {
            systemPrompt: context ? `Context: ${context}\n\nYou are AURA, an AI Universal Real-life Assistant. Provide helpful responses based on the given context.` : 'You are AURA, an AI Universal Real-life Assistant. Provide helpful, accurate, and comprehensive responses.',
            maxTokens: 1000
          });
          break;
      }

      if (!response.success) {
        return res.status(400).json({
          status: 'error',
          message: response.error
        });
      }

      logger.info(`Chat response generated using ${aiModel} for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Response generated successfully',
        data: {
          response: response.data,
          model: aiModel,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Ask question error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate response'
      });
    }
  }

  async analyzeIntent(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      const result = await groqService.analyzeIntent(message);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Intent analyzed for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Intent analyzed successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Analyze intent error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Intent analysis failed'
      });
    }
  }

  async getAvailableModels(req, res) {
    try {
      const models = [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Most capable model for complex reasoning and creative tasks',
          maxTokens: 4000,
          capabilities: ['text-generation', 'reasoning', 'creative-writing', 'analysis']
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient model for general tasks',
          maxTokens: 2000,
          capabilities: ['text-generation', 'conversation', 'summarization']
        },
        {
          id: 'groq',
          name: 'Groq (Llama)',
          description: 'Fast inference with Llama models',
          maxTokens: 2000,
          capabilities: ['text-generation', 'quick-responses', 'intent-analysis']
        },
        {
          id: 'gemini',
          name: 'Gemini Pro',
          description: 'Google\'s advanced language model',
          maxTokens: 2000,
          capabilities: ['text-generation', 'multilingual', 'reasoning']
        }
      ];

      res.json({
        status: 'success',
        data: models
      });
    } catch (error) {
      logger.error('Get available models error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get available models'
      });
    }
  }

  async getChatHistory(req, res) {
    try {
      // This would typically fetch from a chat history table
      // For now, return empty array as we don't have persistent chat history
      res.json({
        status: 'success',
        data: {
          messages: [],
          total: 0
        }
      });
    } catch (error) {
      logger.error('Get chat history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get chat history'
      });
    }
  }

  async clearChatHistory(req, res) {
    try {
      // This would typically clear chat history from database
      // For now, just return success
      logger.info(`Chat history cleared for user: ${req.user?.id || 'anonymous'}`);

      res.json({
        status: 'success',
        message: 'Chat history cleared successfully'
      });
    } catch (error) {
      logger.error('Clear chat history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to clear chat history'
      });
    }
  }

  async getSystemPrompt(req, res) {
    try {
      const prompts = {
        default: 'You are AURA, an AI Universal Real-life Assistant. Provide helpful, accurate, and comprehensive responses.',
        health: 'You are AURA, a health and wellness assistant. Provide evidence-based health advice and recommendations.',
        finance: 'You are AURA, a financial advisor assistant. Provide practical financial insights and recommendations.',
        productivity: 'You are AURA, a productivity assistant. Help users organize, plan, and optimize their daily tasks.',
        creative: 'You are AURA, a creative assistant. Help users with creative writing, brainstorming, and artistic projects.',
        technical: 'You are AURA, a technical assistant. Help users with programming, technology, and technical problems.'
      };

      res.json({
        status: 'success',
        data: prompts
      });
    } catch (error) {
      logger.error('Get system prompts error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get system prompts'
      });
    }
  }

  async updateSystemPrompt(req, res) {
    try {
      const { prompt, category = 'default' } = req.body;

      if (!prompt) {
        return res.status(400).json({
          status: 'error',
          message: 'Prompt is required'
        });
      }

      // This would typically save to database
      // For now, just return success
      logger.info(`System prompt updated for category: ${category}`);

      res.json({
        status: 'success',
        message: 'System prompt updated successfully',
        data: {
          category,
          prompt
        }
      });
    } catch (error) {
      logger.error('Update system prompt error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update system prompt'
      });
    }
  }
}

module.exports = new ChatController();


