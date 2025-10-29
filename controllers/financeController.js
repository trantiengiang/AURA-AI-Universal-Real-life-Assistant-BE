const financeModel = require('../models/financeModel');
const gptService = require('../services/gptService');
const logger = require('../utils/logger');

class FinanceController {
  async createFinanceRecord(req, res) {
    try {
      const userId = req.user.id;
      const { category, amount, note, type, date } = req.body;

      // Validate required fields
      if (!category || !amount || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'Category, amount, and type are required'
        });
      }

      // Validate type
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Type must be either "income" or "expense"'
        });
      }

      const result = await financeModel.createFinanceRecord(userId, {
        category,
        amount: parseFloat(amount),
        note,
        type,
        date: date ? new Date(date) : new Date()
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Finance record created for user: ${userId}`);

      res.status(201).json({
        status: 'success',
        message: 'Finance record created successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Create finance record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create finance record'
      });
    }
  }

  async getFinanceRecords(req, res) {
    try {
      const userId = req.user.id;
      const { 
        limit = 10, 
        offset = 0, 
        startDate, 
        endDate, 
        category, 
        type 
      } = req.query;

      const result = await financeModel.getFinanceRecords(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        startDate,
        endDate,
        category,
        type
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
      logger.error('Get finance records error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get finance records'
      });
    }
  }

  async getFinanceRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;

      const result = await financeModel.getFinanceRecordById(recordId, userId);

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
      logger.error('Get finance record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get finance record'
      });
    }
  }

  async updateFinanceRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;
      const updateData = req.body;

      const result = await financeModel.updateFinanceRecord(recordId, userId, updateData);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Finance record updated: ${recordId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Update finance record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update finance record'
      });
    }
  }

  async deleteFinanceRecord(req, res) {
    try {
      const userId = req.user.id;
      const { recordId } = req.params;

      const result = await financeModel.deleteFinanceRecord(recordId, userId);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`Finance record deleted: ${recordId} for user: ${userId}`);

      res.json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      logger.error('Delete finance record error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete finance record'
      });
    }
  }

  async getFinanceStats(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      const result = await financeModel.getFinanceStats(userId, period);

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
      logger.error('Get finance stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get finance statistics'
      });
    }
  }

  async getFinanceInsights(req, res) {
    try {
      const userId = req.user.id;
      const { period = '30d' } = req.query;

      // Get finance data
      const statsResult = await financeModel.getFinanceStats(userId, period);

      if (!statsResult.success) {
        return res.status(400).json({
          status: 'error',
          message: statsResult.error
        });
      }

      // Generate AI insights
      const insightsResult = await gptService.generateFinanceInsight(statsResult.data);

      if (!insightsResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to generate finance insights'
        });
      }

      logger.info(`Finance insights generated for user: ${userId}`);

      res.json({
        status: 'success',
        message: 'Finance insights generated successfully',
        data: {
          stats: statsResult.data,
          insights: insightsResult.data
        }
      });
    } catch (error) {
      logger.error('Get finance insights error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get finance insights'
      });
    }
  }

  async getCategoryInsights(req, res) {
    try {
      const userId = req.user.id;
      const { category } = req.params;
      const { period = '30d' } = req.query;

      const result = await financeModel.getCategoryInsights(userId, category, period);

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
      logger.error('Get category insights error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get category insights'
      });
    }
  }
}

module.exports = new FinanceController();


