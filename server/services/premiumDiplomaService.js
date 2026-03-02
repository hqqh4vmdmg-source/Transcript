const puppeteer = require('puppeteer');
const LogoGenerator = require('../utils/logoGenerator');

/**
 * Premium Diploma Service
 * Creates high-quality replica diplomas with authentic design elements
 */
class PremiumDiplomaService {
  constructor() {
    this.logoGenerator = new LogoGenerator();
    
    // Paper sizes in millimeters
    this.paperSizes = {
      'letter': { width: '215.9mm', height: '279.4mm', name: 'Letter (8.5" x 11")' },
      'a4': { width: '210mm', height: '297mm', name: 'A4 (210mm x 297mm)' },
      'legal': { width: '215.9mm', height: '355.6mm', name: 'Legal (8.5" x 14")' },
      'tabloid': { width: '279.4mm', height: '431.8mm', name: 'Tabloid (11" x 17")' },
      'custom_landscape': { width: '420mm', height: '297mm', name: 'Custom Landscape' },
      'custom_portrait': { width: '297mm', height: '420mm', name: 'Custom Portrait' }
    };

    // Professional fonts for diplomas
    this.professionalFonts = {
      'traditional': 'Garamond, Times New Roman, serif',
      'calligraphy': 'Brush Script MT, cursive',
      'elegant': 'Playfair Display, Georgia, serif',
      'modern': 'Open Sans, Helvetica, sans-serif',
      'classic': 'Book Antiqua, Palatino, serif',
      'formal': 'Baskerville, serif'
    };
  }

  /**
   * Generate premium diploma PDF
   */
  async generatePremiumDiploma(diplomaData) {
    let browser;
    try {
      // Generate school logo if not provided
      let logoData = null;
      if (diplomaData.generateLogo) {
        logoData = this.logoGenerator.generateLogo({
          schoolName: diplomaData.school_name,
          schoolInitials: diplomaData.school_initials,
          foundedYear: diplomaData.founded_year,
          style: diplomaData.logo_style || 'shield',
          primaryColor: diplomaData.logo_primary_color || '#003366',
          secondaryColor: diplomaData.logo_secondary_color || '#FFD700'
        });
      }

      // Get paper size
      const paperSize = this.paperSizes[diplomaData.paper_size || 'letter'];
      const isLandscape = diplomaData.orientation === 'landscape';

      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Render HTML with all premium features
      const html = this.renderPremiumDiplomaHTML(diplomaData, logoData, paperSize, isLandscape);

      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF with high quality
      const pdfBuffer = await page.pdf({
        width: isLandscape ? paperSize.height : paperSize.width,
        height: isLandscape ? paperSize.width : paperSize.height,
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        },
        preferCSSPageSize: true
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Premium diploma generation error:', error);
      throw new Error('Failed to generate premium diploma');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Render premium diploma HTML with all authentic features
   */
  renderPremiumDiplomaHTML(diploma, logoData, paperSize, isLandscape) {
    const {
      school_name,
      school_location,
      recipient_name,
      degree_type,
      major,
      honors,
      graduation_date,
      custom_text,
      
      // Design options
      paper_texture = 'parchment',
      font_style = 'traditional',
      primary_color = '#003366',
      accent_color = '#FFD700',
      border_style = 'ornate',
      
      // Embossing options
      enable_embossing = true,
      gold_foil = true,
      
      // Signatures
      signatures = []
    } = diploma;

    const fonts = this.professionalFonts[font_style] || this.professionalFonts.traditional;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Import professional fonts */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Garamond:wght@400;700&family=Brush+Script+MT&family=Baskerville&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: ${isLandscape ? paperSize.height : paperSize.width} ${isLandscape ? paperSize.width : paperSize.height};
      margin: 0;
    }

    body {
      font-family: ${fonts};
      width: 100%;
      height: 100vh;
      position: relative;
      overflow: hidden;
    }

    /* Premium paper texture background */
    .paper-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      ${this.getPaperTexture(paper_texture)}
    }

    /* Ornate border frame with embossed effect */
    .border-frame {
      position: absolute;
      top: ${isLandscape ? '20mm' : '25mm'};
      left: ${isLandscape ? '25mm' : '20mm'};
      right: ${isLandscape ? '25mm' : '20mm'};
      bottom: ${isLandscape ? '20mm' : '25mm'};
      border: 12px solid ${accent_color};
      ${border_style === 'ornate' ? `
        border-style: double;
        box-shadow: 
          inset 0 0 0 3px ${primary_color},
          inset 0 0 0 6px ${accent_color},
          inset 0 4px 20px rgba(0,0,0,0.15),
          0 8px 20px rgba(0,0,0,0.25);
      ` : `
        box-shadow: 
          inset 0 0 20px rgba(0,0,0,0.1),
          0 4px 8px rgba(0,0,0,0.2);
      `}
      z-index: 2;
    }

    /* Inner decorative border */
    .border-frame::before {
      content: '';
      position: absolute;
      top: 8mm;
      left: 8mm;
      right: 8mm;
      bottom: 8mm;
      border: 2px solid ${accent_color};
      opacity: 0.6;
      ${border_style === 'ornate' ? 'border-style: dotted;' : ''}
    }

    /* Content container */
    .diploma-content {
      position: relative;
      z-index: 10;
      padding: ${isLandscape ? '30mm 40mm' : '40mm 30mm'};
      text-align: center;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* School logo/emblem */
    .school-logo {
      width: ${isLandscape ? '80mm' : '70mm'};
      height: ${isLandscape ? '80mm' : '70mm'};
      margin: 0 auto ${isLandscape ? '5mm' : '8mm'} auto;
      ${enable_embossing ? `
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
      ` : ''}
    }

    /* School header */
    .school-header {
      margin-bottom: ${isLandscape ? '8mm' : '12mm'};
    }

    .school-name {
      font-size: ${isLandscape ? '38pt' : '36pt'};
      font-weight: 900;
      color: ${primary_color};
      text-transform: uppercase;
      letter-spacing: 6px;
      margin-bottom: 3mm;
      ${enable_embossing ? `
        text-shadow: 
          2px 2px 0 ${accent_color}40,
          3px 3px 8px rgba(0,0,0,0.3);
      ` : `
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      `}
      font-family: 'Playfair Display', ${fonts};
    }

    .school-location {
      font-size: ${isLandscape ? '16pt' : '14pt'};
      color: ${primary_color};
      font-style: italic;
      letter-spacing: 2px;
    }

    /* Main diploma text */
    .diploma-title {
      font-size: ${isLandscape ? '28pt' : '26pt'};
      font-weight: 700;
      color: ${primary_color};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin: ${isLandscape ? '10mm' : '15mm'} 0 ${isLandscape ? '5mm' : '8mm'} 0;
    }

    .certifies-text {
      font-size: ${isLandscape ? '18pt' : '16pt'};
      color: ${primary_color};
      margin-bottom: 5mm;
      font-style: italic;
    }

    /* Recipient name - Large calligraphy style */
    .recipient-name {
      font-size: ${isLandscape ? '52pt' : '48pt'};
      font-weight: 700;
      color: ${accent_color};
      font-family: 'Brush Script MT', 'Playfair Display', ${fonts};
      margin: ${isLandscape ? '8mm' : '10mm'} 0;
      ${gold_foil ? `
        background: linear-gradient(135deg, 
          ${accent_color} 0%,
          ${this.lightenColor(accent_color, 20)} 25%,
          ${accent_color} 50%,
          ${this.lightenColor(accent_color, 20)} 75%,
          ${accent_color} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ` : ''}
      ${enable_embossing ? `
        text-shadow: 
          3px 3px 0 rgba(0,0,0,0.1),
          4px 4px 12px rgba(0,0,0,0.3);
      ` : ''}
      line-height: 1.2;
    }

    /* Honors decoration */
    .honors {
      font-size: ${isLandscape ? '20pt' : '18pt'};
      color: ${accent_color};
      font-style: italic;
      font-weight: 600;
      margin: 5mm 0;
      letter-spacing: 2px;
    }

    /* Degree information */
    .degree-info {
      font-size: ${isLandscape ? '20pt' : '18pt'};
      color: ${primary_color};
      margin: ${isLandscape ? '8mm' : '10mm'} 0;
      line-height: 1.8;
    }

    .degree-type {
      font-weight: 700;
      font-size: ${isLandscape ? '24pt' : '22pt'};
      color: ${primary_color};
    }

    .major {
      font-style: italic;
      font-size: ${isLandscape ? '20pt' : '18pt'};
      color: ${primary_color};
    }

    /* Completion text */
    .completion-text {
      font-size: ${isLandscape ? '16pt' : '14pt'};
      color: ${primary_color};
      margin: ${isLandscape ? '8mm' : '10mm'} 0;
      line-height: 1.6;
      max-width: 80%;
      margin-left: auto;
      margin-right: auto;
    }

    /* Date */
    .graduation-date {
      font-size: ${isLandscape ? '18pt' : '16pt'};
      color: ${primary_color};
      font-weight: 600;
      margin: ${isLandscape ? '8mm' : '10mm'} 0;
      letter-spacing: 1px;
    }

    /* Embossed gold seal - positioned bottom center */
    .embossed-seal-container {
      position: absolute;
      bottom: ${isLandscape ? '35mm' : '40mm'};
      left: 50%;
      transform: translateX(-50%);
      width: ${isLandscape ? '90mm' : '80mm'};
      height: ${isLandscape ? '90mm' : '80mm'};
      z-index: 15;
    }

    .embossed-seal {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      ${gold_foil ? `
        background: radial-gradient(circle at 35% 35%,
          #FFE17B 0%,
          ${accent_color} 30%,
          ${this.darkenColor(accent_color, 15)} 60%,
          ${this.darkenColor(accent_color, 30)} 100%);
      ` : `
        background: radial-gradient(circle at 35% 35%,
          ${accent_color} 0%,
          ${this.darkenColor(accent_color, 20)} 100%);
      `}
      box-shadow:
        0 0 0 4px ${accent_color},
        inset 0 3px 15px rgba(255,255,255,0.6),
        inset 0 -3px 15px rgba(0,0,0,0.4),
        0 10px 30px rgba(0,0,0,0.4),
        0 0 40px ${accent_color}60;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    /* Metallic foil embossed effect */
    .embossed-seal::before {
      content: '';
      position: absolute;
      top: 8%;
      left: 8%;
      width: 84%;
      height: 84%;
      border-radius: 50%;
      background: linear-gradient(
        145deg,
        rgba(255,255,255,0.5) 0%,
        transparent 45%,
        rgba(0,0,0,0.3) 100%
      );
      pointer-events: none;
    }

    /* Raised ribbed pattern on seal */
    .embossed-seal::after {
      content: '';
      position: absolute;
      inset: 15%;
      border-radius: 50%;
      background: repeating-radial-gradient(
        circle,
        transparent 0px,
        rgba(255,255,255,0.1) 2px,
        transparent 4px
      );
    }

    .seal-text {
      position: relative;
      z-index: 2;
      color: ${primary_color};
      font-size: ${isLandscape ? '12pt' : '11pt'};
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      line-height: 1.4;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    /* Signatures section */
    .signatures-section {
      position: absolute;
      bottom: ${isLandscape ? '35mm' : '40mm'};
      left: ${isLandscape ? '40mm' : '35mm'};
      right: ${isLandscape ? '40mm' : '35mm'};
      display: flex;
      justify-content: space-between;
      z-index: 10;
    }

    .signature-block {
      flex: 1;
      text-align: center;
      padding: 0 ${isLandscape ? '15mm' : '10mm'};
      max-width: 35%;
    }

    .signature-line {
      border-top: 2px solid ${primary_color};
      margin-bottom: 2mm;
      padding-top: ${isLandscape ? '20mm' : '18mm'};
    }

    .signature-name {
      font-size: ${isLandscape ? '14pt' : '13pt'};
      font-weight: 700;
      color: ${primary_color};
      font-family: 'Brush Script MT', ${fonts};
      margin-bottom: 1mm;
    }

    .signature-title {
      font-size: ${isLandscape ? '11pt' : '10pt'};
      color: ${primary_color};
      font-style: italic;
      line-height: 1.3;
    }

    /* Corner ornaments */
    .corner-ornament {
      position: absolute;
      width: ${isLandscape ? '35mm' : '30mm'};
      height: ${isLandscape ? '35mm' : '30mm'};
      opacity: 0.25;
      z-index: 5;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,10 Q50,10 50,50 Q50,10 90,10 M10,10 Q10,50 50,50 Q10,50 10,90" fill="none" stroke="${accent_color}" stroke-width="3"/></svg>');
      background-size: contain;
    }

    .corner-ornament.top-left { top: ${isLandscape ? '25mm' : '30mm'}; left: ${isLandscape ? '30mm' : '25mm'}; }
    .corner-ornament.top-right { top: ${isLandscape ? '25mm' : '30mm'}; right: ${isLandscape ? '30mm' : '25mm'}; transform: rotate(90deg); }
    .corner-ornament.bottom-left { bottom: ${isLandscape ? '25mm' : '30mm'}; left: ${isLandscape ? '30mm' : '25mm'}; transform: rotate(-90deg); }
    .corner-ornament.bottom-right { bottom: ${isLandscape ? '25mm' : '30mm'}; right: ${isLandscape ? '30mm' : '25mm'}; transform: rotate(180deg); }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: ${isLandscape ? '90pt' : '80pt'};
      color: ${accent_color}08;
      font-weight: 900;
      z-index: 3;
      letter-spacing: 15px;
      font-family: 'Playfair Display', serif;
    }
  </style>
</head>
<body>
  <!-- Premium paper background -->
  <div class="paper-background"></div>

  <!-- Decorative border frame -->
  <div class="border-frame"></div>

  <!-- Corner ornaments -->
  ${border_style === 'ornate' ? `
    <div class="corner-ornament top-left"></div>
    <div class="corner-ornament top-right"></div>
    <div class="corner-ornament bottom-left"></div>
    <div class="corner-ornament bottom-right"></div>
  ` : ''}

  <!-- Watermark -->
  <div class="watermark">AUTHENTIC</div>

  <!-- Main diploma content -->
  <div class="diploma-content">
    <div>
      <!-- School logo -->
      ${logoData ? `
        <div class="school-logo">
          <img src="${logoData.dataUrl}" alt="School Logo" style="width: 100%; height: 100%;">
        </div>
      ` : ''}

      <!-- School header -->
      <div class="school-header">
        <div class="school-name">${school_name}</div>
        ${school_location ? `<div class="school-location">${school_location}</div>` : ''}
      </div>

      <!-- Diploma title -->
      <div class="diploma-title">Diploma</div>

      <!-- Certifies text -->
      <div class="certifies-text">This is to certify that</div>

      <!-- Recipient name - Large and prominent -->
      <div class="recipient-name">${recipient_name}</div>

      <!-- Honors -->
      ${honors ? `<div class="honors">${honors}</div>` : ''}

      <!-- Degree information -->
      <div class="degree-info">
        has fulfilled all requirements for the degree of<br>
        <span class="degree-type">${degree_type}</span>
        ${major ? `<br>in<br><span class="major">${major}</span>` : ''}
      </div>

      <!-- Custom completion text -->
      ${custom_text ? `
        <div class="completion-text">${custom_text}</div>
      ` : ''}

      <!-- Graduation date -->
      ${graduation_date ? `
        <div class="graduation-date">
          ${new Date(graduation_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Embossed gold seal -->
  ${enable_embossing ? `
    <div class="embossed-seal-container">
      <div class="embossed-seal">
        <div class="seal-text">
          <div style="font-size: ${isLandscape ? '16pt' : '14pt'};">OFFICIAL</div>
          <div style="font-size: ${isLandscape ? '20pt' : '18pt'}; margin: 3mm 0; font-weight: 900;">SEAL</div>
          <div>${new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- Signatures -->
  ${signatures && signatures.length > 0 ? `
    <div class="signatures-section">
      ${signatures.slice(0, 2).map((sig, idx) => `
        <div class="signature-block" style="${idx === 1 ? 'margin-left: auto;' : ''}">
          <div class="signature-line"></div>
          <div class="signature-name">${sig.name}</div>
          <div class="signature-title">${sig.title}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>`;
  }

  /**
   * Get paper texture CSS
   */
  getPaperTexture(textureType) {
    const textures = {
      'parchment': `
        background-color: #FFFEF0;
        background-image: 
          radial-gradient(circle at 20% 50%, rgba(210,180,140,0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(210,180,140,0.05) 0%, transparent 50%),
          linear-gradient(90deg, transparent 0%, rgba(210,180,140,0.02) 50%, transparent 100%);
      `,
      'linen': `
        background-color: #FAF9F6;
        background-image: 
          repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, transparent 1px, transparent 2px),
          repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, transparent 1px, transparent 2px);
      `,
      'cotton': `
        background-color: #FEFEFE;
        background-image: 
          radial-gradient(circle at 25% 25%, rgba(0,0,0,0.01) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(0,0,0,0.01) 0%, transparent 50%);
      `,
      'vellum': `
        background-color: #FFF8E7;
        background-image: 
          linear-gradient(45deg, rgba(210,180,140,0.03) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(210,180,140,0.03) 25%, transparent 25%);
        background-size: 20px 20px;
      `
    };

    return textures[textureType] || textures.parchment;
  }

  /**
   * Helper to lighten color
   */
  lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
  }

  /**
   * Helper to darken color
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
  }
}

module.exports = new PremiumDiplomaService();
