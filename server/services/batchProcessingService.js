const { CertificateModel } = require('../models/certificateModel');
const Transcript = require('../models/transcriptModel');
const premiumDiplomaService = require('./premiumDiplomaService');
const pdfService = require('./pdfService');
const JSZip = require('jszip');

/**
 * Batch Processing Service
 * Handles bulk generation of transcripts and diplomas
 */
class BatchProcessingService {
  constructor() {
    this.maxBatchSize = 100;
    this.processingJobs = new Map();
  }

  /**
   * Batch generate transcripts from CSV/JSON data
   */
  async batchGenerateTranscripts(userId, studentsData, options = {}) {
    const {
      type = 'high_school',
      format = 'pdf',
      saveToDatabase = true
    } = options;

    if (studentsData.length > this.maxBatchSize) {
      throw new Error(`Batch size exceeds maximum of ${this.maxBatchSize}`);
    }

    const jobId = this.generateJobId();
    this.processingJobs.set(jobId, {
      status: 'processing',
      total: studentsData.length,
      completed: 0,
      failed: 0,
      startedAt: new Date()
    });

    const results = {
      jobId,
      successful: [],
      failed: [],
      pdfs: []
    };

    try {
      for (let i = 0; i < studentsData.length; i++) {
        const studentData = studentsData[i];
        
        try {
          // Create transcript
          const transcriptData = {
            user_id: userId,
            type,
            data: {
              schoolName: studentData.schoolName,
              schoolAddress: studentData.schoolAddress,
              studentName: studentData.studentName,
              studentId: studentData.studentId,
              dateOfBirth: studentData.dateOfBirth,
              cumulativeGPA: studentData.cumulativeGPA,
              gradeLevel: studentData.gradeLevel,
              graduationDate: studentData.graduationDate,
              major: studentData.major,
              degree: studentData.degree,
              expectedGraduation: studentData.expectedGraduation
            }
          };

          let transcript;
          if (saveToDatabase) {
            transcript = await Transcript.create(transcriptData);
            
            // Add courses if provided
            if (studentData.courses && Array.isArray(studentData.courses)) {
              for (const course of studentData.courses) {
                await Transcript.addCourse(transcript.id, course);
              }
            }
          } else {
            transcript = { id: i + 1, ...transcriptData };
          }

          // Generate PDF if requested
          if (format === 'pdf') {
            const fullTranscript = saveToDatabase 
              ? await Transcript.findById(transcript.id)
              : transcript;
              
            const courses = saveToDatabase
              ? await Transcript.getCourses(transcript.id)
              : studentData.courses || [];

            const pdfBuffer = await pdfService.generateTranscriptPDF({
              ...fullTranscript,
              courses
            });

            results.pdfs.push({
              filename: `transcript_${studentData.studentId || i + 1}.pdf`,
              buffer: pdfBuffer,
              studentName: studentData.studentName
            });
          }

          results.successful.push({
            studentName: studentData.studentName,
            studentId: studentData.studentId,
            transcriptId: transcript.id
          });

          // Update job status
          this.updateJobStatus(jobId, 'completed');
          
        } catch (error) {
          console.error(`Failed to process student ${studentData.studentName}:`, error);
          results.failed.push({
            studentName: studentData.studentName,
            studentId: studentData.studentId,
            error: error.message
          });
          
          this.updateJobStatus(jobId, 'failed');
        }
      }

      // Complete job
      const job = this.processingJobs.get(jobId);
      job.status = 'completed';
      job.completedAt = new Date();

      return results;
      
    } catch (error) {
      const job = this.processingJobs.get(jobId);
      job.status = 'error';
      job.error = error.message;
      throw error;
    }
  }

  /**
   * Batch generate diplomas for GPA categories
   */
  async batchGenerateDiplomas(userId, diplomasData, options = {}) {
    const {
      saveToDatabase = false,
      createZip = true
    } = options;

    if (diplomasData.length > this.maxBatchSize) {
      throw new Error(`Batch size exceeds maximum of ${this.maxBatchSize}`);
    }

    const jobId = this.generateJobId();
    this.processingJobs.set(jobId, {
      status: 'processing',
      total: diplomasData.length,
      completed: 0,
      failed: 0,
      startedAt: new Date()
    });

    const results = {
      jobId,
      successful: [],
      failed: [],
      pdfs: []
    };

    try {
      for (let i = 0; i < diplomasData.length; i++) {
        const diplomaData = diplomasData[i];
        
        try {
          // Generate diploma PDF
          const pdfBuffer = await premiumDiplomaService.generatePremiumDiploma(diplomaData);

          // Save to database if requested
          if (saveToDatabase) {
            const certificateData = {
              user_id: userId,
              certificate_type: 'diploma',
              title: `${diplomaData.degree_type} - Batch ${jobId}`,
              school_name: diplomaData.school_name,
              school_location: diplomaData.school_location,
              recipient_name: diplomaData.recipient_name,
              student_id: diplomaData.student_id,
              degree_type: diplomaData.degree_type,
              program_name: diplomaData.major,
              honors: diplomaData.honors,
              graduation_date: diplomaData.graduation_date,
              custom_fields: {
                gpa: diplomaData.gpa,
                category: diplomaData.category
              }
            };

            await CertificateModel.create(certificateData);
          }

          results.pdfs.push({
            filename: `diploma_${diplomaData.recipient_name.replace(/\s+/g, '_')}_${i + 1}.pdf`,
            buffer: pdfBuffer,
            recipientName: diplomaData.recipient_name
          });

          results.successful.push({
            recipientName: diplomaData.recipient_name,
            studentId: diplomaData.student_id,
            category: diplomaData.category
          });

          this.updateJobStatus(jobId, 'completed');
          
        } catch (error) {
          console.error(`Failed to process diploma for ${diplomaData.recipient_name}:`, error);
          results.failed.push({
            recipientName: diplomaData.recipient_name,
            error: error.message
          });
          
          this.updateJobStatus(jobId, 'failed');
        }
      }

      // Create ZIP file if requested
      if (createZip && results.pdfs.length > 0) {
        results.zipBuffer = await this.createZipArchive(results.pdfs);
      }

      // Complete job
      const job = this.processingJobs.get(jobId);
      job.status = 'completed';
      job.completedAt = new Date();

      return results;
      
    } catch (error) {
      const job = this.processingJobs.get(jobId);
      job.status = 'error';
      job.error = error.message;
      throw error;
    }
  }

  /**
   * Create ZIP archive from PDFs
   */
  async createZipArchive(pdfs) {
    const zip = new JSZip();

    pdfs.forEach(pdf => {
      zip.file(pdf.filename, pdf.buffer);
    });

    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Parse CSV data for batch processing
   */
  parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }

    return data;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    return this.processingJobs.get(jobId) || null;
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId, type) {
    const job = this.processingJobs.get(jobId);
    if (!job) return;

    if (type === 'completed') {
      job.completed++;
    } else if (type === 'failed') {
      job.failed++;
    }

    job.progress = Math.round((job.completed + job.failed) / job.total * 100);
  }

  /**
   * Generate unique job ID
   */
  generateJobId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Clean up old jobs (older than 24 hours)
   */
  cleanupOldJobs() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const [jobId, job] of this.processingJobs.entries()) {
      if (job.startedAt.getTime() < cutoffTime) {
        this.processingJobs.delete(jobId);
      }
    }
  }
}

module.exports = new BatchProcessingService();
