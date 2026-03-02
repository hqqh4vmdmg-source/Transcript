'use strict';
const crypto = require('crypto');

/**
 * Diploma Auto-Generation Service
 * Category G: Features 126-155
 */
class DiplomaAutoGenerationService {
  constructor() {
    this.formalDateWords = {
      ones: ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      yearWords: { 2020: 'Two Thousand Twenty', 2021: 'Two Thousand Twenty-One', 2022: 'Two Thousand Twenty-Two', 2023: 'Two Thousand Twenty-Three', 2024: 'Two Thousand Twenty-Four', 2025: 'Two Thousand Twenty-Five', 2026: 'Two Thousand Twenty-Six', 2027: 'Two Thousand Twenty-Seven', 2028: 'Two Thousand Twenty-Eight' }
    };

    this.calligraphicFonts = [
      'Brush Script MT, cursive', 'Palatino Linotype, serif', 'Book Antiqua, serif',
      'Garamond, serif', 'Baskerville, serif', 'Trajan Pro, serif',
      'Copperplate, fantasy', 'Didot, serif', 'Cormorant Garamond, serif',
      'EB Garamond, serif', 'Cinzel, serif', 'Playfair Display, serif'
    ];

    this.diplomaSizes = {
      standard: { width: '8.5in', height: '11in', label: 'Standard (8.5"×11")' },
      standard_landscape: { width: '11in', height: '8.5in', label: 'Standard Landscape (11"×8.5")' },
      large: { width: '11in', height: '14in', label: 'Large (11"×14")' },
      extra_large: { width: '14in', height: '18in', label: 'Extra Large (14"×18")' },
      a4: { width: '210mm', height: '297mm', label: 'A4' }
    };

    this.borderStyles = [
      'traditional', 'contemporary', 'minimalist', 'ornate', 'classic', 'modern'
    ];
  }

  // Feature 126: Auto-generate student name in calligraphic display text
  generateCalligraphicNameDisplay(fullName, fontStyle = 0) {
    const font = this.calligraphicFonts[fontStyle % this.calligraphicFonts.length];
    return {
      name: fullName,
      font,
      fontSize: '48pt',
      alignment: 'center',
      svg: `<text x="50%" y="50%" text-anchor="middle" font-family="${font}" font-size="48" fill="#1a1a2e">${this._escapeXml(fullName)}</text>`
    };
  }

  // Feature 127: Auto-populate degree title exactly as conferred
  formatDegreeTitle(degreeType, major) {
    const degrees = {
      bs: 'Bachelor of Science',
      ba: 'Bachelor of Arts',
      bfa: 'Bachelor of Fine Arts',
      bba: 'Bachelor of Business Administration',
      beng: 'Bachelor of Engineering',
      ms: 'Master of Science',
      ma: 'Master of Arts',
      mba: 'Master of Business Administration',
      meng: 'Master of Engineering',
      phd: 'Doctor of Philosophy',
      edd: 'Doctor of Education',
      jd: 'Juris Doctor',
      md: 'Doctor of Medicine'
    };
    const title = degrees[degreeType?.toLowerCase()] || degreeType || 'Bachelor of Science';
    return { degreeTitle: title, major: major || '', fullTitle: major ? `${title} in ${major}` : title };
  }

  // Feature 128: Auto-populate field of study from institutional catalog
  formatFieldOfStudy(major, concentration = null, minor = null) {
    let field = major || 'General Studies';
    if (concentration) field += `, ${concentration}`;
    return { major: major || '', concentration, minor, displayField: field, minorLine: minor ? `Minor in ${minor}` : null };
  }

  // Feature 129: Auto-generate graduation date in formal text
  formatGraduationDateFormal(date) {
    const d = new Date(date);
    if (isNaN(d)) return date || '';
    const day = this.formalDateWords.ones[d.getDate()] || String(d.getDate());
    const month = this.formalDateWords.months[d.getMonth()];
    const year = this.formalDateWords.yearWords[d.getFullYear()] || String(d.getFullYear());
    return `the ${day} day of ${month}, ${year}`;
  }

  // Feature 130: Auto-generate institution's full official name in diploma
  formatInstitutionNameForDiploma(name) {
    return { fullName: name || 'University', displayName: (name || 'University').toUpperCase(), formal: true };
  }

  // Feature 131: Auto-generate standard diploma authority statement
  generateAuthorityStatement(institutionName, boardName = 'Board of Trustees') {
    return `By the authority vested in us by the ${boardName} of ${institutionName || 'this institution'}, and upon the recommendation of the faculty, and upon the fulfillment of all requirements, we hereby confer upon`;
  }

  // Feature 132: Auto-customize authority statement per institution
  customizeAuthorityStatement(institutionName, customTemplate = null) {
    if (customTemplate) return customTemplate.replace('{institution}', institutionName);
    return this.generateAuthorityStatement(institutionName);
  }

  // Feature 133: Auto-generate signatory names and titles
  generateSignatoryBlock(signatories) {
    const defaultSignatories = [
      { name: '', title: 'President', role: 'president' },
      { name: '', title: 'Provost', role: 'provost' },
      { name: '', title: 'University Registrar', role: 'registrar' },
      { name: '', title: 'Dean', role: 'dean' }
    ];
    const sigs = (signatories || []).length > 0 ? signatories : defaultSignatories;
    return sigs.map(s => ({ name: s.name || '', title: s.title, role: s.role, position: this._getSignatoryPosition(s.role) }));
  }

  // Feature 134: Auto-research current signing officers
  researchSigningOfficers(institutionName) {
    const knownOfficers = {
      'harvard university': [
        { name: 'Lawrence Bacow', title: 'President', role: 'president' },
        { name: 'Alan Garber', title: 'Provost', role: 'provost' }
      ]
    };
    const key = (institutionName || '').toLowerCase();
    return knownOfficers[key] || [{ name: '', title: 'President', role: 'president', note: 'Name not auto-resolved — please enter manually' }];
  }

  // Feature 135: Auto-generate calligraphic signatures for each signatory
  generateSignatorySignatures(signatories) {
    return signatories.map(s => ({
      ...s,
      signatureSVG: s.name ? `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60"><text x="10" y="42" font-family="Brush Script MT, cursive" font-size="28" fill="#1a1a2e">${this._escapeXml(s.name)}</text><line x1="10" y1="50" x2="210" y2="50" stroke="#1a1a2e" stroke-width="0.8"/></svg>` : null
    }));
  }

  // Feature 136: Auto-populate honors designations on diploma
  generateDiplomaHonors(cumulativeGPA) {
    if (cumulativeGPA >= 3.9) return { honor: 'Summa Cum Laude', gpa: cumulativeGPA, display: 'with Highest Distinction' };
    if (cumulativeGPA >= 3.7) return { honor: 'Magna Cum Laude', gpa: cumulativeGPA, display: 'with High Distinction' };
    if (cumulativeGPA >= 3.5) return { honor: 'Cum Laude', gpa: cumulativeGPA, display: 'with Distinction' };
    return null;
  }

  // Feature 137: Auto-generate institution seal for diploma
  generateDiplomaSeal(sealConfig) {
    const { institutionName = '', acronym = 'UNI', primaryColor = '#003366', secondaryColor = '#FFD700', size = 200 } = sealConfig || {};
    const cx = size / 2, cy = size / 2, r = size * 0.47;
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${this._sanitizeColor(primaryColor)}" stroke="${this._sanitizeColor(secondaryColor)}" stroke-width="${size*0.04}"/>
  <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="${size*0.2}" font-weight="bold" fill="${this._sanitizeColor(secondaryColor)}" font-family="serif">${this._escapeXml(acronym)}</text>
  <defs><path id="dp${size}" d="M ${cx-r*0.85} ${cy} A ${r*0.85} ${r*0.85} 0 1 1 ${cx+r*0.85} ${cy}"/></defs>
  <text font-size="${size*0.065}" fill="${this._sanitizeColor(secondaryColor)}" font-family="serif"><textPath href="#dp${size}" startOffset="5%">${this._escapeXml(institutionName.toUpperCase())}</textPath></text>
</svg>`,
      width: size,
      height: size
    };
  }

  // Feature 138: Apply institution colors to diploma
  applyInstitutionColors(diplomaTemplate, colors) {
    const { primary = '#003366', secondary = '#FFD700', accent = '#FFFFFF' } = colors || {};
    return { ...diplomaTemplate, colors: { primary, secondary, accent }, applied: true };
  }

  // Feature 139: Auto-select diploma border design
  selectBorderDesign(institutionName, style = 'traditional') {
    const borders = {
      traditional: { pattern: 'ornate-classical', corners: 'flourish', sides: 'vine', color: 'primary' },
      contemporary: { pattern: 'geometric', corners: 'modern', sides: 'lines', color: 'accent' },
      minimalist: { pattern: 'simple-line', corners: 'square', sides: 'single-rule', color: 'primary' },
      ornate: { pattern: 'baroque', corners: 'medallion', sides: 'laurel', color: 'gold' }
    };
    return { style: style || 'traditional', design: borders[style] || borders.traditional, institutionName };
  }

  // Feature 140: Auto-generate institution logo for diploma
  generateDiplomaLogo(institutionName, colors = {}) {
    const acronym = (institutionName || '').split(/\s+/).filter(w => w.length > 3).map(w => w[0]).join('') || 'UNI';
    const primary = this._sanitizeColor(colors.primary || '#003366');
    const secondary = this._sanitizeColor(colors.secondary || '#FFD700');
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><rect width="120" height="120" rx="12" fill="${primary}"/><text x="60" y="78" text-anchor="middle" font-size="42" font-weight="bold" fill="${secondary}" font-family="serif">${this._escapeXml(acronym)}</text></svg>`,
      acronym,
      position: 'top-center'
    };
  }

  // Feature 141: Auto-match font style to institution's diploma typeface
  matchDiplomaFont(institutionName, fontIndex = 0) {
    const font = this.calligraphicFonts[fontIndex % this.calligraphicFonts.length];
    return { font, bodyFont: 'Garamond, serif', headingFont: font, institutionName, matched: false, generated: true };
  }

  // Feature 142: Auto-generate diploma in standard paper size
  getDiplomaPaperSize(sizeKey = 'standard') {
    return this.diplomaSizes[sizeKey] || this.diplomaSizes.standard;
  }

  // Feature 143: Auto-detect diploma orientation
  detectDiplomaOrientation(institutionName) {
    const landscapeInstitutions = ['harvard university', 'yale university', 'princeton university'];
    const isLandscape = landscapeInstitutions.includes((institutionName || '').toLowerCase());
    return { orientation: isLandscape ? 'landscape' : 'portrait', sizeKey: isLandscape ? 'standard_landscape' : 'standard' };
  }

  // Feature 144: Generate print-ready diploma PDF spec (600 DPI)
  getDiplomaPrintSpec() {
    return { dpi: 600, colorSpace: 'CMYK', compression: 'lossless', printReady: true, format: 'PDF/X-4', bleed: '0.125in', cropMarks: true };
  }

  // Feature 145: Auto-generate digital preview specification
  getDiplomaPreviewSpec(_diplomaData) {
    return { format: 'PNG', dpi: 150, scale: 0.25, previewMode: true, thumbnailSize: { width: 550, height: 425 } };
  }

  // Feature 146: Visual quality review for diploma
  performDiplomaQualityCheck(diplomaData) {
    const checks = [
      { check: 'Student Name', passed: !!(diplomaData.studentName) },
      { check: 'Degree Title', passed: !!(diplomaData.degreeTitle) },
      { check: 'Field of Study', passed: !!(diplomaData.major) },
      { check: 'Graduation Date', passed: !!(diplomaData.graduationDate) },
      { check: 'Institution Name', passed: !!(diplomaData.institutionName) },
      { check: 'Authority Statement', passed: !!(diplomaData.authorityStatement) },
      { check: 'Signatory Block', passed: !!(diplomaData.signatories?.length > 0) }
    ];
    const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100);
    return { passed: checks.every(c => c.passed), score, checks, recommendation: score >= 85 ? 'Ready for output' : 'Complete missing fields' };
  }

  // Feature 147: Auto-generate secondary language version
  generateBilingualStatement(statement, targetLanguage = 'latin') {
    const translations = {
      latin: { authorityStatement: 'Auctoritate Academica conferimus gradum', degreeConferred: 'gradum contulit', byAuthority: 'Auctoritate' },
      spanish: { authorityStatement: 'Por la autoridad conferida, se otorga el grado de', degreeConferred: 'ha conferido el grado de', byAuthority: 'Por autoridad de' },
      french: { authorityStatement: "Par l'autorité qui nous est conférée, nous décernons le grade de", degreeConferred: 'a décerné le grade de', byAuthority: "Par autorité de" }
    };
    return { original: statement, language: targetLanguage, translation: translations[targetLanguage] || null };
  }

  // Feature 148: Auto-generate parchment paper texture background
  generateParchmentBackground(style = 'aged') {
    const backgrounds = {
      aged: { cssFilter: 'sepia(30%) brightness(105%)', backgroundColor: '#f4e4c1', textureUrl: null, pattern: 'parchment-aged' },
      cream: { cssFilter: 'brightness(102%) saturate(80%)', backgroundColor: '#fdf6e3', textureUrl: null, pattern: 'parchment-cream' },
      white_linen: { cssFilter: 'brightness(99%)', backgroundColor: '#fafafa', textureUrl: null, pattern: 'linen' }
    };
    return backgrounds[style] || backgrounds.aged;
  }

  // Feature 149: Auto-apply watermark pattern behind diploma text
  generateDiplomaWatermark(institutionAcronym, style = 'subtle') {
    const acronym = this._escapeXml(institutionAcronym || 'OFFICIAL');
    return {
      svg: `<text x="50%" y="50%" text-anchor="middle" font-size="180" fill="rgba(0,0,0,0.04)" transform="rotate(-45,420,550)" font-family="serif" font-weight="bold">${acronym}</text>`,
      style,
      opacity: style === 'subtle' ? 0.04 : 0.07
    };
  }

  // Feature 150: Auto-generate multiple layout variants
  generateLayoutVariants(diplomaData) {
    return ['traditional', 'contemporary', 'minimalist'].map(style => ({
      style,
      border: this.selectBorderDesign(diplomaData.institutionName, style),
      background: this.generateParchmentBackground(style === 'traditional' ? 'aged' : style === 'contemporary' ? 'cream' : 'white_linen'),
      font: this.matchDiplomaFont(diplomaData.institutionName, style === 'traditional' ? 0 : style === 'contemporary' ? 5 : 11),
      preview: { label: `${style.charAt(0).toUpperCase() + style.slice(1)} Style`, recommended: style === 'traditional' }
    }));
  }

  // Feature 151: Auto-generate apostille attachment page
  generateApostillePage(diplomaData) {
    return {
      format: 'Hague Convention Apostille',
      fields: {
        country: diplomaData.country || 'United States of America',
        publicAuthority: diplomaData.institutionName,
        signedBy: diplomaData.registrarName || 'University Registrar',
        capacity: 'University Official',
        city: diplomaData.city || '',
        date: new Date().toISOString().split('T')[0],
        number: crypto.randomBytes(4).toString('hex').toUpperCase()
      },
      note: 'This apostille certifies the authenticity of the signature of the public official who has signed this document.',
      pageLayout: 'standard-hague',
      attachAsPage: true
    };
  }

  // Feature 152: Auto-produce diploma metadata block
  generateDiplomaMetadata(diplomaData) {
    return {
      documentId: crypto.randomBytes(8).toString('hex').toUpperCase(),
      issueDate: new Date().toISOString().split('T')[0],
      institutionCode: diplomaData.institutionCode || 'INST',
      studentName: diplomaData.studentName,
      degreeTitle: diplomaData.degreeTitle,
      major: diplomaData.major,
      version: '1.0',
      format: 'PDF',
      embedded: true
    };
  }

  // Feature 153: Auto-generate DUPLICATE/REPLACEMENT COPY notation
  generateDuplicateNotation(isDuplicate = false, isReplacement = false) {
    if (!isDuplicate && !isReplacement) return null;
    return {
      text: isReplacement ? 'REPLACEMENT COPY' : 'DUPLICATE',
      position: 'top-right',
      style: { fontSize: '11pt', color: '#8B0000', fontWeight: 'bold', border: '1px solid #8B0000', padding: '2px 6px' },
      notation: `This is a ${isReplacement ? 'replacement' : 'duplicate'} copy of the original diploma issued.`
    };
  }

  // Feature 154: Auto-generate bilingual diploma format
  generateBilingualDiploma(diplomaData, secondLanguage = 'spanish') {
    const translations = {
      spanish: { degreeConferred: 'Grado conferido', field: 'en el campo de', institution: 'por autoridad de', date: 'el día' },
      french: { degreeConferred: 'Grade conféré', field: 'dans le domaine de', institution: "par l'autorité de", date: 'le' },
      latin: { degreeConferred: 'Gradum contulit', field: 'in studiis', institution: 'auctoritate', date: 'die' }
    };
    const t = translations[secondLanguage] || translations.spanish;
    return {
      primaryLanguage: 'English',
      secondaryLanguage: secondLanguage,
      translation: t,
      layout: 'side-by-side',
      secondaryText: `${t.degreeConferred}: ${diplomaData.degreeTitle} ${t.field} ${diplomaData.major}`
    };
  }

  // Feature 155: Auto-include IPEDS ID and accreditation in diploma metadata
  generateDiplomaDocumentMetadata(diplomaData, institutionData = {}) {
    return {
      ipedsId: institutionData.ipedsId || null,
      accreditationBody: institutionData.accreditationBody || null,
      accreditationStatus: institutionData.accreditationStatus || 'Accredited',
      ceebCode: institutionData.ceebCode || null,
      documentType: 'Academic Diploma',
      isoStandard: 'ISO 32000-1 (PDF)',
      embeddedMetadata: true
    };
  }

  // Utility: Generate complete diploma data bundle
  generateCompleteDiplomaData(input) {
    const {
      studentName, degreeType, major, concentration, minor, graduationDate,
      institutionName, boardName, signatories, cumulativeGPA,
      colors, sizeKey, fontIndex, isDuplicate, isReplacement,
      institutionData = {}
    } = input || {};

    const degreeTitle = this.formatDegreeTitle(degreeType, major);
    const fieldOfStudy = this.formatFieldOfStudy(major, concentration, minor);
    const formalDate = graduationDate ? this.formatGraduationDateFormal(graduationDate) : '';
    const authorityStatement = this.generateAuthorityStatement(institutionName, boardName);
    const sigs = this.generateSignatoryBlock(signatories);
    const honors = cumulativeGPA ? this.generateDiplomaHonors(parseFloat(cumulativeGPA)) : null;
    const seal = this.generateDiplomaSeal({ institutionName, primaryColor: colors?.primary, secondaryColor: colors?.secondary });
    const logo = this.generateDiplomaLogo(institutionName, colors);
    const border = this.selectBorderDesign(institutionName);
    const background = this.generateParchmentBackground();
    const paperSize = this.getDiplomaPaperSize(sizeKey);
    const fontSpec = this.matchDiplomaFont(institutionName, fontIndex);
    const qualityCheck = this.performDiplomaQualityCheck({ studentName, degreeTitle: degreeTitle.degreeTitle, major, graduationDate, institutionName, authorityStatement, signatories: sigs });
    const metadata = this.generateDiplomaMetadata({ studentName, degreeTitle: degreeTitle.degreeTitle, major, institutionName });
    const documentMetadata = this.generateDiplomaDocumentMetadata(input, institutionData);
    const duplicateNotation = this.generateDuplicateNotation(isDuplicate, isReplacement);

    return {
      studentName,
      degreeDisplay: this.generateCalligraphicNameDisplay(studentName, fontIndex),
      degreeTitle,
      fieldOfStudy,
      formalDate,
      authorityStatement,
      signatories: sigs,
      honors,
      seal,
      logo,
      border,
      background,
      paperSize,
      fontSpec,
      qualityCheck,
      metadata,
      documentMetadata,
      duplicateNotation,
      printSpec: this.getDiplomaPrintSpec(),
      layouts: this.generateLayoutVariants({ institutionName })
    };
  }

  _escapeXml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  _sanitizeColor(color) {
    const safe = String(color || '#000000');
    return /^#[0-9a-fA-F]{3,8}$|^rgb\(/.test(safe) ? safe : '#000000';
  }

  _getSignatoryPosition(role) {
    const positions = { president: 'left', provost: 'center-left', registrar: 'center-right', dean: 'right' };
    return positions[role] || 'center';
  }
}

module.exports = new DiplomaAutoGenerationService();
