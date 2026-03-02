const sealModel = require('../models/sealModel');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// File extension mapping based on MIME types
const MIME_TO_EXT = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/webp': '.webp'
};

class SealController {
  /**
   * Upload and create a new official seal
   */
  async createSeal(req, res) {
    try {
      const { name, description, seal_type, metadata, valid_until } = req.body;
      const userId = req.user.userId;

      // Validate required fields
      if (!name || !seal_type) {
        return res.status(400).json({
          error: 'Name and seal type are required'
        });
      }

      // Validate seal type
      const validTypes = ['institutional', 'departmental', 'accreditation', 'registrar'];
      if (!validTypes.includes(seal_type)) {
        return res.status(400).json({
          error: 'Invalid seal type. Must be one of: ' + validTypes.join(', ')
        });
      }

      let imagePath = null;
      let imageData = null;

      // Handle file upload if present
      if (req.file) {
        // Use MIME type to determine extension
        const ext = MIME_TO_EXT[req.file.mimetype] || '.png';
        const filename = `seal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        imagePath = `/seals/${filename}`;
        const fullPath = path.join(__dirname, '../public/seals', filename);

        try {
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          // Save file to disk
          await fs.writeFile(fullPath, req.file.buffer);
        } catch (writeError) {
          console.error('Failed to write seal image:', writeError);
          return res.status(500).json({
            error: 'Failed to save seal image',
            details: writeError.message
          });
        }
        
        // Also store in database
        imageData = req.file.buffer;
      }

      let parsedMetadata = {};
      if (metadata) {
        try {
          parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata);
        } catch (_e) {
          return res.status(400).json({ error: 'Invalid metadata JSON' });
        }
      }

      const sealData = {
        name,
        description,
        image_path: imagePath,
        image_data: imageData,
        seal_type,
        metadata: parsedMetadata,
        valid_until: valid_until || null,
        created_by: userId
      };

      const seal = await sealModel.create(sealData);

      res.status(201).json({
        message: 'Seal created successfully',
        seal: {
          id: seal.id,
          name: seal.name,
          description: seal.description,
          seal_type: seal.seal_type,
          image_path: seal.image_path,
          created_at: seal.created_at
        }
      });
    } catch (error) {
      console.error('Create seal error:', error);
      res.status(500).json({
        error: 'Failed to create seal',
        details: error.message
      });
    }
  }

  /**
   * Get all active seals
   */
  async getAllSeals(req, res) {
    try {
      const seals = await sealModel.getAllActive();

      res.json({
        message: 'Seals retrieved successfully',
        count: seals.length,
        seals
      });
    } catch (error) {
      console.error('Get seals error:', error);
      res.status(500).json({
        error: 'Failed to retrieve seals',
        details: error.message
      });
    }
  }

  /**
   * Get seal by ID
   */
  async getSealById(req, res) {
    try {
      const { id } = req.params;
      const seal = await sealModel.getById(id);

      if (!seal) {
        return res.status(404).json({
          error: 'Seal not found'
        });
      }

      res.json({
        message: 'Seal retrieved successfully',
        seal: {
          id: seal.id,
          name: seal.name,
          description: seal.description,
          seal_type: seal.seal_type,
          image_path: seal.image_path,
          metadata: seal.metadata,
          valid_from: seal.valid_from,
          valid_until: seal.valid_until,
          created_at: seal.created_at
        }
      });
    } catch (error) {
      console.error('Get seal error:', error);
      res.status(500).json({
        error: 'Failed to retrieve seal',
        details: error.message
      });
    }
  }

  /**
   * Get seals by type
   */
  async getSealsByType(req, res) {
    try {
      const { type } = req.params;
      const seals = await sealModel.getByType(type);

      res.json({
        message: 'Seals retrieved successfully',
        seal_type: type,
        count: seals.length,
        seals
      });
    } catch (error) {
      console.error('Get seals by type error:', error);
      res.status(500).json({
        error: 'Failed to retrieve seals',
        details: error.message
      });
    }
  }

  /**
   * Update seal
   */
  async updateSeal(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if seal exists
      const existingSeal = await sealModel.getById(id);
      if (!existingSeal) {
        return res.status(404).json({
          error: 'Seal not found'
        });
      }

      // Handle file upload if present
      if (req.file) {
        // Use MIME type to determine extension
        const ext = MIME_TO_EXT[req.file.mimetype] || '.png';
        const filename = `seal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        updates.image_path = `/seals/${filename}`;
        const fullPath = path.join(__dirname, '../public/seals', filename);
        
        try {
          // Ensure directory exists
          const dir = path.dirname(fullPath);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(fullPath, req.file.buffer);
          updates.image_data = req.file.buffer;

          // Delete old file if exists
          if (existingSeal.image_path) {
            const oldPath = path.join(__dirname, '../public', existingSeal.image_path);
            try {
              await fs.unlink(oldPath);
            } catch (err) {
              console.error('Failed to delete old seal image:', err);
            }
          }
        } catch (writeError) {
          console.error('Failed to write updated seal image:', writeError);
          return res.status(500).json({
            error: 'Failed to save updated seal image',
            details: writeError.message
          });
        }
      }

      const updatedSeal = await sealModel.update(id, updates);

      res.json({
        message: 'Seal updated successfully',
        seal: {
          id: updatedSeal.id,
          name: updatedSeal.name,
          description: updatedSeal.description,
          seal_type: updatedSeal.seal_type,
          image_path: updatedSeal.image_path,
          updated_at: updatedSeal.updated_at
        }
      });
    } catch (error) {
      console.error('Update seal error:', error);
      res.status(500).json({
        error: 'Failed to update seal',
        details: error.message
      });
    }
  }

  /**
   * Delete seal (soft delete)
   */
  async deleteSeal(req, res) {
    try {
      const { id } = req.params;

      const seal = await sealModel.getById(id);
      if (!seal) {
        return res.status(404).json({
          error: 'Seal not found'
        });
      }

      await sealModel.delete(id);

      res.json({
        message: 'Seal deleted successfully'
      });
    } catch (error) {
      console.error('Delete seal error:', error);
      res.status(500).json({
        error: 'Failed to delete seal',
        details: error.message
      });
    }
  }

  /**
   * Verify seal using verification code
   */
  async verifySeal(req, res) {
    try {
      const { verification_code } = req.params;

      if (!verification_code) {
        return res.status(400).json({
          error: 'Verification code is required'
        });
      }

      const verificationResult = await sealModel.verifySeal(verification_code);

      if (!verificationResult) {
        return res.status(404).json({
          error: 'Invalid verification code',
          is_valid: false
        });
      }

      res.json({
        message: verificationResult.is_valid ? 'Seal is valid' : 'Seal is not valid',
        verification: {
          is_valid: verificationResult.is_valid,
          seal_name: verificationResult.seal_name,
          seal_type: verificationResult.seal_type,
          transcript_id: verificationResult.transcript_id,
          transcript_type: verificationResult.transcript_type,
          used_at: verificationResult.used_at
        }
      });
    } catch (error) {
      console.error('Verify seal error:', error);
      res.status(500).json({
        error: 'Failed to verify seal',
        details: error.message
      });
    }
  }

  /**
   * Get seal usage statistics
   */
  async getSealStats(req, res) {
    try {
      const { id } = req.params;

      const seal = await sealModel.getById(id);
      if (!seal) {
        return res.status(404).json({
          error: 'Seal not found'
        });
      }

      const stats = await sealModel.getUsageStats(id);

      res.json({
        message: 'Seal statistics retrieved successfully',
        seal_id: parseInt(id, 10),
        seal_name: seal.name,
        statistics: stats
      });
    } catch (error) {
      console.error('Get seal stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve seal statistics',
        details: error.message
      });
    }
  }

  /**
   * Download seal image
   */
  async downloadSealImage(req, res) {
    try {
      const { id } = req.params;

      const seal = await sealModel.getSealWithImage(id);
      if (!seal) {
        return res.status(404).json({
          error: 'Seal not found'
        });
      }

      if (!seal.image_data) {
        return res.status(404).json({
          error: 'Seal image not available'
        });
      }

      // Set appropriate content type
      const ext = path.extname(seal.image_path || '.png').toLowerCase();
      const contentTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
      };

      res.set('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.send(seal.image_data);
    } catch (error) {
      console.error('Download seal image error:', error);
      res.status(500).json({
        error: 'Failed to download seal image',
        details: error.message
      });
    }
  }
}

module.exports = new SealController();
