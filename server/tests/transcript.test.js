const request = require('supertest');
const app = require('../app');

describe('Transcript API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Register and login a test user
    const userData = {
      username: 'transcripttest' + Date.now(),
      email: `transcripttest${Date.now()}@example.com`,
      password: 'Test123456!'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = response.body.token;
  });

  describe('POST /api/transcripts', () => {
    it('should create a high school transcript', async () => {
      const transcriptData = {
        type: 'high_school',
        data: {
          schoolName: 'Test High School',
          studentName: 'John Doe',
          studentId: 'HS-2024-001',
          dateOfBirth: '2006-01-15',
          gradeLevel: '12th',
          graduationDate: '2024-06-15',
          cumulativeGPA: '3.85',
          courses: [
            {
              code: 'MATH301',
              name: 'Calculus I',
              semester_year: 'Fall 2023',
              credits: 4,
              grade: 'A',
              teacher_professor: 'Mr. Smith'
            }
          ]
        }
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData)
        .expect(201);

      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.type).toBe('high_school');
    });

    it('should create a college transcript', async () => {
      const transcriptData = {
        type: 'college',
        data: {
          schoolName: 'State University',
          studentName: 'Jane Doe',
          studentId: 'CU-2024-001',
          dateOfBirth: '2002-05-20',
          major: 'Computer Science',
          degree: 'Bachelor',
          expectedGraduation: '2024-05-15',
          cumulativeGPA: '3.75',
          courses: [
            {
              code: 'CS101',
              name: 'Introduction to Programming',
              semester_year: 'Fall 2023',
              credits: 3,
              grade: 'A',
              teacher_professor: 'Dr. Williams'
            }
          ]
        }
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData)
        .expect(201);

      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.type).toBe('college');
    });

    it('should reject transcript creation without authentication', async () => {
      const transcriptData = {
        type: 'high_school',
        data: {}
      };

      const response = await request(app)
        .post('/api/transcripts')
        .send(transcriptData)
        .expect(401);

      expect(response.body.message).toMatch(/token/i);
    });

    it('should reject transcript with invalid type', async () => {
      const transcriptData = {
        type: 'invalid_type',
        data: {}
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/transcripts', () => {
    it('should get all transcripts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transcripts');
      expect(Array.isArray(response.body.transcripts)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/transcripts')
        .expect(401);

      expect(response.body.message).toMatch(/token/i);
    });
  });

  describe('GET /api/transcripts/:id', () => {
    let transcriptId;

    beforeAll(async () => {
      const transcriptData = {
        type: 'high_school',
        data: {
          schoolName: 'Test School',
          studentName: 'Test Student',
          cumulativeGPA: '3.5'
        }
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData);

      transcriptId = response.body.transcript.id;
    });

    it('should get transcript by ID', async () => {
      const response = await request(app)
        .get(`/api/transcripts/${transcriptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transcript');
      expect(response.body.transcript.id).toBe(transcriptId);
    });

    it('should return 404 for non-existent transcript', async () => {
      const response = await request(app)
        .get('/api/transcripts/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('PUT /api/transcripts/:id', () => {
    let transcriptId;

    beforeAll(async () => {
      const transcriptData = {
        type: 'high_school',
        data: {
          schoolName: 'Original School',
          studentName: 'Test Student',
          cumulativeGPA: '3.0'
        }
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData);

      transcriptId = response.body.transcript.id;
    });

    it('should update transcript', async () => {
      const updateData = {
        type: 'high_school',
        data: {
          schoolName: 'Updated School',
          cumulativeGPA: '3.5'
        }
      };

      const response = await request(app)
        .put(`/api/transcripts/${transcriptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.transcript.data.schoolName).toBe('Updated School');
    });
  });

  describe('DELETE /api/transcripts/:id', () => {
    let transcriptId;

    beforeAll(async () => {
      const transcriptData = {
        type: 'high_school',
        data: {
          schoolName: 'Delete Test School',
          studentName: 'Delete Test',
          cumulativeGPA: '3.0'
        }
      };

      const response = await request(app)
        .post('/api/transcripts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transcriptData);

      transcriptId = response.body.transcript.id;
    });

    it('should delete transcript', async () => {
      const response = await request(app)
        .delete(`/api/transcripts/${transcriptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toMatch(/deleted/i);
    });

    it('should return 404 when trying to get deleted transcript', async () => {
      await request(app)
        .get(`/api/transcripts/${transcriptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
