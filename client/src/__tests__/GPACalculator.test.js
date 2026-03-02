import GPACalculator from '../utils/GPACalculator';

describe('GPACalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new GPACalculator();
  });

  describe('calculate()', () => {
    it('should return zero GPA for empty courses array', () => {
      const result = calculator.calculate([]);
      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(0);
      expect(result.qualityPoints).toBe(0);
    });

    it('should return zero GPA for non-array input', () => {
      const result = calculator.calculate(null);
      expect(result.gpa).toBe(0);
    });

    it('should calculate GPA for a single A-grade course', () => {
      const courses = [{ credits: 3, grade: 'A' }];
      const result = calculator.calculate(courses);
      expect(result.gpa).toBe(4.0);
      expect(result.totalCredits).toBe(3);
      expect(result.qualityPoints).toBe(12.0);
    });

    it('should calculate GPA across multiple courses', () => {
      const courses = [
        { credits: 3, grade: 'A' },   // 3 * 4.0 = 12
        { credits: 3, grade: 'B' },   // 3 * 3.0 = 9
        { credits: 3, grade: 'C' },   // 3 * 2.0 = 6
      ];
      const result = calculator.calculate(courses);
      // (12 + 9 + 6) / 9 = 3.0
      expect(result.gpa).toBe(3.0);
      expect(result.totalCredits).toBe(9);
    });

    it('should skip pass/withdraw grades in GPA calculation', () => {
      const courses = [
        { credits: 3, grade: 'A' },
        { credits: 3, grade: 'P' },  // Pass - not counted
        { credits: 3, grade: 'W' },  // Withdraw - not counted
      ];
      const result = calculator.calculate(courses);
      expect(result.gpa).toBe(4.0);
      expect(result.totalCredits).toBe(3);
    });

    it('should handle F grade (0.0 grade points)', () => {
      const courses = [{ credits: 3, grade: 'F' }];
      const result = calculator.calculate(courses);
      expect(result.gpa).toBe(0);
      expect(result.totalCredits).toBe(3);
      expect(result.qualityPoints).toBe(0);
    });

    it('should handle plus/minus grades', () => {
      const courses = [
        { credits: 3, grade: 'A-' },  // 3.7
        { credits: 3, grade: 'B+' },  // 3.3
      ];
      const result = calculator.calculate(courses);
      // (3*3.7 + 3*3.3) / 6 = (11.1 + 9.9) / 6 = 21 / 6 = 3.5
      expect(result.gpa).toBe(3.5);
    });
  });

  describe('isValidGrade()', () => {
    it('should return true for valid grades', () => {
      ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'W'].forEach(grade => {
        expect(calculator.isValidGrade(grade)).toBe(true);
      });
    });

    it('should return false for invalid grades', () => {
      expect(calculator.isValidGrade('Z')).toBe(false);
      expect(calculator.isValidGrade('E')).toBe(false);
      expect(calculator.isValidGrade('')).toBe(false);
    });
  });
});
