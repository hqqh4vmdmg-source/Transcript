const db = require('../config/database');

class CertificateModel {
  /**
   * Create a new certificate
   */
  static async create(certificateData) {
    const {
      user_id,
      template_id,
      certificate_type,
      title,
      school_name,
      school_location,
      school_logo_url,
      recipient_name,
      student_id,
      program_name,
      degree_type,
      honors,
      graduation_date,
      completion_date,
      custom_text,
      custom_fields,
      design_overrides
    } = certificateData;

    const query = `
      INSERT INTO certificates (
        user_id, template_id, certificate_type, title,
        school_name, school_location, school_logo_url,
        recipient_name, student_id,
        program_name, degree_type, honors,
        graduation_date, completion_date,
        custom_text, custom_fields, design_overrides
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      user_id, template_id, certificate_type, title,
      school_name, school_location, school_logo_url,
      recipient_name, student_id,
      program_name, degree_type, honors,
      graduation_date, completion_date,
      custom_text, 
      custom_fields ? JSON.stringify(custom_fields) : null,
      design_overrides ? JSON.stringify(design_overrides) : null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get certificate by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM certificates WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get certificate by ID and user ID
   */
  static async findByIdAndUserId(id, user_id) {
    const query = 'SELECT * FROM certificates WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  }

  /**
   * Get all certificates for a user
   */
  static async findByUserId(user_id) {
    const query = `
      SELECT c.*, t.name as template_name, t.style as template_style
      FROM certificates c
      LEFT JOIN certificate_templates t ON c.template_id = t.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    return result.rows;
  }

  /**
   * Update certificate
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (['custom_fields', 'design_overrides'].includes(key)) {
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
      UPDATE certificates 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete certificate
   */
  static async delete(id, user_id) {
    const query = 'DELETE FROM certificates WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  }

  /**
   * Get certificate with signatures
   */
  static async getCertificateWithSignatures(id) {
    const certQuery = 'SELECT * FROM certificates WHERE id = $1';
    const certResult = await db.query(certQuery, [id]);
    
    if (certResult.rows.length === 0) {
      return null;
    }

    const certificate = certResult.rows[0];

    // Get signatures
    const sigQuery = `
      SELECT s.*, cs.position, cs.alignment
      FROM signatures s
      JOIN certificate_signatures cs ON s.id = cs.signature_id
      WHERE cs.certificate_id = $1
      ORDER BY cs.position
    `;
    const sigResult = await db.query(sigQuery, [id]);
    certificate.signatures = sigResult.rows;

    return certificate;
  }

  /**
   * Add signature to certificate
   */
  static async addSignature(certificate_id, signature_id, position = 1, alignment = 'left') {
    const query = `
      INSERT INTO certificate_signatures (certificate_id, signature_id, position, alignment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [certificate_id, signature_id, position, alignment]);
    return result.rows[0];
  }

  /**
   * Remove signature from certificate
   */
  static async removeSignature(certificate_id, signature_id) {
    const query = 'DELETE FROM certificate_signatures WHERE certificate_id = $1 AND signature_id = $2';
    await db.query(query, [certificate_id, signature_id]);
  }

  /**
   * Get all templates
   */
  static async getTemplates(type = null) {
    let query = 'SELECT * FROM certificate_templates WHERE is_active = true';
    const values = [];
    
    if (type) {
      query += ' AND type = $1';
      values.push(type);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(id) {
    const query = 'SELECT * FROM certificate_templates WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get design elements
   */
  static async getDesignElements(type = null) {
    let query = 'SELECT * FROM design_elements WHERE is_active = true';
    const values = [];
    
    if (type) {
      query += ' AND element_type = $1';
      values.push(type);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, values);
    return result.rows;
  }
}

class SignatureModel {
  /**
   * Create a signature
   */
  static async create(signatureData) {
    const {
      user_id,
      name,
      title,
      organization,
      signature_type,
      signature_data,
      signature_style,
      is_default
    } = signatureData;

    const query = `
      INSERT INTO signatures (
        user_id, name, title, organization,
        signature_type, signature_data, signature_style, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user_id, name, title, organization,
      signature_type, signature_data, signature_style, is_default
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get signature by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM signatures WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get signatures by user ID
   */
  static async findByUserId(user_id) {
    const query = 'SELECT * FROM signatures WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [user_id]);
    return result.rows;
  }

  /**
   * Update signature
   */
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    values.push(id);
    const query = `
      UPDATE signatures 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete signature
   */
  static async delete(id, user_id) {
    const query = 'DELETE FROM signatures WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await db.query(query, [id, user_id]);
    return result.rows[0];
  }
}

module.exports = { CertificateModel, SignatureModel };
