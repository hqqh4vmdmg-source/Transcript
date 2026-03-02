const request = require('supertest');
const app = require('../app');

describe('Authentication API Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'Test123456!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalidemail',
        password: 'Test123456!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject registration with short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        email: 'first@example.com',
        password: 'Test123456!'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register again with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          email: 'different@example.com'
        })
        .expect(400);

      expect(response.body.message).toMatch(/username/i);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      username: 'logintest',
      email: 'logintest@example.com',
      password: 'Test123456!'
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid/i);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123456!'
        })
        .expect(401);

      expect(response.body.message).toMatch(/invalid/i);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    
    beforeAll(async () => {
      const userData = {
        username: 'profiletest',
        email: 'profiletest@example.com',
        password: 'Test123456!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      token = response.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.message).toMatch(/token/i);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toMatch(/valid/i);
    });
  });
});
