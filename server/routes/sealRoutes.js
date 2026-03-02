const express = require('express');
const router = express.Router();
const sealController = require('../controllers/sealController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @route   GET /api/seals/verify/:verification_code
 * @desc    Verify seal using verification code
 * @access  Public (no auth required for verification)
 */
router.get('/verify/:verification_code', sealController.verifySeal);

// All routes below require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/seals
 * @desc    Create a new official seal
 * @access  Private
 */
router.post('/', upload.single('seal_image'), sealController.createSeal);

/**
 * @route   GET /api/seals
 * @desc    Get all active seals
 * @access  Private
 */
router.get('/', sealController.getAllSeals);

/**
 * @route   GET /api/seals/type/:type
 * @desc    Get seals by type
 * @access  Private
 */
router.get('/type/:type', sealController.getSealsByType);

/**
 * @route   GET /api/seals/:id/stats
 * @desc    Get seal usage statistics
 * @access  Private
 */
router.get('/:id/stats', sealController.getSealStats);

/**
 * @route   GET /api/seals/:id/download
 * @desc    Download seal image
 * @access  Private
 */
router.get('/:id/download', sealController.downloadSealImage);

/**
 * @route   GET /api/seals/:id
 * @desc    Get seal by ID
 * @access  Private
 */
router.get('/:id', sealController.getSealById);

/**
 * @route   PUT /api/seals/:id
 * @desc    Update seal
 * @access  Private
 */
router.put('/:id', upload.single('seal_image'), sealController.updateSeal);

/**
 * @route   DELETE /api/seals/:id
 * @desc    Delete seal (soft delete)
 * @access  Private
 */
router.delete('/:id', sealController.deleteSeal);

module.exports = router;
