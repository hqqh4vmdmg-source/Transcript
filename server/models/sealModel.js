const db = require('../config/database');
const crypto = require('crypto');

// Constants
const VERIFICATION_CODE_LENGTH = 32;

class SealModel {
  /**
   * Create a new official seal
   */
  async create(sealData) {
    const {
      name,
      description,
      image_path,
      image_data,
      seal_type,
      metadata,
      valid_from,
      valid_until,
      created_by
    } = sealData;

    const query = `
      INSERT INTO official_seals 
      (name, description, image_path, image_data, seal_type, metadata, valid_from, valid_until, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      name,
      description,
      image_path,
      image_data,
      seal_type,
      metadata || {},
      valid_from || new Date(),
      valid_until,
      created_by
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all active seals
   */
  async getAllActive() {
    const query = `
      SELECT id, name, description, image_path, seal_type, metadata, 
             valid_from, valid_until, created_at
      FROM official_seals
      WHERE is_active = true
      AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get seal by ID
   */
  async getById(sealId) {
    const query = `
      SELECT * FROM official_seals
      WHERE id = $1
    `;

    const result = await db.query(query, [sealId]);
    return result.rows[0];
  }

  /**
   * Get seal with image data
   */
  async getSealWithImage(sealId) {
    const query = `
      SELECT id, name, description, image_path, image_data, seal_type, metadata
      FROM official_seals
      WHERE id = $1 AND is_active = true
    `;

    const result = await db.query(query, [sealId]);
    return result.rows[0];
  }

  /**
   * Update seal
   */
  async update(sealId, updates) {
    const allowedFields = ['name', 'description', 'image_path', 'image_data', 'seal_type', 'metadata', 'is_active', 'valid_until'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(sealId);

    const query = `
      UPDATE official_seals
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete seal (soft delete by setting is_active to false)
   */
  async delete(sealId) {
    const query = `
      UPDATE official_seals
      SET is_active = false
      WHERE id = $1
      RETURNING id
    `;

    const result = await db.query(query, [sealId]);
    return result.rows[0];
  }

  /**
   * Record seal usage on a transcript
   */
  async recordUsage(sealId, transcriptId, userId) {
    const verificationCode = this.generateVerificationCode();

    const query = `
      INSERT INTO seal_usage (seal_id, transcript_id, used_by, verification_code)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await db.query(query, [sealId, transcriptId, userId, verificationCode]);
    
    // Update transcript with seal information
    await db.query(
      'UPDATE transcripts SET seal_id = $1, seal_verification_code = $2 WHERE id = $3',
      [sealId, verificationCode, transcriptId]
    );

    return result.rows[0];
  }

  /**
   * Verify seal on a transcript
   */
  async verifySeal(verificationCode) {
    const query = `
      SELECT 
        su.*, 
        os.name as seal_name,
        os.seal_type,
        os.is_active as seal_active,
        os.valid_until as seal_valid_until,
        t.id as transcript_id,
        t.type as transcript_type
      FROM seal_usage su
      JOIN official_seals os ON su.seal_id = os.id
      JOIN transcripts t ON su.transcript_id = t.id
      WHERE su.verification_code = $1
    `;

    const result = await db.query(query, [verificationCode]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const sealData = result.rows[0];
    
    // Check if seal is still valid
    const isValid = sealData.seal_active && 
                   (!sealData.seal_valid_until || new Date(sealData.seal_valid_until) > new Date());

    // Log verification attempt
    await this.logVerification(sealData.seal_id, sealData.transcript_id, verificationCode, isValid);

    return {
      ...sealData,
      is_valid: isValid
    };
  }

  /**
   * Log seal verification attempt
   */
  async logVerification(sealId, transcriptId, verificationCode, result, verifierInfo = {}) {
    const query = `
      INSERT INTO seal_verification_log 
      (seal_id, transcript_id, verification_code, verification_result, verifier_info)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const dbResult = await db.query(query, [
      sealId,
      transcriptId,
      verificationCode,
      result,
      verifierInfo
    ]);

    return dbResult.rows[0];
  }

  /**
   * Get seal usage statistics
   */
  async getUsageStats(sealId) {
    const query = `
      SELECT 
        COUNT(*) as total_uses,
        COUNT(DISTINCT transcript_id) as unique_transcripts,
        MAX(used_at) as last_used
      FROM seal_usage
      WHERE seal_id = $1
    `;

    const result = await db.query(query, [sealId]);
    return result.rows[0];
  }

  /**
   * Generate unique verification code
   */
  generateVerificationCode() {
    return crypto.randomBytes(VERIFICATION_CODE_LENGTH / 2).toString('hex').toUpperCase();
  }

  /**
   * Get seals by type
   */
  async getByType(sealType) {
    const query = `
      SELECT id, name, description, image_path, seal_type, metadata
      FROM official_seals
      WHERE seal_type = $1 AND is_active = true
      AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, [sealType]);
    return result.rows;
  }
}

module.exports = new SealModel();
