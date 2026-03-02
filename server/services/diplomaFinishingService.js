'use strict';

/**
 * Diploma Finishing Service
 * Category H: Features 156-170 - Premium finishing options for diplomas
 */
class DiplomaFinishingService {
  constructor() {
    this.frameSizes = {
      '8x10': { width: 8, height: 10, unit: 'in', matDepth: 2, label: '8"×10"' },
      '11x14': { width: 11, height: 14, unit: 'in', matDepth: 2.5, label: '11"×14"' },
      '14x18': { width: 14, height: 18, unit: 'in', matDepth: 3, label: '14"×18"' },
      '16x20': { width: 16, height: 20, unit: 'in', matDepth: 3.5, label: '16"×20"' },
      'a4_frame': { width: 210, height: 297, unit: 'mm', matDepth: 40, label: 'A4 Frame' }
    };

    this.calligraphicFontLibrary = [
      { name: 'Brush Script MT', style: 'cursive', weight: 'normal', suitable: ['name', 'formal'] },
      { name: 'Palatino Linotype', style: 'serif', weight: 'normal', suitable: ['body', 'authority'] },
      { name: 'Book Antiqua', style: 'serif', weight: 'normal', suitable: ['body', 'institution'] },
      { name: 'Garamond', style: 'serif', weight: 'normal', suitable: ['body', 'text'] },
      { name: 'Baskerville', style: 'serif', weight: 'normal', suitable: ['body', 'authority'] },
      { name: 'Trajan Pro', style: 'serif', weight: 'bold', suitable: ['heading', 'institution'] },
      { name: 'Copperplate', style: 'fantasy', weight: 'normal', suitable: ['heading', 'name'] },
      { name: 'Didot', style: 'serif', weight: 'normal', suitable: ['name', 'elegant'] },
      { name: 'Cormorant Garamond', style: 'serif', weight: 'normal', suitable: ['formal', 'elegant'] },
      { name: 'EB Garamond', style: 'serif', weight: 'normal', suitable: ['body', 'traditional'] },
      { name: 'Cinzel', style: 'serif', weight: 'normal', suitable: ['heading', 'roman'] },
      { name: 'Playfair Display', style: 'serif', weight: 'normal', suitable: ['heading', 'elegant'] }
    ];
  }

  // Feature 156: Auto-generate embossed seal simulation layer
  generateEmbossedSealLayer(sealSVG, options = {}) {
    const { size = 150, intensity = 0.6 } = options;
    return {
      layers: [
        { name: 'base', content: sealSVG, zIndex: 1 },
        { name: 'emboss-highlight', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2-5}" r="${size*0.45}" fill="rgba(255,255,255,${intensity*0.3})" filter="url(#blur)"/><defs><filter id="blur"><feGaussianBlur stdDeviation="3"/></filter></defs></svg>`, zIndex: 2 },
        { name: 'emboss-shadow', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size/2+3}" cy="${size/2+3}" r="${size*0.45}" fill="rgba(0,0,0,${intensity*0.2})" filter="url(#blur2)"/><defs><filter id="blur2"><feGaussianBlur stdDeviation="4"/></filter></defs></svg>`, zIndex: 0 }
      ],
      effect: 'emboss',
      intensity,
      type: 'seal-emboss'
    };
  }

  // Feature 157: Auto-generate gold foil simulation overlay
  generateGoldFoilOverlay(elements, options = {}) {
    const { shimmer = true } = options;
    const goldGradient = `<defs><linearGradient id="goldFoil" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD700;stop-opacity:1"/><stop offset="25%" style="stop-color:#FFF0A0;stop-opacity:1"/><stop offset="50%" style="stop-color:#B8860B;stop-opacity:1"/><stop offset="75%" style="stop-color:#FFD700;stop-opacity:1"/><stop offset="100%" style="stop-color:#DAA520;stop-opacity:1"/></linearGradient>${shimmer ? '<animateTransform attributeName="gradientTransform" type="translate" from="-200 0" to="200 0" dur="3s" repeatCount="indefinite"/>' : ''}</defs>`;
    return {
      gradient: goldGradient,
      fillRef: 'url(#goldFoil)',
      elements: (elements || ['seal', 'border', 'name']).map(el => ({ element: el, applyFoil: true })),
      effect: 'gold-foil',
      type: 'metallic-simulation'
    };
  }

  // Feature 158: Auto-produce production-ready foil stamp layer (separate PDF layer)
  generateFoilStampLayer(_diplomaData) {
    return {
      layerName: 'Foil-Stamp-Layer',
      colorSpace: 'Spot Color',
      spotColor: 'PANTONE 871 C (Metallic Gold)',
      elements: [
        { type: 'seal', coordinates: { x: '50%', y: '15%' }, size: '120px' },
        { type: 'border', stroke: 'full-perimeter' },
        { type: 'studentName', coordinates: { x: '50%', y: '42%' } },
        { type: 'institutionName', coordinates: { x: '50%', y: '12%' } }
      ],
      exportFormat: 'PDF-Separate-Layer',
      printReady: true,
      instructions: 'Print this layer separately on foil stamping press. Register with base layer using crop marks.'
    };
  }

  // Feature 159: Auto-generate emboss/deboss die-cut specification sheet
  generateEmbossDieSpec(sealConfig, diplomaSize = 'standard') {
    const { width } = { standard: { width: 8.5, height: 11 }, large: { width: 11, height: 14 } }[diplomaSize] || { width: 8.5, height: 11 };
    return {
      specSheet: {
        dieType: 'Combination Emboss/Deboss',
        sealDiameter: `${sealConfig?.size || 2}in`,
        sealPosition: `${(width - (sealConfig?.size || 2)) / 2}" from left, 0.75" from top`,
        textElements: [{ element: 'studentName', debossDepth: '0.010in', width: '5in' }],
        borderEmboss: { type: 'rounded-rule', depth: '0.008in', offset: '0.5in from trim' },
        stockThickness: '80lb cover or heavier',
        vendorNote: 'Submit die file with final diploma artwork at 600 DPI'
      },
      diplomaSize,
      documentType: 'Emboss/Deboss Die Specification'
    };
  }

  // Feature 160: Auto-generate diploma in multiple size options
  generateMultipleSizeVariants(diplomaData) {
    return Object.entries(this.frameSizes)
      .filter(([key]) => ['11x14', '14x18'].includes(key) || key.startsWith('8'))
      .map(([sizeKey, spec]) => ({
        sizeKey,
        dimensions: spec,
        label: spec.label,
        scaleRatio: spec.width / 8.5,
        diplomaData: { ...diplomaData, sizeKey, dimensions: spec }
      }));
  }

  // Feature 161: Auto-scale all design elements proportionally
  scaleElements(elements, baseWidth = 8.5, targetWidth = 11) {
    const scale = targetWidth / baseWidth;
    return (elements || []).map(el => ({
      ...el,
      width: el.width ? el.width * scale : undefined,
      height: el.height ? el.height * scale : undefined,
      fontSize: el.fontSize ? `${parseFloat(el.fontSize) * scale}pt` : undefined,
      x: el.x ? el.x * scale : undefined,
      y: el.y ? el.y * scale : undefined,
      scaledBy: scale
    }));
  }

  // Feature 162: Auto-generate frame-ready print specification
  generateFrameSpec(diplomaSize = 'standard') {
    const sizes = {
      standard: { diploma: '8.5x11', frame: '11x14', mat: { top: 1.25, right: 1.25, bottom: 1.25, left: 1.25 }, unit: 'in' },
      large: { diploma: '11x14', frame: '14x18', mat: { top: 2, right: 2, bottom: 2, left: 2 }, unit: 'in' }
    };
    const spec = sizes[diplomaSize] || sizes.standard;
    return {
      diplomaDimensions: spec.diploma,
      recommendedFrameSize: spec.frame,
      matDimensions: spec.mat,
      trimMarks: true,
      bleed: '0.125in',
      safeArea: '0.25in from edge',
      note: 'Print at 600 DPI on 80lb cover stock or premium linen paper.'
    };
  }

  // Feature 163: Auto-produce matting specification
  generateMattingSpec(diplomaSize = 'standard', matColor = 'white') {
    const matColorOptions = {
      white: { name: 'Bright White', hex: '#FFFFFF', pantone: 'White' },
      cream: { name: 'Antique White/Cream', hex: '#FDF5E6', pantone: 'Warm White' },
      navy: { name: 'Navy Blue', hex: '#003087', pantone: 'Pantone 289 C' },
      burgundy: { name: 'Burgundy', hex: '#7B0D1E', pantone: 'Pantone 7421 C' },
      black: { name: 'Black', hex: '#1A1A1A', pantone: 'Process Black' }
    };
    const frameSpec = this.generateFrameSpec(diplomaSize);
    return {
      matColor: matColorOptions[matColor] || matColorOptions.cream,
      dimensions: { top: frameSpec.matDimensions.top, right: frameSpec.matDimensions.right, bottom: frameSpec.matDimensions.bottom, left: frameSpec.matDimensions.left },
      openingSize: frameSpec.diplomaDimensions,
      beveled: true,
      doublemat: false,
      recommendation: 'Single bevel-cut mat in cream or institution color'
    };
  }

  // Feature 164: Auto-generate shadow-box layout variant
  generateShadowBoxLayout(diplomaData) {
    return {
      layout: 'shadow-box',
      depth: '2in',
      elements: [
        { type: 'diploma', position: 'back', dimensions: '8.5x11', matted: true },
        { type: 'tassel', position: 'upper-left', material: 'actual' },
        { type: 'medallion', position: 'upper-right', material: 'replica' },
        { type: 'class-photo', position: 'lower-left', size: '3x5' },
        { type: 'institutional-pin', position: 'lower-right' }
      ],
      frameStyle: 'deep-profile',
      backing: 'velvet',
      diplomaData
    };
  }

  // Feature 165: Auto-generate ribbon/seal placement guide
  generatePlacementGuide(diplomaSize = 'standard') {
    const sizeMap = { standard: { w: 8.5, h: 11 }, large: { w: 11, h: 14 } };
    const dim = sizeMap[diplomaSize] || sizeMap.standard;
    return {
      documentType: 'Placement Guide',
      diplomaSize: `${dim.w}"×${dim.h}"`,
      sealPlacement: { x: `${dim.w / 2 - 1}"`, y: '0.75"', diameter: '2"', note: 'Center of page, 0.75" from top edge' },
      ribbonPlacement: { x: `${dim.w / 2 - 0.625}"`, y: `${dim.h - 2}"`, width: '1.25"', length: '4"', note: 'Center horizontally, 2" from bottom' },
      signatureLines: [
        { position: `${dim.w * 0.15}" from left`, y: `${dim.h - 1.5}"`, width: '2.5"' },
        { position: `${dim.w * 0.55}" from left`, y: `${dim.h - 1.5}"`, width: '2.5"' }
      ],
      unit: 'inches'
    };
  }

  // Feature 166: Auto-apply calligraphy rendering for student name
  applyCalligraphyRendering(name, institutionStyle = 'traditional') {
    const styleMap = {
      traditional: { fontIndex: 0, size: '48pt', tracking: '0.05em', color: '#1a1a2e' },
      elegant: { fontIndex: 7, size: '44pt', tracking: '0.08em', color: '#1a1a2e' },
      modern: { fontIndex: 5, size: '40pt', tracking: '0.12em', color: '#333333' }
    };
    const style = styleMap[institutionStyle] || styleMap.traditional;
    const font = this.calligraphicFontLibrary[style.fontIndex]?.name || 'Brush Script MT';
    return {
      name,
      font: `${font}, cursive`,
      fontSize: style.size,
      letterSpacing: style.tracking,
      color: style.color,
      style: institutionStyle
    };
  }

  // Feature 167: Auto-select from 12+ calligraphic font styles
  selectCalligraphicFont(_institutionStyle = 'traditional', useCase = 'name') {
    const suitable = this.calligraphicFontLibrary.filter(f => f.suitable.includes(useCase) || f.suitable.includes('formal'));
    const selected = suitable.length > 0 ? suitable[0] : this.calligraphicFontLibrary[0];
    return { fontFamily: `${selected.name}, cursive`, fontStyle: selected.style, fontWeight: selected.weight, allOptions: this.calligraphicFontLibrary.map(f => f.name) };
  }

  // Feature 168: Auto-generate premium paper simulation mode
  generatePaperSimulation(stockType = 'linen') {
    const stocks = {
      linen: { name: '100 lb Linen Text', textureCSS: 'background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)', backgroundColor: '#faf8f5', note: '100 lb linen text stock visual simulation' },
      parchment: { name: 'Parchment', textureCSS: 'background: radial-gradient(ellipse at center, #f4e4c1 0%, #e8d5a3 100%)', backgroundColor: '#f4e4c1', note: 'Parchment texture simulation' },
      cotton: { name: '25% Cotton Bond', textureCSS: 'background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.008) 3px, rgba(0,0,0,0.008) 6px)', backgroundColor: '#fffef9', note: '25% cotton bond simulation' }
    };
    return stocks[stockType] || stocks.linen;
  }

  // Feature 169: Auto-produce digital certificate of authenticity
  generateCertificateOfAuthenticity(diplomaData) {
    return {
      documentType: 'Certificate of Authenticity',
      documentId: `COA-${Date.now().toString(36).toUpperCase()}`,
      certifies: {
        studentName: diplomaData.studentName,
        degreeTitle: diplomaData.degreeTitle,
        major: diplomaData.major,
        institutionName: diplomaData.institutionName,
        graduationDate: diplomaData.graduationDate,
        diplomaId: diplomaData.documentId
      },
      statement: `This Certificate of Authenticity confirms that the accompanying diploma was generated by the authorized Transcript Generator system for ${diplomaData.studentName || 'the named student'} and represents the academic degree conferred.`,
      issuedDate: new Date().toISOString().split('T')[0],
      verificationCode: `COA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
  }

  // Feature 170: Auto-generate packaging and shipping label
  generateShippingLabel(recipientData, diplomaData) {
    const { name, address, city, state, zip, country = 'USA' } = recipientData || {};
    const tubeOrFlat = diplomaData?.sizeKey === 'standard' ? 'flat-mailer' : 'diploma-tube';
    return {
      labelType: 'Diploma Shipping Label',
      packaging: tubeOrFlat,
      recipient: { name: name || diplomaData?.studentName, address: address || '', cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(), country },
      returnAddress: { name: diplomaData?.institutionName || 'Office of the Registrar', address: '', note: 'Return to Registrar if undeliverable' },
      specialInstructions: 'DO NOT BEND — Academic Credential Enclosed',
      packageDimensions: tubeOrFlat === 'flat-mailer' ? '12"×15" padded flat mailer' : '3"×18" diploma tube',
      fragile: false
    };
  }

  // Utility: Full finishing package
  generateCompleteFinishingPackage(diplomaData, options = {}) {
    const { sealSVG, diplomaSize = 'standard', matColor = 'cream', stockType = 'linen', recipientData } = options;
    return {
      embossedSeal: sealSVG ? this.generateEmbossedSealLayer(sealSVG) : null,
      goldFoil: this.generateGoldFoilOverlay(['seal', 'border', 'institutionName']),
      foilStampLayer: this.generateFoilStampLayer(diplomaData),
      embossDieSpec: this.generateEmbossDieSpec(null, diplomaSize),
      sizeVariants: this.generateMultipleSizeVariants(diplomaData),
      frameSpec: this.generateFrameSpec(diplomaSize),
      mattingSpec: this.generateMattingSpec(diplomaSize, matColor),
      shadowBoxLayout: this.generateShadowBoxLayout(diplomaData),
      placementGuide: this.generatePlacementGuide(diplomaSize),
      calligraphy: this.applyCalligraphyRendering(diplomaData.studentName || '', 'traditional'),
      fontSelection: this.selectCalligraphicFont('traditional', 'name'),
      paperSimulation: this.generatePaperSimulation(stockType),
      certificateOfAuthenticity: this.generateCertificateOfAuthenticity(diplomaData),
      shippingLabel: recipientData ? this.generateShippingLabel(recipientData, diplomaData) : null
    };
  }
}

module.exports = new DiplomaFinishingService();
