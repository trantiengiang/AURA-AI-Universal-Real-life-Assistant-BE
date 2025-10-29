const userModel = require('../models/userModel');
const { validate } = require('../utils/validateIntent');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, age, gender } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await userModel.getUserById(email);
      if (existingUser.success) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }

      // Create user
      const result = await userModel.createUser({
        name,
        email,
        password,
        age,
        gender
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Registration failed'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Authenticate user
      const result = await userModel.loginUser(email, password);

      if (!result.success) {
        return res.status(401).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`User logged in: ${email}`);

      res.json({
        status: 'success',
        message: 'Login successful',
        data: result.data
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed'
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      // User is already attached to req by auth middleware
      const user = req.user;

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user information'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, age, gender, avatar } = req.body;

      const result = await userModel.updateUser(userId, {
        name,
        age,
        gender,
        avatar
      });

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`User profile updated: ${userId}`);

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: result.data
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update profile'
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await userModel.getUserStats(userId);

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
      logger.error('Get user stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user statistics'
      });
    }
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;

      const result = await userModel.deleteUser(userId);

      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: result.error
        });
      }

      logger.info(`User account deleted: ${userId}`);

      res.json({
        status: 'success',
        message: 'Account deleted successfully'
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete account'
      });
    }
  }
}

module.exports = new AuthController();




