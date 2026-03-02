const puppeteer = require('puppeteer');
const { CertificateModel } = require('../models/certificateModel');
const sealModel = require('../models/sealModel');

/**
 * Certificate/Diploma Service
 * Generates authentic-looking certificates and diplomas with professional design elements
 */
class CertificateService {
  /**
   * Generate Certificate/Diploma PDF with authentic design elements
   */
  async generateCertificatePDF(certificateId, userId) {
    let browser;
    try {
      // Get certificate data with signatures
      const certificate = await CertificateModel.getCertificateWithSignatures(certificateId);
      
      if (!certificate || certificate.user_id !== userId) {
        throw new Error('Certificate not found or access denied');
      }

      // Get template
      const template = await CertificateModel.getTemplateById(certificate.template_id);
      
      // Get seal if specified
      let sealData = null;
      if (certificate.custom_fields?.seal_id) {
        sealData = await sealModel.getById(certificate.custom_fields.seal_id);
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Render HTML
      const html = this.renderCertificateHTML(certificate, template || {}, sealData);

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: certificate.design_overrides?.pageSize || 'A4',
        landscape: (template || {}).layout === 'landscape',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        }
      });

      return pdfBuffer;
    } catch (error) {
      console.error('Certificate PDF generation error:', error);
      throw new Error('Failed to generate certificate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Render certificate HTML with authentic design elements
   */
  renderCertificateHTML(certificate, template, _sealData) {
    const config = template.design_config || {};
    const overrides = certificate.design_overrides || {};
    
    // Merge configuration
    const design = {
      borderStyle: overrides.borderStyle || config.borderStyle || 'ornate',
      sealType: overrides.sealType || config.sealType || 'gold',
      fontFamily: overrides.fontFamily || config.fontFamily || 'Garamond',
      primaryColor: overrides.primaryColor || config.primaryColor || '#003366',
      accentColor: overrides.accentColor || config.accentColor || '#FFD700',
      backgroundColor: overrides.backgroundColor || config.backgroundColor || '#FFFEF0'
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Garamond:wght@400;700&family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${design.fontFamily}, serif;
      background: ${design.backgroundColor};
      width: ${template.layout === 'landscape' ? '297mm' : '210mm'};
      height: ${template.layout === 'landscape' ? '210mm' : '297mm'};
      padding: 20mm;
      position: relative;
    }

    /* Ornate Border with Embossed Effect */
    .border-frame {
      position: absolute;
      top: 15mm;
      left: 15mm;
      right: 15mm;
      bottom: 15mm;
      border: 8px solid ${design.accentColor};
      border-style: ${design.borderStyle === 'ornate' ? 'double' : 'solid'};
      box-shadow: 
        inset 0 0 0 2px ${design.primaryColor},
        inset 0 0 20px rgba(0,0,0,0.1),
        0 4px 8px rgba(0,0,0,0.2);
    }

    /* Inner decorative border */
    .border-frame::before {
      content: '';
      position: absolute;
      top: 5mm;
      left: 5mm;
      right: 5mm;
      bottom: 5mm;
      border: 2px solid ${design.accentColor};
      opacity: 0.5;
    }

    /* Certificate content container */
    .certificate-content {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 40mm 20mm;
    }

    /* Header - School Name */
    .school-header {
      font-size: 32pt;
      font-weight: 700;
      color: ${design.primaryColor};
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 5mm;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .school-location {
      font-size: 14pt;
      color: ${design.primaryColor};
      margin-bottom: 15mm;
      font-style: italic;
    }

    /* Certificate Title */
    .certificate-title {
      font-size: 24pt;
      font-weight: 700;
      color: ${design.primaryColor};
      margin-bottom: 10mm;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    /* Program/Degree Name */
    .program-name {
      font-size: 20pt;
      color: ${design.primaryColor};
      margin-bottom: 8mm;
      font-style: italic;
    }

    /* Recipient Name - Large and Prominent */
    .recipient-section {
      margin: 15mm 0;
    }

    .recipient-label {
      font-size: 14pt;
      color: ${design.primaryColor};
      margin-bottom: 3mm;
    }

    .recipient-name {
      font-size: 36pt;
      font-weight: 700;
      color: ${design.accentColor};
      font-family: 'Playfair Display', serif;
      margin: 5mm 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      border-bottom: 3px solid ${design.accentColor};
      display: inline-block;
      padding: 0 20mm 2mm 20mm;
    }

    /* Honors and Distinctions */
    .honors {
      font-size: 16pt;
      color: ${design.accentColor};
      font-style: italic;
      font-weight: 600;
      margin: 5mm 0;
    }

    /* Completion Text */
    .completion-text {
      font-size: 14pt;
      color: ${design.primaryColor};
      margin: 10mm 0;
      line-height: 1.6;
    }

    /* Date */
    .graduation-date {
      font-size: 14pt;
      color: ${design.primaryColor};
      margin: 8mm 0;
      font-weight: 600;
    }

    /* Embossed Gold Seal */
    .seal-container {
      position: absolute;
      bottom: 25mm;
      left: 50%;
      transform: translateX(-50%);
      width: 80mm;
      height: 80mm;
      z-index: 5;
    }

    .embossed-seal {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(
        circle at 30% 30%,
        ${design.accentColor},
        ${this.darkenColor(design.accentColor, 20)}
      );
      box-shadow:
        0 0 0 3px ${design.accentColor},
        inset 0 2px 10px rgba(255,255,255,0.5),
        inset 0 -2px 10px rgba(0,0,0,0.3),
        0 8px 20px rgba(0,0,0,0.3),
        0 0 30px ${design.accentColor}40;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    /* Metallic foil effect */
    .embossed-seal::before {
      content: '';
      position: absolute;
      top: 5%;
      left: 5%;
      width: 90%;
      height: 90%;
      border-radius: 50%;
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.4) 0%,
        transparent 50%,
        rgba(0,0,0,0.2) 100%
      );
    }

    .seal-text {
      position: relative;
      z-index: 2;
      color: ${design.primaryColor};
      font-size: 10pt;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.3;
    }

    /* Signatures Section */
    .signatures-container {
      position: absolute;
      bottom: 35mm;
      left: 30mm;
      right: 30mm;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
    }

    .signature-block {
      flex: 1;
      text-align: center;
      padding: 0 10mm;
    }

    .signature-line {
      border-top: 2px solid ${design.primaryColor};
      margin-bottom: 2mm;
      padding-top: 15mm;
    }

    .signature-name {
      font-size: 12pt;
      font-weight: 600;
      color: ${design.primaryColor};
      font-family: 'Playfair Display', serif;
      margin-bottom: 1mm;
    }

    .signature-title {
      font-size: 10pt;
      color: ${design.primaryColor};
      font-style: italic;
    }

    /* Decorative elements */
    .corner-ornament {
      position: absolute;
      width: 30mm;
      height: 30mm;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,10 Q50,10 50,50 T10,90" fill="none" stroke="${design.accentColor}" stroke-width="2"/></svg>');
      opacity: 0.3;
    }

    .corner-ornament.top-left {
      top: 20mm;
      left: 20mm;
    }

    .corner-ornament.top-right {
      top: 20mm;
      right: 20mm;
      transform: rotate(90deg);
    }

    .corner-ornament.bottom-left {
      bottom: 20mm;
      left: 20mm;
      transform: rotate(-90deg);
    }

    .corner-ornament.bottom-right {
      bottom: 20mm;
      right: 20mm;
      transform: rotate(180deg);
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: ${design.accentColor}10;
      font-weight: 700;
      z-index: 1;
      letter-spacing: 10px;
    }
  </style>
</head>
<body>
  <!-- Decorative Border -->
  <div class="border-frame"></div>
  
  <!-- Corner Ornaments -->
  ${design.borderStyle === 'ornate' ? `
  <div class="corner-ornament top-left"></div>
  <div class="corner-ornament top-right"></div>
  <div class="corner-ornament bottom-left"></div>
  <div class="corner-ornament bottom-right"></div>
  ` : ''}

  <!-- Watermark -->
  <div class="watermark">OFFICIAL</div>

  <!-- Certificate Content -->
  <div class="certificate-content">
    <!-- School Header -->
    <div class="school-header">${certificate.school_name}</div>
    ${certificate.school_location ? `<div class="school-location">${certificate.school_location}</div>` : ''}

    <!-- Certificate Title -->
    <div class="certificate-title">${certificate.title}</div>
    ${certificate.program_name ? `<div class="program-name">${certificate.program_name}</div>` : ''}

    <!-- Recipient Section -->
    <div class="recipient-section">
      <div class="recipient-label">This certifies that</div>
      <div class="recipient-name">${certificate.recipient_name}</div>
      ${certificate.honors ? `<div class="honors">${certificate.honors}</div>` : ''}
    </div>

    <!-- Completion Text -->
    <div class="completion-text">
      ${certificate.custom_text || `has successfully completed all requirements for the ${certificate.degree_type || 'degree'}`}
    </div>

    <!-- Graduation Date -->
    ${certificate.graduation_date ? `
      <div class="graduation-date">
        Awarded on ${new Date(certificate.graduation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    ` : ''}
  </div>

  <!-- Embossed Gold Seal -->
  <div class="seal-container">
    <div class="embossed-seal">
      <div class="seal-text">
        <div>OFFICIAL</div>
        <div style="font-size: 14pt; margin: 2mm 0;">SEAL</div>
        <div>${new Date().getFullYear()}</div>
      </div>
    </div>
  </div>

  <!-- Signatures -->
  ${certificate.signatures && certificate.signatures.length > 0 ? `
  <div class="signatures-container">
    ${certificate.signatures.map(sig => `
      <div class="signature-block">
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
   * Helper function to darken a color
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
      (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
      .toString(16).slice(1);
  }
}

module.exports = new CertificateService();
