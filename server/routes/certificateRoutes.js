const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * Certificate collection routes
 */

// Create certificate
router.post('/', certificateController.createCertificate);

// Get all user certificates
router.get('/', certificateController.getCertificates);

/**
 * Template Routes (must be before /:id to avoid shadowing)
 */

// Get all templates
router.get('/templates/all', certificateController.getTemplates);

// Get specific template
router.get('/templates/:id', certificateController.getTemplate);

/**
 * Design Elements Routes
 */

// Get design elements
router.get('/design/elements', certificateController.getDesignElements);

/**
 * Signature Routes
 */

// Create signature
router.post('/signatures', certificateController.createSignature);

// Get user signatures
router.get('/signatures/all', certificateController.getSignatures);

// Update signature
router.put('/signatures/:id', certificateController.updateSignature);

// Delete signature
router.delete('/signatures/:id', certificateController.deleteSignature);

/**
 * GPA Category Diploma Routes (must be before /:id to avoid shadowing)
 */

// Get available GPA categories
router.get('/gpa-categories', certificateController.getGPACategories);

// Get editable diploma template for category
router.get('/diploma/template/:category', certificateController.getDiplomaTemplate);

// Generate diploma for specific GPA category
router.post('/diploma/category/:category', certificateController.generateDiplomaForCategory);

// Preview diploma without saving
router.post('/diploma/preview', certificateController.previewDiploma);

/**
 * Single-certificate routes (generic /:id must come after all specific named routes)
 */

// Get specific certificate
router.get('/:id', certificateController.getCertificate);

// Download certificate PDF
router.get('/:id/pdf', certificateController.downloadCertificatePDF);

// Update certificate
router.put('/:id', certificateController.updateCertificate);

// Delete certificate
router.delete('/:id', certificateController.deleteCertificate);

module.exports = router;
