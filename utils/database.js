const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

class DatabaseConnection {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (!this.prisma) {
        this.prisma = new PrismaClient({
          log: [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'event' },
            { level: 'info', emit: 'event' },
            { level: 'warn', emit: 'event' },
          ],
        });

        // Log Prisma events
        this.prisma.$on('query', (e) => {
          if (process.env.NODE_ENV === 'development') {
            logger.debug(`Query: ${e.query}`);
            logger.debug(`Params: ${e.params}`);
            logger.debug(`Duration: ${e.duration}ms`);
          }
        });

        this.prisma.$on('error', (e) => {
          logger.error(`Database Error: ${e.message}`);
        });

        this.prisma.$on('info', (e) => {
          logger.info(`Database Info: ${e.message}`);
        });

        this.prisma.$on('warn', (e) => {
          logger.warn(`Database Warning: ${e.message}`);
        });
      }

      // Test connection
      await this.prisma.$connect();
      this.isConnected = true;
      
      logger.info('✅ Database connected successfully');
      
      // Test basic query
      await this.prisma.$queryRaw`SELECT 1 as test`;
      logger.info('✅ Database query test successful');
      
      return this.prisma;
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.isConnected = false;
        logger.info('✅ Database disconnected successfully');
      }
    } catch (error) {
      logger.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  async healthCheck() {
    try {
      if (!this.prisma) {
        return { status: 'disconnected', message: 'Database client not initialized' };
      }

      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      return { status: 'connected', message: 'Database is healthy' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Graceful shutdown
  async gracefulShutdown() {
    logger.info('🔄 Initiating database graceful shutdown...');
    try {
      await this.disconnect();
      logger.info('✅ Database graceful shutdown completed');
    } catch (error) {
      logger.error('❌ Database graceful shutdown failed:', error);
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

// Handle process termination
process.on('SIGINT', async () => {
  await dbConnection.gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await dbConnection.gracefulShutdown();
  process.exit(0);
});

module.exports = dbConnection;

