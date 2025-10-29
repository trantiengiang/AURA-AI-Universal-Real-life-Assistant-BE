# AURA - AI Universal Real-life Assistant Backend

A comprehensive backend API for AURA, an AI-powered universal assistant that integrates multiple AI services to provide health analysis, financial insights, note management, translation, and more.

## Features

- **Multi-AI Integration**: GPT-4, Groq (Llama), Gemini, Stability AI, Whisper, Google Translate
- **Authentication**: JWT-based user authentication and authorization
- **Health Analysis**: Food image analysis, health advice, and tracking
- **Financial Management**: Expense tracking, insights, and analytics
- **Note Management**: Text and voice notes with AI summarization
- **Translation**: Multi-language text and voice translation
- **Image Generation**: AI-powered image creation for various purposes
- **Orchestrator**: Intelligent coordination of multiple AI services
- **File Upload**: Support for images and audio files

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **AI Services**: OpenAI, Groq, Google Gemini, Stability AI
- **Logging**: Winston
- **Validation**: Joi

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AURA-AI-Universal-Real-life-Assistant-BE
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the required API keys and database URL.

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

7. Open Web Tester:
   - Visit: **http://localhost:5000**
   - Use the beautiful web interface to test all API endpoints
   - No need for Postman or other tools!

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aura

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# AI API Keys
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
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/stats` - Get user statistics
- `DELETE /api/auth/account` - Delete user account

### Health
- `POST /api/health/analyze` - Analyze health data
- `POST /api/health/analyze-image` - Analyze food images
- `GET /api/health/records` - Get health records
- `GET /api/health/records/:id` - Get specific health record
- `PUT /api/health/records/:id` - Update health record
- `DELETE /api/health/records/:id` - Delete health record
- `GET /api/health/stats` - Get health statistics

### Finance
- `POST /api/finance/record` - Create finance record
- `GET /api/finance/records` - Get finance records
- `GET /api/finance/records/:id` - Get specific finance record
- `PUT /api/finance/records/:id` - Update finance record
- `DELETE /api/finance/records/:id` - Delete finance record
- `GET /api/finance/stats` - Get finance statistics
- `GET /api/finance/insights` - Get AI-generated insights
- `GET /api/finance/category/:category/insights` - Get category insights

### Notes
- `POST /api/notes/create` - Create note
- `GET /api/notes` - Get notes
- `GET /api/notes/search` - Search notes
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/transcribe` - Transcribe audio to note
- `POST /api/notes/:id/summarize` - Summarize note
- `GET /api/notes/stats` - Get note statistics
- `GET /api/notes/tags/popular` - Get popular tags

### Translation
- `POST /api/translate/text` - Translate text
- `POST /api/translate/audio` - Translate audio
- `GET /api/translate` - Get translations
- `GET /api/translate/search` - Search translations
- `GET /api/translate/:id` - Get specific translation
- `DELETE /api/translate/:id` - Delete translation
- `GET /api/translate/languages` - Get supported languages
- `POST /api/translate/detect` - Detect language
- `GET /api/translate/stats` - Get translation statistics
- `GET /api/translate/pairs/popular` - Get popular language pairs

### Images
- `POST /api/image/generate` - Generate AI image
- `POST /api/image/health-illustration` - Generate health illustration
- `POST /api/image/finance-chart` - Generate finance chart
- `POST /api/image/note-illustration` - Generate note illustration
- `POST /api/image/upload` - Upload image
- `GET /api/image/styles` - Get available styles
- `GET /api/image/sizes` - Get available sizes

### Chat
- `POST /api/chat/ask` - Ask AI question
- `POST /api/chat/analyze-intent` - Analyze user intent
- `GET /api/chat/models` - Get available AI models
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history
- `GET /api/chat/prompts` - Get system prompts
- `PUT /api/chat/prompts` - Update system prompt

### Orchestrator
- `POST /api/orchestrator/process` - Process complex request
- `POST /api/orchestrator/multimodal` - Process multi-modal request
- `GET /api/orchestrator/capabilities` - Get capabilities
- `GET /api/orchestrator/status` - Get service status
- `POST /api/orchestrator/test` - Test orchestrator

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **health_records**: Health tracking data
- **finance_records**: Financial transactions
- **notes**: User notes and voice transcriptions
- **translations**: Translation history

## AI Services Integration

### OpenAI (GPT-4)
- Text generation and analysis
- Health advice generation
- Financial insights
- Note summarization

### Groq (Llama)
- Fast text generation
- Intent analysis
- Quick responses

### Google Gemini
- Vision analysis for food images
- Text generation
- Multi-language support

### Stability AI
- Image generation
- Illustrations and charts

### Whisper (OpenAI)
- Audio transcription
- Voice note processing

### Google Translate
- Text translation
- Language detection

## Quick Start

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
npm install
npm run setup
npm run db:generate
npm run db:push
npm run dev
```

Then visit: **http://localhost:5000** for the Web Tester!

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Migrations
```bash
npx prisma db push
npx prisma generate
```

### Testing
```bash
npm test
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- File upload restrictions

## Error Handling

- Centralized error handling middleware
- Structured error responses
- Comprehensive logging with Winston
- Graceful API service failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details