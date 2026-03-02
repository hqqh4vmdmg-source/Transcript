const express = require('express');
const { body } = require('express-validator');
const transcriptController = require('../controllers/transcriptController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const transcriptValidation = [
  body('type')
    .isIn(['high_school', 'college'])
    .withMessage('Type must be either "high_school" or "college"'),
  body('data')
    .isObject()
    .withMessage('Data must be a valid object')
];

// Routes
router.post('/', transcriptValidation, transcriptController.createTranscript);
router.get('/', transcriptController.getTranscripts);
router.get('/:id', transcriptController.getTranscript);
router.put('/:id', transcriptValidation, transcriptController.updateTranscript);
router.delete('/:id', transcriptController.deleteTranscript);
router.post('/:id/duplicate', transcriptController.duplicateTranscript);
router.get('/:id/pdf', transcriptController.generatePDF);

module.exports = router;
