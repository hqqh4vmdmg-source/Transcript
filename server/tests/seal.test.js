const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const sealModel = require('../models/sealModel');

describe('Seal API Tests', () => {
  let authToken;
  let userId;
  let sealId;

  beforeAll(async () => {
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'sealtest',
        email: 'sealtest@test.com',
        password: 'password123'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data in FK-safe order:
    // 1. seal_usage (references seals + transcripts)
    // 2. seal_verification_log (references transcripts + official_seals)
    // 3. transcripts (references official_seals via seal_id – delete child first)
    // 4. official_seals (no remaining references)
    // 5. users
    try {
      await db.query('DELETE FROM seal_usage WHERE used_by = $1', [userId]);
      await db.query('DELETE FROM seal_verification_log WHERE transcript_id IN (SELECT id FROM transcripts WHERE user_id = $1)', [userId]);
      await db.query('DELETE FROM transcripts WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM official_seals WHERE created_by = $1', [userId]);
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    // Don't close the connection pool here - let Jest handle cleanup
  });

  describe('POST /api/seals', () => {
    it('should create a new seal without image', async () => {
      const response = await request(app)
        .post('/api/seals')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Test Institutional Seal')
        .field('description', 'Test seal for institutional use')
        .field('seal_type', 'institutional');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Seal created successfully');
      expect(response.body.seal).toHaveProperty('id');
      expect(response.body.seal.name).toBe('Test Institutional Seal');
      expect(response.body.seal.seal_type).toBe('institutional');

      sealId = response.body.seal.id;
    });

    it('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/seals')
        .set('Authorization', `Bearer ${authToken}`)
        .field('description', 'Missing name and type');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid seal type', async () => {
      const response = await request(app)
        .post('/api/seals')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Invalid Seal')
        .field('seal_type', 'invalid_type');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid seal type');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/seals')
        .field('name', 'Unauthorized Seal')
        .field('seal_type', 'institutional');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/seals', () => {
    it('should get all active seals', async () => {
      const response = await request(app)
        .get('/api/seals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seals retrieved successfully');
      expect(Array.isArray(response.body.seals)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/seals');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/seals/:id', () => {
    it('should get seal by ID', async () => {
      const response = await request(app)
        .get(`/api/seals/${sealId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seal retrieved successfully');
      expect(response.body.seal.id).toBe(sealId);
      expect(response.body.seal.name).toBe('Test Institutional Seal');
    });

    it('should return 404 for non-existent seal', async () => {
      const response = await request(app)
        .get('/api/seals/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/seals/type/:type', () => {
    it('should get seals by type', async () => {
      const response = await request(app)
        .get('/api/seals/type/institutional')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.seal_type).toBe('institutional');
      expect(Array.isArray(response.body.seals)).toBe(true);
    });
  });

  describe('PUT /api/seals/:id', () => {
    it('should update seal', async () => {
      const response = await request(app)
        .put(`/api/seals/${sealId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated Seal Name')
        .field('description', 'Updated description');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seal updated successfully');
      expect(response.body.seal.name).toBe('Updated Seal Name');
    });

    it('should return 404 for non-existent seal', async () => {
      const response = await request(app)
        .put('/api/seals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Updated Name');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/seals/:id/stats', () => {
    it('should get seal statistics', async () => {
      const response = await request(app)
        .get(`/api/seals/${sealId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seal statistics retrieved successfully');
      expect(response.body.seal_id).toBe(sealId);
      expect(response.body.statistics).toHaveProperty('total_uses');
      expect(response.body.statistics).toHaveProperty('unique_transcripts');
    });
  });

  describe('Seal Verification', () => {
    it('should generate and verify seal code', async () => {
      // Create a transcript first
      const transcriptResponse = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'college',
          data: {
            schoolName: 'Test University',
            studentName: 'Test Student',
            cumulativeGPA: '3.5'
          }
        });

      const transcriptId = transcriptResponse.body.transcript.id;

      // Record seal usage
      const usage = await sealModel.recordUsage(sealId, transcriptId, userId);
      const verificationCode = usage.verification_code;

      // Verify the seal
      const verifyResponse = await request(app)
        .get(`/api/seals/verify/${verificationCode}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.verification.is_valid).toBe(true);
      expect(verifyResponse.body.verification.seal_name).toBe('Updated Seal Name');
      expect(verifyResponse.body.verification.transcript_id).toBe(transcriptId);
    });

    it('should return invalid for non-existent verification code', async () => {
      const response = await request(app)
        .get('/api/seals/verify/INVALIDCODE123');

      expect(response.status).toBe(404);
      expect(response.body.is_valid).toBe(false);
    });
  });

  describe('DELETE /api/seals/:id', () => {
    it('should soft delete seal', async () => {
      const response = await request(app)
        .delete(`/api/seals/${sealId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Seal deleted successfully');

      // Verify seal is deactivated
      const getResponse = await request(app)
        .get('/api/seals')
        .set('Authorization', `Bearer ${authToken}`);

      const deletedSeal = getResponse.body.seals.find(s => s.id === sealId);
      expect(deletedSeal).toBeUndefined();
    });
  });

  describe('Seal Model Unit Tests', () => {
    it('should generate unique verification codes', () => {
      const code1 = sealModel.generateVerificationCode();
      const code2 = sealModel.generateVerificationCode();

      expect(code1).not.toBe(code2);
      expect(code1.length).toBeGreaterThan(0);
      expect(code2.length).toBeGreaterThan(0);
      // Verification codes should be alphanumeric
      expect(/^[A-F0-9]+$/.test(code1)).toBe(true);
    });

    it('should create seal with all fields', async () => {
      const sealData = {
        name: 'Model Test Seal',
        description: 'Testing seal model',
        image_path: '/test/path.png',
        image_data: Buffer.from('test'),
        seal_type: 'registrar',
        metadata: { test: 'data' },
        created_by: userId
      };

      const seal = await sealModel.create(sealData);

      expect(seal).toHaveProperty('id');
      expect(seal.name).toBe('Model Test Seal');
      expect(seal.seal_type).toBe('registrar');

      // Cleanup
      await sealModel.delete(seal.id);
    });

    it('should get seals by type', async () => {
      // Create test seals
      const registrarSeal = await sealModel.create({
        name: 'Registrar Seal',
        seal_type: 'registrar',
        image_path: '/test.png',
        created_by: userId
      });

      const departmentSeal = await sealModel.create({
        name: 'Department Seal',
        seal_type: 'departmental',
        image_path: '/test2.png',
        created_by: userId
      });

      const registrarSeals = await sealModel.getByType('registrar');
      const departmentSeals = await sealModel.getByType('departmental');

      expect(registrarSeals.length).toBeGreaterThan(0);
      expect(departmentSeals.length).toBeGreaterThan(0);
      expect(registrarSeals.every(s => s.seal_type === 'registrar')).toBe(true);
      expect(departmentSeals.every(s => s.seal_type === 'departmental')).toBe(true);

      // Cleanup
      await sealModel.delete(registrarSeal.id);
      await sealModel.delete(departmentSeal.id);
    });
  });
});
