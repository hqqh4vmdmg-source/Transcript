const crypto = require('crypto');

/**
 * School Logo Generator
 * Generates professional school logos and emblems for diplomas
 */
class LogoGenerator {
  constructor() {
    this.defaultConfig = {
      width: 400,
      height: 400,
      format: 'svg',
      style: 'shield' // 'shield', 'circle', 'square', 'crest'
    };
  }

  /**
   * Generate school logo/emblem
   */
  generateLogo(options = {}) {
    const config = { ...this.defaultConfig, ...options };
    const {
      schoolName,
      schoolInitials,
      foundedYear,
      motto,
      style,
      primaryColor = '#003366',
      secondaryColor = '#FFD700',
      tertiaryColor = '#FFFFFF'
    } = config;

    const initials = schoolInitials || this.extractInitials(schoolName);

    switch (style) {
      case 'shield':
        return this.generateShieldLogo(initials, foundedYear, primaryColor, secondaryColor, tertiaryColor);
      case 'circle':
        return this.generateCircleLogo(schoolName, foundedYear, motto, primaryColor, secondaryColor);
      case 'square':
        return this.generateSquareLogo(initials, schoolName, primaryColor, secondaryColor);
      case 'crest':
        return this.generateCrestLogo(schoolName, initials, foundedYear, motto, primaryColor, secondaryColor, tertiaryColor);
      default:
        return this.generateShieldLogo(initials, foundedYear, primaryColor, secondaryColor, tertiaryColor);
    }
  }

  /**
   * Generate shield-style logo (classic university style)
   */
  generateShieldLogo(initials, year, primary, secondary, tertiary) {
    const svg = `
<svg width="400" height="480" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(primary, 30)};stop-opacity:1" />
    </linearGradient>
    <filter id="emboss">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
      <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" 
                          specularExponent="20" lighting-color="#white" result="specOut">
        <fePointLight x="-5000" y="-10000" z="20000"/>
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" 
                   k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  </defs>
  
  <!-- Shield outline -->
  <path d="M 200 20 L 360 80 L 360 280 Q 360 380, 200 460 Q 40 380, 40 280 L 40 80 Z" 
        fill="url(#shieldGrad)" stroke="${secondary}" stroke-width="8" filter="url(#emboss)"/>
  
  <!-- Inner shield border -->
  <path d="M 200 40 L 340 90 L 340 280 Q 340 360, 200 430 Q 60 360, 60 280 L 60 90 Z" 
        fill="none" stroke="${secondary}" stroke-width="4" opacity="0.6"/>
  
  <!-- Divider lines (quarters) -->
  <line x1="200" y1="80" x2="200" y2="280" stroke="${secondary}" stroke-width="3" opacity="0.4"/>
  <path d="M 60 180 Q 200 180, 340 180" stroke="${secondary}" stroke-width="3" opacity="0.4"/>
  
  <!-- School initials -->
  <text x="200" y="200" font-family="Garamond, serif" font-size="120" font-weight="bold" 
        fill="${tertiary}" text-anchor="middle" dominant-baseline="middle" 
        style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">
    ${initials}
  </text>
  
  <!-- Founded year banner -->
  ${year ? `
  <rect x="80" y="320" width="240" height="50" fill="${secondary}" stroke="${primary}" stroke-width="2"/>
  <text x="200" y="350" font-family="Georgia, serif" font-size="28" font-weight="bold" 
        fill="${primary}" text-anchor="middle" dominant-baseline="middle">
    EST. ${year}
  </text>
  ` : ''}
  
  <!-- Decorative elements -->
  <circle cx="100" cy="120" r="15" fill="${secondary}" opacity="0.6"/>
  <circle cx="300" cy="120" r="15" fill="${secondary}" opacity="0.6"/>
  
  <!-- Stars -->
  <path d="M 200,60 L 205,75 L 220,75 L 208,84 L 213,99 L 200,90 L 187,99 L 192,84 L 180,75 L 195,75 Z" 
        fill="${secondary}" opacity="0.8"/>
</svg>`;

    return {
      svg,
      base64: Buffer.from(svg).toString('base64'),
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      format: 'svg'
    };
  }

  /**
   * Generate circular logo (seal style)
   */
  generateCircleLogo(schoolName, year, motto, primary, secondary) {
    const svg = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="circleGrad">
      <stop offset="0%" style="stop-color:${secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(secondary, 20)};stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Outer circle -->
  <circle cx="200" cy="200" r="180" fill="url(#circleGrad)" stroke="${primary}" stroke-width="12"/>
  
  <!-- Inner circle -->
  <circle cx="200" cy="200" r="150" fill="none" stroke="${primary}" stroke-width="4"/>
  
  <!-- School name arc (top) -->
  <path id="topArc" d="M 60,200 A 140,140 0 0,1 340,200" fill="none"/>
  <text font-family="Georgia, serif" font-size="24" font-weight="bold" fill="${primary}">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">
      ${schoolName.toUpperCase()}
    </textPath>
  </text>
  
  <!-- Center emblem -->
  <circle cx="200" cy="200" r="80" fill="${primary}" opacity="0.8"/>
  <circle cx="200" cy="200" r="75" fill="none" stroke="${secondary}" stroke-width="3"/>
  
  <!-- Book icon in center -->
  <rect x="170" y="180" width="60" height="40" fill="${secondary}" rx="2"/>
  <line x1="200" y1="180" x2="200" y2="220" stroke="${primary}" stroke-width="2"/>
  
  <!-- Year arc (bottom) -->
  ${year ? `
  <path id="bottomArc" d="M 60,200 A 140,140 0 0,0 340,200" fill="none"/>
  <text font-family="Georgia, serif" font-size="20" font-weight="bold" fill="${primary}">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
      FOUNDED ${year}
    </textPath>
  </text>
  ` : ''}
</svg>`;

    return {
      svg,
      base64: Buffer.from(svg).toString('base64'),
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      format: 'svg'
    };
  }

  /**
   * Generate crest-style logo (elaborate university crest)
   */
  generateCrestLogo(schoolName, initials, year, motto, primary, secondary, tertiary) {
    const svg = `
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="crestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${this.darkenColor(primary, 40)};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main shield -->
  <path d="M 200 30 L 350 90 L 350 280 Q 350 390, 200 470 Q 50 390, 50 280 L 50 90 Z" 
        fill="url(#crestGrad)" stroke="${secondary}" stroke-width="10"/>
  
  <!-- Quarterly divisions -->
  <line x1="200" y1="90" x2="200" y2="280" stroke="${secondary}" stroke-width="4" opacity="0.5"/>
  <line x1="50" y1="185" x2="350" y2="185" stroke="${secondary}" stroke-width="4" opacity="0.5"/>
  
  <!-- Top left quarter - Book -->
  <g transform="translate(125, 140)">
    <rect x="-30" y="-20" width="60" height="40" fill="${secondary}" rx="2"/>
    <line x1="0" y1="-20" x2="0" y2="20" stroke="${primary}" stroke-width="2"/>
  </g>
  
  <!-- Top right quarter - Torch -->
  <g transform="translate(275, 140)">
    <ellipse cx="0" cy="-15" rx="15" ry="20" fill="${secondary}"/>
    <rect x="-5" y="5" width="10" height="30" fill="${secondary}"/>
  </g>
  
  <!-- Bottom left quarter - Oak leaves -->
  <g transform="translate(125, 230)">
    <ellipse cx="-10" cy="0" rx="15" ry="8" fill="${secondary}" transform="rotate(-30)"/>
    <ellipse cx="10" cy="0" rx="15" ry="8" fill="${secondary}" transform="rotate(30)"/>
  </g>
  
  <!-- Bottom right quarter - Star -->
  <path d="M 275,215 L 280,230 L 295,230 L 283,239 L 288,254 L 275,245 L 262,254 L 267,239 L 255,230 L 270,230 Z" 
        fill="${secondary}"/>
  
  <!-- Center shield with initials -->
  <ellipse cx="200" cy="185" rx="60" ry="70" fill="${tertiary}" stroke="${secondary}" stroke-width="4"/>
  <text x="200" y="200" font-family="Garamond, serif" font-size="60" font-weight="bold" 
        fill="${primary}" text-anchor="middle" dominant-baseline="middle">
    ${initials}
  </text>
  
  <!-- Banner ribbon at bottom -->
  <path d="M 70 320 L 70 360 L 200 380 L 330 360 L 330 320 L 200 340 Z" 
        fill="${secondary}" stroke="${primary}" stroke-width="3"/>
  
  <!-- Motto or year on banner -->
  <text x="200" y="355" font-family="Georgia, serif" font-size="20" font-weight="bold" 
        fill="${primary}" text-anchor="middle" dominant-baseline="middle">
    ${motto || (year ? `EST. ${year}` : 'VERITAS')}
  </text>
  
  <!-- Decorative scrollwork -->
  <path d="M 40 90 Q 30 60, 50 40" fill="none" stroke="${secondary}" stroke-width="3"/>
  <path d="M 360 90 Q 370 60, 350 40" fill="none" stroke="${secondary}" stroke-width="3"/>
</svg>`;

    return {
      svg,
      base64: Buffer.from(svg).toString('base64'),
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      format: 'svg'
    };
  }

  /**
   * Generate square/modern logo
   */
  generateSquareLogo(initials, schoolName, primary, secondary) {
    const svg = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Modern square frame -->
  <rect x="40" y="40" width="320" height="320" fill="${primary}" stroke="${secondary}" stroke-width="8"/>
  <rect x="60" y="60" width="280" height="280" fill="none" stroke="${secondary}" stroke-width="4"/>
  
  <!-- Large initials -->
  <text x="200" y="220" font-family="Helvetica, Arial, sans-serif" font-size="140" 
        font-weight="900" fill="${secondary}" text-anchor="middle" dominant-baseline="middle">
    ${initials}
  </text>
  
  <!-- Small school name at bottom -->
  <text x="200" y="310" font-family="Arial, sans-serif" font-size="16" font-weight="600" 
        fill="${secondary}" text-anchor="middle">
    ${schoolName.toUpperCase()}
  </text>
</svg>`;

    return {
      svg,
      base64: Buffer.from(svg).toString('base64'),
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      format: 'svg'
    };
  }

  /**
   * Extract initials from school name
   */
  extractInitials(schoolName) {
    if (!schoolName) return 'U';
    
    const words = schoolName.split(' ').filter(word => 
      !['of', 'the', 'and', 'for'].includes(word.toLowerCase())
    );
    
    if (words.length === 1) {
      return words[0].substring(0, 1).toUpperCase();
    } else if (words.length === 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    }
  }

  /**
   * Helper to darken colors
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
  }

  /**
   * Generate filename for logo
   */
  generateFilename(schoolName, style = 'shield') {
    const sanitized = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `logo_${sanitized}_${style}_${timestamp}_${random}.svg`;
  }
}

module.exports = LogoGenerator;
