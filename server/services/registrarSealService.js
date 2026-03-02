'use strict';
const crypto = require('crypto');

let QRCode;
try {
  QRCode = require('qrcode');
} catch (_e) {
  QRCode = null;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeColor(color, fallback) {
  return /^#[0-9a-fA-F]{3,6}$/.test(color) ? color : fallback;
}

/**
 * Registrar Signature & Seal Automation Service
 * Category F: Features 111-125
 */
class RegistrarSealService {
  constructor() {
    this.defaultSealPositions = {
      'top-left': { x: '20px', y: '20px' },
      'top-center': { x: '50%', y: '20px', transform: 'translateX(-50%)' },
      'center-header': { x: '50%', y: '100px', transform: 'translateX(-50%)' },
      'bottom-left': { x: '20px', y: 'auto', bottom: '80px' },
      'bottom-center': { x: '50%', y: 'auto', bottom: '80px', transform: 'translateX(-50%)' },
      'bottom-right': { x: 'auto', right: '20px', bottom: '80px' }
    };

    this.signatureStyles = {
      cursive: 'Brush Script MT, Segoe Script, cursive',
      formal: 'Palatino Linotype, Book Antiqua, serif',
      modern: 'Helvetica Neue, Arial, sans-serif',
      traditional: 'Times New Roman, serif'
    };
  }

  // Feature 111: Auto-research and render registrar name in signature block
  generateRegistrarSignatureBlock(registrarName, title = 'University Registrar', options = {}) {
    return {
      name: registrarName || 'Office of the Registrar',
      title: title,
      signatureLineWidth: options.lineWidth || '200px',
      displayBlock: {
        signatureLine: '___________________________',
        name: registrarName || '',
        title: title,
        dateLabel: 'Date of Issue:'
      }
    };
  }

  // Feature 112: Auto-generate calligraphic registrar signature
  generateCalligraphicSignature(name, style = 'cursive') {
    if (!name) return null;
    const font = this.signatureStyles[style] || this.signatureStyles.cursive;
    const words = name.trim().split(' ');
    const initials = words.map(w => w[0]).join('');
    const displayName = escapeXml(name);
    
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="80" viewBox="0 0 280 80">
  <text x="20" y="55" font-family="${escapeXml(font)}" font-size="32" fill="#1a1a2e" transform="rotate(-3,140,40)">${displayName}</text>
  <path d="M20 70 Q140 65 260 70" stroke="#1a1a2e" stroke-width="1" fill="none" opacity="0.6"/>
</svg>`,
      name,
      initials,
      style,
      font
    };
  }

  // Feature 113: Auto-place registrar signature block in correct position
  positionSignatureBlock(institutionLayout = 'standard') {
    const positions = {
      standard: { bottom: '1.5in', left: '1in', width: '3in' },
      left: { bottom: '1.5in', left: '0.75in', width: '2.5in' },
      center: { bottom: '1.5in', left: '50%', transform: 'translateX(-50%)', width: '3in' },
      right: { bottom: '1.5in', right: '1in', width: '3in' }
    };
    return positions[institutionLayout] || positions.standard;
  }

  // Feature 114: Auto-generate institution seal (high-res SVG/PNG)
  generateInstitutionSeal(sealConfig) {
    const {
      institutionName = 'University',
      acronym = 'UNI',
      foundedYear = '',
      motto = '',
      primaryColor = '#003366',
      secondaryColor = '#FFD700',
      size = 150
    } = sealConfig || {};

    return {
      svg: this._buildSealSVG({ institutionName, acronym, foundedYear, motto, primaryColor, secondaryColor, size }),
      config: sealConfig,
      format: 'SVG',
      width: size,
      height: size,
      resolution: '300dpi'
    };
  }

  // Feature 115: Auto-place seal in correct size and location
  positionSeal(institutionName = '', preferredPosition = 'top-left') {
    const pos = this.defaultSealPositions[preferredPosition] || this.defaultSealPositions['top-left'];
    return { position: preferredPosition, coordinates: pos, size: { width: '120px', height: '120px' }, institutionName };
  }

  // Feature 116: Auto-generate circular seal border with institution name
  generateCircularSealBorder(institutionName, primaryColor = '#003366', secondaryColor = '#FFD700') {
    const name = escapeXml((institutionName || '').toUpperCase());
    const pc = sanitizeColor(primaryColor, '#003366');
    const sc = sanitizeColor(secondaryColor, '#FFD700');
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="${pc}" stroke="${sc}" stroke-width="6"/>
  <circle cx="100" cy="100" r="80" fill="none" stroke="${sc}" stroke-width="2" stroke-dasharray="4,2"/>
  <defs><path id="nameArc" d="M 15 100 A 85 85 0 1 1 185 100"/></defs>
  <text font-size="10" fill="${sc}" font-family="serif" font-weight="bold" letter-spacing="2">
    <textPath href="#nameArc" startOffset="5%">${name}</textPath>
  </text>
</svg>`,
      institutionName,
      primaryColor,
      secondaryColor
    };
  }

  // Feature 117: Include founding year, motto, and central emblem in seal
  buildCompleteSeal(sealData) {
    const { institutionName, acronym, foundedYear, motto, primaryColor = '#003366', secondaryColor = '#FFD700' } = sealData || {};
    return {
      svg: this._buildSealSVG({ institutionName, acronym, foundedYear, motto, primaryColor, secondaryColor, size: 200 }),
      components: { name: institutionName, acronym, foundedYear, motto, hasEmblem: true }
    };
  }

  // Feature 118: Apply raised-seal emboss simulation
  generateEmbossEffect(sealSVG, options = {}) {
    const { intensity = 0.3 } = options;
    return {
      embossedSVG: sealSVG.replace('<svg', `<svg filter="url(#emboss)"`).replace('</svg>', `<defs><filter id="emboss"><feConvolveMatrix order="3" kernelMatrix="-2 -1 0 -1 1 1 0 1 2" preserveAlpha="true"/><feComposite in="SourceGraphic" result="embossed"/></filter></defs></svg>`),
      effect: 'emboss',
      intensity,
      note: 'Emboss simulation applied for digital display'
    };
  }

  // Feature 119: Auto-generate registrar's office date stamp
  generateDateStamp(date = new Date(), _institutionFormat = 'MMMM D, YYYY') {
    const d = new Date(date);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const formatted = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    return {
      date: formatted,
      raw: d.toISOString().split('T')[0],
      stamp: `ISSUED: ${formatted}`,
      position: 'bottom-right'
    };
  }

  // Feature 120: Auto-include official transcript certification statement
  generateCertificationStatement(institutionName, registrarName = '') {
    return {
      statement: `This is an official transcript of the academic record of the student named herein at ${institutionName || 'this institution'}. Changes or alterations render this document invalid. ${registrarName ? `Certified by: ${registrarName}` : ''}`.trim(),
      style: 'formal',
      position: 'footer',
      border: '1px solid #333'
    };
  }

  // Feature 121: Auto-generate unique alphanumeric verification code
  generateVerificationCode(prefix = 'TRN') {
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    return {
      code: `${prefix}-${code.substring(0,4)}-${code.substring(4,8)}-${code.substring(8)}`,
      generatedAt: new Date().toISOString(),
      prefix
    };
  }

  // Feature 122: Auto-embed QR code for verification
  async generateVerificationQRCode(verificationCode, baseUrl = '') {
    const url = baseUrl ? `${baseUrl}/verify/${verificationCode}` : `https://verify.example.com/${verificationCode}`;
    if (!QRCode) {
      return { qrDataUrl: null, verificationUrl: url, code: verificationCode, error: 'qrcode module not available' };
    }
    try {
      const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'M', width: 120 });
      return { qrDataUrl, verificationUrl: url, code: verificationCode };
    } catch (err) {
      return { qrDataUrl: null, verificationUrl: url, code: verificationCode, error: err.message };
    }
  }

  // Feature 123: Auto-place certification footer statement
  generateCertificationFooter(institutionName, accreditationBody = '') {
    return {
      text: `${institutionName || 'This institution'} is accredited by ${accreditationBody || 'a recognized accrediting body'}. This transcript is issued in accordance with institutional policy and AACRAO standards.`,
      position: 'footer',
      fontSize: '8pt',
      borderTop: '1px solid #000'
    };
  }

  // Feature 124: Auto-generate "DO NOT ACCEPT IF SEAL IS BROKEN" statement
  generateSealIntegrityStatement(format = 'digital') {
    const statements = {
      digital: 'This document is protected by a digital verification code. Authenticity can be confirmed at the verification URL provided.',
      print: 'OFFICIAL — Do not accept if institutional seal is broken or signature is missing.',
      both: 'This official document is sealed and signed. Do not accept if seal or signature is compromised. Verify authenticity using the QR code or verification number provided.'
    };
    return { statement: statements[format] || statements.both, format, position: 'footer', fontStyle: 'italic', fontSize: '8pt' };
  }

  // Feature 125: Auto-produce transcript authenticity notice (AACRAO standards)
  generateAACRAOAuthenticityNotice(institutionName) {
    return {
      notice: [
        `This is an official transcript of ${institutionName || 'the institution'}.`,
        'This document was prepared by the Office of the University Registrar.',
        'An official transcript bears the original signature of the Registrar and/or the seal of the institution.',
        'This transcript is issued in accordance with AACRAO standards for electronic transcript exchange.',
        'Changes or alterations render this document invalid.',
        'Recipient: do not accept if this document has been tampered with.'
      ].join(' '),
      standard: 'AACRAO',
      position: 'footer',
      formatting: { fontSize: '7.5pt', lineHeight: '1.3', color: '#333' }
    };
  }

  // Utility: Generate complete seal and signature package
  async generateCompleteSealPackage(data) {
    const { institutionName, acronym, foundedYear, motto, primaryColor, secondaryColor, registrarName, includeQR = true, baseUrl = '' } = data || {};
    const verCode = this.generateVerificationCode();
    const seal = this.generateInstitutionSeal({ institutionName, acronym, foundedYear, motto, primaryColor, secondaryColor });
    const signature = this.generateCalligraphicSignature(registrarName);
    const certification = this.generateCertificationStatement(institutionName, registrarName);
    const dateStamp = this.generateDateStamp();
    const qr = includeQR ? await this.generateVerificationQRCode(verCode.code, baseUrl) : null;
    const footer = this.generateCertificationFooter(institutionName);
    const aacrao = this.generateAACRAOAuthenticityNotice(institutionName);
    return { seal, signature, certification, dateStamp, verificationCode: verCode, qrCode: qr, footer, aacrao, sealPosition: this.positionSeal(institutionName) };
  }

  // Private: Build full SVG seal
  _buildSealSVG({ institutionName = '', acronym = 'UNI', foundedYear = '', motto = '', primaryColor = '#003366', secondaryColor = '#FFD700', size = 150 }) {
    const cx = size / 2, cy = size / 2, r = size * 0.47, innerR = r * 0.79;
    const nameUp = escapeXml((institutionName || '').toUpperCase());
    const safeAcronym = escapeXml(acronym);
    const safeMotto = escapeXml(motto);
    const safeYear = escapeXml(foundedYear);
    const pc = sanitizeColor(primaryColor, '#003366');
    const sc = sanitizeColor(secondaryColor, '#FFD700');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${pc}" stroke="${sc}" stroke-width="${size*0.04}"/>
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${sc}" stroke-width="${size*0.01}" stroke-dasharray="${size*0.03},${size*0.015}"/>
  <text x="${cx}" y="${cy + size*0.06}" text-anchor="middle" font-size="${size*0.18}" font-weight="bold" fill="${sc}" font-family="serif">${safeAcronym}</text>
  ${safeYear ? `<text x="${cx}" y="${cy + size*0.23}" text-anchor="middle" font-size="${size*0.065}" fill="${sc}" font-family="serif">EST. ${safeYear}</text>` : ''}
  ${safeMotto ? `<text x="${cx}" y="${cy - size*0.12}" text-anchor="middle" font-size="${size*0.06}" fill="${sc}" font-family="serif" font-style="italic">${safeMotto}</text>` : ''}
  <defs><path id="namePath${size}" d="M ${cx - r*0.88} ${cy} A ${r*0.88} ${r*0.88} 0 1 1 ${cx + r*0.88} ${cy}"/></defs>
  <text font-size="${size*0.062}" fill="${sc}" font-family="serif" font-weight="bold" letter-spacing="1">
    <textPath href="#namePath${size}" startOffset="5%">${nameUp}</textPath>
  </text>
</svg>`;
  }
}

module.exports = new RegistrarSealService();
