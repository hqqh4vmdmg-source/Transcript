const db = require('../config/database');

/**
 * Design Theme Model
 * Handles theme management, color palettes, and design versioning
 */
class DesignThemeModel {
  /**
   * Get all themes (presets + user custom)
   */
  static async getAllThemes(userId = null, includePublic = true) {
    let query = 'SELECT * FROM design_themes WHERE is_active = true';
    const params = [];
    
    if (includePublic && userId) {
      query += ' AND (is_public = true OR user_id = $1)';
      params.push(userId);
    } else if (!includePublic && userId) {
      query += ' AND user_id = $1';
      params.push(userId);
    } else if (includePublic) {
      query += ' AND is_public = true';
    }
    
    query += ' ORDER BY category, name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get theme by ID
   */
  static async getThemeById(id) {
    const query = 'SELECT * FROM design_themes WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get preset themes
   */
  static async getPresetThemes() {
    const query = `
      SELECT * FROM design_themes 
      WHERE category = 'preset' AND is_active = true 
      ORDER BY name
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Create custom theme
   */
  static async createTheme(themeData) {
    const {
      name,
      description,
      user_id,
      theme_config,
      is_public = false,
      preview_image,
      thumbnail
    } = themeData;

    const query = `
      INSERT INTO design_themes (
        name, category, description, user_id, theme_config,
        is_public, preview_image, thumbnail
      ) VALUES ($1, 'custom', $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      name,
      description,
      user_id,
      JSON.stringify(theme_config),
      is_public,
      preview_image,
      thumbnail
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Update theme
   */
  static async updateTheme(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key === 'theme_config') {
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
      UPDATE design_themes 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete theme
   */
  static async deleteTheme(id, userId) {
    const query = `
      DELETE FROM design_themes 
      WHERE id = $1 AND user_id = $2 AND category != 'preset'
      RETURNING id
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  /**
   * Increment theme usage count
   */
  static async incrementUsage(id) {
    const query = `
      UPDATE design_themes 
      SET usage_count = usage_count + 1 
      WHERE id = $1
      RETURNING usage_count
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Save design version
   */
  static async saveVersion(versionData) {
    const {
      design_id,
      design_type,
      version_number,
      design_data,
      changes_description,
      created_by
    } = versionData;

    const query = `
      INSERT INTO design_versions (
        design_id, design_type, version_number,
        design_data, changes_description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      design_id,
      design_type,
      version_number,
      JSON.stringify(design_data),
      changes_description,
      created_by
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get design versions
   */
  static async getVersions(designId, designType) {
    const query = `
      SELECT * FROM design_versions 
      WHERE design_id = $1 AND design_type = $2 
      ORDER BY version_number DESC
    `;
    const result = await db.query(query, [designId, designType]);
    return result.rows;
  }

  /**
   * Get latest version number
   */
  static async getLatestVersionNumber(designId, designType) {
    const query = `
      SELECT MAX(version_number) as latest 
      FROM design_versions 
      WHERE design_id = $1 AND design_type = $2
    `;
    const result = await db.query(query, [designId, designType]);
    return result.rows[0]?.latest || 0;
  }

  /**
   * Create color palette
   */
  static async createColorPalette(paletteData) {
    const {
      name,
      user_id,
      colors,
      palette_type,
      source,
      wcag_aa_compliant,
      wcag_aaa_compliant,
      contrast_ratios
    } = paletteData;

    const query = `
      INSERT INTO color_palettes (
        name, user_id, colors, palette_type, source,
        wcag_aa_compliant, wcag_aaa_compliant, contrast_ratios
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      name,
      user_id,
      JSON.stringify(colors),
      palette_type,
      source,
      wcag_aa_compliant,
      wcag_aaa_compliant,
      JSON.stringify(contrast_ratios)
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get color palettes
   */
  static async getColorPalettes(userId) {
    const query = `
      SELECT * FROM color_palettes 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Save brand guidelines
   */
  static async saveBrandGuidelines(guidelinesData) {
    const {
      user_id,
      organization_name,
      logo_url,
      style_guide_url,
      primary_colors,
      secondary_colors,
      accent_colors,
      approved_fonts,
      font_sizes,
      logo_usage_rules,
      design_rules
    } = guidelinesData;

    const query = `
      INSERT INTO brand_guidelines (
        user_id, organization_name, logo_url, style_guide_url,
        primary_colors, secondary_colors, accent_colors,
        approved_fonts, font_sizes, logo_usage_rules, design_rules
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      user_id,
      organization_name,
      logo_url,
      style_guide_url,
      JSON.stringify(primary_colors),
      JSON.stringify(secondary_colors),
      JSON.stringify(accent_colors),
      JSON.stringify(approved_fonts),
      JSON.stringify(font_sizes),
      JSON.stringify(logo_usage_rules),
      JSON.stringify(design_rules)
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get brand guidelines
   */
  static async getBrandGuidelines(userId) {
    const query = `
      SELECT * FROM brand_guidelines 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Save accessibility audit
   */
  static async saveAccessibilityAudit(auditData) {
    const {
      design_id,
      design_type,
      user_id,
      wcag_level,
      overall_score,
      color_contrast,
      text_size,
      alt_text,
      keyboard_navigation,
      issues,
      passed_checks,
      failed_checks
    } = auditData;

    const query = `
      INSERT INTO accessibility_audits (
        design_id, design_type, user_id, wcag_level, overall_score,
        color_contrast, text_size, alt_text, keyboard_navigation,
        issues, passed_checks, failed_checks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      design_id,
      design_type,
      user_id,
      wcag_level,
      overall_score,
      JSON.stringify(color_contrast),
      JSON.stringify(text_size),
      JSON.stringify(alt_text),
      JSON.stringify(keyboard_navigation),
      JSON.stringify(issues),
      passed_checks,
      failed_checks
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get accessibility audits
   */
  static async getAccessibilityAudits(designId, designType) {
    const query = `
      SELECT * FROM accessibility_audits 
      WHERE design_id = $1 AND design_type = $2 
      ORDER BY audited_at DESC
    `;
    const result = await db.query(query, [designId, designType]);
    return result.rows;
  }

  /**
   * Save print specifications
   */
  static async savePrintSpec(specData) {
    const {
      design_id,
      design_type,
      paper_size,
      paper_weight,
      paper_finish,
      color_mode,
      resolution,
      bleed_size,
      cmyk_colors,
      rgb_colors,
      pantone_colors,
      spec_file_url
    } = specData;

    const query = `
      INSERT INTO print_specifications (
        design_id, design_type, paper_size, paper_weight, paper_finish,
        color_mode, resolution, bleed_size,
        cmyk_colors, rgb_colors, pantone_colors, spec_file_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      design_id,
      design_type,
      paper_size,
      paper_weight,
      paper_finish,
      color_mode,
      resolution,
      bleed_size,
      JSON.stringify(cmyk_colors),
      JSON.stringify(rgb_colors),
      JSON.stringify(pantone_colors),
      spec_file_url
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get print specifications
   */
  static async getPrintSpec(designId, designType) {
    const query = `
      SELECT * FROM print_specifications 
      WHERE design_id = $1 AND design_type = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await db.query(query, [designId, designType]);
    return result.rows[0];
  }
}

module.exports = DesignThemeModel;
