const request = require('supertest');
const app = require('../server');

describe('AURA Backend API', () => {
  describe('Health Check', () => {
    it('should return 200 and API status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('AURA Backend API is running');
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });
  });

  describe('Chat API', () => {
    it('should respond to chat message', async () => {
      const message = {
        message: 'Hello, how are you?',
        aiModel: 'gpt-4'
      };

      const res = await request(app)
        .post('/api/chat/ask')
        .send(message)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.response).toBeDefined();
    });
  });

  describe('Image API', () => {
    it('should return available image styles', async () => {
      const res = await request(app)
        .get('/api/image/styles')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.styles).toBeInstanceOf(Array);
    });
  });

  describe('Orchestrator API', () => {
    it('should return orchestrator capabilities', async () => {
      const res = await request(app)
        .get('/api/orchestrator/capabilities')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.supportedIntents).toBeInstanceOf(Array);
    });
  });
});


