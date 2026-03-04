import axios from 'axios';

const API_URL = '/api/academic';

const academicService = {
  // ─── Category A: Transcript Auto-Generation (Features 1–30) ───────────────

  /** Generate a complete transcript data bundle from student input */
  generateTranscript: (token, studentData) =>
    axios.post(`${API_URL}/transcript/generate`, studentData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Build organized course history from terms and courses */
  generateCourseHistory: (token, data) =>
    axios.post(`${API_URL}/transcript/course-history`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate academic term labels for a given calendar type and start year */
  generateTermLabels: (token, calendarType, startYear, numTerms) =>
    axios.post(`${API_URL}/transcript/term-labels`, { calendarType, startYear, numTerms }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a unique transcript serial/reference number */
  generateSerialNumber: (token, institutionCode) =>
    axios.post(`${API_URL}/transcript/serial-number`, { institutionCode }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate the transcript legend/key explaining grading symbols */
  generateTranscriptLegend: (token, scaleType, calendarType) =>
    axios.post(`${API_URL}/transcript/legend`, { scaleType, calendarType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Calculate pagination for multi-page transcripts */
  calculatePagination: (token, courses, coursesPerPage) =>
    axios.post(`${API_URL}/transcript/pagination`, { courses, coursesPerPage }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category B: GPA Automation (Features 31–50) ─────────────────────────

  /** Calculate GPA for a single academic term */
  calculateTermGPA: (token, courses, scaleType) =>
    axios.post(`${API_URL}/gpa/term`, { courses, scaleType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Calculate overall cumulative GPA across all terms */
  calculateCumulativeGPA: (token, courses, scaleType) =>
    axios.post(`${API_URL}/gpa/cumulative`, { courses, scaleType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a full GPA report including summary table, standing, and progress */
  generateGPAReport: (token, terms, options) =>
    axios.post(`${API_URL}/gpa/report`, { terms, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate the GPA summary table (term-by-term with running cumulative) */
  generateGPASummaryTable: (token, terms, scaleType) =>
    axios.post(`${API_URL}/gpa/summary-table`, { terms, scaleType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate grade distribution summary (count of A's, B's, etc.) */
  generateGradeDistribution: (token, courses) =>
    axios.post(`${API_URL}/gpa/distribution`, { courses }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Calculate degree progress (credits earned vs required) */
  calculateDegreeProgress: (token, creditsEarned, creditsRequired) =>
    axios.post(`${API_URL}/gpa/degree-progress`, { creditsEarned, creditsRequired }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Calculate major GPA for a specific department */
  calculateMajorGPA: (token, courses, majorDepartment, scaleType) =>
    axios.post(`${API_URL}/gpa/major`, { courses, majorDepartment, scaleType }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Convert a GPA from one scale to the standard 4.0 scale */
  convertGPAScale: (token, gpa, fromScale) =>
    axios.post(`${API_URL}/gpa/convert`, { gpa, fromScale }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category C: Transfer Credits & Academic Honors (Features 51–65) ─────

  /** Generate the transfer credit section for a transcript */
  generateTransferSection: (token, courses) =>
    axios.post(`${API_URL}/transfer/section`, { courses }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get the transfer credit data entry form schema */
  getTransferCreditFormSchema: (token) =>
    axios.post(`${API_URL}/transfer/form-schema`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate term honors (Dean's List, President's List) */
  generateTermHonors: (token, termGPA, termCredits, policy) =>
    axios.post(`${API_URL}/transfer/honors/term`, { termGPA, termCredits, policy }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate graduation honors designation (Cum Laude, etc.) */
  generateGraduationHonors: (token, cumulativeGPA, institutionKey) =>
    axios.post(`${API_URL}/transfer/honors/graduation`, { cumulativeGPA, institutionKey }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate complete honors and transfer summary */
  generateHonorsSummary: (token, studentData) =>
    axios.post(`${API_URL}/transfer/summary`, studentData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category D: Institution Research & Branding (Features 66–90) ────────

  /** Get the full institution profile (auto-researched) */
  getInstitutionProfile: (token, name, forceRefresh = false) =>
    axios.get(`${API_URL}/institution/profile`, {
      params: { name, forceRefresh },
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get institution official color palette */
  getInstitutionColors: (token, name) =>
    axios.get(`${API_URL}/institution/colors`, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get institution seal SVG */
  getInstitutionSeal: (token, name) =>
    axios.get(`${API_URL}/institution/seal`, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text'
    }).then(r => r.data),

  /** Get institution logo SVG */
  getInstitutionLogo: (token, name) =>
    axios.get(`${API_URL}/institution/logo`, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'text'
    }).then(r => r.data),

  /** Get institution header block for transcript */
  getInstitutionHeader: (token, name) =>
    axios.get(`${API_URL}/institution/header`, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Refresh institution data cache */
  refreshInstitutionData: (token, name) =>
    axios.post(`${API_URL}/institution/refresh`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category E: Transcript Layout & Paper Quality (Features 91–110) ─────

  /** Generate the complete layout configuration for a transcript */
  generateLayoutConfig: (token, transcriptData, options) =>
    axios.post(`${API_URL}/layout/config`, { transcriptData, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Paginate a transcript's terms and courses across pages */
  paginateTranscript: (token, terms, coursesPerPage) =>
    axios.post(`${API_URL}/layout/paginate`, { terms, coursesPerPage }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Run visual quality check on transcript data */
  performLayoutQualityCheck: (token, transcriptData) =>
    axios.post(`${API_URL}/layout/quality-check`, transcriptData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a watermark for the transcript (VOID/SAMPLE/etc.) */
  generateWatermark: (token, text, visible, options) =>
    axios.post(`${API_URL}/layout/watermark`, { text, visible, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get typography specification for a transcript section */
  getTypographySpec: (token, section) =>
    axios.get(`${API_URL}/layout/typography`, {
      params: { section },
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category F: Registrar Signature & Seal Automation (Features 111–125) ─

  /** Generate an institution seal */
  generateSeal: (token, sealData) =>
    axios.post(`${API_URL}/seal/generate`, sealData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a calligraphic registrar signature */
  generateCalligraphicSignature: (token, name, style) =>
    axios.post(`${API_URL}/seal/signature`, { name, style }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a unique verification code for the transcript */
  generateVerificationCode: (token, prefix) =>
    axios.post(`${API_URL}/seal/verification-code`, { prefix }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate a QR code linking to the verification page */
  generateQRCode: (token, verificationCode, baseUrl) =>
    axios.post(`${API_URL}/seal/qr-code`, { verificationCode, baseUrl }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate the official certification statement */
  generateCertificationStatement: (token, institutionName, registrarName) =>
    axios.post(`${API_URL}/seal/certification`, { institutionName, registrarName }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate the complete seal and signature package */
  generateSealPackage: (token, packageData) =>
    axios.post(`${API_URL}/seal/package`, packageData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category G: Diploma Auto-Generation Core (Features 126–155) ─────────

  /** Generate a complete diploma data bundle */
  generateDiploma: (token, diplomaInput) =>
    axios.post(`${API_URL}/diploma/generate`, diplomaInput, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Format a degree title (e.g., "Bachelor of Science in Computer Science") */
  formatDegreeTitle: (token, degreeType, major) =>
    axios.post(`${API_URL}/diploma/degree-title`, { degreeType, major }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Format graduation date in formal written-out style */
  formatGraduationDateFormal: (token, date) =>
    axios.post(`${API_URL}/diploma/formal-date`, { date }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate or customize the diploma authority statement */
  generateAuthorityStatement: (token, institutionName, customTemplate) =>
    axios.post(`${API_URL}/diploma/authority-statement`, { institutionName, customTemplate }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Determine honors designation for diploma (Cum Laude, etc.) */
  generateDiplomaHonors: (token, cumulativeGPA) =>
    axios.post(`${API_URL}/diploma/honors`, { cumulativeGPA }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate multiple diploma layout variants (traditional/contemporary/minimalist) */
  generateDiplomaLayouts: (token, diplomaData) =>
    axios.post(`${API_URL}/diploma/layouts`, diplomaData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate an apostille attachment page for international use */
  generateApostille: (token, diplomaData) =>
    axios.post(`${API_URL}/diploma/apostille`, diplomaData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Run visual quality check on diploma data before output */
  performDiplomaQualityCheck: (token, diplomaData) =>
    axios.post(`${API_URL}/diploma/quality-check`, diplomaData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category H: Diploma Design, Embossing & Finishing (Features 156–170) ─

  /** Generate the complete finishing package for a diploma */
  generateFinishingPackage: (token, diplomaData, options) =>
    axios.post(`${API_URL}/diploma/finishing/package`, { diplomaData, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate gold foil simulation overlay spec */
  generateGoldFoilOverlay: (token, elements, options) =>
    axios.post(`${API_URL}/diploma/finishing/gold-foil`, { elements, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate frame-ready print and matting specifications */
  generateFrameSpec: (token, diplomaSize, matColor) =>
    axios.post(`${API_URL}/diploma/finishing/frame-spec`, { diplomaSize, matColor }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate digital certificate of authenticity */
  generateCertificateOfAuthenticity: (token, diplomaData) =>
    axios.post(`${API_URL}/diploma/finishing/certificate-of-authenticity`, diplomaData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate shipping label for diploma packaging */
  generateShippingLabel: (token, recipientData, diplomaData) =>
    axios.post(`${API_URL}/diploma/finishing/shipping-label`, { recipientData, diplomaData }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category I: Data Input Forms & Generation Toggles (Features 171–185) ─

  /** Generate the smart intake form pre-populated from institution name */
  generateSmartIntakeForm: (token, institutionName) =>
    axios.post(`${API_URL}/forms/intake`, { institutionName }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get the transfer credit data entry form */
  getTransferCreditEntryForm: (token) =>
    axios.get(`${API_URL}/forms/transfer-credits`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get the academic honors entry form */
  getAcademicHonorsForm: (token) =>
    axios.get(`${API_URL}/forms/honors`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get the diploma signatory entry form */
  getDiplomaSignatoryForm: (token) =>
    axios.get(`${API_URL}/forms/signatories`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Apply all generation toggles to base options */
  applyToggles: (token, baseOptions, toggleState) =>
    axios.post(`${API_URL}/toggles/apply`, { baseOptions, toggleState }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get the default toggle state */
  getDefaultToggles: (token) =>
    axios.get(`${API_URL}/toggles/defaults`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // ─── Category J: Export, Print & Delivery Automation (Features 186–200) ──

  /** Generate the complete export package specification */
  generateExportPackage: (token, options) =>
    axios.post(`${API_URL}/export/package`, options, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate batch processing manifest for multiple students */
  generateBatchManifest: (token, students) =>
    axios.post(`${API_URL}/export/batch`, { students }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate quality assurance checklist before document delivery */
  generateQAChecklist: (token, documentData) =>
    axios.post(`${API_URL}/export/qa-checklist`, documentData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Export transcript data as JSON or CSV download */
  exportTranscriptData: async (token, transcriptData, format = 'json') => {
    const response = await axios.post(`${API_URL}/export/data`, { transcriptData, format }, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    const filename = `transcript-export-${Date.now()}.${format}`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** Generate AACRAO-standard cover letter for transcript delivery */
  generateCoverLetter: (token, transcriptData, recipientData) =>
    axios.post(`${API_URL}/export/cover-letter`, { transcriptData, recipientData }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Generate delivery confirmation receipt */
  generateDeliveryReceipt: (token, deliveryData) =>
    axios.post(`${API_URL}/export/delivery-receipt`, deliveryData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Start actual batch PDF generation for multiple students */
  startBatchGeneration: (token, studentsData, options) =>
    axios.post(`${API_URL}/batch/generate`, { studentsData, options }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Get status of a running batch generation job */
  getBatchStatus: (token, jobId) =>
    axios.get(`${API_URL}/batch/status/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  /** Export transcript data as a file download (JSON/CSV) */
  downloadTranscriptExport: async (token, transcriptData, format = 'json') => {
    const response = await axios.post(`${API_URL}/export/data`, { transcriptData, format }, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    const filename = `transcript-${Date.now()}.${format}`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default academicService;
