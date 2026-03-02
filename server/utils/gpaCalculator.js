// Automated GPA Calculation Utility
class GPACalculator {
  constructor() {
    this.gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0, 'P': null, 'W': null
    };
  }

  calculate(courses) {
    if (!Array.isArray(courses) || courses.length === 0) {
      return { gpa: 0, totalCredits: 0, qualityPoints: 0 };
    }

    let totalCredits = 0;
    let qualityPoints = 0;

    for (const course of courses) {
      const credits = parseInt(course.credits) || 0;
      const gradePoint = this.gradePoints[course.grade];

      if (gradePoint == null) continue;

      totalCredits += credits;
      qualityPoints += credits * gradePoint;
    }

    const gpa = totalCredits > 0 ? (qualityPoints / totalCredits).toFixed(2) : 0;

    return {
      gpa: parseFloat(gpa),
      totalCredits,
      qualityPoints: parseFloat(qualityPoints.toFixed(2))
    };
  }

  isValidGrade(grade) {
    return grade in this.gradePoints;
  }
}

module.exports = GPACalculator;
