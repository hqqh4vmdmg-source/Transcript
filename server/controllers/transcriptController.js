const { validationResult } = require('express-validator');
const Transcript = require('../models/transcriptModel');
const pdfService = require('../services/pdfService');

// Create a new transcript
exports.createTranscript = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, data } = req.body;
    const user_id = req.user.userId;

    // Validate type
    if (!['high_school', 'college'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transcript type. Must be "high_school" or "college"' });
    }

    // Create transcript
    const transcript = await Transcript.create({ user_id, type, data });

    // Add courses if provided
    if (data.courses && Array.isArray(data.courses)) {
      for (const course of data.courses) {
        await Transcript.addCourse(transcript.id, course);
      }
    }

    res.status(201).json({
      message: 'Transcript created successfully',
      transcript
    });
  } catch (error) {
    console.error('Create transcript error:', error);
    res.status(500).json({ message: 'Server error creating transcript' });
  }
};

// Get all transcripts for the current user
exports.getTranscripts = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { type, search, sort } = req.query;
    const transcripts = await Transcript.findByUserId(user_id, { type, search, sort });

    res.status(200).json({ transcripts });
  } catch (error) {
    console.error('Get transcripts error:', error);
    res.status(500).json({ message: 'Server error fetching transcripts' });
  }
};

// Get a specific transcript
exports.getTranscript = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const transcript = await Transcript.findByIdAndUserId(id, user_id);

    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    // Get associated courses
    const courses = await Transcript.getCourses(id);

    res.status(200).json({
      transcript,
      courses
    });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({ message: 'Server error fetching transcript' });
  }
};

// Update a transcript
exports.updateTranscript = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const user_id = req.user.userId;
    const { type, data } = req.body;

    // Check if transcript exists and belongs to user
    const existingTranscript = await Transcript.findByIdAndUserId(id, user_id);
    if (!existingTranscript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    // Update transcript
    const updates = {};
    if (type) updates.type = type;
    if (data) updates.data = data;

    const updatedTranscript = await Transcript.update(id, updates);

    res.status(200).json({
      message: 'Transcript updated successfully',
      transcript: updatedTranscript
    });
  } catch (error) {
    console.error('Update transcript error:', error);
    res.status(500).json({ message: 'Server error updating transcript' });
  }
};

// Delete a transcript
exports.deleteTranscript = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const deletedTranscript = await Transcript.delete(id, user_id);

    if (!deletedTranscript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    res.status(200).json({ message: 'Transcript deleted successfully' });
  } catch (error) {
    console.error('Delete transcript error:', error);
    res.status(500).json({ message: 'Server error deleting transcript' });
  }
};

// Duplicate a transcript
exports.duplicateTranscript = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;

    const newTranscript = await Transcript.duplicate(id, user_id);

    if (!newTranscript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    res.status(201).json({
      message: 'Transcript duplicated successfully',
      transcript: newTranscript
    });
  } catch (error) {
    console.error('Duplicate transcript error:', error);
    res.status(500).json({ message: 'Server error duplicating transcript' });
  }
};

// Generate PDF for a transcript
exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.userId;
    const { seal_id } = req.query; // Optional seal ID from query params

    // Get transcript data
    const transcript = await Transcript.findByIdAndUserId(id, user_id);
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found' });
    }

    // Get courses
    const courses = await Transcript.getCourses(id);

    // Generate PDF with optional seal
    const pdfBuffer = await pdfService.generateTranscriptPDF({
      id: transcript.id,
      ...transcript,
      courses
    }, seal_id, user_id);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transcript-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};
