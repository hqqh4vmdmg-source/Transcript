'use strict';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Transcript Layout & Paper Quality Service
 * Category E: Features 91-110
 */
class TranscriptLayoutService {
  constructor() {
    this.paperSizes = {
      'us_letter': { width: '8.5in', height: '11in', widthPx: 816, heightPx: 1056, bleed: '0.125in' },
      'a4': { width: '210mm', height: '297mm', widthPx: 794, heightPx: 1123, bleed: '3mm' },
      'legal': { width: '8.5in', height: '14in', widthPx: 816, heightPx: 1344, bleed: '0.125in' }
    };

    this.margins = {
      standard: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
      narrow: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
      wide: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    };

    this.fontSizes = {
      header: { institution: '18pt', title: '14pt', subtitle: '12pt' },
      body: { courseName: '9pt', grade: '9pt', credits: '9pt', termLabel: '10pt' },
      footer: { certification: '8pt', pageNum: '8pt' }
    };
  }

  // Feature 91: Auto-select and apply standard transcript layout
  selectTranscriptLayout(institutionName, options = {}) {
    return {
      layout: 'standard',
      institution: institutionName,
      columns: ['courseNumber', 'courseName', 'creditHours', 'grade', 'qualityPoints'],
      sectionOrder: ['header', 'studentInfo', 'courseHistory', 'gpaTable', 'honors', 'signature', 'certification'],
      columnWidths: { courseNumber: '12%', courseName: '45%', creditHours: '12%', grade: '12%', qualityPoints: '19%' },
      options
    };
  }

  // Feature 92: Auto-generate multi-column course listing format
  generateCourseListingFormat(courses) {
    return {
      columns: [
        { key: 'courseNumber', label: 'Course', width: '12%', align: 'left' },
        { key: 'courseName', label: 'Course Title', width: '43%', align: 'left' },
        { key: 'creditHours', label: 'Credits', width: '10%', align: 'center' },
        { key: 'grade', label: 'Grade', width: '10%', align: 'center' },
        { key: 'qualityPoints', label: 'Quality Points', width: '15%', align: 'center' },
        { key: 'notation', label: 'Notes', width: '10%', align: 'left' }
      ],
      rows: courses.map(c => ({
        courseNumber: c.courseNumber || c.code || '',
        courseName: c.courseName || c.name || '',
        creditHours: c.creditHours || c.credits || '',
        grade: c.displayGrade || c.grade || '',
        qualityPoints: c.qualityPoints !== undefined ? c.qualityPoints : '',
        notation: c.notation || ''
      }))
    };
  }

  // Feature 93: Apply correct font sizes and line spacing per section
  getTypographySpec(section = 'body') {
    const specs = {
      institutionName: { fontSize: '18pt', fontWeight: 'bold', lineHeight: '1.2', fontFamily: 'Garamond, serif', textAlign: 'center' },
      transcriptTitle: { fontSize: '13pt', fontWeight: 'bold', lineHeight: '1.3', fontFamily: 'Garamond, serif', textAlign: 'center' },
      studentInfo: { fontSize: '10pt', fontWeight: 'normal', lineHeight: '1.4', fontFamily: 'Times New Roman, serif' },
      termHeader: { fontSize: '11pt', fontWeight: 'bold', lineHeight: '1.3', fontFamily: 'Times New Roman, serif', background: '#f0f0f0' },
      courseRow: { fontSize: '9pt', fontWeight: 'normal', lineHeight: '1.5', fontFamily: 'Times New Roman, serif' },
      gpaRow: { fontSize: '9pt', fontWeight: 'bold', lineHeight: '1.5', fontFamily: 'Times New Roman, serif' },
      certification: { fontSize: '8pt', fontWeight: 'normal', lineHeight: '1.4', fontFamily: 'Times New Roman, serif', textAlign: 'center' }
    };
    return specs[section] || specs.courseRow;
  }

  // Feature 94: Auto-generate header, body, footer zones
  generateLayoutZones(paperSize = 'us_letter') {
    return {
      header: { height: '2.5in', zones: ['institutionLogo', 'institutionName', 'transcriptTitle', 'studentInfo'] },
      body: { height: '7.5in', zones: ['courseHistory', 'gpaTable', 'transferCredits', 'honors'] },
      footer: { height: '1in', zones: ['certification', 'registrarSignature', 'pageNumber'] },
      paperSize: this.paperSizes[paperSize] || this.paperSizes.us_letter
    };
  }

  // Feature 95: Auto-apply page margins for standard transcript paper
  getPageMargins(marginStyle = 'standard') {
    return this.margins[marginStyle] || this.margins.standard;
  }

  // Feature 96: Generate horizontal/vertical rule lines between sections
  generateSectionDividers(sections = []) {
    return sections.map((section, i) => ({
      afterSection: section,
      borderTop: '1px solid #000',
      borderBottom: i === sections.length - 1 ? '2px solid #000' : 'none',
      paddingTop: '4px',
      paddingBottom: '4px'
    }));
  }

  // Feature 97: Auto-paginate multi-term transcripts with header repetition
  paginateTranscript(terms, coursesPerPage = 20, includeHeaderOnEachPage = true) {
    const pages = [];
    let currentPage = { pageNumber: 1, terms: [], courseCount: 0 };
    
    for (const term of terms) {
      const termCourses = term.courses || [];
      if (currentPage.courseCount + termCourses.length > coursesPerPage && currentPage.courseCount > 0) {
        pages.push({ ...currentPage });
        currentPage = { pageNumber: pages.length + 1, terms: [], courseCount: 0 };
      }
      currentPage.terms.push(term);
      currentPage.courseCount += termCourses.length;
    }
    if (currentPage.terms.length > 0) pages.push(currentPage);
    
    return { pages, totalPages: pages.length, includeHeaderOnEachPage };
  }

  // Feature 98: Auto-apply security background pattern (guilloché simulation)
  generateSecurityPattern(style = 'guilloche') {
    const patterns = {
      guilloche: `<pattern id="sec" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q5 0 10 10 Q15 20 20 10" stroke="#e8e8e8" stroke-width="0.5" fill="none"/></pattern>`,
      microtext: `<pattern id="sec" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse"><text font-size="4" fill="#ebebeb" font-family="monospace">OFFICIAL TRANSCRIPT </text></pattern>`,
      crosshatch: `<pattern id="sec" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="10" y2="10" stroke="#eee" stroke-width="0.3"/><line x1="10" y1="0" x2="0" y2="10" stroke="#eee" stroke-width="0.3"/></pattern>`
    };
    return { svgPattern: patterns[style] || patterns.guilloche, style, fillRef: 'url(#sec)' };
  }

  // Feature 99: Auto-generate VOID/SAMPLE watermark toggle
  generateWatermark(text = 'SAMPLE', visible = true, options = {}) {
    if (!visible) return null;
    const safeText = escapeXml(text);
    return {
      text,
      fontSize: options.fontSize || '100px',
      color: options.color || 'rgba(200,0,0,0.12)',
      angle: options.angle || -45,
      position: 'center',
      svgElement: `<text x="50%" y="50%" text-anchor="middle" font-size="100" fill="rgba(200,0,0,0.12)" transform="rotate(-45,400,530)" font-family="Arial" font-weight="bold" opacity="0.12">${safeText}</text>`
    };
  }

  // Feature 100: Paper stock specifications for 24lb bond/security paper
  getPaperStockSpec(type = 'security') {
    const specs = {
      security: { weight: '24 lb bond', brightness: 90, colorFast: true, watermarkReady: true, description: 'Security transcript paper, 24 lb bond, chemically sensitized' },
      standard: { weight: '20 lb bond', brightness: 92, colorFast: false, description: 'Standard bond paper, 20 lb' },
      premium: { weight: '28 lb bond', brightness: 96, colorFast: true, description: 'Premium white bond, 28 lb, cotton content' }
    };
    return specs[type] || specs.security;
  }

  // Feature 101: Auto-generate print-ready PDF at 300 DPI
  getPDFPrintSpec(quality = 'standard') {
    return {
      dpi: quality === 'premium' ? 600 : 300,
      colorSpace: 'sRGB',
      compression: 'lossless',
      metadata: { title: 'Official Academic Transcript', subject: 'Academic Record', creator: 'Transcript Generator' },
      printReady: true
    };
  }

  // Feature 102: CMYK vs RGB color mode specification
  getColorModeSpec(outputMode = 'digital') {
    return outputMode === 'print'
      ? { mode: 'CMYK', profile: 'US Web Coated (SWOP) v2', blackpoint: true }
      : { mode: 'RGB', profile: 'sRGB IEC61966-2.1', blackpoint: false };
  }

  // Feature 103: Generate digital preview rendering specification
  generatePreviewSpec(transcriptData) {
    return {
      format: 'PNG',
      dpi: 150,
      scale: 0.5,
      pages: transcriptData.pagination?.totalPages || 1,
      previewMode: true,
      thumbnailSize: { width: 400, height: 516 }
    };
  }

  // Feature 104: Auto-apply bleed and crop marks
  generateBleedSpec(paperSize = 'us_letter') {
    const size = this.paperSizes[paperSize] || this.paperSizes.us_letter;
    return {
      bleed: size.bleed,
      cropMarks: true,
      registrationMarks: true,
      colorBars: false,
      trimBox: { width: size.width, height: size.height },
      bleedBox: `${size.width} + 2×${size.bleed}`
    };
  }

  // Feature 105: Generate clean digital copy without crop marks
  generateDigitalCopySpec() {
    return {
      cropMarks: false,
      bleed: 'none',
      colorSpace: 'RGB',
      compression: 'standard',
      optimizedForEmail: true,
      maxFileSizeMB: 5
    };
  }

  // Feature 106: Auto-scale elements for non-standard paper sizes
  scaleForPaperSize(elements, targetSize = 'a4') {
    const baseSize = this.paperSizes.us_letter;
    const target = this.paperSizes[targetSize] || this.paperSizes.us_letter;
    const scaleX = target.widthPx / baseSize.widthPx;
    const scaleY = target.heightPx / baseSize.heightPx;
    return elements.map(el => ({ ...el, scaledWidth: el.width ? el.width * scaleX : undefined, scaledHeight: el.height ? el.height * scaleY : undefined, scale: { x: scaleX, y: scaleY } }));
  }

  // Feature 107: Auto-generate envelope address block
  generateEnvelopeAddressBlock(recipientAddress, returnAddress) {
    return {
      returnAddress: { lines: [returnAddress?.name, returnAddress?.street, `${returnAddress?.city}, ${returnAddress?.state} ${returnAddress?.zip}`].filter(Boolean), style: { fontSize: '10pt', position: 'top-left' } },
      recipientAddress: { lines: [recipientAddress?.name, recipientAddress?.street, `${recipientAddress?.city}, ${recipientAddress?.state} ${recipientAddress?.zip}`].filter(Boolean), style: { fontSize: '12pt', position: 'center' } },
      envelopeSize: '9x12'
    };
  }

  // Feature 108: Auto-apply OFFICIAL TRANSCRIPT / STUDENT COPY label
  generateTranscriptLabel(type = 'official', position = 'header') {
    const labels = { official: 'OFFICIAL TRANSCRIPT', student: 'STUDENT COPY — NOT OFFICIAL', unofficial: 'UNOFFICIAL TRANSCRIPT' };
    return { text: labels[type] || labels.official, position, style: { fontSize: '11pt', fontWeight: 'bold', border: '1px solid #000', padding: '4px 8px', display: 'inline-block' } };
  }

  // Feature 109: Visual quality check for official appearance
  performVisualQualityCheck(transcriptData) {
    const checks = [
      { check: 'Institution Name', passed: !!(transcriptData.institutionInfo?.name || transcriptData.studentInfo?.schoolName) },
      { check: 'Student Name', passed: !!(transcriptData.studentInfo?.fullName) },
      { check: 'Course History', passed: !!(transcriptData.academicRecord?.courses?.length > 0) },
      { check: 'GPA Data', passed: transcriptData.gpa !== undefined || !!(transcriptData.gpaReport) },
      { check: 'Issue Date', passed: !!(transcriptData.documentInfo?.issueDate) },
      { check: 'Serial Number', passed: !!(transcriptData.documentInfo?.serialNumber) }
    ];
    const passed = checks.every(c => c.passed);
    const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100);
    return { passed, score, checks, recommendation: passed ? 'Ready for output' : 'Please complete missing fields' };
  }

  // Feature 110: Side-by-side comparison preview
  generateComparisonPreview(generated, reference) {
    return {
      generated: { sections: Object.keys(generated || {}), completeness: this.performVisualQualityCheck(generated).score },
      reference: { sections: Object.keys(reference || {}), source: 'Reference Template' },
      differences: [],
      comparisonReady: true
    };
  }

  // Utility: Generate complete layout configuration
  generateCompleteLayoutConfig(transcriptData, options = {}) {
    const { paperSize = 'us_letter', outputMode = 'digital', marginStyle = 'standard', includeWatermark = false, watermarkText = 'SAMPLE', includeBleed = false, securityPattern = false } = options;
    return {
      layout: this.selectTranscriptLayout(transcriptData?.institutionInfo?.name, options),
      zones: this.generateLayoutZones(paperSize),
      typography: { header: this.getTypographySpec('institutionName'), body: this.getTypographySpec('courseRow'), footer: this.getTypographySpec('certification') },
      margins: this.getPageMargins(marginStyle),
      colorMode: this.getColorModeSpec(outputMode),
      printSpec: this.getPDFPrintSpec(outputMode === 'print' ? 'premium' : 'standard'),
      paperSpec: this.getPaperStockSpec(options.paperType || 'security'),
      watermark: includeWatermark ? this.generateWatermark(watermarkText) : null,
      securityPattern: securityPattern ? this.generateSecurityPattern() : null,
      bleedSpec: includeBleed ? this.generateBleedSpec(paperSize) : null,
      label: this.generateTranscriptLabel(options.labelType || 'official'),
      qualityCheck: this.performVisualQualityCheck(transcriptData)
    };
  }
}

module.exports = new TranscriptLayoutService();
