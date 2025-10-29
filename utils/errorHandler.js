const logger = require('./logger');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        error = { message: 'Duplicate field value entered', statusCode: 400 };
        break;
      case 'P2025':
        error = { message: 'Resource not found', statusCode: 404 };
        break;
      case 'P2003':
        error = { message: 'Foreign key constraint failed', statusCode: 400 };
        break;
      case 'P2014':
        error = { message: 'Invalid relation', statusCode: 400 };
        break;
      default:
        error = { message: 'Database error occurred', statusCode: 500 };
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'File too large', statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = { message: 'Too many files', statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { message: 'Unexpected field', statusCode: 400 };
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    error = { message: 'Too many requests', statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
