const { createCanvas } = require('canvas');
const crypto = require('crypto');

/**
 * Seal Generator Utility
 * Generates official seals programmatically for transcripts
 */
class SealGenerator {
  constructor() {
    this.defaultConfig = {
      width: 300,
      height: 300,
      backgroundColor: '#FFFFFF',
      borderColor: '#003366',
      textColor: '#003366',
      fontFamily: 'Arial',
      fontSize: 24,
      borderWidth: 10
    };
  }

  /**
   * Generate a circular official seal
   * @param {Object} options - Seal configuration options
   * @returns {Object} - { imageBuffer, imageData }
   */
  generateSeal(options = {}) {
    const config = { ...this.defaultConfig, ...options };
    const {
      width,
      height,
      backgroundColor,
      borderColor,
      textColor,
      fontFamily,
      fontSize,
      borderWidth,
      institutionName,
      subtitle,
      year
    } = config;

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - borderWidth;

    // Draw outer circle border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw inner circle
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, 0, 2 * Math.PI);
    ctx.stroke();

    // Add institution name (curved text at top)
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (institutionName) {
      this.drawCurvedText(ctx, institutionName.toUpperCase(), centerX, centerY - 60, radius - 40, true);
    }

    // Add seal type/subtitle at bottom
    if (subtitle) {
      ctx.font = `${fontSize - 6}px ${fontFamily}`;
      this.drawCurvedText(ctx, subtitle.toUpperCase(), centerX, centerY + 60, radius - 40, false);
    }

    // Add center emblem/star
    this.drawStar(ctx, centerX, centerY, 30, 5, borderColor);

    // Add year if provided
    if (year) {
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize - 4}px ${fontFamily}`;
      ctx.fillText(year, centerX, centerY + 30);
    }

    // Add "OFFICIAL SEAL" text
    ctx.font = `${fontSize - 8}px ${fontFamily}`;
    ctx.fillText('OFFICIAL SEAL', centerX, centerY + 90);

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');

    return {
      buffer,
      base64,
      dataUrl: `data:image/png;base64,${base64}`,
      width,
      height,
      format: 'png'
    };
  }

  /**
   * Draw curved text along an arc
   */
  drawCurvedText(ctx, text, x, y, radius, top = true) {
    const angleStep = 0.2;
    const totalAngle = (text.length - 1) * angleStep;
    const startAngle = -totalAngle / 2 - Math.PI / 2;

    ctx.save();
    ctx.translate(x, y);

    for (let i = 0; i < text.length; i++) {
      const angle = startAngle + i * angleStep;
      ctx.save();
      ctx.rotate(angle);
      
      if (top) {
        ctx.translate(0, -radius);
      } else {
        ctx.translate(0, radius);
        ctx.rotate(Math.PI);
      }
      
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw a star in the center of the seal
   */
  drawStar(ctx, x, y, radius, points, color) {
    const outerRadius = radius;
    const innerRadius = radius / 2;

    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
    ctx.fill();
  }

  /**
   * Generate institutional seal
   */
  generateInstitutionalSeal(institutionName, year) {
    return this.generateSeal({
      institutionName,
      year: year || new Date().getFullYear().toString(),
      subtitle: 'EXCELLENCE IN EDUCATION',
      sealType: 'institutional',
      borderColor: '#003366',
      textColor: '#003366'
    });
  }

  /**
   * Generate departmental seal
   */
  generateDepartmentalSeal(departmentName, institutionName) {
    return this.generateSeal({
      institutionName: institutionName || 'UNIVERSITY',
      subtitle: departmentName,
      sealType: 'departmental',
      borderColor: '#006633',
      textColor: '#006633',
      fontSize: 20
    });
  }

  /**
   * Generate registrar seal
   */
  generateRegistrarSeal(institutionName) {
    return this.generateSeal({
      institutionName: institutionName || 'REGISTRAR OFFICE',
      subtitle: 'OFFICIAL RECORDS',
      year: new Date().getFullYear().toString(),
      sealType: 'registrar',
      borderColor: '#660033',
      textColor: '#660033'
    });
  }

  /**
   * Generate accreditation seal
   */
  generateAccreditationSeal(accreditingBody, year) {
    return this.generateSeal({
      institutionName: accreditingBody || 'ACCREDITED',
      subtitle: 'QUALITY ASSURED',
      year: year || new Date().getFullYear().toString(),
      sealType: 'accreditation',
      borderColor: '#663300',
      textColor: '#663300'
    });
  }

  /**
   * Generate a unique filename for the seal
   */
  generateFilename(prefix = 'seal') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${random}.png`;
  }
}

module.exports = SealGenerator;
