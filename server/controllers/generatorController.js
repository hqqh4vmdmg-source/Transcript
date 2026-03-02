const SimpleSealGenerator = require('../utils/simpleSealGenerator');
const CategoryGenerator = require('../utils/categoryGenerator');
const sealModel = require('../models/sealModel');
const fs = require('fs').promises;
const path = require('path');

const sealGenerator = new SimpleSealGenerator();
const categoryGenerator = new CategoryGenerator();

/**
 * Generate and save a seal
 */
exports.generateSeal = async (req, res) => {
  try {
    const {
      sealType = 'institutional',
      institutionName = 'University',
      year,
      subtitle,
      departmentName,
      accreditingBody
    } = req.body;

    const userId = req.user.userId;
    let sealResult;

    // Generate seal based on type
    switch (sealType) {
      case 'institutional':
        sealResult = sealGenerator.generateInstitutionalSeal(institutionName, year);
        break;
      case 'departmental':
        sealResult = sealGenerator.generateDepartmentalSeal(departmentName, institutionName);
        break;
      case 'registrar':
        sealResult = sealGenerator.generateRegistrarSeal(institutionName);
        break;
      case 'accreditation':
        sealResult = sealGenerator.generateAccreditationSeal(accreditingBody, year);
        break;
      default:
        return res.status(400).json({
          error: 'Invalid seal type. Must be: institutional, departmental, registrar, or accreditation'
        });
    }

    // Ensure seals directory exists
    const sealsDir = path.join(__dirname, '../public/seals');
    await fs.mkdir(sealsDir, { recursive: true });

    // Save to filesystem
    const filename = sealGenerator.generateFilename(sealType);
    const filepath = path.join(sealsDir, filename);
    const buffer = sealGenerator.svgToBuffer(sealResult.svg);
    await fs.writeFile(filepath, buffer);

    // Save to database
    const sealData = {
      name: `${institutionName} ${sealType} Seal`,
      description: `Generated ${sealType} seal for ${institutionName}`,
      image_path: `/seals/${filename}`,
      image_data: buffer,
      seal_type: sealType,
      metadata: {
        generated: true,
        institutionName,
        year,
        subtitle,
        departmentName,
        accreditingBody,
        width: sealResult.width,
        height: sealResult.height,
        format: sealResult.format
      },
      created_by: userId
    };

    const savedSeal = await sealModel.create(sealData);

    res.status(201).json({
      message: 'Seal generated successfully',
      seal: {
        id: savedSeal.id,
        name: savedSeal.name,
        seal_type: savedSeal.seal_type,
        image_path: savedSeal.image_path,
        dataUrl: sealResult.dataUrl
      }
    });
  } catch (error) {
    console.error('Generate seal error:', error);
    res.status(500).json({
      error: 'Failed to generate seal',
      details: error.message
    });
  }
};

/**
 * Get available GPA categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = categoryGenerator.getAvailableCategories();
    
    res.json({
      message: 'Available categories retrieved successfully',
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to retrieve categories',
      details: error.message
    });
  }
};

/**
 * Generate transcript by category
 */
exports.generateByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { type = 'college' } = req.body;

    if (!['failed', '2.5', '3.74'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category. Must be: failed, 2.5, or 3.74'
      });
    }

    if (!['high_school', 'college'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be: high_school or college'
      });
    }

    const transcriptData = categoryGenerator.generateTranscriptByCategory(category, type);

    res.json({
      message: `${category} GPA category transcript generated successfully`,
      transcript: transcriptData
    });
  } catch (error) {
    console.error('Generate category error:', error);
    res.status(500).json({
      error: 'Failed to generate category transcript',
      details: error.message
    });
  }
};

/**
 * Generate failed grades category
 */
exports.generateFailedCategory = async (req, res) => {
  try {
    const { type = 'college' } = req.body;
    const transcriptData = categoryGenerator.generateTranscriptByCategory('failed', type);

    res.json({
      message: 'Failed grades category generated successfully',
      transcript: transcriptData
    });
  } catch (error) {
    console.error('Generate failed category error:', error);
    res.status(500).json({
      error: 'Failed to generate failed grades category',
      details: error.message
    });
  }
};

/**
 * Generate 2.5 GPA category
 */
exports.generate25Category = async (req, res) => {
  try {
    const { type = 'college' } = req.body;
    const transcriptData = categoryGenerator.generateTranscriptByCategory('2.5', type);

    res.json({
      message: '2.5 GPA category generated successfully',
      transcript: transcriptData
    });
  } catch (error) {
    console.error('Generate 2.5 category error:', error);
    res.status(500).json({
      error: 'Failed to generate 2.5 GPA category',
      details: error.message
    });
  }
};

/**
 * Generate 3.74 GPA category
 */
exports.generate374Category = async (req, res) => {
  try {
    const { type = 'college' } = req.body;
    const transcriptData = categoryGenerator.generateTranscriptByCategory('3.74', type);

    res.json({
      message: '3.74 GPA category generated successfully',
      transcript: transcriptData
    });
  } catch (error) {
    console.error('Generate 3.74 category error:', error);
    res.status(500).json({
      error: 'Failed to generate 3.74 GPA category',
      details: error.message
    });
  }
};
