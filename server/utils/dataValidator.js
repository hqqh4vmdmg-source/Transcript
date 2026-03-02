// Automated Data Validation Utility
const { body } = require('express-validator');

class DataValidator {
  static validateTranscriptData(type) {
    const baseRules = [
      body('data.schoolName').trim().notEmpty(),
      body('data.studentName').trim().notEmpty(),
      body('data.cumulativeGPA').isFloat({ min: 0, max: 4.0 })
    ];

    if (type === 'high_school') {
      return [
        ...baseRules,
        body('data.gradeLevel').isIn(['9th', '10th', '11th', '12th'])
      ];
    }

    return baseRules;
  }

  static validateCourseData() {
    return [
      body('code').trim().notEmpty(),
      body('name').trim().notEmpty(),
      body('credits').isInt({ min: 1, max: 10 }),
      body('grade').isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'W'])
    ];
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  }
}

module.exports = DataValidator;
