const designSystemService = require('../services/designSystemService');
const DesignThemeModel = require('../models/designThemeModel');

/**
 * Design System Controller
 * Handles all 10 Category 4 enhancement endpoints
 */

/**
 * Feature 1: Get all themes (15 presets + custom)
 */
exports.getThemes = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { includePublic = 'true' } = req.query;

    const themes = await designSystemService.getAllThemes(
      userId,
      includePublic === 'true'
    );

    res.json({
      themes,
      total: themes.length,
      presets: themes.filter(t => t.category === 'preset').length,
      custom: themes.filter(t => t.category === 'custom').length
    });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Failed to retrieve themes' });
  }
};

/**
 * Feature 1: Get preset themes
 */
exports.getPresetThemes = async (req, res) => {
  try {
    const presets = await designSystemService.getPresetThemes();

    res.json({
      presets,
      count: presets.length
    });
  } catch (error) {
    console.error('Get preset themes error:', error);
    res.status(500).json({ error: 'Failed to retrieve preset themes' });
  }
};

/**
 * Feature 1: Create custom theme
 */
exports.createTheme = async (req, res) => {
  try {
    const userId = req.user.userId;
    const themeData = req.body;

    const theme = await designSystemService.createCustomTheme(userId, themeData);

    res.status(201).json({
      message: 'Theme created successfully',
      theme
    });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Failed to create theme' });
  }
};

/**
 * Feature 1: Apply theme to design
 */
exports.applyTheme = async (req, res) => {
  try {
    const { themeId } = req.params;
    const targetData = req.body;

    const result = await designSystemService.applyTheme(themeId, targetData);

    res.json({
      message: 'Theme applied successfully',
      design: result
    });
  } catch (error) {
    console.error('Apply theme error:', error);
    res.status(500).json({ error: 'Failed to apply theme' });
  }
};

/**
 * Feature 2: Generate color palette from base color
 */
exports.generateColorPalette = async (req, res) => {
  try {
    const { baseColor } = req.body;
    const options = {
      paletteType: req.body.paletteType || 'complementary',
      colorCount: req.body.colorCount || 5,
      includeTints: req.body.includeTints !== false,
      includeShades: req.body.includeShades !== false
    };

    const palette = await designSystemService.generateColorPalette(baseColor, options);

    // Optionally save to database
    if (req.body.save && req.user) {
      await DesignThemeModel.createColorPalette({
        name: req.body.name || `Palette ${Date.now()}`,
        user_id: req.user.userId,
        colors: palette.colors,
        palette_type: palette.paletteType,
        source: 'generated',
        ...palette
      });
    }

    res.json({
      palette,
      message: 'Color palette generated successfully'
    });
  } catch (error) {
    console.error('Generate color palette error:', error);
    res.status(500).json({ error: 'Failed to generate color palette' });
  }
};

/**
 * Feature 2: Get saved color palettes
 */
exports.getColorPalettes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const palettes = await DesignThemeModel.getColorPalettes(userId);

    res.json({
      palettes,
      count: palettes.length
    });
  } catch (error) {
    console.error('Get color palettes error:', error);
    res.status(500).json({ error: 'Failed to retrieve color palettes' });
  }
};

/**
 * Feature 3: Get design gallery
 */
exports.getDesignGallery = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const filters = {
      style: req.query.style,
      colorScheme: req.query.colorScheme,
      category: req.query.category
    };

    const gallery = await designSystemService.getDesignGallery(userId, filters);

    res.json({
      gallery,
      filters: filters
    });
  } catch (error) {
    console.error('Get design gallery error:', error);
    res.status(500).json({ error: 'Failed to retrieve design gallery' });
  }
};

/**
 * Feature 4: Generate responsive previews
 */
exports.getResponsivePreviews = async (req, res) => {
  try {
    const designData = req.body;

    const previews = await designSystemService.generateResponsivePreviews(designData);

    res.json({
      previews: previews.previews,
      currentSize: previews.currentSize,
      message: 'Responsive previews generated'
    });
  } catch (error) {
    console.error('Get responsive previews error:', error);
    res.status(500).json({ error: 'Failed to generate responsive previews' });
  }
};

/**
 * Feature 5: Generate 3D preview configuration
 */
exports.get3DPreviewConfig = async (req, res) => {
  try {
    const designData = req.body;

    const config = designSystemService.generate3DPreviewConfig(designData);

    res.json({
      config,
      message: '3D preview configuration generated',
      note: 'Use this config with Three.js on the client side'
    });
  } catch (error) {
    console.error('Get 3D preview config error:', error);
    res.status(500).json({ error: 'Failed to generate 3D preview config' });
  }
};

/**
 * Feature 6: Generate print specifications
 */
exports.generatePrintSpec = async (req, res) => {
  try {
    const designData = req.body;

    const spec = await designSystemService.generatePrintSpec(designData);

    res.json({
      specification: spec,
      message: 'Print specification generated successfully'
    });
  } catch (error) {
    console.error('Generate print spec error:', error);
    res.status(500).json({ error: 'Failed to generate print specification' });
  }
};

/**
 * Feature 6: Get print specification
 */
exports.getPrintSpec = async (req, res) => {
  try {
    const { designId, designType } = req.params;

    const spec = await DesignThemeModel.getPrintSpec(designId, designType);

    if (!spec) {
      return res.status(404).json({ error: 'Print specification not found' });
    }

    res.json({
      specification: spec
    });
  } catch (error) {
    console.error('Get print spec error:', error);
    res.status(500).json({ error: 'Failed to retrieve print specification' });
  }
};

/**
 * Feature 7: Export design
 */
exports.exportDesign = async (req, res) => {
  try {
    const { designId, designType } = req.params;

    const exported = await designSystemService.exportDesign(designId, designType);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.json);
  } catch (error) {
    console.error('Export design error:', error);
    res.status(500).json({ error: 'Failed to export design' });
  }
};

/**
 * Feature 7: Import design
 */
exports.importDesign = async (req, res) => {
  try {
    const userId = req.user.userId;
    const importData = req.body;

    const design = await designSystemService.importDesign(importData, userId);

    res.json({
      message: 'Design imported successfully',
      design
    });
  } catch (error) {
    console.error('Import design error:', error);
    res.status(500).json({ 
      error: 'Failed to import design',
      details: error.message
    });
  }
};

/**
 * Feature 8: Save brand guidelines
 */
exports.saveBrandGuidelines = async (req, res) => {
  try {
    const userId = req.user.userId;
    const guidelinesData = {
      ...req.body,
      user_id: userId
    };

    const guidelines = await DesignThemeModel.saveBrandGuidelines(guidelinesData);

    res.status(201).json({
      message: 'Brand guidelines saved successfully',
      guidelines
    });
  } catch (error) {
    console.error('Save brand guidelines error:', error);
    res.status(500).json({ error: 'Failed to save brand guidelines' });
  }
};

/**
 * Feature 8: Get brand guidelines
 */
exports.getBrandGuidelines = async (req, res) => {
  try {
    const userId = req.user.userId;

    const guidelines = await DesignThemeModel.getBrandGuidelines(userId);

    res.json({
      guidelines,
      count: guidelines.length
    });
  } catch (error) {
    console.error('Get brand guidelines error:', error);
    res.status(500).json({ error: 'Failed to retrieve brand guidelines' });
  }
};

/**
 * Feature 8: Apply brand guidelines to design
 */
exports.applyBrandGuidelines = async (req, res) => {
  try {
    const { guidelinesId } = req.params;
    const designData = req.body;

    const result = await designSystemService.applyBrandGuidelines(designData, guidelinesId);

    res.json({
      message: 'Brand guidelines applied successfully',
      design: result
    });
  } catch (error) {
    console.error('Apply brand guidelines error:', error);
    res.status(500).json({ error: 'Failed to apply brand guidelines' });
  }
};

/**
 * Feature 9: Check accessibility
 */
exports.checkAccessibility = async (req, res) => {
  try {
    const designData = req.body;

    const audit = await designSystemService.checkAccessibility(designData);

    res.json({
      audit,
      compliant: audit.wcag_level !== 'A',
      message: `WCAG ${audit.wcag_level} compliance ${audit.wcag_level === 'AAA' ? 'achieved' : 'checked'}`
    });
  } catch (error) {
    console.error('Check accessibility error:', error);
    res.status(500).json({ error: 'Failed to check accessibility' });
  }
};

/**
 * Feature 9: Get accessibility audits
 */
exports.getAccessibilityAudits = async (req, res) => {
  try {
    const { designId, designType } = req.params;

    const audits = await DesignThemeModel.getAccessibilityAudits(designId, designType);

    res.json({
      audits,
      count: audits.length,
      latest: audits[0] || null
    });
  } catch (error) {
    console.error('Get accessibility audits error:', error);
    res.status(500).json({ error: 'Failed to retrieve accessibility audits' });
  }
};

/**
 * Feature 10: Save design version
 */
exports.saveVersion = async (req, res) => {
  try {
    const { designId, designType } = req.params;
    const { designData, changesDescription } = req.body;
    const userId = req.user.userId;

    const version = await designSystemService.saveDesignVersion(
      designId,
      designType,
      designData,
      userId,
      changesDescription
    );

    res.status(201).json({
      message: 'Design version saved successfully',
      version
    });
  } catch (error) {
    console.error('Save version error:', error);
    res.status(500).json({ error: 'Failed to save design version' });
  }
};

/**
 * Feature 10: Get design history
 */
exports.getDesignHistory = async (req, res) => {
  try {
    const { designId, designType } = req.params;

    const history = await designSystemService.getDesignHistory(designId, designType);

    res.json({
      history,
      versions: history.length,
      latest: history[0] || null
    });
  } catch (error) {
    console.error('Get design history error:', error);
    res.status(500).json({ error: 'Failed to retrieve design history' });
  }
};

/**
 * Feature 10: Restore version
 */
exports.restoreVersion = async (req, res) => {
  try {
    const { designId, designType, versionNumber } = req.params;
    const userId = req.user.userId;

    const restoredData = await designSystemService.restoreVersion(
      parseInt(designId),
      designType,
      parseInt(versionNumber),
      userId
    );

    res.json({
      message: `Version ${versionNumber} restored successfully`,
      design: restoredData
    });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
};

/**
 * Feature 10: Compare versions
 */
exports.compareVersions = async (req, res) => {
  try {
    const { version1, version2 } = req.body;

    const changes = await designSystemService.compareVersions(version1, version2);

    res.json({
      changes,
      count: changes.length
    });
  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({ error: 'Failed to compare versions' });
  }
};

module.exports = exports;
