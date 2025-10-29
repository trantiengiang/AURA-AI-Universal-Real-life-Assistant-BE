const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

class DatabaseSetup {
  constructor() {
    this.isWindows = process.platform === 'win32';
  }

  async setupDatabase() {
    try {
      logger.info('🚀 Starting AURA Database Setup...');
      
      // Step 1: Install dependencies
      await this.installDependencies();
      
      // Step 2: Generate Prisma client
      await this.generatePrismaClient();
      
      // Step 3: Push database schema
      await this.pushDatabaseSchema();
      
      // Step 4: Run demo data (optional)
      const runDemo = process.argv.includes('--demo');
      if (runDemo) {
        await this.runDemoData();
      }
      
      logger.info('✅ Database setup completed successfully!');
      logger.info('🎉 You can now start the server with: npm start');
      
    } catch (error) {
      logger.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  }

  async installDependencies() {
    logger.info('📦 Installing dependencies...');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      logger.info('✅ Dependencies installed successfully');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async generatePrismaClient() {
    logger.info('🔧 Generating Prisma client for SQL Server...');
    
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      logger.info('✅ Prisma client generated successfully');
    } catch (error) {
      throw new Error(`Failed to generate Prisma client: ${error.message}`);
    }
  }

  async pushDatabaseSchema() {
    logger.info('🗄️ Pushing database schema to SQL Server...');
    
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      logger.info('✅ Database schema pushed successfully');
    } catch (error) {
      logger.warn('⚠️ Database push failed. This might be normal if database is not accessible.');
      logger.warn('Please ensure SQL Server is running and DATABASE_URL is correct in .env file');
      throw new Error(`Failed to push database schema: ${error.message}`);
    }
  }

  async runDemoData() {
    logger.info('🎭 Running demo data...');
    
    try {
      execSync('npm run demo', { stdio: 'inherit' });
      logger.info('✅ Demo data created successfully');
    } catch (error) {
      logger.warn('⚠️ Demo data creation failed:', error.message);
    }
  }

  async checkEnvironment() {
    logger.info('🔍 Checking environment configuration...');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      logger.warn('⚠️ .env file not found. Please create it with the provided configuration.');
      return false;
    }
    
    // Check DATABASE_URL
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('DATABASE_URL')) {
      logger.warn('⚠️ DATABASE_URL not found in .env file.');
      return false;
    }
    
    logger.info('✅ Environment configuration looks good');
    return true;
  }

  async validateConnection() {
    logger.info('🔗 Validating database connection...');
    
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as test`;
      await prisma.$disconnect();
      
      logger.info('✅ Database connection validated successfully');
      return true;
    } catch (error) {
      logger.error('❌ Database connection validation failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const setup = new DatabaseSetup();
  
  // Check environment first
  const envOk = await setup.checkEnvironment();
  if (!envOk) {
    logger.error('❌ Environment check failed. Please fix .env configuration.');
    process.exit(1);
  }
  
  // Run setup
  await setup.setupDatabase();
  
  // Validate connection
  const connectionOk = await setup.validateConnection();
  if (!connectionOk) {
    logger.warn('⚠️ Database connection validation failed. Please check your SQL Server setup.');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseSetup;



