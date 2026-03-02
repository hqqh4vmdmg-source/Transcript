const db = require('../config/database');
const logoGenerator = require('../utils/logoGenerator');
const fs = require('fs').promises;
const path = require('path');

/**
 * Certificate Enhancements Service
 * Implements all 10 Category 2 features
 */
class CertificateEnhancementsService {
  
  /**
   * Feature 2.1: Advanced Logo Customizer (8 styles total)
   * Extends existing 4 styles (Shield, Circle, Square, Crest) with 4 more
   */
  async generateAdvancedLogo(options) {
    const { style, schoolName, initials, foundedYear, colors } = options;
    
    // Original 4 styles from logoGenerator
    const originalStyles = ['shield', 'circle', 'square', 'crest'];
    
    // New 4 advanced styles
    const advancedStyles = {
      'diamond': this.generateDiamondLogo,
      'hexagon': this.generateHexagonLogo,
      'banner': this.generateBannerLogo,
      'emblem': this.generateEmblemLogo
    };

    if (originalStyles.includes(style)) {
      // Use existing logo generator
      return logoGenerator.generateLogo(style, { schoolName, initials, foundedYear, colors });
    } else if (advancedStyles[style]) {
      // Use new advanced styles
      return advancedStyles[style].call(this, { schoolName, initials, foundedYear, colors });
    } else {
      throw new Error(`Unknown logo style: ${style}`);
    }
  }

  generateDiamondLogo(options) {
    const { initials, schoolName, colors } = options;
    const primary = colors?.primary || '#003366';
    
    return `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000;stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <path d="M150 20 L270 150 L150 280 L30 150 Z" 
              fill="url(#diamondGrad)" stroke="${primary}" stroke-width="4"/>
        <text x="150" y="160" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="#FFF">${initials}</text>
        <text x="150" y="240" font-size="12" text-anchor="middle" fill="#FFF">${schoolName}</text>
      </svg>
    `;
  }

  generateHexagonLogo(options) {
    const { initials, schoolName, colors } = options;
    const primary = colors?.primary || '#2C5F2D';
    
    return `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <polygon points="150,30 250,90 250,210 150,270 50,210 50,90" 
                 fill="${primary}" stroke="#FFD700" stroke-width="5"/>
        <text x="150" y="160" font-size="52" font-weight="bold" 
              text-anchor="middle" fill="#FFD700">${initials}</text>
        <text x="150" y="235" font-size="11" text-anchor="middle" fill="#FFF">${schoolName}</text>
      </svg>
    `;
  }

  generateBannerLogo(options) {
    const { initials, schoolName, foundedYear, colors } = options;
    const primary = colors?.primary || '#8B0000';
    
    return `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="360" height="120" rx="10" 
              fill="${primary}" stroke="#FFD700" stroke-width="3"/>
        <path d="M 200 160 L 180 190 L 220 190 Z" fill="${primary}"/>
        <text x="200" y="95" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="#FFD700">${initials}</text>
        <text x="200" y="140" font-size="14" text-anchor="middle" fill="#FFF">${schoolName} • Est. ${foundedYear}</text>
      </svg>
    `;
  }

  generateEmblemLogo(options) {
    const { initials, schoolName, colors } = options;
    const primary = colors?.primary || '#1F4788';
    
    return `
      <svg width="300" height="350" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="175" rx="120" ry="150" 
                 fill="${primary}" stroke="#FFD700" stroke-width="4"/>
        <rect x="100" y="40" width="100" height="100" 
              fill="#FFD700" stroke="${primary}" stroke-width="2"/>
        <text x="150" y="100" font-size="42" font-weight="bold" 
              text-anchor="middle" fill="${primary}">${initials}</text>
        <text x="150" y="250" font-size="13" text-anchor="middle" fill="#FFD700">${schoolName}</text>
      </svg>
    `;
  }

  /**
   * Feature 2.2: Multiple Logo Support
   * Support school + department logos
   */
  async createLogoVariant(logoData) {
    const { parent_logo_id, variant_type, name, logo_data, default_position } = logoData;

    const result = await db.query(
      `INSERT INTO logo_variants (parent_logo_id, variant_type, name, logo_data, default_position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [parent_logo_id, variant_type, name, logo_data, JSON.stringify(default_position)]
    );

    return result.rows[0];
  }

  async getLogoVariants(parentLogoId) {
    const result = await db.query(
      'SELECT * FROM logo_variants WHERE parent_logo_id = $1 AND is_active = true',
      [parentLogoId]
    );
    return result.rows;
  }

  async arrangeMultipleLogos(logoIds, layout = 'horizontal') {
    const logos = await db.query(
      'SELECT * FROM logo_variants WHERE id = ANY($1)',
      [logoIds]
    );

    const arrangements = {
      'horizontal': logos.rows.map((logo, i) => ({
        ...logo,
        position: { x: (i * 200) + 50, y: 50, width: 150, height: 150 }
      })),
      'vertical': logos.rows.map((logo, i) => ({
        ...logo,
        position: { x: 50, y: (i * 200) + 50, width: 150, height: 150 }
      })),
      'corners': logos.rows.map((logo, i) => {
        const positions = [
          { x: 50, y: 50 },        // top-left
          { x: 650, y: 50 },       // top-right
          { x: 50, y: 750 },       // bottom-left
          { x: 650, y: 750 }       // bottom-right
        ];
        return { ...logo, position: { ...positions[i], width: 100, height: 100 } };
      })
    };

    return arrangements[layout] || arrangements.horizontal;
  }

  /**
   * Feature 2.3: Custom Font Upload System
   */
  async uploadCustomFont(userId, fontData, fileBuffer) {
    const { font_name, font_family, font_format, font_style, font_weight } = fontData;
    
    // Save font file
    const fontDir = path.join(__dirname, '../../public/fonts/custom');
    await fs.mkdir(fontDir, { recursive: true });
    
    const fileName = `${font_family.replace(/\s+/g, '_')}_${Date.now()}.${font_format}`;
    const filePath = path.join(fontDir, fileName);
    
    await fs.writeFile(filePath, fileBuffer);
    const fileSize = fileBuffer.length;

    const result = await db.query(
      `INSERT INTO custom_fonts (user_id, font_name, font_family, font_file_path, font_format, file_size, font_style, font_weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, font_name, font_family, filePath, font_format, fileSize, font_style, font_weight]
    );

    return result.rows[0];
  }

  async getUserFonts(userId, includePublic = true) {
    let query = 'SELECT * FROM custom_fonts WHERE is_active = true AND (user_id = $1';
    if (includePublic) {
      query += ' OR is_public = true';
    }
    query += ') ORDER BY created_at DESC';

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Feature 2.4: Advanced Border Library (20+ styles)
   */
  async getAllBorders(category = null) {
    let query = 'SELECT * FROM border_library WHERE 1=1';
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    query += ' ORDER BY popularity DESC, name ASC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async getBorderById(borderId) {
    const result = await db.query('SELECT * FROM border_library WHERE id = $1', [borderId]);
    return result.rows[0];
  }

  async applyBorderToDocument(documentData, borderId) {
    const border = await this.getBorderById(borderId);
    if (!border) throw new Error('Border not found');

    return {
      ...documentData,
      border: border.border_config,
      borderName: border.name,
      borderPreview: border.preview_svg
    };
  }

  /**
   * Feature 2.5: Background Patterns and Textures (15 options)
   */
  async getAllPatterns(patternType = null) {
    let query = 'SELECT * FROM background_patterns WHERE 1=1';
    const params = [];
    
    if (patternType) {
      params.push(patternType);
      query += ` AND pattern_type = $${params.length}`;
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async applyPattern(documentData, patternId) {
    const pattern = await db.query('SELECT * FROM background_patterns WHERE id = $1', [patternId]);
    if (pattern.rows.length === 0) throw new Error('Pattern not found');

    return {
      ...documentData,
      backgroundPattern: pattern.rows[0].pattern_config,
      patternName: pattern.rows[0].name
    };
  }

  /**
   * Feature 2.6: Ribbon/Banner Decorative Elements
   */
  async getDecorativeElements(elementType = null) {
    let query = 'SELECT * FROM decorative_elements WHERE 1=1';
    const params = [];
    
    if (elementType) {
      params.push(elementType);
      query += ` AND element_type = $${params.length}`;
    }
    
    query += ' ORDER BY element_type, name';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async addDecorativeElement(documentData, elementId, position = null) {
    const element = await db.query('SELECT * FROM decorative_elements WHERE id = $1', [elementId]);
    if (element.rows.length === 0) throw new Error('Decorative element not found');

    const elementData = element.rows[0];
    const finalPosition = position || elementData.default_position;

    return {
      ...documentData,
      decorativeElements: [
        ...(documentData.decorativeElements || []),
        {
          id: elementData.id,
          type: elementData.element_type,
          data: elementData.element_data,
          position: finalPosition
        }
      ]
    };
  }

  /**
   * Feature 2.7: Multi-Language Support (5 languages)
   */
  async getTranslation(languageCode) {
    const result = await db.query(
      'SELECT * FROM certificate_translations WHERE language_code = $1 AND is_active = true',
      [languageCode]
    );
    
    if (result.rows.length === 0) {
      // Default to English
      const english = await db.query(
        'SELECT * FROM certificate_translations WHERE language_code = $1',
        ['en']
      );
      return english.rows[0];
    }
    
    return result.rows[0];
  }

  async getAllLanguages() {
    const result = await db.query(
      'SELECT language_code, language_name, is_rtl FROM certificate_translations WHERE is_active = true ORDER BY language_name'
    );
    return result.rows;
  }

  async translateCertificate(certificateData, languageCode) {
    const translation = await this.getTranslation(languageCode);
    
    return {
      ...certificateData,
      language: languageCode,
      isRTL: translation.is_rtl,
      translations: translation.translations,
      recommendedFonts: translation.recommended_fonts
    };
  }

  /**
   * Feature 2.8: Digital Signature Integration
   */
  async createDigitalSignature(userId, signatureData) {
    const { signature_name, signature_type, signature_data, signature_format, default_title, default_name } = signatureData;

    const result = await db.query(
      `INSERT INTO digital_signatures (user_id, signature_name, signature_type, signature_data, signature_format, default_title, default_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, signature_name, signature_type, signature_data, signature_format, default_title, default_name]
    );

    return result.rows[0];
  }

  async getUserSignatures(userId) {
    const result = await db.query(
      'SELECT * FROM digital_signatures WHERE user_id = $1 AND is_active = true ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async applySignatures(certificateData, signatureIds) {
    const signatures = await db.query(
      'SELECT * FROM digital_signatures WHERE id = ANY($1)',
      [signatureIds]
    );

    return {
      ...certificateData,
      signatures: signatures.rows.map((sig, index) => ({
        id: sig.id,
        name: sig.default_name,
        title: sig.default_title,
        type: sig.signature_type,
        data: sig.signature_data,
        position: index * 200 + 100 // Spread signatures across bottom
      }))
    };
  }

  /**
   * Feature 2.9: Watermark Customization
   */
  async createWatermark(userId, watermarkData) {
    const { name, watermark_type, content, position, rotation, opacity, color } = watermarkData;

    const result = await db.query(
      `INSERT INTO watermark_configs (user_id, name, watermark_type, content, position, rotation, opacity, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, watermark_type, content, position, rotation || 0, opacity || 0.1, color]
    );

    return result.rows[0];
  }

  async applyWatermark(documentData, watermarkId) {
    const watermark = await db.query(
      'SELECT * FROM watermark_configs WHERE id = $1 AND is_active = true',
      [watermarkId]
    );
    
    if (watermark.rows.length === 0) throw new Error('Watermark not found');

    return {
      ...documentData,
      watermark: {
        type: watermark.rows[0].watermark_type,
        content: watermark.rows[0].content,
        position: watermark.rows[0].position,
        rotation: watermark.rows[0].rotation,
        opacity: watermark.rows[0].opacity,
        color: watermark.rows[0].color
      }
    };
  }

  /**
   * Feature 2.10: Certificate Versioning System
   * (Uses existing design_versions table)
   */
  async saveCertificateVersion(certificateId, versionData, userId) {
    // Get current max version
    const maxVersion = await db.query(
      'SELECT COALESCE(MAX(version_number), 0) as max_version FROM design_versions WHERE design_id = $1 AND design_type = $2',
      [certificateId, 'certificate']
    );

    const newVersionNumber = maxVersion.rows[0].max_version + 1;

    const result = await db.query(
      `INSERT INTO design_versions (design_id, design_type, version_number, design_data, changes_description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [certificateId, 'certificate', newVersionNumber, JSON.stringify(versionData), versionData.changes_description || 'Version update', userId]
    );

    return result.rows[0];
  }

  async getCertificateVersions(certificateId) {
    const result = await db.query(
      `SELECT * FROM design_versions 
       WHERE design_id = $1 AND design_type = $2 
       ORDER BY version_number DESC`,
      [certificateId, 'certificate']
    );
    return result.rows;
  }

  async restoreCertificateVersion(certificateId, versionNumber) {
    const version = await db.query(
      'SELECT * FROM design_versions WHERE design_id = $1 AND design_type = $2 AND version_number = $3',
      [certificateId, 'certificate', versionNumber]
    );

    if (version.rows.length === 0) throw new Error('Version not found');

    return version.rows[0].design_data;
  }

  async compareVersions(certificateId, version1, version2) {
    const versions = await db.query(
      `SELECT * FROM design_versions 
       WHERE design_id = $1 AND design_type = $2 
       AND version_number IN ($3, $4)
       ORDER BY version_number`,
      [certificateId, 'certificate', version1, version2]
    );

    if (versions.rows.length !== 2) throw new Error('One or both versions not found');

    return {
      version1: versions.rows[0],
      version2: versions.rows[1],
      differences: this.calculateDifferences(versions.rows[0].design_data, versions.rows[1].design_data)
    };
  }

  calculateDifferences(data1, data2) {
    // Simple difference calculation
    const differences = [];
    const keys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
    
    keys.forEach(key => {
      if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) {
        differences.push({
          field: key,
          oldValue: data1[key],
          newValue: data2[key]
        });
      }
    });

    return differences;
  }
}

module.exports = new CertificateEnhancementsService();
