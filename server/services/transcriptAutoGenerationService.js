'use strict';

/**
 * Transcript Auto-Generation Service
 * Category A: Features 1-30 - Auto-generate all transcript data fields
 */
class TranscriptAutoGenerationService {
  constructor() {
    this.academicCalendars = {
      semester: ['Fall', 'Spring', 'Summer'],
      quarter: ['Fall', 'Winter', 'Spring', 'Summer'],
      trimester: ['Fall', 'Winter', 'Spring']
    };

    this.gradingScales = {
      standard: { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0 },
      plus_minus: { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 },
      simple: { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 }
    };

    this.courseStatusTypes = ['completed', 'withdrawn', 'audited', 'repeated', 'in_progress', 'incomplete'];
    this.academicLevels = ['freshman', 'sophomore', 'junior', 'senior', 'graduate', 'doctoral'];
    this.meetingFormats = ['lecture', 'lab', 'online', 'hybrid', 'seminar', 'independent_study'];
  }

  // Feature 1: Auto-generate complete course history organized by academic term
  generateCourseHistory(studentData) {
    const { terms = [], courses = [] } = studentData;
    const history = {};
    terms.forEach(term => {
      history[term.label] = courses.filter(c => c.term === term.label).map(c => ({
        ...c,
        termLabel: term.label,
        termYear: term.year,
        termSeason: term.season
      }));
    });
    return history;
  }

  // Feature 2: Auto-populate official course names from catalog format
  formatCourseName(rawName, institutionStyle = 'standard') {
    if (!rawName) return '';
    const styles = {
      standard: rawName.trim().replace(/\s+/g, ' '),
      titleCase: rawName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
      allCaps: rawName.trim().toUpperCase()
    };
    return styles[institutionStyle] || styles.standard;
  }

  // Feature 3: Auto-assign standardized course numbers
  formatCourseNumber(department, level, section = '') {
    const deptCode = (department || 'GEN').toUpperCase().substring(0, 4).padEnd(4, ' ').trim();
    const lvlNum = String(level || 100).padStart(3, '0');
    return section ? `${deptCode} ${lvlNum}-${section}` : `${deptCode} ${lvlNum}`;
  }

  // Feature 4: Auto-generate grade for each course using institution's grading scale
  generateGrade(gradeInput, scaleType = 'standard') {
    const scale = this.gradingScales[scaleType] || this.gradingScales.standard;
    const letter = String(gradeInput || 'C').toUpperCase();
    const points = scale[letter] !== undefined ? scale[letter] : null;
    return { letter, points, scaleType };
  }

  // Feature 5: Auto-display letter grades with numeric equivalents
  formatGradeDisplay(letterGrade, numericGrade = null, scaleType = 'standard') {
    const scale = this.gradingScales[scaleType] || this.gradingScales.standard;
    const points = numericGrade !== null ? numericGrade : (scale[letterGrade] || 0);
    return { letter: letterGrade, numeric: points, display: `${letterGrade} (${points.toFixed(2)})` };
  }

  // Feature 6: Auto-calculate credit hours earned per course
  calculateCreditHoursEarned(creditHours, grade, _failThreshold = 'D-') {
    const failGrades = ['F', 'WF', 'FX'];
    const earned = failGrades.includes(grade) ? 0 : parseFloat(creditHours) || 0;
    return earned;
  }

  // Feature 7: Auto-calculate cumulative credit hours
  calculateCumulativeCredits(courses) {
    return courses.reduce((total, course) => {
      if (course.gradeMode !== 'audit' && !['W', 'WF'].includes(course.grade)) {
        return total + (parseFloat(course.creditHours ?? course.credits) || 0);
      }
      return total;
    }, 0);
  }

  // Feature 8: Auto-organize courses chronologically by term
  organizeByTerm(courses) {
    const termOrder = { Fall: 0, Winter: 1, Spring: 2, Summer: 3 };
    return [...courses].sort((a, b) => {
      const yearDiff = (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
      if (yearDiff !== 0) return yearDiff;
      return (termOrder[a.season] || 0) - (termOrder[b.season] || 0);
    });
  }

  // Feature 9: Auto-detect academic calendar format
  detectCalendarFormat(institutionType = 'university') {
    const calendarMap = {
      university: 'semester',
      college: 'semester',
      community_college: 'semester',
      quarter_school: 'quarter',
      trimester_school: 'trimester'
    };
    return calendarMap[institutionType] || 'semester';
  }

  // Feature 10: Auto-generate academic term labels
  generateTermLabels(calendarType, startYear, numTerms) {
    const calendar = this.academicCalendars[calendarType] || this.academicCalendars.semester;
    const labels = [];
    let year = startYear;
    let seasonIndex = 0;
    for (let i = 0; i < numTerms; i++) {
      labels.push({ label: `${calendar[seasonIndex]} ${year}`, season: calendar[seasonIndex], year });
      seasonIndex++;
      if (seasonIndex >= calendar.length) { seasonIndex = 0; year++; }
    }
    return labels;
  }

  // Feature 11: Auto-populate student full legal name
  formatStudentName(firstName, middleName, lastName, suffix = '') {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    const base = parts.join(' ');
    return suffix ? `${base}, ${suffix}` : base;
  }

  // Feature 12: Auto-generate student ID in institutional format
  generateStudentId(institutionPrefix = '', length = 8) {
    const numPart = String(Math.floor(Math.random() * Math.pow(10, length))).padStart(length, '0');
    return institutionPrefix ? `${institutionPrefix}-${numPart}` : numPart;
  }

  // Feature 13: Auto-populate date of birth in institutional format
  formatDateOfBirth(dob, format = 'MM/DD/YYYY') {
    if (!dob) return '';
    const d = new Date(dob);
    if (isNaN(d)) return dob;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    const formats = { 'MM/DD/YYYY': `${mm}/${dd}/${yyyy}`, 'DD/MM/YYYY': `${dd}/${mm}/${yyyy}`, 'YYYY-MM-DD': `${yyyy}-${mm}-${dd}` };
    return formats[format] || `${mm}/${dd}/${yyyy}`;
  }

  // Feature 14: Auto-generate program of study
  formatProgramOfStudy(major, minor = null, concentration = null) {
    let program = major || 'Undeclared';
    if (concentration) program += `, ${concentration}`;
    if (minor) program += ` / Minor: ${minor}`;
    return program;
  }

  // Feature 15: Auto-populate academic level per course and term
  determineAcademicLevel(totalCredits) {
    if (totalCredits < 30) return 'Freshman';
    if (totalCredits < 60) return 'Sophomore';
    if (totalCredits < 90) return 'Junior';
    if (totalCredits < 120) return 'Senior';
    return 'Graduate';
  }

  // Feature 16: Auto-generate course status indicators
  getCourseStatusIndicator(status) {
    const indicators = {
      completed: '', withdrawn: 'W', audited: 'AU', repeated: 'R',
      in_progress: 'IP', incomplete: 'I', pass: 'P', fail: 'F'
    };
    return indicators[status] || '';
  }

  // Feature 17: Auto-generate repeat course notations
  generateRepeatNotation(courses) {
    const courseMap = {};
    courses.forEach(c => {
      const key = c.courseNumber || c.courseName;
      if (!courseMap[key]) courseMap[key] = [];
      courseMap[key].push(c);
    });
    return Object.entries(courseMap)
      .filter(([, attempts]) => attempts.length > 1)
      .map(([courseKey, attempts]) => ({
        courseKey,
        attempts: attempts.map((a, i) => ({ ...a, attemptNumber: i + 1, notation: i < attempts.length - 1 ? 'E (Excluded)' : 'I (Included)' }))
      }));
  }

  // Feature 18: Auto-apply grade forgiveness / academic renewal
  applyGradeForgiveness(courses, policy = { replaceWithHighest: true }) {
    if (!policy.replaceWithHighest) return courses;
    const courseMap = {};
    courses.forEach(c => {
      const key = c.courseNumber || c.courseName;
      if (!courseMap[key] || (parseFloat(c.gradePoints) > parseFloat(courseMap[key].gradePoints))) {
        courseMap[key] = c;
      }
    });
    return courses.map(c => {
      const key = c.courseNumber || c.courseName;
      const best = courseMap[key];
      return c === best ? c : { ...c, forgivenGrade: true, excludedFromGPA: true, notation: 'Grade Forgiveness Applied' };
    });
  }

  // Feature 19: Auto-generate incomplete (I) grade notations
  processIncompleteGrades(courses) {
    return courses.map(c => {
      if (c.grade === 'I') {
        return { ...c, notation: `Incomplete - ${c.resolvedGrade ? `Resolved: ${c.resolvedGrade}` : 'Pending Resolution'}`, displayGrade: c.resolvedGrade || 'I' };
      }
      return c;
    });
  }

  // Feature 20: Auto-populate pass/fail course designations
  processPassFailCourses(courses) {
    return courses.map(c => c.gradeMode === 'pass_fail' ? { ...c, displayGrade: ['A', 'B', 'C'].includes(c.grade) ? 'P' : 'F', excludedFromGPA: true } : c);
  }

  // Feature 21: Auto-generate withdrawal notations
  generateWithdrawalNotation(course) {
    if (course.grade === 'W' || course.status === 'withdrawn') {
      return { ...course, notation: `W (Withdrawn${course.withdrawalDate ? ' ' + course.withdrawalDate : ''})`, creditHoursEarned: 0 };
    }
    return course;
  }

  // Feature 22: Auto-produce course section numbers and meeting format labels
  formatCourseSection(courseNumber, section, meetingFormat = 'lecture') {
    const formatLabels = { lecture: 'LEC', lab: 'LAB', online: 'ONL', hybrid: 'HYB', seminar: 'SEM', independent_study: 'IND' };
    return { fullNumber: `${courseNumber}-${String(section).padStart(3, '0')}`, formatLabel: formatLabels[meetingFormat] || 'LEC', meetingFormat };
  }

  // Feature 23: Auto-generate institutional address for transcript header
  formatInstitutionAddress(institution) {
    const { name, street, city, state, zip, country = 'USA' } = institution || {};
    return { name: name || '', street: street || '', cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(), country, formatted: [name, street, `${city}, ${state} ${zip}`, country].filter(Boolean).join('\n') };
  }

  // Feature 24: Auto-populate transcript issue date
  formatIssueDate(date = new Date(), format = 'MMMM D, YYYY') {
    const d = new Date(date);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const formats = {
      'MMMM D, YYYY': `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      'MM/DD/YYYY': `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`,
      'YYYY-MM-DD': d.toISOString().split('T')[0]
    };
    return formats[format] || formats['MMMM D, YYYY'];
  }

  // Feature 25: Auto-generate unique transcript serial/reference number
  generateSerialNumber(institutionCode = 'TRN') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${institutionCode}-${timestamp}-${random}`;
  }

  // Feature 26: Auto-populate registrar name and title
  formatRegistrarInfo(name, title = 'University Registrar') {
    return { name: name || 'Office of the Registrar', title, displayLine: `${name || 'Registrar'}, ${title}` };
  }

  // Feature 27: Auto-generate graduation date in formal format
  formatGraduationDate(date, format = 'MMMM YYYY') {
    const d = new Date(date);
    if (isNaN(d)) return date || '';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return format === 'MMMM YYYY' ? `${months[d.getMonth()]} ${d.getFullYear()}` : d.toLocaleDateString();
  }

  // Feature 28: Auto-produce academic year standing notation
  getAcademicStanding(creditsEarned, gpa, standingThreshold = 2.0) {
    const level = this.determineAcademicLevel(creditsEarned);
    const standing = gpa >= standingThreshold ? 'Good Standing' : 'Academic Probation';
    return { level, standing, creditsEarned, gpa };
  }

  // Feature 29: Auto-generate total pages and page numbering
  calculatePagination(courses, coursesPerPage = 20) {
    const totalCourses = courses.length;
    const totalPages = Math.max(1, Math.ceil(totalCourses / coursesPerPage));
    return { totalPages, pages: Array.from({ length: totalPages }, (_, i) => ({ pageNumber: i + 1, totalPages, courses: courses.slice(i * coursesPerPage, (i + 1) * coursesPerPage) })) };
  }

  // Feature 30: Auto-produce transcript legend/key
  generateTranscriptLegend(scaleType = 'standard', calendarType = 'semester') {
    const scale = this.gradingScales[scaleType] || this.gradingScales.standard;
    return {
      gradingScale: Object.entries(scale).map(([grade, points]) => ({ grade, points, description: this._gradeDescription(grade) })),
      notations: [
        { code: 'W', meaning: 'Withdrawal' }, { code: 'I', meaning: 'Incomplete' },
        { code: 'AU', meaning: 'Audit (no credit)' }, { code: 'P', meaning: 'Pass' },
        { code: 'F', meaning: 'Fail' }, { code: 'IP', meaning: 'In Progress' },
        { code: 'R', meaning: 'Repeated Course' }
      ],
      creditUnit: 'Semester Credit Hour',
      calendarSystem: calendarType
    };
  }

  _gradeDescription(grade) {
    const desc = { 'A+': 'Superior', 'A': 'Superior', 'A-': 'Excellent', 'B+': 'Very Good', 'B': 'Good', 'B-': 'Above Average', 'C+': 'Average', 'C': 'Satisfactory', 'C-': 'Below Average', 'D+': 'Poor', 'D': 'Poor', 'D-': 'Barely Passing', 'F': 'Failing' };
    return desc[grade] || '';
  }

  // Feature 25 helper: Generate full transcript data bundle
  generateFullTranscriptData(studentInput) {
    const {
      firstName, middleName, lastName, suffix,
      dateOfBirth, studentId, institutionPrefix,
      major, minor, concentration,
      institutionType, calendarType,
      startYear = new Date().getFullYear() - 4,
      numTerms = 8,
      courses = [],
      institution = {},
      registrarName, registrarTitle,
      graduationDate,
      scaleType = 'standard'
    } = studentInput;

    const fullName = this.formatStudentName(firstName, middleName, lastName, suffix);
    const formattedDOB = this.formatDateOfBirth(dateOfBirth);
    const sid = studentId || this.generateStudentId(institutionPrefix);
    const program = this.formatProgramOfStudy(major, minor, concentration);
    const calendar = calendarType || this.detectCalendarFormat(institutionType);
    const termLabels = this.generateTermLabels(calendar, parseInt(startYear), parseInt(numTerms));
    const organizedCourses = this.organizeByTerm(courses);
    const cumCredits = this.calculateCumulativeCredits(organizedCourses);
    const standing = this.getAcademicStanding(cumCredits, studentInput.gpa || 0.0);
    const serialNumber = this.generateSerialNumber(institution.code);
    const issueDate = this.formatIssueDate(new Date());
    const pagination = this.calculatePagination(organizedCourses);
    const legend = this.generateTranscriptLegend(scaleType, calendar);
    const address = this.formatInstitutionAddress(institution);
    const registrar = this.formatRegistrarInfo(registrarName, registrarTitle);
    const gradDate = graduationDate ? this.formatGraduationDate(graduationDate) : null;

    return {
      studentInfo: { fullName, dateOfBirth: formattedDOB, studentId: sid, program, academicLevel: standing.level },
      institutionInfo: { ...address, calendar, registrar },
      academicRecord: { terms: termLabels, courses: organizedCourses, cumulativeCredits: cumCredits },
      documentInfo: { serialNumber, issueDate, pagination, gradDate },
      legend,
      standing
    };
  }
}

module.exports = new TranscriptAutoGenerationService();
