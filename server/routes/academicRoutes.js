'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transcriptAutoGen = require('../services/transcriptAutoGenerationService');
const gpaAutomation = require('../services/gpaAutomationService');

// Rate limiter for batch generation (resource-intensive)
const batchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  message: { success: false, error: 'Too many batch requests, please try again later.' }
});

// Rate limiter for general export/import routes
const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

// Category A routes - Transcript Auto-Generation (Features 1-30)
router.post('/transcript/generate', authMiddleware, async (req, res) => {
  try {
    const data = transcriptAutoGen.generateFullTranscriptData(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transcript/course-history', authMiddleware, async (req, res) => {
  try {
    const history = transcriptAutoGen.generateCourseHistory(req.body);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transcript/term-labels', authMiddleware, async (req, res) => {
  try {
    const { calendarType, startYear, numTerms } = req.body;
    const labels = transcriptAutoGen.generateTermLabels(calendarType || 'semester', parseInt(startYear) || 2020, parseInt(numTerms) || 8);
    res.json({ success: true, labels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transcript/serial-number', authMiddleware, async (req, res) => {
  try {
    const { institutionCode } = req.body;
    const serial = transcriptAutoGen.generateSerialNumber(institutionCode);
    res.json({ success: true, serialNumber: serial });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transcript/legend', authMiddleware, async (req, res) => {
  try {
    const { scaleType, calendarType } = req.body;
    const legend = transcriptAutoGen.generateTranscriptLegend(scaleType, calendarType);
    res.json({ success: true, legend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transcript/pagination', authMiddleware, async (req, res) => {
  try {
    const { courses, coursesPerPage } = req.body;
    const pagination = transcriptAutoGen.calculatePagination(courses || [], coursesPerPage);
    res.json({ success: true, pagination });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category B routes - GPA Automation (Features 31-50)
router.post('/gpa/term', authMiddleware, async (req, res) => {
  try {
    const { courses, scaleType } = req.body;
    const gpa = gpaAutomation.calculateTermGPA(courses || [], scaleType);
    res.json({ success: true, termGPA: gpaAutomation.formatGPA(gpa, 3) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/cumulative', authMiddleware, async (req, res) => {
  try {
    const { courses, scaleType } = req.body;
    const gpa = gpaAutomation.calculateCumulativeGPA(courses || [], scaleType);
    res.json({ success: true, cumulativeGPA: gpaAutomation.formatGPA(gpa, 3) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/report', authMiddleware, async (req, res) => {
  try {
    const { terms, options } = req.body;
    const report = gpaAutomation.generateFullGPAReport(terms || [], options || {});
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/summary-table', authMiddleware, async (req, res) => {
  try {
    const { terms, scaleType } = req.body;
    const table = gpaAutomation.generateGPASummaryTable(terms || [], scaleType);
    res.json({ success: true, table });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/distribution', authMiddleware, async (req, res) => {
  try {
    const { courses } = req.body;
    const distribution = gpaAutomation.generateGradeDistribution(courses || []);
    res.json({ success: true, distribution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/degree-progress', authMiddleware, async (req, res) => {
  try {
    const { creditsEarned, creditsRequired } = req.body;
    const progress = gpaAutomation.calculateDegreeProgress(parseFloat(creditsEarned) || 0, parseFloat(creditsRequired) || 120);
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/major', authMiddleware, async (req, res) => {
  try {
    const { courses, majorDepartment, scaleType } = req.body;
    const majorGPA = gpaAutomation.calculateMajorGPA(courses || [], majorDepartment, scaleType);
    res.json({ success: true, majorGPA });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/gpa/convert', authMiddleware, async (req, res) => {
  try {
    const { gpa, fromScale } = req.body;
    const converted = gpaAutomation.convertToStandard4Scale(parseFloat(gpa) || 0, fromScale);
    res.json({ success: true, convertedGPA: converted, scale: '4.0' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category C routes - Transfer Credits & Academic Honors (Features 51-65)
router.post('/transfer/section', authMiddleware, async (req, res) => {
  try {
    const transferCredits = require('../services/transferCreditsService');
    const section = transferCredits.generateTransferSection(req.body.courses || []);
    res.json({ success: true, section });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transfer/form-schema', authMiddleware, async (req, res) => {
  try {
    const transferCredits = require('../services/transferCreditsService');
    res.json({ success: true, schema: transferCredits.getTransferCreditFormSchema() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transfer/honors/term', authMiddleware, async (req, res) => {
  try {
    const transferCredits = require('../services/transferCreditsService');
    const { termGPA, termCredits, policy } = req.body;
    const honors = transferCredits.generateTermHonors(parseFloat(termGPA) || 0, parseFloat(termCredits) || 0, policy || {});
    res.json({ success: true, honors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transfer/honors/graduation', authMiddleware, async (req, res) => {
  try {
    const transferCredits = require('../services/transferCreditsService');
    const { cumulativeGPA, institutionKey } = req.body;
    const honor = transferCredits.generateGraduationHonors(parseFloat(cumulativeGPA) || 0, institutionKey);
    res.json({ success: true, honor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/transfer/summary', authMiddleware, async (req, res) => {
  try {
    const transferCredits = require('../services/transferCreditsService');
    const summary = transferCredits.generateCompleteHonorsSummary(req.body);
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category D routes - Institution Research & Branding (Features 66-90)
router.get('/institution/profile', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name, forceRefresh } = req.query;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    const profile = institutionResearch.getCachedInstitutionData(name, forceRefresh === 'true');
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/institution/colors', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    res.json({ success: true, colors: institutionResearch.getInstitutionColors(name) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/institution/seal', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    const svg = institutionResearch.generateInstitutionSeal(name);
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/institution/logo', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    const svg = institutionResearch.generateInstitutionLogo(name);
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/institution/header', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    const header = institutionResearch.generateSchoolHeader(name);
    res.json({ success: true, header });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/institution/refresh', authMiddleware, async (req, res) => {
  try {
    const institutionResearch = require('../services/institutionResearchService');
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Institution name required' });
    const result = institutionResearch.refreshInstitutionData(name);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category E routes - Transcript Layout & Paper Quality (Features 91-110)
router.post('/layout/config', authMiddleware, async (req, res) => {
  try {
    const transcriptLayout = require('../services/transcriptLayoutService');
    const { transcriptData, options } = req.body;
    const config = transcriptLayout.generateCompleteLayoutConfig(transcriptData || {}, options || {});
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/layout/paginate', authMiddleware, async (req, res) => {
  try {
    const transcriptLayout = require('../services/transcriptLayoutService');
    const { terms, coursesPerPage } = req.body;
    const pagination = transcriptLayout.paginateTranscript(terms || [], coursesPerPage);
    res.json({ success: true, pagination });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/layout/quality-check', authMiddleware, async (req, res) => {
  try {
    const transcriptLayout = require('../services/transcriptLayoutService');
    const check = transcriptLayout.performVisualQualityCheck(req.body);
    res.json({ success: true, check });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/layout/watermark', authMiddleware, async (req, res) => {
  try {
    const transcriptLayout = require('../services/transcriptLayoutService');
    const { text, visible, options } = req.body;
    const watermark = transcriptLayout.generateWatermark(text, visible !== false, options || {});
    res.json({ success: true, watermark });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/layout/typography', authMiddleware, async (req, res) => {
  try {
    const transcriptLayout = require('../services/transcriptLayoutService');
    const { section } = req.query;
    const typography = transcriptLayout.getTypographySpec(section || 'courseRow');
    res.json({ success: true, typography });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category F routes - Registrar Signature & Seal Automation (Features 111-125)
router.post('/seal/generate', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const seal = registrarSeal.generateInstitutionSeal(req.body);
    res.json({ success: true, seal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seal/signature', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const { name, style } = req.body;
    const signature = registrarSeal.generateCalligraphicSignature(name, style);
    res.json({ success: true, signature });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seal/verification-code', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const { prefix } = req.body;
    const code = registrarSeal.generateVerificationCode(prefix);
    res.json({ success: true, code });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seal/qr-code', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const { verificationCode, baseUrl } = req.body;
    const qr = await registrarSeal.generateVerificationQRCode(verificationCode, baseUrl);
    res.json({ success: true, qr });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seal/certification', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const { institutionName, registrarName } = req.body;
    const certification = registrarSeal.generateCertificationStatement(institutionName, registrarName);
    res.json({ success: true, certification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/seal/package', authMiddleware, async (req, res) => {
  try {
    const registrarSeal = require('../services/registrarSealService');
    const pkg = await registrarSeal.generateCompleteSealPackage(req.body);
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category G routes - Diploma Auto-Generation Core (Features 126-155)
router.post('/diploma/generate', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const data = diplomaAutoGen.generateCompleteDiplomaData(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/degree-title', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const { degreeType, major } = req.body;
    const title = diplomaAutoGen.formatDegreeTitle(degreeType, major);
    res.json({ success: true, title });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/formal-date', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const { date } = req.body;
    const formalDate = diplomaAutoGen.formatGraduationDateFormal(date);
    res.json({ success: true, formalDate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/authority-statement', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const { institutionName, customTemplate } = req.body;
    const statement = diplomaAutoGen.customizeAuthorityStatement(institutionName, customTemplate);
    res.json({ success: true, statement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/honors', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const { cumulativeGPA } = req.body;
    const honors = diplomaAutoGen.generateDiplomaHonors(parseFloat(cumulativeGPA) || 0);
    res.json({ success: true, honors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/layouts', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const variants = diplomaAutoGen.generateLayoutVariants(req.body);
    res.json({ success: true, variants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/apostille', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const apostille = diplomaAutoGen.generateApostillePage(req.body);
    res.json({ success: true, apostille });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/quality-check', authMiddleware, async (req, res) => {
  try {
    const diplomaAutoGen = require('../services/diplomaAutoGenerationService');
    const check = diplomaAutoGen.performDiplomaQualityCheck(req.body);
    res.json({ success: true, check });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category H routes - Diploma Design, Embossing & Finishing (Features 156-170)
router.post('/diploma/finishing/package', authMiddleware, async (req, res) => {
  try {
    const diplomaFinishing = require('../services/diplomaFinishingService');
    const { diplomaData, options } = req.body;
    const pkg = diplomaFinishing.generateCompleteFinishingPackage(diplomaData || {}, options || {});
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/finishing/gold-foil', authMiddleware, async (req, res) => {
  try {
    const diplomaFinishing = require('../services/diplomaFinishingService');
    const { elements, options } = req.body;
    const foil = diplomaFinishing.generateGoldFoilOverlay(elements, options || {});
    res.json({ success: true, foil });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/finishing/frame-spec', authMiddleware, async (req, res) => {
  try {
    const diplomaFinishing = require('../services/diplomaFinishingService');
    const { diplomaSize, matColor } = req.body;
    const frameSpec = diplomaFinishing.generateFrameSpec(diplomaSize || 'standard');
    const mattingSpec = diplomaFinishing.generateMattingSpec(diplomaSize || 'standard', matColor || 'cream');
    res.json({ success: true, frameSpec, mattingSpec });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/finishing/certificate-of-authenticity', authMiddleware, async (req, res) => {
  try {
    const diplomaFinishing = require('../services/diplomaFinishingService');
    const coa = diplomaFinishing.generateCertificateOfAuthenticity(req.body);
    res.json({ success: true, certificateOfAuthenticity: coa });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/diploma/finishing/shipping-label', authMiddleware, async (req, res) => {
  try {
    const diplomaFinishing = require('../services/diplomaFinishingService');
    const { recipientData, diplomaData } = req.body;
    const label = diplomaFinishing.generateShippingLabel(recipientData || {}, diplomaData || {});
    res.json({ success: true, label });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category I routes - Data Input Forms & Generation Toggles (Features 171-185)
router.post('/forms/intake', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const { institutionName } = req.body;
    const form = generationToggles.generateSmartIntakeForm(institutionName || '');
    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/forms/transfer-credits', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const form = generationToggles.getTransferCreditEntryForm();
    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/forms/honors', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const form = generationToggles.getAcademicHonorsEntryForm();
    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/forms/signatories', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const form = generationToggles.getDiplomaSignatoryForm();
    res.json({ success: true, form });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/toggles/apply', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const { baseOptions, toggleState } = req.body;
    const options = generationToggles.applyAllToggles(baseOptions || {}, toggleState || {});
    res.json({ success: true, options });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/toggles/defaults', authMiddleware, async (req, res) => {
  try {
    const generationToggles = require('../services/generationTogglesService');
    const defaults = generationToggles.getToggleState();
    res.json({ success: true, defaults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Category J routes - Export, Print & Delivery Automation (Features 186-200)
router.post('/export/package', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const pkg = exportDelivery.generateCompleteExportPackage(req.body);
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/export/batch', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const { students } = req.body;
    const manifest = exportDelivery.generateBatchProcessingManifest(students || []);
    res.json({ success: true, manifest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/export/qa-checklist', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const checklist = exportDelivery.generateQualityAssuranceChecklist(req.body);
    res.json({ success: true, checklist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/export/data', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const { transcriptData, format } = req.body;
    const exported = exportDelivery.exportTranscriptData(transcriptData || {}, format || 'json');
    res.set('Content-Type', exported.contentType);
    res.set('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.content);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/export/cover-letter', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const { transcriptData, recipientData } = req.body;
    const letter = exportDelivery.generateAACRAOCoverLetter(transcriptData || {}, recipientData || {});
    res.json({ success: true, coverLetter: letter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/export/delivery-receipt', authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const receipt = exportDelivery.generateDeliveryReceipt(req.body);
    res.json({ success: true, receipt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Batch Processing routes - actual bulk generation (Feature 199)
router.post('/batch/generate', batchLimiter, authMiddleware, async (req, res) => {
  try {
    const batchProcessing = require('../services/batchProcessingService');
    const { studentsData, options } = req.body;
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ success: false, error: 'studentsData array is required' });
    }
    const result = await batchProcessing.batchGenerateTranscripts(req.user.userId, studentsData, options || {});
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/batch/status/:jobId', exportLimiter, authMiddleware, async (req, res) => {
  try {
    const batchProcessing = require('../services/batchProcessingService');
    const status = batchProcessing.getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ success: false, error: 'Batch job not found' });
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Transcript data import routes (Features 198-199)
router.post('/import/json', exportLimiter, authMiddleware, async (req, res) => {
  try {
    const exportDelivery = require('../services/exportDeliveryService');
    const { transcriptData, format } = req.body;
    const exported = exportDelivery.exportTranscriptData(transcriptData || {}, format || 'json');
    res.set('Content-Type', exported.contentType);
    res.set('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.content);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
