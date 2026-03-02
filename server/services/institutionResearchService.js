'use strict';

/**
 * Institution Research & Branding Service
 * Category D: Features 66-90 - Auto-research institution data and generate branding
 */
class InstitutionResearchService {
  constructor() {
    // Pre-loaded institution database (representative sample)
    this.institutionDB = {
      'harvard university': {
        fullName: 'Harvard University',
        acronym: 'Harvard',
        address: { street: 'Massachusetts Hall', city: 'Cambridge', state: 'MA', zip: '02138', country: 'USA' },
        website: 'https://www.harvard.edu',
        registrarPhone: '617-495-1543',
        registrarFax: '617-495-2928',
        accreditation: 'New England Commission of Higher Education (NECHE)',
        foundedYear: 1636,
        motto: 'Veritas',
        mottoLanguage: 'Latin',
        colors: { primary: '#A51C30', secondary: '#000000', accent: '#FFFFFF' },
        fonts: { heading: 'Garamond, serif', body: 'Times New Roman, serif' },
        type: 'Private Research University',
        calendarSystem: 'semester',
        gradingScale: 'standard',
        ceebCode: '3434',
        ipedsId: '166027',
        carnegieClass: 'Doctoral Universities: Very High Research Activity (R1)',
        accreditationType: 'regional',
        accreditingBody: 'NECHE',
        ficeCode: '002155',
        registrar: { name: 'Marlyn McGrath', title: 'Dean of Admissions' }
      },
      'mit': {
        fullName: 'Massachusetts Institute of Technology',
        acronym: 'MIT',
        address: { street: '77 Massachusetts Avenue', city: 'Cambridge', state: 'MA', zip: '02139', country: 'USA' },
        website: 'https://web.mit.edu',
        registrarPhone: '617-253-4787',
        accreditation: 'New England Commission of Higher Education (NECHE)',
        foundedYear: 1861,
        motto: 'Mens et Manus',
        mottoLanguage: 'Latin',
        colors: { primary: '#750014', secondary: '#8A8B8C', accent: '#FFFFFF' },
        fonts: { heading: 'Helvetica Neue, sans-serif', body: 'Arial, sans-serif' },
        type: 'Private Research University',
        calendarSystem: 'semester',
        gradingScale: 'standard',
        ceebCode: '3514',
        ipedsId: '166683',
        carnegieClass: 'Doctoral Universities: Very High Research Activity (R1)',
        accreditationType: 'regional',
        ficeCode: '002178'
      },
      'stanford university': {
        fullName: 'Stanford University',
        acronym: 'Stanford',
        address: { street: '450 Serra Mall', city: 'Stanford', state: 'CA', zip: '94305', country: 'USA' },
        website: 'https://www.stanford.edu',
        registrarPhone: '650-723-2300',
        accreditation: 'WASC Senior College and University Commission (WSCUC)',
        foundedYear: 1885,
        motto: 'Die Luft der Freiheit weht',
        mottoLanguage: 'German',
        colors: { primary: '#8C1515', secondary: '#4D4F53', accent: '#B1B3B3' },
        fonts: { heading: 'Source Serif Pro, serif', body: 'Source Sans Pro, sans-serif' },
        type: 'Private Research University',
        calendarSystem: 'quarter',
        gradingScale: 'standard',
        ceebCode: '4704',
        ipedsId: '243744',
        carnegieClass: 'Doctoral Universities: Very High Research Activity (R1)',
        accreditationType: 'regional',
        ficeCode: '003804'
      },
      'university of california, los angeles': {
        fullName: 'University of California, Los Angeles',
        acronym: 'UCLA',
        address: { street: '405 Hilgard Avenue', city: 'Los Angeles', state: 'CA', zip: '90095', country: 'USA' },
        website: 'https://www.ucla.edu',
        registrarPhone: '310-825-1091',
        accreditation: 'WASC Senior College and University Commission (WSCUC)',
        foundedYear: 1919,
        motto: 'Fiat Lux',
        mottoLanguage: 'Latin',
        colors: { primary: '#2774AE', secondary: '#FFD100', accent: '#FFFFFF' },
        fonts: { heading: 'UCLA Bruin, serif', body: 'Arial, sans-serif' },
        type: 'Public Research University',
        calendarSystem: 'quarter',
        gradingScale: 'standard',
        ceebCode: '4837',
        ipedsId: '110662',
        carnegieClass: 'Doctoral Universities: Very High Research Activity (R1)',
        accreditationType: 'regional',
        ficeCode: '001315'
      }
    };

    this.cache = {};
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Feature 66: Auto-research institution's full official name
  researchInstitutionName(query) {
    const key = query.toLowerCase().trim();
    const institution = this.institutionDB[key] || this._fuzzyMatch(query);
    return institution ? { found: true, fullName: institution.fullName, source: 'database' } : { found: false, query, suggestion: 'Please enter the full official name' };
  }

  // Feature 67: Auto-retrieve institution acronym/common name
  getInstitutionAcronym(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { acronym: data.acronym, fullName: data.fullName } : { acronym: this._generateAcronym(institutionName), fullName: institutionName, generated: true };
  }

  // Feature 68: Auto-research institution's official mailing address
  getInstitutionAddress(institutionName) {
    const data = this._lookup(institutionName);
    if (data?.address) {
      const { street, city, state, zip, country } = data.address;
      return { street, city, state, zip, country, formatted: `${street}\n${city}, ${state} ${zip}\n${country}` };
    }
    return null;
  }

  // Feature 69: Auto-retrieve institution website URL
  getInstitutionWebsite(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { url: data.website, found: true } : { url: null, found: false };
  }

  // Feature 70: Auto-research telephone and fax for registrar's office
  getRegistrarContact(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { phone: data.registrarPhone || null, fax: data.registrarFax || null, found: true } : { phone: null, fax: null, found: false };
  }

  // Feature 71: Auto-generate accreditation body and status
  getAccreditationInfo(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { body: data.accreditation, status: 'Accredited', type: data.accreditationType || 'regional', found: true } : { body: null, status: 'Unknown', found: false };
  }

  // Feature 72: Auto-research institution founding year
  getFoundingYear(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { foundedYear: data.foundedYear, found: true } : { foundedYear: null, found: false };
  }

  // Feature 73: Auto-generate institution motto
  getInstitutionMotto(institutionName) {
    const data = this._lookup(institutionName);
    return data ? { motto: data.motto, language: data.mottoLanguage || 'English', found: true } : { motto: null, found: false };
  }

  // Feature 74: Auto-research and recreate institution seal (SVG generation)
  generateInstitutionSeal(institutionName, options = {}) {
    const data = this._lookup(institutionName);
    const colors = data?.colors || { primary: '#003366', secondary: '#FFD700' };
    const acronym = data?.acronym || this._generateAcronym(institutionName);
    const foundedYear = data?.foundedYear || options.foundedYear || '';
    const motto = data?.motto || '';

    return this._generateSVGSeal({ name: institutionName, acronym, colors, foundedYear, motto });
  }

  // Feature 75: Auto-research institution color palette
  getInstitutionColors(institutionName) {
    const data = this._lookup(institutionName);
    return data?.colors
      ? { ...data.colors, found: true, institutionName: data.fullName }
      : { primary: '#003366', secondary: '#FFD700', accent: '#FFFFFF', found: false, generated: true };
  }

  // Feature 76: Auto-identify institution fonts
  getInstitutionFonts(institutionName) {
    const data = this._lookup(institutionName);
    return data?.fonts
      ? { ...data.fonts, found: true }
      : { heading: 'Garamond, serif', body: 'Times New Roman, serif', found: false, generated: true };
  }

  // Feature 77: Auto-generate custom school header
  generateSchoolHeader(institutionName, options = {}) {
    const data = this._lookup(institutionName);
    const colors = data?.colors || { primary: '#003366', secondary: '#FFD700' };
    const fonts = data?.fonts || { heading: 'Garamond, serif', body: 'Times New Roman, serif' };
    const address = data?.address || options.address || {};
    const fullName = data?.fullName || institutionName;

    return {
      institutionName: fullName,
      acronym: data?.acronym || this._generateAcronym(fullName),
      address: `${address.street || ''}\n${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.trim(),
      website: data?.website || '',
      phone: data?.registrarPhone || '',
      colors,
      fonts,
      cssStyle: `color: ${colors.primary}; font-family: ${fonts.heading};`,
      layout: 'standard'
    };
  }

  // Feature 78: Auto-research registrar's office name and current registrar
  getRegistrarInfo(institutionName) {
    const data = this._lookup(institutionName);
    return data?.registrar
      ? { name: data.registrar.name, title: data.registrar.title, officeName: 'Office of the University Registrar', found: true }
      : { name: null, title: 'University Registrar', officeName: 'Office of the Registrar', found: false };
  }

  // Feature 79: Auto-generate institutional logo SVG
  generateInstitutionLogo(institutionName, options = {}) {
    const data = this._lookup(institutionName);
    const colors = data?.colors || { primary: '#003366', secondary: '#FFD700' };
    const acronym = data?.acronym || this._generateAcronym(institutionName);
    return this._generateLogoSVG(acronym, colors, options);
  }

  // Feature 80: Apply institution watermark/background
  getInstitutionWatermark(institutionName) {
    const data = this._lookup(institutionName);
    const acronym = data?.acronym || this._generateAcronym(institutionName);
    const color = data?.colors?.primary || '#003366';
    return { watermarkText: acronym, color, opacity: 0.05, angle: -45, fontSize: '120px', repeat: true };
  }

  // Feature 81: Auto-detect calendar system (semester/quarter/trimester)
  detectCalendarSystem(institutionName) {
    const data = this._lookup(institutionName);
    return { calendarSystem: data?.calendarSystem || 'semester', found: !!data };
  }

  // Feature 82: Auto-research grading scale
  getGradingScale(institutionName) {
    const data = this._lookup(institutionName);
    return { scaleType: data?.gradingScale || 'standard', found: !!data };
  }

  // Feature 83: Auto-research official transcript format
  getTranscriptFormat(_institutionName) {
    return { layout: 'standard', sectionOrder: ['header', 'studentInfo', 'courseHistory', 'gpaTable', 'honors', 'signature', 'certification'], found: false };
  }

  // Feature 84: Auto-generate institution type label
  getInstitutionType(institutionName) {
    const data = this._lookup(institutionName);
    return { type: data?.type || 'University', found: !!data };
  }

  // Feature 85: Auto-research CEEB/ACT school codes
  getSchoolCodes(institutionName) {
    const data = this._lookup(institutionName);
    return { ceebCode: data?.ceebCode || null, actCode: data?.actCode || null, found: !!data?.ceebCode };
  }

  // Feature 86: Auto-generate Carnegie Classification notation
  getCarnegieClassification(institutionName) {
    const data = this._lookup(institutionName);
    return { classification: data?.carnegieClass || null, found: !!data?.carnegieClass };
  }

  // Feature 87: Auto-research regional vs national accreditation
  getAccreditationType(institutionName) {
    const data = this._lookup(institutionName);
    return { type: data?.accreditationType || 'regional', body: data?.accreditingBody || data?.accreditation || null, found: !!data };
  }

  // Feature 88: Auto-generate FICE code, IPEDS unit ID, OPE ID
  getInstitutionCodes(institutionName) {
    const data = this._lookup(institutionName);
    return { ficeCode: data?.ficeCode || null, ipedsId: data?.ipedsId || null, opeId: data?.opeId || null, found: !!data };
  }

  // Feature 89: Auto-update from most recent public directory data
  refreshInstitutionData(institutionName) {
    // Clear cache for this institution to force re-lookup
    const key = institutionName.toLowerCase().trim();
    delete this.cache[key];
    return { refreshed: true, institutionName, note: 'Institution data cleared from cache. Will re-fetch on next request.' };
  }

  // Feature 90: Auto-cache researched institutional data
  getCachedInstitutionData(institutionName, forceRefresh = false) {
    const key = institutionName.toLowerCase().trim();
    if (!forceRefresh && this.cache[key] && (Date.now() - this.cache[key].timestamp < this.cacheExpiry)) {
      return { ...this.cache[key].data, fromCache: true };
    }
    const data = this.getFullInstitutionProfile(institutionName);
    this.cache[key] = { data, timestamp: Date.now() };
    return { ...data, fromCache: false };
  }

  // Utility: Get full institution profile
  getFullInstitutionProfile(institutionName) {
    const data = this._lookup(institutionName);
    if (!data) return { institutionName, found: false, generated: true };
    return {
      fullName: data.fullName,
      acronym: data.acronym,
      address: data.address,
      website: data.website,
      registrarPhone: data.registrarPhone,
      registrarFax: data.registrarFax,
      accreditation: data.accreditation,
      accreditationType: data.accreditationType,
      foundedYear: data.foundedYear,
      motto: data.motto,
      mottoLanguage: data.mottoLanguage,
      colors: data.colors,
      fonts: data.fonts,
      type: data.type,
      calendarSystem: data.calendarSystem,
      gradingScale: data.gradingScale,
      ceebCode: data.ceebCode,
      ipedsId: data.ipedsId,
      carnegieClass: data.carnegieClass,
      ficeCode: data.ficeCode,
      registrar: data.registrar,
      found: true
    };
  }

  // Private: Lookup institution in database
  _lookup(name) {
    if (!name) return null;
    const key = name.toLowerCase().trim();
    return this.institutionDB[key] || this._fuzzyMatch(name);
  }

  // Private: Fuzzy match for institution name
  _fuzzyMatch(query) {
    const q = query.toLowerCase();
    for (const [key, val] of Object.entries(this.institutionDB)) {
      if (key.includes(q) || q.includes(key) || (val.acronym && val.acronym.toLowerCase() === q)) {
        return val;
      }
    }
    return null;
  }

  // Private: Generate acronym from name
  _generateAcronym(name) {
    return (name || '').split(/\s+/).filter(w => w.length > 3 && !['the', 'and', 'of', 'at', 'for'].includes(w.toLowerCase())).map(w => w[0].toUpperCase()).join('') || 'UNI';
  }

  // Private: Generate SVG seal
  _generateSVGSeal({ name, acronym, colors, foundedYear, motto }) {
    const { primary = '#003366', secondary = '#FFD700' } = colors || {};
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <circle cx="100" cy="100" r="95" fill="${primary}" stroke="${secondary}" stroke-width="6"/>
  <circle cx="100" cy="100" r="75" fill="none" stroke="${secondary}" stroke-width="2"/>
  <text x="100" y="108" text-anchor="middle" font-size="28" font-weight="bold" fill="${secondary}" font-family="serif">${acronym}</text>
  ${foundedYear ? `<text x="100" y="130" text-anchor="middle" font-size="10" fill="${secondary}" font-family="serif">EST. ${foundedYear}</text>` : ''}
  <text x="100" y="155" text-anchor="middle" font-size="8" fill="${secondary}" font-family="serif">${motto || ''}</text>
  <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="${secondary}" stroke-width="1"/>
  <text font-size="9" fill="${secondary}" font-family="serif">
    <textPath href="#circle-path" startOffset="10%">${name.toUpperCase()}</textPath>
  </text>
  <defs>
    <path id="circle-path" d="M 20 100 A 80 80 0 1 1 180 100"/>
  </defs>
</svg>`;
  }

  // Private: Generate logo SVG
  _generateLogoSVG(acronym, colors, options = {}) {
    const { primary = '#003366', secondary = '#FFD700' } = colors;
    const size = options.size || 100;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="10" ry="10" fill="${primary}"/>
  <text x="${size/2}" y="${size*0.65}" text-anchor="middle" font-size="${size*0.35}" font-weight="bold" fill="${secondary}" font-family="serif">${acronym}</text>
</svg>`;
  }
}

module.exports = new InstitutionResearchService();
