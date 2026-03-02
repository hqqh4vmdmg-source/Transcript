const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/generator/seal
 * @desc    Generate a seal programmatically
 * @access  Private
 */
router.post('/seal', generatorController.generateSeal);

/**
 * @route   GET /api/generator/categories
 * @desc    Get available GPA categories
 * @access  Private
 */
router.get('/categories', generatorController.getCategories);

/**
 * @route   POST /api/generator/category/:category
 * @desc    Generate transcript by category (failed, 2.5, or 3.74)
 * @access  Private
 */
router.post('/category/:category', generatorController.generateByCategory);

/**
 * @route   POST /api/generator/category/failed
 * @desc    Generate failed grades category transcript
 * @access  Private
 */
router.post('/failed', generatorController.generateFailedCategory);

/**
 * @route   POST /api/generator/2.5
 * @desc    Generate 2.5 GPA category transcript
 * @access  Private
 */
router.post('/2.5', generatorController.generate25Category);

/**
 * @route   POST /api/generator/3.74
 * @desc    Generate 3.74 GPA category transcript
 * @access  Private
 */
router.post('/3.74', generatorController.generate374Category);

module.exports = router;
