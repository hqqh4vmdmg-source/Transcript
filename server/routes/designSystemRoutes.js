const express = require('express');
const router = express.Router();
const designSystemController = require('../controllers/designSystemController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * Feature 1: Theme Builder with 15 Preset Themes
 */

// Get all themes (presets + custom)
router.get('/themes', designSystemController.getThemes);

// Get preset themes only
router.get('/themes/presets', designSystemController.getPresetThemes);

// Create custom theme
router.post('/themes', designSystemController.createTheme);

// Apply theme to design
router.post('/themes/:themeId/apply', designSystemController.applyTheme);

/**
 * Feature 2: Color Palette Generator
 */

// Generate color palette from base color
router.post('/colors/generate', designSystemController.generateColorPalette);

// Get saved color palettes
router.get('/colors/palettes', designSystemController.getColorPalettes);

/**
 * Feature 3: Design Preview Gallery
 */

// Get design gallery with filters
router.get('/gallery', designSystemController.getDesignGallery);

/**
 * Feature 4: Responsive Preview (Multiple Sizes)
 */

// Get responsive previews
router.post('/preview/responsive', designSystemController.getResponsivePreviews);

/**
 * Feature 5: 3D Realistic Diploma Preview
 */

// Get 3D preview configuration
router.post('/preview/3d', designSystemController.get3DPreviewConfig);

/**
 * Feature 6: Print Specification Generator
 */

// Generate print specifications
router.post('/print/spec', designSystemController.generatePrintSpec);

// Get print specification for design
router.get('/print/spec/:designType/:designId', designSystemController.getPrintSpec);

/**
 * Feature 7: Design Export/Import
 */

// Export design as JSON
router.get('/export/:designType/:designId', designSystemController.exportDesign);

// Import design from JSON
router.post('/import', designSystemController.importDesign);

/**
 * Feature 8: Brand Guidelines Integration
 */

// Save brand guidelines
router.post('/brand-guidelines', designSystemController.saveBrandGuidelines);

// Get brand guidelines
router.get('/brand-guidelines', designSystemController.getBrandGuidelines);

// Apply brand guidelines to design
router.post('/brand-guidelines/:guidelinesId/apply', designSystemController.applyBrandGuidelines);

/**
 * Feature 9: Accessibility Checker (WCAG 2.1 AA/AAA)
 */

// Check accessibility of design
router.post('/accessibility/check', designSystemController.checkAccessibility);

// Get accessibility audits for design
router.get('/accessibility/audits/:designType/:designId', designSystemController.getAccessibilityAudits);

/**
 * Feature 10: Design History/Versions
 */

// Save design version
router.post('/versions/:designType/:designId', designSystemController.saveVersion);

// Get design history
router.get('/versions/:designType/:designId', designSystemController.getDesignHistory);

// Restore specific version
router.post('/versions/:designType/:designId/restore/:versionNumber', designSystemController.restoreVersion);

// Compare two versions
router.post('/versions/compare', designSystemController.compareVersions);

module.exports = router;
