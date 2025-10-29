const { verifyToken } = require('./jwt');
const userModel = require('../models/userModel');
const logger = require('./logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const userResult = await userModel.getUserById(decoded.userId);
    
    if (!userResult.success) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token - user not found'
      });
    }

    // Add user to request object
    req.user = userResult.data;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const userResult = await userModel.getUserById(decoded.userId);
      
      if (userResult.success) {
        req.user = userResult.data;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};




