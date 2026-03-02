const request = require('supertest');
const app = require('../app');
const SimpleSealGenerator = require('../utils/simpleSealGenerator');
const CategoryGenerator = require('../utils/categoryGenerator');

describe('Generator API Tests', () => {
  let authToken;
  const sealGenerator = new SimpleSealGenerator();
  const categoryGenerator = new CategoryGenerator();

  beforeAll(async () => {
    // Register and login a test user
    const userData = {
      username: 'generatortest' + Date.now(),
      email: `generatortest${Date.now()}@example.com`,
      password: 'Test123456!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.token;
  });

  describe('Seal Generator Utility', () => {
    it('should generate an institutional seal', () => {
      const seal = sealGenerator.generateInstitutionalSeal('Test University', '2024');
      
      expect(seal).toHaveProperty('svg');
      expect(seal).toHaveProperty('base64');
      expect(seal).toHaveProperty('dataUrl');
      expect(seal.dataUrl).toContain('data:image/svg+xml;base64');
      expect(seal.format).toBe('svg');
    });

    it('should generate a departmental seal', () => {
      const seal = sealGenerator.generateDepartmentalSeal('Computer Science', 'Test University');
      
      expect(seal).toHaveProperty('svg');
      expect(seal.width).toBe(300);
      expect(seal.height).toBe(300);
    });

    it('should generate a registrar seal', () => {
      const seal = sealGenerator.generateRegistrarSeal('Test University');
      
      expect(seal).toHaveProperty('svg');
      expect(seal.format).toBe('svg');
    });

    it('should generate unique filenames', () => {
      const filename1 = sealGenerator.generateFilename('test');
      const filename2 = sealGenerator.generateFilename('test');
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toContain('.svg');
    });
  });

  describe('Category Generator Utility', () => {
    it('should generate failed grades category', () => {
      const category = categoryGenerator.generateFailedGradesCategory();
      
      expect(category).toHaveProperty('courses');
      expect(category).toHaveProperty('stats');
      expect(category.courses.length).toBeGreaterThan(0);
      expect(category.stats.gpa).toBeLessThan(1.5);
      expect(category.stats.category).toBe('Failed Grades');
    });

    it('should generate 2.5 GPA category', () => {
      const category = categoryGenerator.generate25GPACategory();
      
      expect(category).toHaveProperty('courses');
      expect(category).toHaveProperty('stats');
      expect(category.stats.gpa).toBeGreaterThan(2.0);
      expect(category.stats.gpa).toBeLessThan(3.0);
      expect(category.stats.category).toBe('2.5 GPA');
    });

    it('should generate 3.74 GPA category', () => {
      const category = categoryGenerator.generate374GPACategory();
      
      expect(category).toHaveProperty('courses');
      expect(category).toHaveProperty('stats');
      expect(category.stats.gpa).toBeGreaterThan(3.5);
      expect(category.stats.gpa).toBeLessThan(4.0);
      expect(category.stats.category).toBe('3.74 GPA');
      expect(category.stats.honorsEligible).toBe(true);
    });

    it('should generate complete transcript by category', () => {
      const transcript = categoryGenerator.generateTranscriptByCategory('2.5', 'college');
      
      expect(transcript).toHaveProperty('type');
      expect(transcript).toHaveProperty('data');
      expect(transcript).toHaveProperty('stats');
      expect(transcript.type).toBe('college');
      expect(transcript.data.courses).toBeDefined();
    });

    it('should get available categories', () => {
      const categories = categoryGenerator.getAvailableCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(3);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/generator/seal', () => {
    it('should generate institutional seal via API', async () => {
      const response = await request(app)
        .post('/api/generator/seal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sealType: 'institutional',
          institutionName: 'Test University',
          year: '2024'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('seal');
      expect(response.body.seal.seal_type).toBe('institutional');
    });

    it('should reject invalid seal type', async () => {
      const response = await request(app)
        .post('/api/generator/seal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sealType: 'invalid',
          institutionName: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/generator/seal')
        .send({
          sealType: 'institutional'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/generator/categories', () => {
    it('should get available categories', async () => {
      const response = await request(app)
        .get('/api/generator/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBe(3);
    });
  });

  describe('POST /api/generator/category/:category', () => {
    it('should generate failed category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/category/failed')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.stats.gpa).toBeLessThan(1.5);
    });

    it('should generate 2.5 GPA category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/category/2.5')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.stats.gpa).toBeGreaterThan(2.0);
      expect(response.body.transcript.stats.gpa).toBeLessThan(3.0);
    });

    it('should generate 3.74 GPA category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/category/3.74')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.stats.gpa).toBeGreaterThan(3.5);
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/generator/category/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/generator/failed', () => {
    it('should generate failed category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/failed')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(200);
      expect(response.body.transcript.stats.category).toBe('Failed Grades');
    });
  });

  describe('POST /api/generator/2.5', () => {
    it('should generate 2.5 GPA category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/2.5')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'high_school' });

      expect(response.status).toBe(200);
      expect(response.body.transcript.type).toBe('high_school');
    });
  });

  describe('POST /api/generator/3.74', () => {
    it('should generate 3.74 GPA category transcript', async () => {
      const response = await request(app)
        .post('/api/generator/3.74')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'college' });

      expect(response.status).toBe(200);
      expect(response.body.transcript.stats.honorsEligible).toBe(true);
    });
  });
});
