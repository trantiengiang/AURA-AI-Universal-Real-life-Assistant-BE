const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'AURA Backend API',
      version: '1.0.0',
      description: `# AURA - AI Universal Real-life Assistant

## 🚀 Overview
AURA is an advanced AI-powered personal assistant platform that provides comprehensive life management services through intelligent automation and data analysis.

## 🎯 Core Features
- **Authentication & User Management** - Secure user registration, login, and profile management
- **Health Management** - AI-powered health analysis, fitness tracking, and wellness insights
- **Finance Management** - Personal finance tracking, expense analysis, and budgeting
- **AI Services** - Advanced AI analysis, recommendations, and intelligent automation
- **File Upload** - Secure file handling for images, documents, and media
- **Translation** - Multi-language translation with AI-powered accuracy

## 🔧 Technical Stack
- **Backend**: Node.js + Express.js
- **Database**: SQL Server with Prisma ORM
- **AI Integration**: OpenAI, Gemini, Groq APIs
- **Authentication**: JWT-based security
- **Documentation**: OpenAPI 3.1.0 specification

## 📚 API Documentation
This documentation provides comprehensive information about all available endpoints, request/response schemas, and authentication requirements.

## 🌐 Base URLs
- **Development**: http://localhost:5000
- **Production**: https://api.aura.ai
- **Staging**: https://staging-api.aura.ai`,
      contact: {
        name: 'AURA Development Team',
        email: 'dev@aura.ai',
        url: 'https://aura.ai'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://aura.ai/terms'
    },
    servers: [
      {
        url: 'https://api.aura.ai',
        description: 'Production Server - AURA AI Platform'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server - Local Development'
      },
      {
        url: 'https://staging-api.aura.ai',
        description: 'Staging Server - Pre-production Testing'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
        externalDocs: {
          description: 'Find out more about AURA authentication',
          url: 'https://docs.aura.ai/authentication'
        }
      },
      {
        name: 'Health Management',
        description: 'Health records, analysis, and wellness tracking',
        externalDocs: {
          description: 'Health API documentation',
          url: 'https://docs.aura.ai/health'
        }
      },
      {
        name: 'Finance Management',
        description: 'Personal finance tracking and analysis',
        externalDocs: {
          description: 'Finance API documentation',
          url: 'https://docs.aura.ai/finance'
        }
      },
      {
        name: 'Notes Management',
        description: 'Digital notes, voice notes, and content management',
        externalDocs: {
          description: 'Notes API documentation',
          url: 'https://docs.aura.ai/notes'
        }
      },
      {
        name: 'Translation Services',
        description: 'AI-powered translation and language services',
        externalDocs: {
          description: 'Translation API documentation',
          url: 'https://docs.aura.ai/translation'
        }
      },
      {
        name: 'AI Analysis',
        description: 'AI-powered analysis and insights',
        externalDocs: {
          description: 'AI Analysis documentation',
          url: 'https://docs.aura.ai/ai-analysis'
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            age: {
              type: 'integer',
              description: 'User age'
            },
            gender: {
              type: 'string',
              enum: ['Nam', 'Nữ', 'Khác'],
              description: 'User gender'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp'
            }
          }
        },
        HealthRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Health record unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this record'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Record date'
            },
            weight: {
              type: 'number',
              format: 'float',
              description: 'Weight in kg'
            },
            height: {
              type: 'number',
              format: 'float',
              description: 'Height in cm'
            },
            calories: {
              type: 'integer',
              description: 'Daily calories consumed'
            },
            sleep: {
              type: 'integer',
              description: 'Sleep hours'
            },
            exercise: {
              type: 'string',
              description: 'Exercise description'
            },
            advice: {
              type: 'string',
              description: 'Health advice'
            },
            imageUrl: {
              type: 'string',
              description: 'Health image URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            }
          }
        },
        FinanceRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Finance record unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this record'
            },
            category: {
              type: 'string',
              description: 'Finance category'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount'
            },
            note: {
              type: 'string',
              description: 'Transaction note'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp'
            }
          }
        },
        Note: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Note unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this note'
            },
            title: {
              type: 'string',
              description: 'Note title'
            },
            content: {
              type: 'string',
              description: 'Note content'
            },
            tags: {
              type: 'string',
              description: 'Note tags as JSON string'
            },
            isVoice: {
              type: 'boolean',
              description: 'Is voice note'
            },
            audioUrl: {
              type: 'string',
              description: 'Audio file URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Note creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Note last update timestamp'
            }
          }
        },
        Translation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Translation unique identifier'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this translation'
            },
            inputText: {
              type: 'string',
              description: 'Input text to translate'
            },
            outputText: {
              type: 'string',
              description: 'Translated text'
            },
            fromLang: {
              type: 'string',
              description: 'Source language code'
            },
            toLang: {
              type: 'string',
              description: 'Target language code'
            },
            isVoice: {
              type: 'boolean',
              description: 'Is voice translation'
            },
            audioUrl: {
              type: 'string',
              description: 'Audio file URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Translation creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [] // Tạm thời bỏ qua authentication
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API files
};

const specs = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerUi,
  specs
};
