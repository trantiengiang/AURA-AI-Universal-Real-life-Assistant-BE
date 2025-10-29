const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoute');
const orchestratorRoutes = require('./routes/orchestratorRoute');
const healthRoutes = require('./routes/healthRoute');
const financeRoutes = require('./routes/financeRoute');
const notesRoutes = require('./routes/notesRoute');
const translateRoutes = require('./routes/translateRoute');
const imageRoutes = require('./routes/imageRoute');
const chatRoutes = require('./routes/chatRoute');

// Import middleware
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');
const dbConnection = require('./utils/database');
const { setupSwagger } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://petstore.swagger.io"],
      connectSrc: ["'self'", "https://unpkg.com"],
      fontSrc: ["'self'", "https://unpkg.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://*.onrender.com', 'https://*.vercel.app']
    : process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup Swagger UI - Professional Documentation
setupSwagger(app);

// Redirect root path to Swagger docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await dbConnection.healthCheck();
    
    res.status(200).json({
      status: 'success',
      message: 'AURA Backend API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Development test endpoint
app.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working! No authentication required in development mode.',
    timestamp: new Date().toISOString(),
    endpoints: {
      'API Documentation': '/api-docs',
      'Health Check': '/health',
      'Authentication': '/api/auth/*',
      'Health Management': '/api/health/*',
      'Finance Management': '/api/finance/*',
      'Notes Management': '/api/notes/*',
      'Translation': '/api/translate/*'
    }
  });
});

// API Routes - Versioned API Structure
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orchestrator', orchestratorRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/translate', translateRoutes);
app.use('/api/v1/image', imageRoutes);
app.use('/api/v1/chat', chatRoutes);

// Legacy API support (backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/translate', translateRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  try {
    // Skip database connection for now (Render deployment)
    if (process.env.NODE_ENV !== 'production' || process.env.SKIP_DB === 'true') {
      logger.info(`🚀 AURA Backend API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      logger.info(`🗄️ Database: Skipped for deployment`);
    } else {
      // Connect to database
      await dbConnection.connect();
      
      logger.info(`🚀 AURA Backend API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
      logger.info(`🗄️ Database: SQL Server connected`);
    }
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

module.exports = app;
