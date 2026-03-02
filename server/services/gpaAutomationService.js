'use strict';

/**
 * GPA Automation Service
 * Category B: Features 31-50 - Auto-calculate all GPA and credit data
 */
class GPAAutomationService {
  constructor() {
    this.defaultGradingScales = {
      '4.0': { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 },
      '5.0': { 'A+': 5.0, 'A': 5.0, 'A-': 4.7, 'B+': 4.3, 'B': 4.0, 'B-': 3.7, 'C+': 3.3, 'C': 3.0, 'C-': 2.7, 'D+': 2.3, 'D': 2.0, 'F': 0.0 },
      '100': { 'A': 95, 'B': 85, 'C': 75, 'D': 65, 'F': 55 }
    };
    this.defaultScaleType = '4.0';
  }

  // Feature 31: Auto-calculate term GPA for each academic term
  calculateTermGPA(courses, scaleType = '4.0') {
    const scale = this.defaultGradingScales[scaleType] || this.defaultGradingScales['4.0'];
    const gradable = courses.filter(c => c.gradeMode !== 'audit' && c.gradeMode !== 'pass_fail' && !['W', 'I', 'IP'].includes(c.grade));
    if (gradable.length === 0) return 0.0;
    let totalQP = 0, totalAttempted = 0;
    gradable.forEach(c => {
      const pts = scale[c.grade] !== undefined ? scale[c.grade] : 0;
      const hrs = parseFloat(c.creditHours ?? c.credits) || 0;
      totalQP += pts * hrs;
      totalAttempted += hrs;
    });
    return totalAttempted > 0 ? parseFloat((totalQP / totalAttempted).toFixed(scaleType === '100' ? 2 : 3)) : 0.0;
  }

  // Feature 32: Auto-calculate overall cumulative GPA
  calculateCumulativeGPA(allCourses, scaleType = '4.0') {
    return this.calculateTermGPA(allCourses, scaleType);
  }

  // Feature 33: Auto-display GPA to exact decimal precision
  formatGPA(gpa, decimals = 3) {
    return parseFloat(gpa).toFixed(decimals);
  }

  // Feature 34: Auto-apply correct quality point values per letter grade
  getQualityPoints(grade, creditHours, scaleType = '4.0') {
    const scale = this.defaultGradingScales[scaleType] || this.defaultGradingScales['4.0'];
    const pts = scale[grade] !== undefined ? scale[grade] : 0;
    return parseFloat((pts * (parseFloat(creditHours) || 0)).toFixed(3));
  }

  // Feature 35: Auto-calculate attempted vs earned credit hours
  calculateAttemptedVsEarned(courses) {
    let attempted = 0, earned = 0;
    courses.forEach(c => {
      if (!['AU', 'audit'].includes(c.gradeMode)) {
        const hrs = parseFloat(c.creditHours ?? c.credits) || 0;
        attempted += hrs;
        if (!['F', 'W', 'WF', 'I'].includes(c.grade)) earned += hrs;
      }
    });
    return { attempted: parseFloat(attempted.toFixed(1)), earned: parseFloat(earned.toFixed(1)) };
  }

  // Feature 36: Auto-calculate quality points per course and per term
  calculateQualityPoints(courses, scaleType = '4.0') {
    const scale = this.defaultGradingScales[scaleType] || this.defaultGradingScales['4.0'];
    return courses.map(c => {
      const pts = scale[c.grade] || 0;
      const hrs = parseFloat(c.creditHours ?? c.credits) || 0;
      return { ...c, qualityPoints: parseFloat((pts * hrs).toFixed(3)), gradePoints: pts };
    });
  }

  // Feature 37: Auto-generate running cumulative GPA column
  generateRunningCumulativeGPA(terms, scaleType = '4.0') {
    let allCoursesSoFar = [];
    return terms.map(term => {
      allCoursesSoFar = allCoursesSoFar.concat(term.courses || []);
      const cumGPA = this.calculateCumulativeGPA(allCoursesSoFar, scaleType);
      const termGPA = this.calculateTermGPA(term.courses || [], scaleType);
      return { ...term, termGPA: this.formatGPA(termGPA, 3), cumulativeGPA: this.formatGPA(cumGPA, 3) };
    });
  }

  // Feature 38: Auto-calculate standardized 4.0 scale conversion
  convertToStandard4Scale(gpa, fromScale = '5.0') {
    const maxPoints = { '5.0': 5.0, '100': 100, '4.0': 4.0 };
    const max = maxPoints[fromScale] || 4.0;
    return parseFloat(((gpa / max) * 4.0).toFixed(3));
  }

  // Feature 39: Auto-exclude non-credit and audit courses from GPA
  filterGPACourses(courses) {
    return {
      included: courses.filter(c => c.gradeMode !== 'audit' && !c.nonCredit),
      excluded: courses.filter(c => c.gradeMode === 'audit' || c.nonCredit)
    };
  }

  // Feature 40: Auto-apply grade replacement rules
  applyGradeReplacement(courses, _rule = 'highest') {
    const seen = {};
    courses.forEach(c => {
      const key = c.courseNumber || c.courseName;
      if (!seen[key]) seen[key] = [];
      seen[key].push(c);
    });
    return courses.map(c => {
      const key = c.courseNumber || c.courseName;
      const attempts = seen[key];
      if (attempts.length <= 1) return c;
      const best = attempts.reduce((prev, cur) => (parseFloat(cur.gradePoints) > parseFloat(prev.gradePoints) ? cur : prev));
      return c === best ? { ...c, gradeReplacementApplied: true } : { ...c, excludedFromGPA: true, replacedBy: best.term };
    });
  }

  // Feature 41: Auto-calculate major GPA
  calculateMajorGPA(courses, majorDepartment, scaleType = '4.0') {
    const majorCourses = courses.filter(c => c.department === majorDepartment || (c.courseNumber || '').startsWith(majorDepartment));
    return { majorGPA: this.formatGPA(this.calculateTermGPA(majorCourses, scaleType), 3), courseCount: majorCourses.length, majorDepartment };
  }

  // Feature 42: Auto-calculate final semester/term GPA
  calculateFinalTermGPA(allTerms, scaleType = '4.0') {
    if (allTerms.length === 0) return 0.0;
    const lastTerm = allTerms[allTerms.length - 1];
    return { term: lastTerm.label, gpa: this.formatGPA(this.calculateTermGPA(lastTerm.courses || [], scaleType), 3) };
  }

  // Feature 43: Auto-generate GPA summary table
  generateGPASummaryTable(terms, scaleType = '4.0') {
    const withRunning = this.generateRunningCumulativeGPA(terms, scaleType);
    return withRunning.map(term => {
      const { attempted, earned } = this.calculateAttemptedVsEarned(term.courses || []);
      return { term: term.label, year: term.year, termGPA: term.termGPA, cumulativeGPA: term.cumulativeGPA, attemptedHours: attempted, earnedHours: earned };
    });
  }

  // Feature 44: Auto-detect pass/fail and exclude from GPA
  processPassFailExclusion(courses) {
    return courses.map(c => {
      if (c.gradeMode === 'pass_fail') {
        const pass = !['F', 'NP', 'U'].includes(c.grade);
        return { ...c, displayGrade: pass ? 'P' : 'NP', excludedFromGPA: true, creditsEarned: pass ? (parseFloat(c.creditHours ?? c.credits) || 0) : 0 };
      }
      return c;
    });
  }

  // Feature 45: Auto-generate academic standing notation
  generateAcademicStandingNotation(gpa, threshold = 2.0, institutionPolicy = {}) {
    const { probationThreshold = 1.5, suspensionThreshold = 1.0 } = institutionPolicy;
    if (gpa < suspensionThreshold) return { status: 'Academic Suspension', code: 'SUSP', gpa };
    if (gpa < probationThreshold) return { status: 'Academic Probation Warning', code: 'PROB-W', gpa };
    if (gpa < threshold) return { status: 'Academic Probation', code: 'PROB', gpa };
    return { status: 'Good Academic Standing', code: 'GAS', gpa };
  }

  // Feature 46: Auto-calculate credits in progress
  calculateInProgressCredits(courses) {
    const inProgress = courses.filter(c => c.grade === 'IP' || c.status === 'in_progress');
    return { count: inProgress.length, credits: inProgress.reduce((t, c) => t + (parseFloat(c.creditHours ?? c.credits) || 0), 0), courses: inProgress };
  }

  // Feature 47: Auto-generate total credits required vs earned
  calculateDegreeProgress(creditsEarned, creditsRequired = 120) {
    const remaining = Math.max(0, creditsRequired - creditsEarned);
    const percentage = Math.min(100, parseFloat(((creditsEarned / creditsRequired) * 100).toFixed(1)));
    return { creditsEarned, creditsRequired, creditsRemaining: remaining, completionPercentage: percentage };
  }

  // Feature 48: Auto-compute credits remaining to degree
  computeCreditsRemaining(creditsEarned, creditsRequired = 120, creditsInProgress = 0) {
    const effectiveEarned = creditsEarned + creditsInProgress;
    return Math.max(0, creditsRequired - effectiveEarned);
  }

  // Feature 49: Auto-flag courses with failing grades
  flagFailingGrades(courses, failThreshold = 'D-', scaleType = '4.0') {
    const scale = this.defaultGradingScales[scaleType] || this.defaultGradingScales['4.0'];
    const thresholdPoints = scale[failThreshold] !== undefined ? scale[failThreshold] : scale['D-'] || 0;
    return courses.map(c => {
      const pts = scale[c.grade];
      const failing = pts !== undefined && pts <= thresholdPoints;
      return failing ? { ...c, flagged: true, flagReason: 'Below minimum grade threshold', notation: `⚠ ${c.grade}` } : c;
    });
  }

  // Feature 50: Auto-generate grade distribution summary
  generateGradeDistribution(courses) {
    const dist = { 'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'F': 0, 'W': 0, 'P': 0, 'I': 0 };
    courses.forEach(c => { if (dist[c.grade] !== undefined) dist[c.grade]++; });
    const total = courses.length;
    return {
      distribution: dist,
      percentages: Object.fromEntries(Object.entries(dist).map(([g, cnt]) => [g, total > 0 ? parseFloat(((cnt / total) * 100).toFixed(1)) : 0])),
      total,
      honorRoll: dist['A+'] + dist['A'] + dist['A-'],
      goodStanding: total - dist['F'] - dist['W']
    };
  }

  // Utility: Full GPA report for a student
  generateFullGPAReport(terms, options = {}) {
    const { scaleType = '4.0', majorDepartment, degreeCreditsRequired = 120 } = options;
    const allCourses = terms.flatMap(t => t.courses || []);
    const filtered = this.filterGPACourses(allCourses);
    const withQP = this.calculateQualityPoints(filtered.included, scaleType);
    const summary = this.generateGPASummaryTable(terms, scaleType);
    const cumGPA = this.calculateCumulativeGPA(allCourses, scaleType);
    const { attempted, earned } = this.calculateAttemptedVsEarned(allCourses);
    const standing = this.generateAcademicStandingNotation(cumGPA);
    const progress = this.calculateDegreeProgress(earned, degreeCreditsRequired);
    const distribution = this.generateGradeDistribution(allCourses);
    const inProgress = this.calculateInProgressCredits(allCourses);
    const majorGPA = majorDepartment ? this.calculateMajorGPA(withQP, majorDepartment, scaleType) : null;
    const finalTerm = this.calculateFinalTermGPA(terms, scaleType);
    return { cumulativeGPA: this.formatGPA(cumGPA, 3), scaleType, summary, standing, progress, distribution, inProgress, majorGPA, finalTerm, attemptedCredits: attempted, earnedCredits: earned };
  }
}

module.exports = new GPAAutomationService();
