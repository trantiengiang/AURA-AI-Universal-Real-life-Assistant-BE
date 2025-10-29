#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AURA Backend API...\n');

// Create necessary directories
const directories = [
  'uploads',
  'uploads/images',
  'uploads/audio',
  'uploads/misc',
  'logs'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory already exists: ${dir}`);
  }
});

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
    console.log('⚠️  Please update .env with your actual API keys and database URL');
  } else {
    // Create basic .env file
    const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aura

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# AI API Keys (Add your actual keys here)
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
STABILITY_API_KEY=your_stability_api_key_here
TRANSLATE_API_KEY=your_google_translate_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default values');
    console.log('⚠️  Please update .env with your actual API keys and database URL');
  }
} else {
  console.log('📄 .env file already exists');
}

console.log('\n🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Update .env file with your API keys and database URL');
console.log('2. Run: npm install');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma db push');
console.log('5. Run: npm run dev');
console.log('\n📚 Check README.md for detailed documentation');




