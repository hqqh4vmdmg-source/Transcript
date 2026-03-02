'use strict';

/**
 * Transfer Credits & Academic Honors Service
 * Category C: Features 51-65
 */
class TransferCreditsService {
  constructor() {
    this.honorThresholds = {
      default: { cumLaude: 3.5, magnaCumLaude: 3.7, summaCumLaude: 3.9 },
      mit: { cumLaude: 4.0, magnaCumLaude: 4.5, summaCumLaude: 4.8 }, // Thresholds on MIT's 5.0 GPA scale
      harvard: { cumLaude: 3.5, magnaCumLaude: 3.75, summaCumLaude: 3.9 },
      stanford: { cumLaude: 3.5, magnaCumLaude: 3.7, summaCumLaude: 3.85 }
    };

    this.honorsList = {
      deansList: { minGPA: 3.5, title: "Dean's List", type: 'term' },
      presidentsList: { minGPA: 4.0, title: "President's List", type: 'term' }
    };
  }

  // Feature 51: Auto-generate dedicated transfer credit section
  generateTransferSection(transferCourses) {
    if (!transferCourses || transferCourses.length === 0) {
      return { hasTransferCredits: false, courses: [], totalTransferCredits: 0 };
    }
    const grouped = {};
    transferCourses.forEach(c => {
      const inst = c.originatingInstitution || 'Unknown Institution';
      if (!grouped[inst]) grouped[inst] = [];
      grouped[inst].push(c);
    });
    const totalCredits = transferCourses.reduce((t, c) => t + (parseFloat(c.creditsAwarded) || 0), 0);
    return { hasTransferCredits: true, grouped, courses: transferCourses, totalTransferCredits: parseFloat(totalCredits.toFixed(1)), institutionCount: Object.keys(grouped).length };
  }

  // Feature 52: Auto-populate originating institution details
  formatTransferInstitution(institution) {
    const { name, city, state, country = 'USA', courseEquivalent } = institution || {};
    return {
      name: name || 'Unknown Institution',
      location: [city, state, country].filter(Boolean).join(', '),
      courseEquivalent: courseEquivalent || 'Elective Credit',
      displayLine: `${name || 'Unknown'} — ${city || ''}, ${state || ''}`
    };
  }

  // Feature 53: Display original course title, grade, and credit hours
  formatTransferCourseDisplay(course) {
    return {
      originalTitle: course.originalTitle || course.courseName,
      originalGrade: course.originalGrade || course.grade,
      creditHoursAwarded: parseFloat(course.creditsAwarded) || 0,
      localEquivalent: course.localEquivalent || 'Elective',
      originatingInstitution: course.originatingInstitution,
      transferStatus: 'Accepted',
      displayLine: `${course.originalTitle} — ${course.originalGrade} — ${course.creditsAwarded} cr`
    };
  }

  // Feature 54: Apply transfer credit equivalency rules
  applyEquivalencyRules(transferCourse, equivalencyTable = {}) {
    const key = (transferCourse.originalTitle || '').toLowerCase();
    const match = equivalencyTable[key];
    return match
      ? { ...transferCourse, localEquivalent: match.localCourse, localCourseNumber: match.courseNumber, equivalencyApplied: true }
      : { ...transferCourse, localEquivalent: 'Elective Credit', equivalencyApplied: false };
  }

  // Feature 55: Calculate transfer credits contribution to cumulative GPA
  calculateTransferGPAContribution(transferCourses, policy = 'exclude') {
    if (policy === 'exclude') {
      return { transferCreditsIncluded: false, note: 'Transfer credits do not affect GPA at this institution', transferCredits: transferCourses.reduce((t, c) => t + (parseFloat(c.creditsAwarded) || 0), 0) };
    }
    // Include in GPA calculation
    const scale = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
    let totalQP = 0, totalHrs = 0;
    transferCourses.forEach(c => {
      const pts = scale[c.originalGrade] || 0;
      const hrs = parseFloat(c.creditsAwarded) || 0;
      totalQP += pts * hrs;
      totalHrs += hrs;
    });
    return { transferCreditsIncluded: true, transferGPA: totalHrs > 0 ? parseFloat((totalQP / totalHrs).toFixed(3)) : 0, transferCredits: totalHrs };
  }

  // Feature 56: Toggle to include/exclude transfer credits
  applyTransferCreditToggle(transcriptData, includeTransfer = true) {
    return { ...transcriptData, showTransferCredits: includeTransfer, transferSection: includeTransfer ? transcriptData.transferSection : null };
  }

  // Feature 57: Easy fillable form data structure for transfer credits
  getTransferCreditFormSchema() {
    return {
      fields: [
        { name: 'originatingInstitution', label: 'Originating Institution', type: 'text', required: true },
        { name: 'institutionLocation', label: 'Institution Location (City, State)', type: 'text', required: false },
        { name: 'originalTitle', label: 'Original Course Title', type: 'text', required: true },
        { name: 'originalCourseNumber', label: 'Original Course Number', type: 'text', required: false },
        { name: 'originalGrade', label: 'Original Grade', type: 'select', options: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'P', 'T'], required: true },
        { name: 'creditsAwarded', label: 'Credit Hours Awarded', type: 'number', required: true },
        { name: 'localEquivalent', label: 'Local Course Equivalent', type: 'text', required: false },
        { name: 'transferYear', label: 'Transfer Year', type: 'number', required: false }
      ]
    };
  }

  // Feature 58: Auto-generate CLEP/AP credit notation
  generateCLEPAPNotation(examCredits) {
    return examCredits.map(e => ({
      ...e,
      notation: e.type === 'CLEP'
        ? `CLEP Examination — ${e.examName} — ${e.creditsAwarded} cr`
        : `Advanced Placement (AP) — ${e.examName} — Score: ${e.score} — ${e.creditsAwarded} cr`,
      includeInTranscript: true
    }));
  }

  // Feature 59: Auto-display military education credits (ACE)
  generateMilitaryEducationNotation(militaryCredits) {
    return militaryCredits.map(c => ({
      ...c,
      notation: `Military Education (ACE Recommended) — ${c.courseTitle} — ${c.creditsAwarded} cr`,
      aceRecommended: true
    }));
  }

  // Feature 60: Auto-generate academic honors per term (Dean's List, President's List)
  generateTermHonors(termGPA, termCredits, institutionHonorsPolicy = {}) {
    const honors = [];
    const pList = institutionHonorsPolicy.presidentsList || { minGPA: 4.0, minCredits: 12 };
    const dList = institutionHonorsPolicy.deansList || { minGPA: 3.5, minCredits: 12 };
    if (termCredits >= pList.minCredits && termGPA >= pList.minGPA) {
      honors.push({ type: "President's List", gpa: termGPA, minGPA: pList.minGPA });
    } else if (termCredits >= dList.minCredits && termGPA >= dList.minGPA) {
      honors.push({ type: "Dean's List", gpa: termGPA, minGPA: dList.minGPA });
    }
    return honors;
  }

  // Feature 61: Auto-generate graduation honors (Cum Laude, Magna, Summa)
  generateGraduationHonors(cumulativeGPA, institutionKey = 'default') {
    const thresholds = this.honorThresholds[institutionKey] || this.honorThresholds.default;
    if (cumulativeGPA >= thresholds.summaCumLaude) return { honor: 'Summa Cum Laude', gpa: cumulativeGPA, threshold: thresholds.summaCumLaude };
    if (cumulativeGPA >= thresholds.magnaCumLaude) return { honor: 'Magna Cum Laude', gpa: cumulativeGPA, threshold: thresholds.magnaCumLaude };
    if (cumulativeGPA >= thresholds.cumLaude) return { honor: 'Cum Laude', gpa: cumulativeGPA, threshold: thresholds.cumLaude };
    return null;
  }

  // Feature 62: Auto-research GPA thresholds per institution
  getInstitutionHonorThresholds(institutionKey) {
    return this.honorThresholds[institutionKey?.toLowerCase()] || this.honorThresholds.default;
  }

  // Feature 63: Auto-generate scholarship and award notations
  generateScholarshipNotations(awards) {
    return (awards || []).map(a => ({
      awardName: a.name,
      academicYear: a.year,
      amount: a.amount,
      notation: `${a.name}${a.year ? ' — ' + a.year : ''}${a.amount ? ' ($' + a.amount + ')' : ''}`,
      type: 'scholarship_award'
    }));
  }

  // Feature 64: Auto-generate academic distinction notations
  generateAcademicDistinctions(distinctions) {
    const types = {
      valedictorian: 'Valedictorian',
      salutatorian: 'Salutatorian',
      honor_society: 'Honor Society Member',
      phi_beta_kappa: 'Phi Beta Kappa',
      golden_key: 'Golden Key International Honour Society'
    };
    return (distinctions || []).map(d => ({
      type: d.type,
      label: types[d.type] || d.type,
      organization: d.organization || '',
      year: d.year || '',
      notation: `${types[d.type] || d.type}${d.organization ? ' — ' + d.organization : ''}${d.year ? ' (' + d.year + ')' : ''}`
    }));
  }

  // Feature 65: Auto-generate departmental honors and thesis notations
  generateDepartmentalHonors(honors) {
    return (honors || []).map(h => ({
      type: h.type || 'departmental_honors',
      department: h.department,
      title: h.title || 'Departmental Honors',
      description: h.description,
      notation: `${h.title || 'Departmental Honors'} in ${h.department}${h.description ? ' — ' + h.description : ''}`,
      includeOnTranscript: true
    }));
  }

  // Utility: Complete honors and transfer summary
  generateCompleteHonorsSummary(studentData) {
    const {
      transferCourses = [], examCredits = [], militaryCredits = [],
      awards = [], distinctions = [], departmentalHonors = [],
      terms = [], cumulativeGPA = 0, institutionKey = 'default'
    } = studentData;

    const termHonors = terms.map(t => ({
      term: t.label,
      honors: this.generateTermHonors(parseFloat(t.termGPA) || 0, parseFloat(t.attemptedCredits) || 0)
    })).filter(t => t.honors.length > 0);

    return {
      transferSection: this.generateTransferSection(transferCourses),
      examCredits: this.generateCLEPAPNotation(examCredits),
      militaryCredits: this.generateMilitaryEducationNotation(militaryCredits),
      termHonors,
      graduationHonors: this.generateGraduationHonors(cumulativeGPA, institutionKey),
      scholarships: this.generateScholarshipNotations(awards),
      distinctions: this.generateAcademicDistinctions(distinctions),
      departmentalHonors: this.generateDepartmentalHonors(departmentalHonors)
    };
  }
}

module.exports = new TransferCreditsService();
