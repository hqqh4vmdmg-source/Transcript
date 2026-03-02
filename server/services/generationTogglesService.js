'use strict';

/**
 * Generation Toggles & Smart Forms Service
 * Category I: Features 171-185
 */
class GenerationTogglesService {
  constructor() {
    this.defaultToggles = {
      includeTransferCredits: true,
      includeAcademicHonors: true,
      includeGPASummaryTable: true,
      includeGraduationDate: true,
      applyGradeForgiveness: false,
      showStudentId: true,
      includeInProgressCourses: true,
      enableEmbossedSeal: true,
      enableGoldFoil: false,
      includeApostille: false,
      outputFormat: 'digital',
      showWatermark: false,
      watermarkText: 'SAMPLE',
      diplomaOrientation: 'portrait',
      diplomaSize: 'standard'
    };
  }

  // Feature 171: Auto-generate smart intake form that pre-populates from institution name
  generateSmartIntakeForm(institutionName = '') {
    const institutionDefaults = this._getInstitutionDefaults(institutionName);
    return {
      formTitle: 'Transcript & Diploma Generation Form',
      sections: [
        {
          id: 'student',
          title: 'Student Information',
          fields: [
            { name: 'firstName', label: 'First Name', type: 'text', required: true, value: '' },
            { name: 'middleName', label: 'Middle Name', type: 'text', required: false, value: '' },
            { name: 'lastName', label: 'Last Name', type: 'text', required: true, value: '' },
            { name: 'suffix', label: 'Suffix (Jr., III, etc.)', type: 'text', required: false, value: '' },
            { name: 'studentId', label: 'Student ID', type: 'text', required: false, value: '' },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false, value: '' },
            { name: 'major', label: 'Major / Field of Study', type: 'text', required: true, value: '' },
            { name: 'minor', label: 'Minor (if any)', type: 'text', required: false, value: '' },
            { name: 'concentration', label: 'Concentration (if any)', type: 'text', required: false, value: '' }
          ]
        },
        {
          id: 'institution',
          title: 'Institution Information',
          fields: [
            { name: 'institutionName', label: 'Institution Name', type: 'text', required: true, value: institutionName, helpText: 'Auto-populates known institution data' },
            { name: 'calendarSystem', label: 'Calendar System', type: 'select', options: ['semester', 'quarter', 'trimester'], value: institutionDefaults.calendarSystem },
            { name: 'gradingScaleType', label: 'Grading Scale', type: 'select', options: ['standard', 'plus_minus', 'simple'], value: 'standard' },
            { name: 'registrarName', label: "Registrar's Name", type: 'text', required: false, value: institutionDefaults.registrarName },
            { name: 'registrarTitle', label: "Registrar's Title", type: 'text', required: false, value: "University Registrar" }
          ]
        },
        {
          id: 'academic',
          title: 'Academic Record',
          fields: [
            { name: 'startYear', label: 'Start Year', type: 'number', required: true, value: '' },
            { name: 'graduationDate', label: 'Graduation Date', type: 'date', required: false, value: '' },
            { name: 'cumulativeGPA', label: 'Cumulative GPA', type: 'number', step: '0.001', min: '0', max: '4.0', required: false, value: '' },
            { name: 'degreeType', label: 'Degree Type', type: 'select', options: ['bs', 'ba', 'bfa', 'bba', 'beng', 'ms', 'ma', 'mba', 'meng', 'phd', 'edd', 'jd', 'md'], value: 'bs' },
            { name: 'totalCreditsEarned', label: 'Total Credits Earned', type: 'number', required: false, value: '' },
            { name: 'creditsRequired', label: 'Credits Required for Degree', type: 'number', value: '120' }
          ]
        }
      ],
      prePopulated: Object.keys(institutionDefaults).length > 0,
      institution: institutionName
    };
  }

  // Feature 172: Transfer credit data entry form
  getTransferCreditEntryForm() {
    return {
      formTitle: 'Transfer Credit Entry',
      fields: [
        { name: 'originatingInstitution', label: 'Originating Institution', type: 'text', required: true },
        { name: 'institutionLocation', label: 'Institution Location (City, State)', type: 'text', required: false },
        { name: 'originalTitle', label: 'Original Course Title', type: 'text', required: true },
        { name: 'originalCourseNumber', label: 'Original Course Number', type: 'text', required: false },
        { name: 'originalGrade', label: 'Original Grade Received', type: 'select', options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'T', 'CR'], required: true },
        { name: 'creditsAwarded', label: 'Credit Hours Awarded', type: 'number', step: '0.5', required: true },
        { name: 'localEquivalent', label: 'Local Course Equivalent', type: 'text', required: false, placeholder: 'e.g., MATH 201 or Elective Credit' },
        { name: 'transferYear', label: 'Year Transferred', type: 'number', required: false }
      ],
      allowMultiple: true,
      addButtonLabel: 'Add Another Transfer Course'
    };
  }

  // Feature 173: Toggle to include/exclude transfer credits
  toggleTransferCredits(options, include) {
    return { ...options, includeTransferCredits: !!include };
  }

  // Feature 174: Toggle to include/exclude academic honors and awards
  toggleAcademicHonors(options, include) {
    return { ...options, includeAcademicHonors: !!include };
  }

  // Feature 175: Toggle to include/exclude GPA summary table
  toggleGPASummaryTable(options, include) {
    return { ...options, includeGPASummaryTable: !!include };
  }

  // Feature 176: Toggle to show/hide graduation date and degree conferral
  toggleGraduationDate(options, include) {
    return { ...options, includeGraduationDate: !!include };
  }

  // Feature 177: Toggle to apply grade forgiveness and show/hide original grades
  toggleGradeForgiveness(options, applyForgiveness, showOriginal = false) {
    return { ...options, applyGradeForgiveness: !!applyForgiveness, showOriginalGradesWithForgiveness: !!showOriginal };
  }

  // Feature 178: Toggle to show/redact student ID for privacy
  toggleStudentIdDisplay(options, show) {
    return { ...options, showStudentId: !!show, studentIdRedacted: !show };
  }

  // Feature 179: Toggle to include courses in progress
  toggleInProgressCourses(options, include) {
    return { ...options, includeInProgressCourses: !!include };
  }

  // Feature 180: Fillable form for entering academic honors and award names
  getAcademicHonorsEntryForm() {
    return {
      formTitle: 'Academic Honors & Awards Entry',
      sections: [
        {
          title: 'Term Honors (Dean\'s List / President\'s List)',
          fields: [
            { name: 'honorType', label: 'Honor Type', type: 'select', options: ["Dean's List", "President's List", "Chancellor's List", 'Academic Excellence Award', 'Other'] },
            { name: 'term', label: 'Term', type: 'text', placeholder: 'e.g., Fall 2023' },
            { name: 'customName', label: 'Custom Honor Name (if Other)', type: 'text', required: false }
          ]
        },
        {
          title: 'Scholarships & Awards',
          fields: [
            { name: 'awardName', label: 'Award / Scholarship Name', type: 'text', required: true },
            { name: 'year', label: 'Academic Year Awarded', type: 'text', placeholder: '2022-2023' },
            { name: 'amount', label: 'Amount (if applicable)', type: 'number', required: false }
          ]
        },
        {
          title: 'Academic Distinctions',
          fields: [
            { name: 'distinctionType', label: 'Distinction Type', type: 'select', options: ['Valedictorian', 'Salutatorian', 'Honor Society', 'Phi Beta Kappa', 'Other'] },
            { name: 'organization', label: 'Organization / Chapter', type: 'text', required: false },
            { name: 'year', label: 'Year', type: 'number', required: false }
          ]
        }
      ],
      allowMultiple: true
    };
  }

  // Feature 181: Fillable form for diploma signatory names
  getDiplomaSignatoryForm() {
    return {
      formTitle: 'Diploma Signatory Information',
      description: 'Enter the names and titles of officials who will sign the diploma. Fields will be auto-populated where known.',
      fields: [
        { name: 'president_name', label: 'President / Chancellor Name', type: 'text', role: 'president', required: false, placeholder: 'Auto-populated if institution is recognized' },
        { name: 'president_title', label: 'President Title', type: 'text', role: 'president', value: 'President', required: false },
        { name: 'provost_name', label: 'Provost / Academic VP Name', type: 'text', role: 'provost', required: false },
        { name: 'provost_title', label: 'Provost Title', type: 'text', role: 'provost', value: 'Provost and Senior Vice President for Academic Affairs', required: false },
        { name: 'registrar_name', label: "Registrar's Name", type: 'text', role: 'registrar', required: false },
        { name: 'registrar_title', label: "Registrar's Title", type: 'text', role: 'registrar', value: 'University Registrar', required: false },
        { name: 'dean_name', label: "Dean's Name", type: 'text', role: 'dean', required: false },
        { name: 'dean_title', label: "Dean's Title", type: 'text', role: 'dean', value: 'Dean', required: false }
      ]
    };
  }

  // Feature 182: Toggle embossed seal simulation
  toggleEmbossedSeal(options, enable) {
    return { ...options, enableEmbossedSeal: !!enable };
  }

  // Feature 183: Toggle gold foil simulation
  toggleGoldFoil(options, enable) {
    return { ...options, enableGoldFoil: !!enable };
  }

  // Feature 184: Toggle apostille attachment page
  toggleApostille(options, include) {
    return { ...options, includeApostille: !!include };
  }

  // Feature 185: Toggle between digital delivery and print production format
  toggleOutputFormat(options, format = 'digital') {
    const validFormats = ['digital', 'print'];
    const selectedFormat = validFormats.includes(format) ? format : 'digital';
    return {
      ...options,
      outputFormat: selectedFormat,
      cropMarks: selectedFormat === 'print',
      bleed: selectedFormat === 'print',
      colorSpace: selectedFormat === 'print' ? 'CMYK' : 'RGB',
      dpi: selectedFormat === 'print' ? 600 : 150,
      maxFileSizeMB: selectedFormat === 'digital' ? 5 : null
    };
  }

  // Utility: Apply all toggles to transcript/diploma generation options
  applyAllToggles(baseOptions, toggleState) {
    const options = { ...this.defaultToggles, ...baseOptions };
    if (toggleState) {
      Object.keys(toggleState).forEach(key => {
        if (key in options) options[key] = toggleState[key];
      });
    }
    return options;
  }

  // Utility: Get current toggle state
  getToggleState(options = {}) {
    return { ...this.defaultToggles, ...options };
  }

  // Private: Get institution defaults for form pre-population
  _getInstitutionDefaults(institutionName) {
    const defaults = {
      'harvard university': { calendarSystem: 'semester', registrarName: '' },
      'mit': { calendarSystem: 'semester', registrarName: '' },
      'stanford university': { calendarSystem: 'quarter', registrarName: '' },
      'university of california, los angeles': { calendarSystem: 'quarter', registrarName: '' }
    };
    return defaults[(institutionName || '').toLowerCase()] || { calendarSystem: 'semester', registrarName: '' };
  }
}

module.exports = new GenerationTogglesService();
