const db = require('../config/database');
const xlsx = require('xlsx');
const { parse: parseCSV } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

/**
 * Transcript Enhancements Service
 * Implements all 10 Category 1 features
 */
class TranscriptEnhancementsService {
  
  /**
   * Feature 1.1: Batch Transcript Generation
   * Generate up to 100 transcripts at once
   */
  async batchGenerateTranscripts(userId, transcriptsData, options = {}) {
    const { template_id, format = 'pdf' } = options;
    
    if (transcriptsData.length > 100) {
      throw new Error('Maximum 100 transcripts per batch');
    }

    // Create batch job
    const batchJob = await db.query(
      `INSERT INTO batch_jobs (user_id, job_type, job_name, job_config, total_items, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        'transcript_generation',
        `Batch Generation - ${new Date().toISOString()}`,
        JSON.stringify({ template_id, format }),
        transcriptsData.length,
        'processing'
      ]
    );

    const jobId = batchJob.rows[0].id;
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    // Process each transcript
    for (const transcriptData of transcriptsData) {
      try {
        // If template_id provided, merge with template
        let finalData = transcriptData;
        if (template_id) {
          const template = await this.getTemplateById(template_id);
          finalData = { ...template.template_config, ...transcriptData };
        }

        // Create transcript
        const result = await db.query(
          `INSERT INTO transcripts (user_id, student_name, student_id, school_name, data)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [userId, finalData.student_name, finalData.student_id, finalData.school_name, JSON.stringify(finalData)]
        );

        results.push({ success: true, transcriptId: result.rows[0].id, studentName: finalData.student_name });
        successCount++;
      } catch (error) {
        results.push({ success: false, error: error.message, studentName: transcriptData.student_name });
        failedCount++;
      }
    }

    // Update batch job
    await db.query(
      `UPDATE batch_jobs 
       SET status = $1, processed_items = $2, success_items = $3, failed_items = $4,
           results = $5, completed_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      ['completed', transcriptsData.length, successCount, failedCount, JSON.stringify(results), jobId]
    );

    return {
      jobId,
      total: transcriptsData.length,
      success: successCount,
      failed: failedCount,
      results
    };
  }

  /**
   * Feature 1.2: CSV/Excel Import Support
   * Import transcript data from CSV or Excel files
   */
  async importFromFile(userId, filePath, fileType, columnMapping) {
    let data;

    try {
      if (fileType === 'csv') {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        data = parseCSV(fileContent, { columns: true, skip_empty_lines: true });
      } else if (fileType === 'excel' || fileType === 'xlsx') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Map columns to transcript fields
      const mappedData = data.map(row => {
        const mapped = {};
        Object.keys(columnMapping).forEach(targetField => {
          const sourceField = columnMapping[targetField];
          mapped[targetField] = row[sourceField];
        });
        return mapped;
      });

      // Create import history record
      const importRecord = await db.query(
        `INSERT INTO import_history (user_id, import_type, file_name, rows_total, column_mapping)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, fileType, path.basename(filePath), data.length, JSON.stringify(columnMapping)]
      );

      // Use batch generation for imported data
      const batchResult = await this.batchGenerateTranscripts(userId, mappedData);

      // Update import history
      await db.query(
        `UPDATE import_history 
         SET rows_imported = $1, rows_failed = $2, batch_job_id = $3
         WHERE id = $4`,
        [batchResult.success, batchResult.failed, batchResult.jobId, importRecord.rows[0].id]
      );

      return {
        importId: importRecord.rows[0].id,
        ...batchResult
      };
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Feature 1.3: Template System
   * Create and manage reusable transcript templates
   */
  async createTemplate(userId, templateData) {
    const { name, description, template_config, category, is_public } = templateData;

    const result = await db.query(
      `INSERT INTO transcript_templates (user_id, name, description, template_config, category, is_public, template_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, name, description, JSON.stringify(template_config), category, is_public || false, 'custom']
    );

    return result.rows[0];
  }

  async getTemplateById(templateId) {
    const result = await db.query('SELECT * FROM transcript_templates WHERE id = $1', [templateId]);
    if (result.rows.length === 0) throw new Error('Template not found');
    return result.rows[0];
  }

  async getUserTemplates(userId, includePublic = true) {
    let query = 'SELECT * FROM transcript_templates WHERE user_id = $1';
    if (includePublic) {
      query += ' OR is_public = true';
    }
    query += ' ORDER BY usage_count DESC, created_at DESC';

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  async applyTemplate(templateId, transcriptData) {
    const template = await this.getTemplateById(templateId);
    
    // Increment usage count
    await db.query('UPDATE transcript_templates SET usage_count = usage_count + 1 WHERE id = $1', [templateId]);

    // Merge template config with transcript data
    return {
      ...template.template_config,
      ...transcriptData,
      templateId: template.id,
      templateName: template.name
    };
  }

  /**
   * Feature 1.4: Draft Mode
   * Save and manage incomplete transcripts
   */
  async saveDraft(userId, draftData, templateId = null) {
    // Calculate completion percentage
    const requiredFields = ['student_name', 'student_id', 'school_name', 'major', 'gpa'];
    const completedFields = requiredFields.filter(field => draftData[field]).length;
    const completionPercentage = (completedFields / requiredFields.length) * 100;

    const result = await db.query(
      `INSERT INTO transcript_drafts (user_id, template_id, draft_data, completion_percentage, last_auto_save)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, templateId, JSON.stringify(draftData), completionPercentage]
    );

    return result.rows[0];
  }

  async updateDraft(draftId, draftData) {
    const requiredFields = ['student_name', 'student_id', 'school_name', 'major', 'gpa'];
    const completedFields = requiredFields.filter(field => draftData[field]).length;
    const completionPercentage = (completedFields / requiredFields.length) * 100;

    const result = await db.query(
      `UPDATE transcript_drafts 
       SET draft_data = $1, completion_percentage = $2, updated_at = CURRENT_TIMESTAMP, last_auto_save = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [JSON.stringify(draftData), completionPercentage, draftId]
    );

    return result.rows[0];
  }

  async getUserDrafts(userId) {
    const result = await db.query(
      'SELECT * FROM transcript_drafts WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  }

  async convertDraftToTranscript(draftId) {
    const draft = await db.query('SELECT * FROM transcript_drafts WHERE id = $1', [draftId]);
    if (draft.rows.length === 0) throw new Error('Draft not found');

    const draftData = draft.rows[0].draft_data;
    
    // Create transcript from draft
    const transcript = await db.query(
      `INSERT INTO transcripts (user_id, student_name, student_id, school_name, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [draft.rows[0].user_id, draftData.student_name, draftData.student_id, draftData.school_name, JSON.stringify(draftData)]
    );

    // Update draft status
    await db.query('UPDATE transcript_drafts SET status = $1 WHERE id = $2', ['completed', draftId]);

    return { transcriptId: transcript.rows[0].id, draftId };
  }

  /**
   * Feature 1.5: Semester-by-Semester GPA Breakdown
   * Track and display GPA by semester
   */
  async createSemesterRecord(transcriptId, semesterData) {
    const result = await db.query(
      `INSERT INTO semester_records (
        transcript_id, semester_name, semester_number, year, term,
        semester_gpa, semester_credits, semester_quality_points,
        cumulative_gpa, cumulative_credits, courses_taken, courses_passed,
        honor_roll, dean_list
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        transcriptId, semesterData.semester_name, semesterData.semester_number,
        semesterData.year, semesterData.term, semesterData.semester_gpa,
        semesterData.semester_credits, semesterData.semester_quality_points,
        semesterData.cumulative_gpa, semesterData.cumulative_credits,
        semesterData.courses_taken, semesterData.courses_passed,
        semesterData.honor_roll || false, semesterData.dean_list || false
      ]
    );

    return result.rows[0];
  }

  async getSemesterBreakdown(transcriptId) {
    const result = await db.query(
      'SELECT * FROM semester_records WHERE transcript_id = $1 ORDER BY semester_number',
      [transcriptId]
    );

    // Calculate statistics
    const semesters = result.rows;
    const stats = {
      totalSemesters: semesters.length,
      averageSemesterGPA: semesters.reduce((sum, s) => sum + parseFloat(s.semester_gpa), 0) / semesters.length,
      highestSemesterGPA: Math.max(...semesters.map(s => parseFloat(s.semester_gpa))),
      lowestSemesterGPA: Math.min(...semesters.map(s => parseFloat(s.semester_gpa))),
      honorRollSemesters: semesters.filter(s => s.honor_roll).length,
      deanListSemesters: semesters.filter(s => s.dean_list).length
    };

    return { semesters, stats };
  }

  /**
   * Feature 1.6: Course Catalog and Recommendations
   * Recommend courses based on major and progress
   */
  async getCourseRecommendations(major, currentLevel, completedCourses = []) {
    const result = await db.query(
      `SELECT * FROM course_catalog 
       WHERE is_active = true 
       AND level = $1
       AND ($2 = ANY(major_programs) OR 'All' = ANY(major_programs))
       AND course_code NOT IN (SELECT unnest($3::text[]))
       ORDER BY popularity_score DESC, difficulty_rating ASC
       LIMIT 20`,
      [currentLevel, major, completedCourses]
    );

    return result.rows;
  }

  async searchCourseCatalog(searchTerm, filters = {}) {
    let query = 'SELECT * FROM course_catalog WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    if (searchTerm) {
      paramCount++;
      query += ` AND (course_name ILIKE $${paramCount} OR course_code ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${searchTerm}%`);
    }

    if (filters.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      params.push(filters.department);
    }

    if (filters.level) {
      paramCount++;
      query += ` AND level = $${paramCount}`;
      params.push(filters.level);
    }

    query += ' ORDER BY popularity_score DESC LIMIT 50';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Feature 1.7: Credit Tracking Dashboard
   * Track progress toward graduation requirements
   */
  async updateCreditTracking(transcriptId, trackingData) {
    const {
      total_credits_required, total_credits_earned, total_credits_in_progress,
      general_education_required, general_education_earned,
      major_required, major_earned,
      elective_required, elective_earned
    } = trackingData;

    // Calculate derived values
    const completion_percentage = (total_credits_earned / total_credits_required) * 100;
    const credits_remaining = total_credits_required - total_credits_earned;
    const semesters_remaining = Math.ceil(credits_remaining / 15); // Assuming 15 credits per semester
    const on_track = completion_percentage >= 25; // Basic on-track logic

    const result = await db.query(
      `INSERT INTO credit_tracking (
        transcript_id, total_credits_required, total_credits_earned, total_credits_in_progress,
        general_education_required, general_education_earned,
        major_required, major_earned,
        elective_required, elective_earned,
        completion_percentage, credits_remaining, semesters_remaining, on_track
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (transcript_id) DO UPDATE SET
        total_credits_earned = $3, total_credits_in_progress = $4,
        general_education_earned = $6, major_earned = $8, elective_earned = $10,
        completion_percentage = $11, credits_remaining = $12, semesters_remaining = $13,
        on_track = $14, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        transcriptId, total_credits_required, total_credits_earned, total_credits_in_progress,
        general_education_required, general_education_earned,
        major_required, major_earned,
        elective_required, elective_earned,
        completion_percentage, credits_remaining, semesters_remaining, on_track
      ]
    );

    return result.rows[0];
  }

  async getCreditDashboard(transcriptId) {
    const result = await db.query('SELECT * FROM credit_tracking WHERE transcript_id = $1', [transcriptId]);
    return result.rows[0];
  }

  /**
   * Feature 1.8: Multi-Format Export (JSON, CSV, PDF, XML)
   * Export transcripts in various formats
   */
  async exportTranscript(transcriptId, format) {
    const transcript = await db.query('SELECT * FROM transcripts WHERE id = $1', [transcriptId]);
    if (transcript.rows.length === 0) throw new Error('Transcript not found');

    const data = transcript.rows[0];

    switch (format.toLowerCase()) {
      case 'json':
        return { format: 'json', data: JSON.stringify(data, null, 2) };
      
      case 'csv':
        return this.exportToCSV(data);
      
      case 'xml':
        return this.exportToXML(data);
      
      case 'pdf':
        return this.exportToPDF(data);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportToCSV(data) {
    const courses = data.data.courses || [];
    let csv = 'Course Code,Course Name,Credits,Grade,Quality Points\n';
    
    courses.forEach(course => {
      csv += `${course.code},${course.name},${course.credits},${course.grade},${course.qualityPoints}\n`;
    });

    return { format: 'csv', data: csv };
  }

  exportToXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<transcript>\n';
    xml += `  <student_name>${data.student_name}</student_name>\n`;
    xml += `  <student_id>${data.student_id}</student_id>\n`;
    xml += `  <school_name>${data.school_name}</school_name>\n`;
    xml += `  <gpa>${data.data.gpa}</gpa>\n`;
    xml += '  <courses>\n';
    
    const courses = data.data.courses || [];
    courses.forEach(course => {
      xml += '    <course>\n';
      xml += `      <code>${course.code}</code>\n`;
      xml += `      <name>${course.name}</name>\n`;
      xml += `      <credits>${course.credits}</credits>\n`;
      xml += `      <grade>${course.grade}</grade>\n`;
      xml += '    </course>\n';
    });
    
    xml += '  </courses>\n';
    xml += '</transcript>';

    return { format: 'xml', data: xml };
  }

  exportToPDF(_data) {
    // This would generate a PDF using pdfService
    return { format: 'pdf', message: 'PDF generation handled by pdfService' };
  }

  /**
   * Feature 1.9: Transcript Comparison Tool
   * Compare two or more transcripts
   */
  async compareTranscripts(userId, transcriptIds) {
    if (transcriptIds.length < 2) {
      throw new Error('At least 2 transcripts required for comparison');
    }

    const transcripts = await db.query(
      'SELECT * FROM transcripts WHERE id = ANY($1)',
      [transcriptIds]
    );

    if (transcripts.rows.length !== transcriptIds.length) {
      throw new Error('One or more transcripts not found');
    }

    // Perform comparison
    const comparison = {
      transcripts: transcripts.rows.map(t => ({
        id: t.id,
        student_name: t.student_name,
        gpa: t.data.gpa,
        total_credits: t.data.totalCredits
      })),
      gpaDifferences: {},
      courseDifferences: {},
      creditDifferences: {},
      similarities: []
    };

    // Calculate differences
    const gpas = transcripts.rows.map(t => parseFloat(t.data.gpa));
    comparison.gpaDifferences = {
      highest: Math.max(...gpas),
      lowest: Math.min(...gpas),
      average: gpas.reduce((a, b) => a + b, 0) / gpas.length,
      range: Math.max(...gpas) - Math.min(...gpas)
    };

    // Save comparison
    const result = await db.query(
      `INSERT INTO transcript_comparisons (user_id, transcript_ids, comparison_data)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, transcriptIds, JSON.stringify(comparison)]
    );

    return { comparisonId: result.rows[0].id, ...comparison };
  }

  /**
   * Feature 1.10: Academic Progress Timeline
   * Track and visualize academic journey
   */
  async createTimelineEvent(transcriptId, eventData) {
    const result = await db.query(
      `INSERT INTO academic_timeline (
        transcript_id, event_date, event_type, event_title, event_description,
        semester_id, course_id, is_milestone, milestone_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        transcriptId, eventData.event_date, eventData.event_type,
        eventData.event_title, eventData.event_description,
        eventData.semester_id || null, eventData.course_id || null,
        eventData.is_milestone || false, eventData.milestone_type || null,
        JSON.stringify(eventData.metadata || {})
      ]
    );

    return result.rows[0];
  }

  async getAcademicTimeline(transcriptId) {
    const result = await db.query(
      `SELECT * FROM academic_timeline 
       WHERE transcript_id = $1 
       ORDER BY event_date ASC`,
      [transcriptId]
    );

    // Group by year
    const timeline = result.rows;
    const grouped = {};
    
    timeline.forEach(event => {
      const year = new Date(event.event_date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(event);
    });

    return { timeline, groupedByYear: grouped };
  }

  async generateAutomaticTimeline(transcriptId) {
    // Get semester records
    const semesters = await db.query(
      'SELECT * FROM semester_records WHERE transcript_id = $1 ORDER BY semester_number',
      [transcriptId]
    );

    const events = [];

    // Create timeline events for each semester
    for (const semester of semesters.rows) {
      // Semester start
      events.push({
        event_date: new Date(semester.year, this.getMonthForTerm(semester.term, 'start'), 1),
        event_type: 'semester_start',
        event_title: `${semester.semester_name} - Semester Start`,
        event_description: `Started ${semester.courses_taken} courses`,
        semester_id: semester.id
      });

      // Semester end
      events.push({
        event_date: new Date(semester.year, this.getMonthForTerm(semester.term, 'end'), 15),
        event_type: 'semester_end',
        event_title: `${semester.semester_name} - Semester End`,
        event_description: `Completed with GPA: ${semester.semester_gpa}`,
        semester_id: semester.id,
        is_milestone: semester.honor_roll || semester.dean_list,
        milestone_type: semester.dean_list ? 'dean_list' : (semester.honor_roll ? 'honor_roll' : null)
      });
    }

    // Insert all events
    for (const eventData of events) {
      await this.createTimelineEvent(transcriptId, eventData);
    }

    return events;
  }

  getMonthForTerm(term, startOrEnd) {
    const termMonths = {
      fall: { start: 8, end: 11 },    // September - December
      spring: { start: 0, end: 4 },   // January - May
      summer: { start: 5, end: 7 },   // June - August
      winter: { start: 11, end: 0 }   // December - January
    };

    return termMonths[term.toLowerCase()][startOrEnd];
  }
}

module.exports = new TranscriptEnhancementsService();
