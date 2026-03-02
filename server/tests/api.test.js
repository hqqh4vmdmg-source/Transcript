const request = require('supertest');
const app = require('../app');

describe('API Health Check', () => {
  it('should return 200 and OK status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
  });
});

describe('Authentication Endpoints', () => {
  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });

  it('should validate registration input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('errors');
  });
});

describe('Transcript Endpoints', () => {
  it('should require authentication for transcript creation', async () => {
    const response = await request(app)
      .post('/api/transcripts')
      .send({
        type: 'high_school',
        data: {}
      })
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });

  it('should require authentication for getting transcripts', async () => {
    const response = await request(app)
      .get('/api/transcripts')
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });
});
