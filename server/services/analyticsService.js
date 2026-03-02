const { CertificateModel } = require('../models/certificateModel');
const Transcript = require('../models/transcriptModel');

/**
 * Analytics Service
 * Provides statistics and insights for transcripts and certificates
 */
class AnalyticsService {
  /**
   * Get user analytics dashboard data
   */
  async getUserAnalytics(userId) {
    try {
      // Get transcript statistics
      const transcriptStats = await this.getTranscriptStats(userId);
      
      // Get certificate statistics
      const certificateStats = await this.getCertificateStats(userId);
      
      // Get GPA distribution
      const gpaDistribution = await this.getGPADistribution(userId);
      
      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);
      
      // Get popular templates
      const popularTemplates = await this.getPopularTemplates(userId);

      return {
        transcripts: transcriptStats,
        certificates: certificateStats,
        gpaDistribution,
        recentActivity,
        popularTemplates,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }

  /**
   * Get transcript statistics
   */
  async getTranscriptStats(userId) {
    const transcripts = await Transcript.findByUserId(userId);
    
    const stats = {
      total: transcripts.length,
      byType: {
        high_school: transcripts.filter(t => t.type === 'high_school').length,
        college: transcripts.filter(t => t.type === 'college').length
      },
      byYearLevel: {},
      averageGPA: 0,
      highestGPA: 0,
      lowestGPA: 4.0
    };

    // Calculate GPA statistics
    let totalGPA = 0;
    let gpaCount = 0;

    transcripts.forEach(t => {
      const gpa = parseFloat(t.data?.cumulativeGPA || 0);
      if (gpa > 0) {
        totalGPA += gpa;
        gpaCount++;
        stats.highestGPA = Math.max(stats.highestGPA, gpa);
        stats.lowestGPA = Math.min(stats.lowestGPA, gpa);
      }

      // Count by year level
      const yearLevel = t.year_level || 'unspecified';
      stats.byYearLevel[yearLevel] = (stats.byYearLevel[yearLevel] || 0) + 1;
    });

    stats.averageGPA = gpaCount > 0 ? (totalGPA / gpaCount).toFixed(2) : 0;
    
    return stats;
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats(userId) {
    const certificates = await CertificateModel.findByUserId(userId);
    
    const stats = {
      total: certificates.length,
      byType: {},
      byCategory: {},
      withHonors: 0,
      byStatus: {
        draft: 0,
        finalized: 0,
        issued: 0
      }
    };

    certificates.forEach(cert => {
      // Count by type
      const type = cert.certificate_type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count by category
      if (cert.custom_fields?.category) {
        const category = cert.custom_fields.category;
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      }

      // Count honors
      if (cert.honors) {
        stats.withHonors++;
      }

      // Count by status
      const status = cert.status || 'draft';
      stats.byStatus[status]++;
    });

    return stats;
  }

  /**
   * Get GPA distribution
   */
  async getGPADistribution(userId) {
    const transcripts = await Transcript.findByUserId(userId);
    
    const distribution = {
      '0.0-1.0': 0,
      '1.0-2.0': 0,
      '2.0-2.5': 0,
      '2.5-3.0': 0,
      '3.0-3.5': 0,
      '3.5-3.7': 0,
      '3.7-3.85': 0,
      '3.85-4.0': 0
    };

    transcripts.forEach(t => {
      const gpa = parseFloat(t.data?.cumulativeGPA || 0);
      
      if (gpa >= 0 && gpa < 1.0) distribution['0.0-1.0']++;
      else if (gpa >= 1.0 && gpa < 2.0) distribution['1.0-2.0']++;
      else if (gpa >= 2.0 && gpa < 2.5) distribution['2.0-2.5']++;
      else if (gpa >= 2.5 && gpa < 3.0) distribution['2.5-3.0']++;
      else if (gpa >= 3.0 && gpa < 3.5) distribution['3.0-3.5']++;
      else if (gpa >= 3.5 && gpa < 3.7) distribution['3.5-3.7']++;
      else if (gpa >= 3.7 && gpa < 3.85) distribution['3.7-3.85']++;
      else if (gpa >= 3.85 && gpa <= 4.0) distribution['3.85-4.0']++;
    });

    return distribution;
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(userId, limit = 10) {
    const transcripts = await Transcript.findByUserId(userId);
    const certificates = await CertificateModel.findByUserId(userId);

    const activities = [];

    // Add transcripts
    transcripts.forEach(t => {
      activities.push({
        type: 'transcript',
        action: 'created',
        item: {
          id: t.id,
          studentName: t.data?.studentName,
          schoolName: t.data?.schoolName,
          gpa: t.data?.cumulativeGPA
        },
        timestamp: t.created_at
      });
    });

    // Add certificates
    certificates.forEach(c => {
      activities.push({
        type: 'certificate',
        action: 'created',
        item: {
          id: c.id,
          recipientName: c.recipient_name,
          schoolName: c.school_name,
          honors: c.honors
        },
        timestamp: c.created_at
      });
    });

    // Sort by timestamp, most recent first
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, limit);
  }

  /**
   * Get popular templates used
   */
  async getPopularTemplates(userId) {
    const certificates = await CertificateModel.findByUserId(userId);
    
    const templateCount = {};
    
    certificates.forEach(cert => {
      if (cert.template_id) {
        templateCount[cert.template_id] = (templateCount[cert.template_id] || 0) + 1;
      }
    });

    // Convert to array and sort
    const popular = Object.entries(templateCount)
      .map(([templateId, count]) => ({ templateId: parseInt(templateId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return popular;
  }

  /**
   * Get global analytics (admin only)
   */
  async getGlobalAnalytics() {
    // This would require admin permissions check
    // Placeholder for future implementation
    return {
      totalUsers: 0,
      totalTranscripts: 0,
      totalCertificates: 0,
      averageGPA: 0,
      message: 'Global analytics require admin permissions'
    };
  }

  /**
   * Generate insights and recommendations
   */
  async generateInsights(userId) {
    const analytics = await this.getUserAnalytics(userId);
    const insights = [];

    // GPA insights
    if (analytics.transcripts.averageGPA > 0) {
      if (analytics.transcripts.averageGPA >= 3.7) {
        insights.push({
          type: 'success',
          category: 'gpa',
          message: `Excellent performance! Your average GPA is ${analytics.transcripts.averageGPA}, qualifying for Cum Laude honors.`,
          action: 'Consider generating an honors diploma to celebrate this achievement.'
        });
      } else if (analytics.transcripts.averageGPA >= 3.0) {
        insights.push({
          type: 'info',
          category: 'gpa',
          message: `Good academic standing with ${analytics.transcripts.averageGPA} GPA.`,
          action: 'Keep up the good work to reach honors level (3.5+).'
        });
      } else if (analytics.transcripts.averageGPA < 2.0) {
        insights.push({
          type: 'warning',
          category: 'gpa',
          message: `GPA of ${analytics.transcripts.averageGPA} may need improvement.`,
          action: 'Consider reviewing course selection and study strategies.'
        });
      }
    }

    // Template usage insights
    if (analytics.certificates.total > 5) {
      insights.push({
        type: 'tip',
        category: 'efficiency',
        message: `You've created ${analytics.certificates.total} certificates.`,
        action: 'Save your favorite designs as templates for faster creation.'
      });
    }

    // Honors insights
    if (analytics.certificates.withHonors > 0) {
      insights.push({
        type: 'achievement',
        category: 'honors',
        message: `${analytics.certificates.withHonors} of your certificates include honors distinctions!`,
        action: 'Share your achievements on professional networks.'
      });
    }

    return insights;
  }
}

module.exports = new AnalyticsService();
