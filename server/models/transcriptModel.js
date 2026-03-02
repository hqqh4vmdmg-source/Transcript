const db = require('../config/database');

class Transcript {
  static async create({ user_id, type, data }) {
    const query = `
      INSERT INTO transcripts (user_id, type, data)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [user_id, type, JSON.stringify(data)];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM transcripts WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, { type, search, sort } = {}) {
    const conditions = ['user_id = $1'];
    const values = [user_id];
    let paramCount = 2;

    if (type && ['high_school', 'college'].includes(type)) {
      conditions.push(`type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }

    if (search) {
      conditions.push(`(data->>'studentName' ILIKE $${paramCount} OR data->>'schoolName' ILIKE $${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const orderBy = sort === 'oldest' ? 'created_at ASC' : 'created_at DESC';
    const query = `SELECT * FROM transcripts WHERE ${conditions.join(' AND ')} ORDER BY ${orderBy}`;
    const result = await db.query(query, values);
    return result.rows;
  }

  static async findByIdAndUserId(id, user_id) {
    const query = 'SELECT * FROM transcripts WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'data') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updates[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
      paramCount++;
    });

    values.push(id);
    const query = `
      UPDATE transcripts 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id, user_id) {
    const query = 'DELETE FROM transcripts WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  }

  static async addCourse(transcript_id, courseData) {
    const query = `
      INSERT INTO courses (transcript_id, name, code, semester_year, credits, grade, teacher_professor)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      transcript_id,
      courseData.name,
      courseData.code,
      courseData.semester_year,
      courseData.credits,
      courseData.grade,
      courseData.teacher_professor
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getCourses(transcript_id) {
    const query = 'SELECT *, TRIM(grade) AS grade FROM courses WHERE transcript_id = $1 ORDER BY id';
    const result = await db.query(query, [transcript_id]);
    return result.rows;
  }

  static async duplicate(id, user_id) {
    // Fetch original transcript and courses
    const original = await this.findByIdAndUserId(id, user_id);
    if (!original) return null;
    const courses = await this.getCourses(id);

    // Insert new transcript (same data, new id)
    const newTranscript = await this.create({
      user_id,
      type: original.type,
      data: typeof original.data === 'string' ? JSON.parse(original.data) : original.data
    });

    // Insert copies of all courses
    for (const course of courses) {
      await this.addCourse(newTranscript.id, course);
    }

    return newTranscript;
  }
}

module.exports = Transcript;
