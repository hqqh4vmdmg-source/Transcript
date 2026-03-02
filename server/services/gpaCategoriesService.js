const db = require('../config/database');

/**
 * GPA Categories Enhancement Service
 * Implements all 10 Category 3 features
 */
class GPACategoriesService {
  
  /**
   * Feature 3.1: 10 GPA Categories (expanded from 5)
   */
  async getAllCategories() {
    const result = await db.query(
      'SELECT * FROM gpa_categories ORDER BY min_gpa ASC'
    );
    return result.rows;
  }

  async getCategoryByGPA(gpa) {
    const result = await db.query(
      'SELECT * FROM gpa_categories WHERE $1 >= min_gpa AND $1 <= max_gpa',
      [gpa]
    );
    return result.rows[0] || null;
  }

  async getCategoryByCode(categoryCode) {
    const result = await db.query(
      'SELECT * FROM gpa_categories WHERE category_code = $1',
      [categoryCode]
    );
    return result.rows[0] || null;
  }

  /**
   * Feature 3.2: Custom Category Builder
   */
  async createCustomCategory(userId, categoryData) {
    const { category_name, min_gpa, max_gpa, custom_designation, custom_text, custom_color } = categoryData;

    // Validate GPA range
    if (min_gpa < 0 || max_gpa > 4.0 || min_gpa >= max_gpa) {
      throw new Error('Invalid GPA range');
    }

    const result = await db.query(
      `INSERT INTO custom_gpa_categories (user_id, category_name, min_gpa, max_gpa, custom_designation, custom_text, custom_color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, category_name, min_gpa, max_gpa, custom_designation, custom_text, custom_color]
    );

    return result.rows[0];
  }

  async getUserCustomCategories(userId) {
    const result = await db.query(
      'SELECT * FROM custom_gpa_categories WHERE user_id = $1 OR is_public = true ORDER BY min_gpa ASC',
      [userId]
    );
    return result.rows;
  }

  async deleteCustomCategory(categoryId, userId) {
    const result = await db.query(
      'DELETE FROM custom_gpa_categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [categoryId, userId]
    );
    return result.rows[0];
  }

  /**
   * Feature 3.3: Category Recommendation Engine
   */
  async recommendCategory(transcriptData) {
    const { gpa, credits_earned, major, year_level } = transcriptData;

    // Get base category by GPA
    const baseCategory = await this.getCategoryByGPA(gpa);
    
    if (!baseCategory) {
      throw new Error('Unable to determine category for given GPA');
    }

    // Calculate recommendation score based on multiple factors
    const recommendations = {
      primaryCategory: baseCategory,
      confidence: this.calculateConfidence(gpa, baseCategory),
      suggestedActions: baseCategory.recommended_actions || [],
      eligibleHonors: baseCategory.is_honor_eligible,
      nextMilestone: await this.getNextMilestone(gpa)
    };

    // Add honor society recommendations if eligible
    if (baseCategory.is_honor_eligible) {
      recommendations.honorSocieties = await this.getEligibleHonorSocieties(gpa, credits_earned, major);
    }

    // Add scholarship recommendations
    recommendations.scholarships = await this.getEligibleScholarships(gpa, major, year_level);

    return recommendations;
  }

  calculateConfidence(gpa, category) {
    const range = category.max_gpa - category.min_gpa;
    const position = gpa - category.min_gpa;
    const centerDistance = Math.abs(position - (range / 2));
    
    // Confidence is higher when GPA is in the middle of the range
    return Math.max(0.5, 1 - (centerDistance / (range / 2)) * 0.5);
  }

  async getNextMilestone(currentGPA) {
    const categories = await this.getAllCategories();
    const nextCategory = categories.find(cat => cat.min_gpa > currentGPA);
    
    if (nextCategory) {
      return {
        targetGPA: nextCategory.min_gpa,
        targetCategory: nextCategory.category_name,
        pointsNeeded: nextCategory.min_gpa - currentGPA,
        description: `Achieve ${nextCategory.min_gpa} GPA to reach ${nextCategory.category_name}`
      };
    }
    
    return null;
  }

  /**
   * Feature 3.4: Side-by-Side Comparison View
   */
  async compareCategories(categoryIds) {
    const result = await db.query(
      'SELECT * FROM gpa_categories WHERE id = ANY($1) ORDER BY min_gpa ASC',
      [categoryIds]
    );

    const comparison = {
      categories: result.rows,
      differences: {},
      progression: []
    };

    // Calculate differences
    for (let i = 0; i < result.rows.length - 1; i++) {
      const current = result.rows[i];
      const next = result.rows[i + 1];
      
      comparison.progression.push({
        from: current.category_name,
        to: next.category_name,
        gpaIncrease: (next.min_gpa - current.max_gpa).toFixed(2),
        honorChange: `${current.honor_designation || 'None'} → ${next.honor_designation || 'None'}`
      });
    }

    return comparison;
  }

  async compareCategoryRequirements(gpa1, gpa2) {
    const cat1 = await this.getCategoryByGPA(gpa1);
    const cat2 = await this.getCategoryByGPA(gpa2);

    if (!cat1 || !cat2) {
      throw new Error('Invalid GPA values for comparison');
    }

    return {
      category1: cat1,
      category2: cat2,
      gpaDifference: Math.abs(gpa1 - gpa2),
      standingDifference: `${cat1.academic_standing} vs ${cat2.academic_standing}`,
      honorDifference: `${cat1.honor_designation || 'None'} vs ${cat2.honor_designation || 'None'}`,
      percentileImprovement: cat2.percentile_high - cat1.percentile_low
    };
  }

  /**
   * Feature 3.5: Category Analytics Dashboard
   */
  async getCategoryAnalytics(categoryId = null) {
    let query = 'SELECT * FROM category_analytics';
    const params = [];
    
    if (categoryId) {
      params.push(categoryId);
      query += ` WHERE category_id = $${params.length}`;
    }
    
    query += ' ORDER BY total_transcripts DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async updateCategoryAnalytics(categoryId, _transcriptId) {
    // Update or insert analytics
    const result = await db.query(
      `INSERT INTO category_analytics (category_id, total_transcripts, total_students, this_month_count, this_year_count)
       VALUES ($1, 1, 1, 1, 1)
       ON CONFLICT (category_id) DO UPDATE SET
         total_transcripts = category_analytics.total_transcripts + 1,
         total_students = category_analytics.total_students + 1,
         this_month_count = category_analytics.this_month_count + 1,
         this_year_count = category_analytics.this_year_count + 1,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [categoryId]
    );

    return result.rows[0];
  }

  async getAnalyticsSummary() {
    const result = await db.query(`
      SELECT 
        gc.category_name,
        gc.academic_standing,
        COALESCE(ca.total_transcripts, 0) as total_count,
        COALESCE(ca.this_month_count, 0) as this_month,
        COALESCE(ca.trend_direction, 'stable') as trend
      FROM gpa_categories gc
      LEFT JOIN category_analytics ca ON gc.id = ca.category_id
      ORDER BY gc.min_gpa ASC
    `);

    return result.rows;
  }

  /**
   * Feature 3.6: Auto-Category Assignment
   */
  async autoAssignCategory(transcriptId, gpa) {
    const category = await this.getCategoryByGPA(gpa);
    
    if (!category) {
      throw new Error('No matching category found for GPA: ' + gpa);
    }

    // Update analytics
    await this.updateCategoryAnalytics(category.id, transcriptId);

    // Return category assignment
    return {
      transcriptId,
      gpa,
      assignedCategory: category.category_name,
      categoryCode: category.category_code,
      academicStanding: category.academic_standing,
      honorDesignation: category.honor_designation,
      completionText: category.completion_text,
      isHonorEligible: category.is_honor_eligible,
      requiresIntervention: category.requires_intervention,
      percentileRange: `${category.percentile_low}-${category.percentile_high}%`
    };
  }

  /**
   * Feature 3.7: GPA Trend Analysis
   */
  async recordGPATrend(transcriptId, semesterNumber, semesterGPA, cumulativeGPA) {
    // Get previous semester for comparison
    const prevSemester = await db.query(
      'SELECT * FROM gpa_trend_records WHERE transcript_id = $1 AND semester_number = $2',
      [transcriptId, semesterNumber - 1]
    );

    let gpaChange = 0;
    let trendDirection = 'stable';
    
    if (prevSemester.rows.length > 0) {
      gpaChange = cumulativeGPA - prevSemester.rows[0].cumulative_gpa;
      if (gpaChange > 0.05) trendDirection = 'improving';
      else if (gpaChange < -0.05) trendDirection = 'declining';
    }

    // Simple projection (linear)
    const projectedFinalGPA = this.projectFinalGPA(cumulativeGPA, semesterNumber);

    const result = await db.query(
      `INSERT INTO gpa_trend_records (transcript_id, semester_number, gpa_at_semester, cumulative_gpa, gpa_change, trend_direction, projected_final_gpa, confidence_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [transcriptId, semesterNumber, semesterGPA, cumulativeGPA, gpaChange, trendDirection, projectedFinalGPA, 0.75]
    );

    return result.rows[0];
  }

  async getTrendAnalysis(transcriptId) {
    const result = await db.query(
      'SELECT * FROM gpa_trend_records WHERE transcript_id = $1 ORDER BY semester_number ASC',
      [transcriptId]
    );

    const trends = result.rows;
    
    if (trends.length === 0) return null;

    // Calculate overall trend
    const firstGPA = trends[0].cumulative_gpa;
    const lastGPA = trends[trends.length - 1].cumulative_gpa;
    const overallChange = lastGPA - firstGPA;
    
    const analysis = {
      trends,
      overallTrend: overallChange > 0.1 ? 'improving' : (overallChange < -0.1 ? 'declining' : 'stable'),
      totalChange: overallChange.toFixed(2),
      averageGPA: (trends.reduce((sum, t) => sum + parseFloat(t.cumulative_gpa), 0) / trends.length).toFixed(2),
      highestGPA: Math.max(...trends.map(t => parseFloat(t.cumulative_gpa))).toFixed(2),
      lowestGPA: Math.min(...trends.map(t => parseFloat(t.cumulative_gpa))).toFixed(2),
      projectedFinalGPA: trends[trends.length - 1].projected_final_gpa
    };

    return analysis;
  }

  projectFinalGPA(currentGPA, currentSemester, totalSemesters = 8) {
    // Simple linear projection
    const remaining = totalSemesters - currentSemester;
    if (remaining <= 0) return currentGPA;
    
    // Assume student maintains current performance
    return currentGPA;
  }

  /**
   * Feature 3.8: Honor Society Recommendations
   */
  async getEligibleHonorSocieties(gpa, creditsEarned, academicField = null) {
    let query = `
      SELECT * FROM honor_societies 
      WHERE is_active = true 
      AND min_gpa_requirement <= $1
      AND (min_credits_requirement IS NULL OR min_credits_requirement <= $2)
    `;
    const params = [gpa, creditsEarned];

    if (academicField) {
      params.push(academicField);
      query += ` AND (academic_field = $${params.length} OR academic_field = 'General')`;
    }

    query += ' ORDER BY is_prestigious DESC, min_gpa_requirement DESC';

    const result = await db.query(query, params);
    
    return result.rows.map(society => ({
      ...society,
      qualified: true,
      gpaMargin: (gpa - society.min_gpa_requirement).toFixed(2)
    }));
  }

  async getAllHonorSocieties() {
    const result = await db.query(
      'SELECT * FROM honor_societies WHERE is_active = true ORDER BY is_prestigious DESC, society_name ASC'
    );
    return result.rows;
  }

  /**
   * Feature 3.9: Scholarship Eligibility Checker
   */
  async getEligibleScholarships(gpa, major = null, yearLevel = null) {
    let query = `
      SELECT * FROM scholarships 
      WHERE is_active = true 
      AND min_gpa_requirement <= $1
      AND (max_gpa_requirement IS NULL OR max_gpa_requirement >= $1)
    `;
    const params = [gpa];

    if (yearLevel) {
      params.push(yearLevel);
      query += ` AND ($${params.length} = ANY(eligible_years) OR 'all' = ANY(eligible_years))`;
    }

    if (major) {
      params.push(major);
      query += ` AND (eligible_majors IS NULL OR $${params.length} = ANY(eligible_majors))`;
    }

    query += ' ORDER BY award_amount_max DESC, competitiveness ASC';

    const result = await db.query(query, params);
    
    return result.rows.map(scholarship => ({
      ...scholarship,
      qualified: true,
      gpaMargin: (gpa - scholarship.min_gpa_requirement).toFixed(2),
      estimatedAward: ((scholarship.award_amount_min + scholarship.award_amount_max) / 2).toFixed(2)
    }));
  }

  async calculateTotalScholarshipPotential(gpa, major, yearLevel) {
    const eligible = await this.getEligibleScholarships(gpa, major, yearLevel);
    
    const potential = {
      totalScholarships: eligible.length,
      minTotalAward: eligible.reduce((sum, s) => sum + parseFloat(s.award_amount_min), 0),
      maxTotalAward: eligible.reduce((sum, s) => sum + parseFloat(s.award_amount_max), 0),
      averageAward: eligible.length > 0 ? 
        eligible.reduce((sum, s) => sum + (parseFloat(s.award_amount_min) + parseFloat(s.award_amount_max)) / 2, 0) / eligible.length : 0,
      topOpportunities: eligible.slice(0, 5)
    };

    return potential;
  }

  /**
   * Feature 3.10: Career Path Suggestions by GPA
   */
  async getCareerSuggestions(gpa, major = null) {
    let query = `
      SELECT * FROM career_paths 
      WHERE is_active = true 
      AND typical_gpa_range_min <= $1 
      AND typical_gpa_range_max >= $1
    `;
    const params = [gpa];

    if (major) {
      params.push(major);
      query += ` AND $${params.length} = ANY(typical_majors)`;
    }

    query += ' ORDER BY salary_range_max DESC, job_outlook DESC';

    const result = await db.query(query, params);
    
    return result.rows.map(career => ({
      ...career,
      competitive: gpa >= career.min_gpa_competitive,
      gpaMatch: this.calculateGPAMatch(gpa, career.typical_gpa_range_min, career.typical_gpa_range_max),
      salaryMidpoint: (career.salary_range_min + career.salary_range_max) / 2
    }));
  }

  calculateGPAMatch(gpa, minGPA, maxGPA) {
    const range = maxGPA - minGPA;
    const position = gpa - minGPA;
    const matchScore = Math.min(100, Math.max(0, (position / range) * 100));
    
    if (matchScore >= 75) return 'excellent';
    if (matchScore >= 50) return 'good';
    if (matchScore >= 25) return 'fair';
    return 'below average';
  }

  async getCareerOutlook(gpa, major) {
    const careers = await this.getCareerSuggestions(gpa, major);
    
    return {
      totalPathsAvailable: careers.length,
      competitivePaths: careers.filter(c => c.competitive).length,
      averageSalary: careers.reduce((sum, c) => sum + c.salaryMidpoint, 0) / careers.length,
      topCareers: careers.slice(0, 5),
      growthFields: careers.filter(c => c.job_outlook === 'excellent').map(c => c.career_field)
    };
  }
}

module.exports = new GPACategoriesService();
