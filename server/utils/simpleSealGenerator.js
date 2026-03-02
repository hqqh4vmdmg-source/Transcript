const crypto = require('crypto');

/**
 * Simple Seal Generator Utility (SVG-based, no canvas required)
 * Generates official seals programmatically for transcripts using SVG
 */
class SimpleSealGenerator {
  constructor() {
    this.defaultConfig = {
      width: 300,
      height: 300,
      backgroundColor: '#FFFFFF',
      borderColor: '#003366',
      textColor: '#003366',
      borderWidth: 10
    };
  }

  /**
   * Generate a circular official seal as SVG
   * @param {Object} options - Seal configuration options
   * @returns {Object} - { svg, base64, dataUrl }
   */
  generateSeal(options = {}) {
    const config = { ...this.defaultConfig, ...options };
    const {
      width,
      height,
      backgroundColor,
      borderColor,
      textColor,
      borderWidth,
      institutionName = 'INSTITUTION',
      subtitle = 'OFFICIAL SEAL',
      year = new Date().getFullYear().toString(),
      sealType = 'institutional'
    } = config;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - borderWidth;

    // Generate SVG
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
  
  <!-- Outer circle border -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
          fill="none" stroke="${borderColor}" stroke-width="${borderWidth}"/>
  
  <!-- Inner circle -->
  <circle cx="${centerX}" cy="${centerY}" r="${radius - 20}" 
          fill="none" stroke="${borderColor}" stroke-width="3"/>
  
  <!-- Institution name (top arc) -->
  <path id="topArc" d="M ${centerX - radius + 40},${centerY} 
                         A ${radius - 40},${radius - 40} 0 0,1 ${centerX + radius - 40},${centerY}" 
        fill="none"/>
  <text font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        fill="${textColor}" text-anchor="middle">
    <textPath href="#topArc" startOffset="50%">
      ${institutionName.toUpperCase()}
    </textPath>
  </text>
  
  <!-- Center star -->
  ${this.generateStarSVG(centerX, centerY, 30, 5, borderColor)}
  
  <!-- Year -->
  <text x="${centerX}" y="${centerY + 35}" 
        font-family="Arial, sans-serif" font-size="20" font-weight="bold"
        fill="${textColor}" text-anchor="middle">
    ${year}
  </text>
  
  <!-- Bottom text -->
  <text x="${centerX}" y="${centerY + 90}" 
        font-family="Arial, sans-serif" font-size="16"
        fill="${textColor}" text-anchor="middle">
    ${subtitle.toUpperCase()}
  </text>
  
  <!-- Subtitle arc (bottom) -->
  ${subtitle !== 'OFFICIAL SEAL' ? `
  <path id="bottomArc" d="M ${centerX - radius + 40},${centerY} 
                           A ${radius - 40},${radius - 40} 0 0,0 ${centerX + radius - 40},${centerY}" 
        fill="none"/>
  <text font-family="Arial, sans-serif" font-size="18" 
        fill="${textColor}" text-anchor="middle">
    <textPath href="#bottomArc" startOffset="50%">
      OFFICIAL SEAL
    </textPath>
  </text>
  ` : ''}
</svg>`;

    // Convert to base64
    const base64 = Buffer.from(svg).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;

    return {
      svg,
      base64,
      dataUrl,
      width,
      height,
      format: 'svg',
      sealType
    };
  }

  /**
   * Generate a star shape in SVG
   */
  generateStarSVG(cx, cy, radius, points, color) {
    const outerRadius = radius;
    const innerRadius = radius / 2;
    let pathData = '';

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      if (i === 0) {
        pathData += `M ${x},${y}`;
      } else {
        pathData += ` L ${x},${y}`;
      }
    }
    pathData += ' Z';

    return `<path d="${pathData}" fill="${color}"/>`;
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
      subtitle: departmentName || 'DEPARTMENT',
      sealType: 'departmental',
      borderColor: '#006633',
      textColor: '#006633'
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
    return `${prefix}_${timestamp}_${random}.svg`;
  }

  /**
   * Convert SVG to buffer for storage
   */
  svgToBuffer(svg) {
    return Buffer.from(svg, 'utf-8');
  }
}

module.exports = SimpleSealGenerator;
