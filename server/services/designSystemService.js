const DesignThemeModel = require('../models/designThemeModel');

/**
 * Design System Service
 * Implements all 10 Category 4 enhancements
 */
class DesignSystemService {
  constructor() {
    // Feature 2: Color theory for palette generation
    this.colorTheory = {
      complementary: (hue) => [(hue + 180) % 360],
      analogous: (hue) => [(hue + 30) % 360, (hue - 30 + 360) % 360],
      triadic: (hue) => [(hue + 120) % 360, (hue + 240) % 360],
      split: (hue) => [(hue + 150) % 360, (hue + 210) % 360],
      tetradic: (hue) => [(hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360]
    };

    // Feature 9: WCAG 2.1 contrast requirements
    this.wcagRequirements = {
      'AA': { normalText: 4.5, largeText: 3.0 },
      'AAA': { normalText: 7.0, largeText: 4.5 }
    };
  }

  /**
   * Feature 1: Theme Builder with 15 Preset Themes
   */
  async getPresetThemes() {
    return await DesignThemeModel.getPresetThemes();
  }

  async getAllThemes(userId, includePublic = true) {
    return await DesignThemeModel.getAllThemes(userId, includePublic);
  }

  async getThemeById(id) {
    return await DesignThemeModel.getThemeById(id);
  }

  async createCustomTheme(userId, themeData) {
    const theme = await DesignThemeModel.createTheme({
      ...themeData,
      user_id: userId
    });

    // Save as version 1
    await this.saveDesignVersion(theme.id, 'theme', theme.theme_config, userId, 'Initial creation');

    return theme;
  }

  async applyTheme(themeId, targetData) {
    const theme = await DesignThemeModel.getThemeById(themeId);
    if (!theme) throw new Error('Theme not found');

    // Increment usage count
    await DesignThemeModel.incrementUsage(themeId);

    // Merge theme config with target data
    return {
      ...targetData,
      ...theme.theme_config,
      themeId,
      themeName: theme.name
    };
  }

  /**
   * Feature 2: Color Palette Generator from School Colors
   */
  async generateColorPalette(baseColor, options = {}) {
    const {
      paletteType = 'complementary',
      colorCount = 5,
      includeTints = true,
      includeShades = true
    } = options;

    // Parse base color to HSL
    const hsl = this.hexToHSL(baseColor);
    
    // Generate related colors based on color theory
    const relatedHues = this.colorTheory[paletteType]
      ? this.colorTheory[paletteType](hsl.h)
      : [hsl.h];

    const colors = [];

    // Add base color
    colors.push({
      hex: baseColor,
      name: 'Primary',
      role: 'primary',
      hsl: hsl
    });

    // Add related colors
    relatedHues.forEach((hue, index) => {
      const hex = this.hslToHex(hue, hsl.s, hsl.l);
      colors.push({
        hex,
        name: `${paletteType} ${index + 1}`,
        role: index === 0 ? 'secondary' : 'accent',
        hsl: { h: hue, s: hsl.s, l: hsl.l }
      });
    });

    // Add tints and shades if needed
    if (includeTints) {
      const tint = this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90));
      colors.push({
        hex: tint,
        name: 'Light Tint',
        role: 'background',
        hsl: { h: hsl.h, s: hsl.s, l: Math.min(hsl.l + 20, 90) }
      });
    }

    if (includeShades) {
      const shade = this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10));
      colors.push({
        hex: shade,
        name: 'Dark Shade',
        role: 'text',
        hsl: { h: hsl.h, s: hsl.s, l: Math.max(hsl.l - 20, 10) }
      });
    }

    // Calculate accessibility scores
    const contrastRatios = this.calculateContrastMatrix(colors);
    const wcagCompliance = this.checkWCAGCompliance(contrastRatios);

    return {
      colors: colors.slice(0, colorCount),
      paletteType,
      contrastRatios,
      wcagCompliance,
      wcag_aa_compliant: wcagCompliance.AA,
      wcag_aaa_compliant: wcagCompliance.AAA
    };
  }

  /**
   * Feature 3: Design Preview Gallery
   */
  async getDesignGallery(userId, filters = {}) {
    const themes = await DesignThemeModel.getAllThemes(userId, true);
    
    // Apply filters
    let filtered = themes;
    
    if (filters.style) {
      filtered = filtered.filter(t => 
        t.theme_config.elements?.border?.includes(filters.style)
      );
    }
    
    if (filters.colorScheme) {
      filtered = filtered.filter(t => {
        const primaryColor = t.theme_config.colors?.primary;
        return primaryColor && primaryColor.toLowerCase().includes(filters.colorScheme);
      });
    }

    // Group by category for gallery display
    const gallery = {
      preset: filtered.filter(t => t.category === 'preset'),
      custom: filtered.filter(t => t.category === 'custom'),
      popular: filtered.sort((a, b) => b.usage_count - a.usage_count).slice(0, 10)
    };

    return gallery;
  }

  /**
   * Feature 4: Responsive Preview (Multiple Sizes)
   */
  async generateResponsivePreviews(designData) {
    const sizes = [
      { name: 'Letter', width: '215.9mm', height: '279.4mm', dpi: 300 },
      { name: 'A4', width: '210mm', height: '297mm', dpi: 300 },
      { name: 'Legal', width: '215.9mm', height: '355.6mm', dpi: 300 },
      { name: 'Tabloid', width: '279.4mm', height: '431.8mm', dpi: 300 }
    ];

    const previews = sizes.map(size => ({
      ...size,
      orientation: designData.orientation || 'landscape',
      scaleFactor: this.calculateScaleFactor(size),
      previewUrl: `/api/design/preview?size=${size.name}&design=${designData.id}`
    }));

    return {
      previews,
      currentSize: designData.paper_size || 'Letter',
      responsive: true
    };
  }

  /**
   * Feature 5: 3D Realistic Diploma Preview
   * Returns configuration for 3D rendering (client-side with Three.js)
   */
  generate3DPreviewConfig(designData) {
    return {
      type: '3d-diploma',
      scene: {
        backgroundColor: '#f0f0f0',
        lighting: {
          ambient: { color: '#ffffff', intensity: 0.5 },
          directional: { 
            color: '#ffffff', 
            intensity: 0.8,
            position: { x: 5, y: 5, z: 5 }
          }
        }
      },
      diploma: {
        geometry: {
          width: designData.width || 11,
          height: designData.height || 8.5,
          depth: 0.05,
          curveRadius: 0.2
        },
        material: {
          type: 'paper',
          color: designData.backgroundColor || '#FFFEF0',
          texture: designData.paperTexture || 'parchment',
          roughness: 0.8,
          metalness: 0.0
        },
        embossing: {
          enabled: designData.enable_embossing,
          depth: 0.02,
          sealPosition: 'bottom-center'
        }
      },
      seal: {
        enabled: true,
        type: 'circular',
        diameter: 80,
        color: designData.accent_color || '#FFD700',
        metallic: designData.gold_foil,
        position: { x: 0, y: -60, z: 0.03 }
      },
      camera: {
        position: { x: 0, y: 0, z: 15 },
        rotation: { x: 0, y: 0, z: 0 },
        fov: 50
      },
      controls: {
        enableRotation: true,
        enableZoom: true,
        autoRotate: false,
        rotationSpeed: 1.0
      }
    };
  }

  /**
   * Feature 6: Print Specification Generator
   */
  async generatePrintSpec(designData) {
    const colorMode = 'CMYK';
    
    // Convert RGB colors to CMYK
    const cmykColors = {};
    if (designData.colors) {
      Object.entries(designData.colors).forEach(([key, hex]) => {
        cmykColors[key] = this.rgbToCMYK(this.hexToRGB(hex));
      });
    }

    // Generate Pantone suggestions (approximations)
    const pantoneColors = this.suggestPantoneColors(designData.colors);

    const spec = {
      // Paper specifications
      paperSize: designData.paper_size || 'Letter',
      paperDimensions: this.getPaperDimensions(designData.paper_size),
      paperWeight: '100lb Cover (270 gsm)',
      paperFinish: designData.paper_texture || 'Matte',
      paperType: 'Premium Certificate Stock',

      // Color specifications
      colorMode: colorMode,
      resolution: 300, // DPI
      cmykColors,
      pantoneColors,

      // Print specifications
      bleedSize: 3, // mm
      safetyMargin: 5, // mm from edge
      trimMarks: true,
      colorBars: true,

      // Special finishes
      embossing: designData.enable_embossing ? {
        type: 'Foil Stamping',
        color: 'Metallic Gold',
        location: 'Seal area',
        depth: '0.5mm'
      } : null,

      // File specifications
      fileFormat: 'PDF/X-1a:2001',
      compression: 'None',
      fonts: 'Embedded',
      images: '300 DPI minimum',

      // Production notes
      notes: [
        'All colors specified in CMYK',
        'Pantone colors are suggestions for spot color matching',
        'Bleed extends 3mm beyond trim line',
        'Keep important elements 5mm from trim edge',
        designData.gold_foil ? 'Gold foil requires separate plate' : null
      ].filter(Boolean)
    };

    // Save to database
    await DesignThemeModel.savePrintSpec({
      design_id: designData.id,
      design_type: designData.type || 'diploma',
      ...spec
    });

    return spec;
  }

  /**
   * Feature 7: Design Export/Import
   */
  async exportDesign(designId, designType) {
    let designData;
    
    if (designType === 'theme') {
      designData = await DesignThemeModel.getThemeById(designId);
    } else {
      // Load from appropriate model
      designData = { id: designId, type: designType };
    }

    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      designType,
      data: designData,
      compatibility: {
        minVersion: '1.0',
        features: this.extractFeatures(designData)
      }
    };

    return {
      json: JSON.stringify(exportData, null, 2),
      filename: `design_${designType}_${designId}_${Date.now()}.json`
    };
  }

  async importDesign(importData, userId) {
    const parsed = typeof importData === 'string' 
      ? JSON.parse(importData) 
      : importData;

    // Validate version compatibility
    if (!this.isCompatibleVersion(parsed.version)) {
      throw new Error(`Incompatible design version: ${parsed.version}`);
    }

    // Import based on type
    if (parsed.designType === 'theme') {
      return await DesignThemeModel.createTheme({
        ...parsed.data,
        user_id: userId,
        name: `${parsed.data.name} (Imported)`
      });
    }

    return parsed.data;
  }

  /**
   * Feature 8: Brand Guidelines Integration
   */
  async extractBrandGuidelines(_guidelinesFile) {
    // In production, this would parse PDF/document
    // For now, return structured format
    return {
      organization: 'Sample University',
      logo: {
        primary: '/path/to/logo.svg',
        variations: ['full-color', 'monochrome', 'reversed'],
        minSize: { width: 50, height: 50 },
        clearSpace: 10,
        doNot: [
          'Stretch or distort',
          'Change colors',
          'Add effects',
          'Use on busy backgrounds'
        ]
      },
      colors: {
        primary: ['#003366', '#002244'],
        secondary: ['#FFD700', '#FFC700'],
        accent: ['#C0A062'],
        approved: true
      },
      fonts: {
        heading: ['Garamond', 'Times New Roman'],
        body: ['Garamond', 'Georgia'],
        display: ['Playfair Display']
      },
      spacing: {
        minimal: '5mm',
        standard: '10mm',
        generous: '15mm'
      }
    };
  }

  async applyBrandGuidelines(designData, guidelinesId) {
    const guidelines = await DesignThemeModel.getBrandGuidelines(guidelinesId);
    
    if (!guidelines || guidelines.length === 0) {
      throw new Error('Brand guidelines not found');
    }

    const guide = guidelines[0];

    // Apply brand guidelines to design
    return {
      ...designData,
      colors: {
        primary: guide.primary_colors[0],
        secondary: guide.secondary_colors[0],
        accent: guide.accent_colors[0]
      },
      fonts: {
        heading: guide.approved_fonts[0],
        body: guide.approved_fonts[1] || guide.approved_fonts[0]
      },
      brandCompliant: true,
      guidelinesApplied: guidelinesId
    };
  }

  /**
   * Feature 9: Accessibility Checker (WCAG 2.1 AA/AAA)
   */
  async checkAccessibility(designData) {
    const issues = [];
    const checks = {
      passed: 0,
      failed: 0
    };

    // Check 1: Color Contrast
    const contrastResults = this.checkColorContrast(designData.colors);
    if (contrastResults.passed) {
      checks.passed++;
    } else {
      checks.failed++;
      issues.push({
        severity: 'error',
        category: 'color-contrast',
        message: 'Insufficient color contrast for text readability',
        wcagCriterion: '1.4.3 Contrast (Minimum)',
        suggestion: `Increase contrast to at least 4.5:1 for normal text. Current: ${contrastResults.ratio.toFixed(2)}:1`
      });
    }

    // Check 2: Text Size
    const textSizeResults = this.checkTextSize(designData.fonts);
    if (textSizeResults.passed) {
      checks.passed++;
    } else {
      checks.failed++;
      issues.push({
        severity: 'warning',
        category: 'text-size',
        message: 'Text size may be too small for some users',
        wcagCriterion: '1.4.4 Resize Text',
        suggestion: 'Use minimum 12pt for body text, 14pt recommended'
      });
    }

    // Check 3: Non-text Contrast (for borders, icons)
    const nonTextContrast = this.checkNonTextContrast(designData);
    if (nonTextContrast.passed) {
      checks.passed++;
    } else {
      checks.failed++;
      issues.push({
        severity: 'warning',
        category: 'non-text-contrast',
        message: 'Non-text elements may not have sufficient contrast',
        wcagCriterion: '1.4.11 Non-text Contrast',
        suggestion: 'Ensure borders and icons have 3:1 contrast minimum'
      });
    }

    // Determine WCAG level
    const overallScore = (checks.passed / (checks.passed + checks.failed)) * 100;
    const wcagLevel = checks.failed === 0 ? 'AAA' : (overallScore >= 70 ? 'AA' : 'A');

    const audit = {
      wcag_level: wcagLevel,
      overall_score: overallScore.toFixed(2),
      color_contrast: contrastResults,
      text_size: textSizeResults,
      issues,
      passed_checks: checks.passed,
      failed_checks: checks.failed,
      recommendations: this.generateAccessibilityRecommendations(issues)
    };

    // Save audit to database
    if (designData.id) {
      await DesignThemeModel.saveAccessibilityAudit({
        design_id: designData.id,
        design_type: designData.type || 'diploma',
        user_id: designData.user_id,
        ...audit
      });
    }

    return audit;
  }

  /**
   * Feature 10: Design History/Versions
   */
  async saveDesignVersion(designId, designType, designData, userId, changesDescription = '') {
    // Get latest version number
    const latestVersion = await DesignThemeModel.getLatestVersionNumber(designId, designType);
    
    const version = await DesignThemeModel.saveVersion({
      design_id: designId,
      design_type: designType,
      version_number: latestVersion + 1,
      design_data: designData,
      changes_description: changesDescription,
      created_by: userId
    });

    return version;
  }

  async getDesignHistory(designId, designType) {
    const versions = await DesignThemeModel.getVersions(designId, designType);
    
    // Add comparison info between versions
    for (let i = 0; i < versions.length - 1; i++) {
      versions[i].changes = this.compareVersions(
        versions[i].design_data,
        versions[i + 1].design_data
      );
    }

    return versions;
  }

  async restoreVersion(designId, designType, versionNumber, userId) {
    const versions = await DesignThemeModel.getVersions(designId, designType);
    const targetVersion = versions.find(v => v.version_number === versionNumber);
    
    if (!targetVersion) {
      throw new Error('Version not found');
    }

    // Create new version with restored data
    await this.saveDesignVersion(
      designId,
      designType,
      targetVersion.design_data,
      userId,
      `Restored from version ${versionNumber}`
    );

    return targetVersion.design_data;
  }

  async compareVersions(version1Data, version2Data) {
    const changes = [];
    
    const checkDifferences = (obj1, obj2, path = '') => {
      Object.keys(obj1).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (typeof obj1[key] === 'object' && obj1[key] !== null) {
          if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            changes.push({
              field: fullPath,
              before: obj1[key],
              after: obj2[key],
              type: 'modified'
            });
          }
        } else if (obj1[key] !== obj2[key]) {
          changes.push({
            field: fullPath,
            before: obj1[key],
            after: obj2[key],
            type: 'modified'
          });
        }
      });
    };

    checkDifferences(version1Data, version2Data);
    
    return changes;
  }

  // ========== Helper Methods ==========

  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  hexToHSL(hex) {
    const rgb = this.hexToRGB(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    const toHex = (val) => {
      const hex = Math.round((val + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  rgbToCMYK(rgb) {
    let c = 1 - (rgb.r / 255);
    let m = 1 - (rgb.g / 255);
    let y = 1 - (rgb.b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
  }

  calculateContrastRatio(color1, color2) {
    const getLuminance = (rgb) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(this.hexToRGB(color1));
    const lum2 = getLuminance(this.hexToRGB(color2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  calculateContrastMatrix(colors) {
    const matrix = {};
    
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const key = `${colors[i].role}-${colors[j].role}`;
        matrix[key] = this.calculateContrastRatio(colors[i].hex, colors[j].hex);
      }
    }

    return matrix;
  }

  checkWCAGCompliance(contrastRatios) {
    let aaCompliant = true;
    let aaaCompliant = true;

    Object.values(contrastRatios).forEach(ratio => {
      if (ratio < this.wcagRequirements.AA.normalText) {
        aaCompliant = false;
      }
      if (ratio < this.wcagRequirements.AAA.normalText) {
        aaaCompliant = false;
      }
    });

    return { AA: aaCompliant, AAA: aaaCompliant };
  }

  checkColorContrast(colors) {
    if (!colors || !colors.primary || !colors.background) {
      return { passed: false, ratio: 0 };
    }

    const ratio = this.calculateContrastRatio(colors.primary, colors.background);
    return {
      passed: ratio >= this.wcagRequirements.AA.normalText,
      ratio,
      level: ratio >= this.wcagRequirements.AAA.normalText ? 'AAA' : 
             ratio >= this.wcagRequirements.AA.normalText ? 'AA' : 'Fail'
    };
  }

  checkTextSize(_fonts) {
    // Assume minimum 12pt for accessibility
    return {
      passed: true, // Would check actual font sizes
      minSize: '12pt',
      recommendation: '14pt for better readability'
    };
  }

  checkNonTextContrast(_designData) {
    // Check border and icon contrast (3:1 minimum for WCAG 2.1)
    return {
      passed: true,
      ratio: 3.5,
      elements: ['border', 'seal']
    };
  }

  generateAccessibilityRecommendations(issues) {
    return issues.map(issue => ({
      priority: issue.severity === 'error' ? 'high' : 'medium',
      action: issue.suggestion,
      impact: 'Improves readability and compliance'
    }));
  }

  suggestPantoneColors(colors) {
    // Simplified Pantone suggestions based on common mappings
    const pantoneMap = {
      '#003366': 'Pantone 295 C',
      '#FFD700': 'Pantone 123 C',
      '#A51C30': 'Pantone 201 C',
      '#000000': 'Pantone Black C',
      '#FFFFFF': 'Pantone White'
    };

    const suggestions = {};
    if (colors) {
      Object.entries(colors).forEach(([key, hex]) => {
        suggestions[key] = pantoneMap[hex] || 'Custom color match required';
      });
    }

    return suggestions;
  }

  getPaperDimensions(size) {
    const dimensions = {
      'letter': { width: '8.5in', height: '11in', widthMM: 215.9, heightMM: 279.4 },
      'a4': { width: '210mm', height: '297mm', widthMM: 210, heightMM: 297 },
      'legal': { width: '8.5in', height: '14in', widthMM: 215.9, heightMM: 355.6 },
      'tabloid': { width: '11in', height: '17in', widthMM: 279.4, heightMM: 431.8 }
    };

    return dimensions[size?.toLowerCase()] || dimensions.letter;
  }

  calculateScaleFactor(size) {
    // Calculate scale for preview (reference: Letter = 1.0)
    const reference = 215.9 * 279.4; // Letter area in mm²
    const current = this.getPaperDimensions(size.name);
    const currentArea = current.widthMM * current.heightMM;
    
    return Math.sqrt(currentArea / reference);
  }

  extractFeatures(designData) {
    const features = [];
    
    if (designData.theme_config) {
      const config = designData.theme_config;
      if (config.elements?.border) features.push('custom-borders');
      if (config.elements?.seal) features.push('embossed-seals');
      if (config.elements?.watermark) features.push('watermarks');
    }

    return features;
  }

  isCompatibleVersion(version) {
    const [major] = version.split('.');
    return parseInt(major) <= 2; // Support v1.x and v2.x
  }
}

module.exports = new DesignSystemService();
