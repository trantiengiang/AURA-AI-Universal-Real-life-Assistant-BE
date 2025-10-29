const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

/**
 * Swagger configuration for AURA Backend API
 * Professional setup with OAS 3.1.0 specification
 */

const swaggerOptions = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'AURA Backend API',
      version: '1.0.0',
      description: ``
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development'
      },
      {
        url: 'https://api.aura.ai',
        description: 'Production'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Health Management',
        description: 'Health records and wellness tracking'
      },
      {
        name: 'Finance Management',
        description: 'Personal finance tracking and analysis'
      },
      {
        name: 'AI Services',
        description: 'AI-powered analysis and automation'
      },
      {
        name: 'File Upload',
        description: 'Secure file handling'
      },
      {
        name: 'Translation',
        description: 'Multi-language translation services'
      },
      {
        name: 'Notes Management',
        description: 'Digital notes and content management'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier',
              example: 'user_123456789'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            age: {
              type: 'integer',
              description: 'User age',
              example: 25
            },
            gender: {
              type: 'string',
              enum: ['Nam', 'Nữ', 'Khác'],
              description: 'User gender',
              example: 'Nam'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
              example: 'https://api.aura.ai/uploads/avatars/user_123456789.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        HealthRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Health record unique identifier',
              example: 'health_123456789'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this record',
              example: 'user_123456789'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Record date',
              example: '2024-01-01T00:00:00.000Z'
            },
            weight: {
              type: 'number',
              format: 'float',
              description: 'Weight in kg',
              example: 70.5
            },
            height: {
              type: 'number',
              format: 'float',
              description: 'Height in cm',
              example: 175.0
            },
            calories: {
              type: 'integer',
              description: 'Daily calories consumed',
              example: 2000
            },
            sleep: {
              type: 'integer',
              description: 'Sleep hours',
              example: 8
            },
            exercise: {
              type: 'string',
              description: 'Exercise description',
              example: 'Running 30 minutes, Weight training 45 minutes'
            },
            advice: {
              type: 'string',
              description: 'AI-generated health advice',
              example: 'Your sleep pattern looks good. Consider adding more cardio exercises.'
            },
            imageUrl: {
              type: 'string',
              description: 'Health image URL',
              example: 'https://api.aura.ai/uploads/health/user_123456789_20240101.jpg'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
              description: 'Response status'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid credentials'
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
              example: 'Error: Invalid credentials\n    at AuthController.login...'
            }
          }
        },
        FinanceRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Finance record unique identifier',
              example: 'finance_123456789'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this record',
              example: 'user_123456789'
            },
            category: {
              type: 'string',
              description: 'Finance category',
              example: 'Food & Dining'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
              example: 50.00
            },
            note: {
              type: 'string',
              description: 'Transaction note',
              example: 'Lunch at restaurant'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date',
              example: '2024-01-01T00:00:00.000Z'
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              description: 'Transaction type',
              example: 'expense'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation timestamp',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
              description: 'Response status'
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: []
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

// Generate Swagger specification
const specs = swaggerJSDoc(swaggerOptions);

/**
 * Setup Swagger UI for Express app - Dùng Swagger UI gốc từ swagger.io
 * @param {Express} app - Express application instance
 */
function setupSwagger(app) {
  // Route để serve Swagger UI gốc
  app.get('/api-docs', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AURA Backend API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" href="https://petstore.swagger.io/favicon-32x32.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api-docs/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: null,
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: false,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: false,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
      });
    };
  </script>
</body>
</html>`;
    res.send(html);
  });

  // Route để serve OpenAPI spec
  app.get('/api-docs/swagger.json', (req, res) => {
    res.json(specs);
  });

  console.log('📚 Swagger UI (gốc từ swagger.io) available at: http://localhost:5000/api-docs');
}

module.exports = {
  setupSwagger,
  specs
};
