const { CertificateModel, SignatureModel } = require('../models/certificateModel');
const certificateService = require('../services/certificateService');

/**
 * Create a new certificate
 */
exports.createCertificate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const certificateData = {
      ...req.body,
      user_id: userId
    };

    const certificate = await CertificateModel.create(certificateData);

    // Add signatures if provided
    if (req.body.signature_ids && Array.isArray(req.body.signature_ids)) {
      for (let i = 0; i < req.body.signature_ids.length; i++) {
        await CertificateModel.addSignature(
          certificate.id,
          req.body.signature_ids[i],
          i + 1,
          req.body.signature_alignments?.[i] || 'center'
        );
      }
    }

    res.status(201).json({
      message: 'Certificate created successfully',
      certificate
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({
      error: 'Failed to create certificate',
      details: error.message
    });
  }
};

/**
 * Get all certificates for current user
 */
exports.getCertificates = async (req, res) => {
  try {
    const userId = req.user.userId;
    const certificates = await CertificateModel.findByUserId(userId);

    res.json({
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      error: 'Failed to retrieve certificates'
    });
  }
};

/**
 * Get specific certificate
 */
exports.getCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const certificate = await CertificateModel.getCertificateWithSignatures(id);

    if (!certificate || certificate.user_id !== userId) {
      return res.status(404).json({
        error: 'Certificate not found'
      });
    }

    res.json({
      certificate
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      error: 'Failed to retrieve certificate'
    });
  }
};

/**
 * Update certificate
 */
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const existing = await CertificateModel.findByIdAndUserId(id, userId);
    if (!existing) {
      return res.status(404).json({
        error: 'Certificate not found'
      });
    }

    const updates = req.body;
    delete updates.user_id; // Prevent changing owner
    delete updates.id;

    const certificate = await CertificateModel.update(id, updates);

    res.json({
      message: 'Certificate updated successfully',
      certificate
    });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({
      error: 'Failed to update certificate'
    });
  }
};

/**
 * Delete certificate
 */
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await CertificateModel.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Certificate not found'
      });
    }

    res.json({
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      error: 'Failed to delete certificate'
    });
  }
};

/**
 * Download certificate PDF
 */
exports.downloadCertificatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const pdfBuffer = await certificateService.generateCertificatePDF(id, userId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download certificate PDF error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message
    });
  }
};

/**
 * Get all templates
 */
exports.getTemplates = async (req, res) => {
  try {
    const { type } = req.query;
    const templates = await CertificateModel.getTemplates(type);

    res.json({
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Failed to retrieve templates'
    });
  }
};

/**
 * Get template by ID
 */
exports.getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await CertificateModel.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        error: 'Template not found'
      });
    }

    res.json({
      template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      error: 'Failed to retrieve template'
    });
  }
};

/**
 * Get design elements
 */
exports.getDesignElements = async (req, res) => {
  try {
    const { type } = req.query;
    const elements = await CertificateModel.getDesignElements(type);

    res.json({
      elements
    });
  } catch (error) {
    console.error('Get design elements error:', error);
    res.status(500).json({
      error: 'Failed to retrieve design elements'
    });
  }
};

/**
 * Create signature
 */
exports.createSignature = async (req, res) => {
  try {
    const userId = req.user.userId;
    const signatureData = {
      ...req.body,
      user_id: userId
    };

    const signature = await SignatureModel.create(signatureData);

    res.status(201).json({
      message: 'Signature created successfully',
      signature
    });
  } catch (error) {
    console.error('Create signature error:', error);
    res.status(500).json({
      error: 'Failed to create signature'
    });
  }
};

/**
 * Get user's signatures
 */
exports.getSignatures = async (req, res) => {
  try {
    const userId = req.user.userId;
    const signatures = await SignatureModel.findByUserId(userId);

    res.json({
      signatures
    });
  } catch (error) {
    console.error('Get signatures error:', error);
    res.status(500).json({
      error: 'Failed to retrieve signatures'
    });
  }
};

/**
 * Update signature
 */
exports.updateSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const existing = await SignatureModel.findById(id);
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({
        error: 'Signature not found'
      });
    }

    const updates = req.body;
    delete updates.user_id;
    delete updates.id;

    const signature = await SignatureModel.update(id, updates);

    res.json({
      message: 'Signature updated successfully',
      signature
    });
  } catch (error) {
    console.error('Update signature error:', error);
    res.status(500).json({
      error: 'Failed to update signature'
    });
  }
};

/**
 * Delete signature
 */
exports.deleteSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await SignatureModel.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Signature not found'
      });
    }

    res.json({
      message: 'Signature deleted successfully'
    });
  } catch (error) {
    console.error('Delete signature error:', error);
    res.status(500).json({
      error: 'Failed to delete signature'
    });
  }
};

/**
 * Generate diploma for specific GPA category with customer info
 */
exports.generateDiplomaForCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const customerInfo = req.body;
    const userId = req.user.userId;

    const CategoryGenerator = require('../utils/categoryGenerator');
    const categoryGen = new CategoryGenerator();
    const premiumDiplomaService = require('../services/premiumDiplomaService');

    // Generate diploma data for category
    const diplomaData = categoryGen.generateDiplomaForCategory(category, customerInfo);

    // Prepare diploma data with category settings
    const preparedData = categoryGen.prepareDiplomaData(diplomaData, category);

    // Generate PDF
    const pdfBuffer = await premiumDiplomaService.generatePremiumDiploma(preparedData);

    // Optionally save to database
    if (customerInfo.saveToDatabase) {
      const { CertificateModel } = require('../models/certificateModel');
      const certificateData = {
        user_id: userId,
        certificate_type: 'diploma',
        title: `${preparedData.degree_type} - ${category}`,
        school_name: preparedData.school_name,
        school_location: preparedData.school_location,
        recipient_name: preparedData.recipient_name,
        student_id: preparedData.student_id,
        degree_type: preparedData.degree_type,
        program_name: preparedData.major,
        honors: preparedData.honors,
        graduation_date: preparedData.graduation_date,
        custom_text: preparedData.custom_text,
        custom_fields: {
          gpa: preparedData.gpa,
          category: category,
          courses: preparedData.courses
        },
        design_overrides: {
          paperTexture: preparedData.paper_texture,
          fontStyle: preparedData.font_style,
          primaryColor: preparedData.primary_color,
          accentColor: preparedData.accent_color
        }
      };

      await CertificateModel.create(certificateData);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="diploma-${category}-${Date.now()}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate diploma for category error:', error);
    res.status(500).json({
      error: 'Failed to generate diploma',
      details: error.message
    });
  }
};

/**
 * Get editable diploma template for category
 */
exports.getDiplomaTemplate = async (req, res) => {
  try {
    const { category } = req.params;

    const CategoryGenerator = require('../utils/categoryGenerator');
    const categoryGen = new CategoryGenerator();

    const template = categoryGen.generateEditableDiplomaTemplate(category);

    res.json({
      template,
      category: categoryGen.getCategoryDisplayName(category)
    });
  } catch (error) {
    console.error('Get diploma template error:', error);
    res.status(500).json({
      error: 'Failed to get diploma template'
    });
  }
};

/**
 * Get available GPA categories
 */
exports.getGPACategories = async (req, res) => {
  try {
    const CategoryGenerator = require('../utils/categoryGenerator');
    const categoryGen = new CategoryGenerator();

    const categories = categoryGen.getAvailableCategories();

    res.json({
      categories
    });
  } catch (error) {
    console.error('Get GPA categories error:', error);
    res.status(500).json({
      error: 'Failed to get GPA categories'
    });
  }
};

/**
 * Generate diploma preview (without saving)
 */
exports.previewDiploma = async (req, res) => {
  try {
    const diplomaData = req.body;
    const premiumDiplomaService = require('../services/premiumDiplomaService');

    const pdfBuffer = await premiumDiplomaService.generatePremiumDiploma(diplomaData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="diploma-preview.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Preview diploma error:', error);
    res.status(500).json({
      error: 'Failed to generate diploma preview',
      details: error.message
    });
  }
};
