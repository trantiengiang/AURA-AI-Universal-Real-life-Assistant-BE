const healthModel = require('../models/healthModel');
const gptService = require('../services/gptService');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

class HealthController {
  async analyzeHealth(req, res) {
    try {
      const userId = req.user.id;
      const { weight, height, calories, sleep, exercise, imageUrl } = req.body;

      // Prepare health data for AI analysis
      const healthData = {
        weight,
        height,
        calories,
        sleep,
        exercise
      };

      let analysisResult = null;
      let imageAnalysis = null;

      // Analyze image if provided
      if (imageUrl) {
        const imageResult = await geminiService.analyzeFoodImage(imageUrl);
        if (imageResult.success) {
          imageAnalysis = imageResult.data;
        }
      }

      // Get AI health advice
      const adviceResult = await gptService.generateHealthAdvice(healthData);
      
      if (adviceResult.success) {
        analysisResult = adviceResult.data;
      }

      // Save health record
      const recordResult = await healthModel.createHealthRecord(userId, {
        ...healthData,
        advice: analysisResult,
        imageUrl
      });

      if (!recordResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to save health record'
        });
      }

      logger.info(`Health analysis completed for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Health analysis completed',
        data: {
          record: recordResult.data,
          analysis: analysisResult,
          imageAnalysis: imageAnalysis
        }
      });
    } catch (error) {
      logger.error('Health analysis error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health analysis failed'
      });
    }
  }

  async getHealthRecords(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0, startDate, endDate } = req.query;

      const result = await healthModel.getHealthRecords(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        startDate,
        endDate
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
      logger.error('Get health records error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get health records'
      });
    }
  }

  async getHealthRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;

      const result = await healthModel.getHealthRecordById(recordId, userId);

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
      logger.error('Get health record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get health record'
      });
    }
  }

  async updateHealthRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;
      const updateData = req.body;

      const result = await healthModel.updateHealthRecord(recordId, userId, updateData);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Health record updated: ${recordId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Update health record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update health record'
      });
    }
  }

  async deleteHealthRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;

      const result = await healthModel.deleteHealthRecord(recordId, userId);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Health record deleted: ${recordId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Delete health record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete health record'
      });
    }
  }

  async getHealthStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const result = await healthModel.getHealthStats(userId, period);

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
      logger.error('Get health stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get health statistics'
      });
    }
  }

  async analyzeFoodImage(req, res) {
    try {
      const userId = req.user.id;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          status: 'error',
          message: 'Image URL is required'
        });
      }

      // Analyze food image using Gemini Vision
      const result = await geminiService.analyzeFoodImage(imageUrl);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      // Save the analysis as a health record
      await healthModel.createHealthRecord(userId, {
        imageUrl,
        advice: result.data,
        date: new Date()
      });

      logger.info(`Food image analyzed for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Food image analyzed successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Food image analysis error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Food image analysis failed'
      });
    }
  }
}

module.exports = new HealthController();


