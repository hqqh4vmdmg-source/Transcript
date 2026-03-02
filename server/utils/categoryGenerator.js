const GPACalculator = require('./gpaCalculator');

/**
 * Category Generator Utility
 * Generates sample transcript data for different GPA categories
 */
class CategoryGenerator {
  constructor() {
    this.gpaCalculator = new GPACalculator();
  }

  /**
   * Generate courses for failed grades category
   * Includes F, D, and D- grades resulting in low GPA
   * @returns {Object} - { courses, stats }
   */
  generateFailedGradesCategory() {
    const courses = [
      {
        code: 'MATH101',
        name: 'College Algebra',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'F',
        teacher_professor: 'Dr. Smith'
      },
      {
        code: 'ENG101',
        name: 'English Composition I',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'D',
        teacher_professor: 'Prof. Johnson'
      },
      {
        code: 'HIST101',
        name: 'World History',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'D-',
        teacher_professor: 'Dr. Williams'
      },
      {
        code: 'BIO101',
        name: 'Introduction to Biology',
        semester_year: 'Fall 2023',
        credits: 4,
        grade: 'F',
        teacher_professor: 'Dr. Brown'
      },
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'D+',
        teacher_professor: 'Prof. Davis'
      },
      {
        code: 'CHEM101',
        name: 'General Chemistry',
        semester_year: 'Spring 2024',
        credits: 4,
        grade: 'F',
        teacher_professor: 'Dr. Martinez'
      }
    ];

    const stats = this.gpaCalculator.calculate(courses);
    
    return {
      courses,
      stats: {
        ...stats,
        category: 'Failed Grades',
        description: 'Student with multiple failed courses and very low GPA',
        failedCourses: courses.filter(c => c.grade === 'F').length,
        passingCourses: courses.filter(c => !['F', 'D', 'D-', 'D+'].includes(c.grade)).length
      }
    };
  }

  /**
   * Generate courses for 2.5 GPA category
   * Mix of B, C, and some D grades
   * @returns {Object} - { courses, stats }
   */
  generate25GPACategory() {
    const courses = [
      {
        code: 'MATH201',
        name: 'Calculus I',
        semester_year: 'Fall 2023',
        credits: 4,
        grade: 'C+',
        teacher_professor: 'Dr. Anderson'
      },
      {
        code: 'ENG201',
        name: 'English Composition II',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'B',
        teacher_professor: 'Prof. Taylor'
      },
      {
        code: 'HIST201',
        name: 'American History',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'C',
        teacher_professor: 'Dr. Thomas'
      },
      {
        code: 'BIO201',
        name: 'Cell Biology',
        semester_year: 'Fall 2023',
        credits: 4,
        grade: 'B-',
        teacher_professor: 'Dr. Jackson'
      },
      {
        code: 'CS201',
        name: 'Data Structures',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'C+',
        teacher_professor: 'Prof. White'
      },
      {
        code: 'CHEM201',
        name: 'Organic Chemistry I',
        semester_year: 'Spring 2024',
        credits: 4,
        grade: 'C',
        teacher_professor: 'Dr. Harris'
      },
      {
        code: 'PHYS201',
        name: 'Physics I',
        semester_year: 'Spring 2024',
        credits: 4,
        grade: 'B',
        teacher_professor: 'Dr. Clark'
      },
      {
        code: 'PSY201',
        name: 'Introduction to Psychology',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'B-',
        teacher_professor: 'Prof. Lewis'
      }
    ];

    const stats = this.gpaCalculator.calculate(courses);
    
    return {
      courses,
      stats: {
        ...stats,
        category: '2.5 GPA',
        description: 'Average student performance with mix of B and C grades',
        gradeDistribution: this.getGradeDistribution(courses)
      }
    };
  }

  /**
   * Generate courses for 3.74 GPA category
   * Mostly A grades with some B+ and B grades
   * @returns {Object} - { courses, stats }
   */
  generate374GPACategory() {
    const courses = [
      {
        code: 'MATH301',
        name: 'Calculus II',
        semester_year: 'Fall 2023',
        credits: 4,
        grade: 'A',
        teacher_professor: 'Dr. Robinson'
      },
      {
        code: 'ENG301',
        name: 'Advanced Composition',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'A',
        teacher_professor: 'Prof. Walker'
      },
      {
        code: 'HIST301',
        name: 'European History',
        semester_year: 'Fall 2023',
        credits: 3,
        grade: 'A-',
        teacher_professor: 'Dr. Hall'
      },
      {
        code: 'BIO301',
        name: 'Molecular Biology',
        semester_year: 'Fall 2023',
        credits: 4,
        grade: 'A',
        teacher_professor: 'Dr. Allen'
      },
      {
        code: 'CS301',
        name: 'Algorithms',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'A',
        teacher_professor: 'Prof. Young'
      },
      {
        code: 'CHEM301',
        name: 'Organic Chemistry II',
        semester_year: 'Spring 2024',
        credits: 4,
        grade: 'B+',
        teacher_professor: 'Dr. Hernandez'
      },
      {
        code: 'PHYS301',
        name: 'Physics II',
        semester_year: 'Spring 2024',
        credits: 4,
        grade: 'A',
        teacher_professor: 'Dr. King'
      },
      {
        code: 'PSY301',
        name: 'Cognitive Psychology',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'A',
        teacher_professor: 'Prof. Wright'
      },
      {
        code: 'STAT301',
        name: 'Statistics',
        semester_year: 'Spring 2024',
        credits: 3,
        grade: 'B+',
        teacher_professor: 'Dr. Lopez'
      }
    ];

    const stats = this.gpaCalculator.calculate(courses);
    
    return {
      courses,
      stats: {
        ...stats,
        category: '3.74 GPA',
        description: 'High-achieving student with excellent academic performance',
        gradeDistribution: this.getGradeDistribution(courses),
        honorsEligible: stats.gpa >= 3.5
      }
    };
  }

  /**
   * Generate complete transcript data for a category
   * @param {string} category - 'failed', '2.5', or '3.74'
   * @param {string} type - 'high_school' or 'college'
   * @returns {Object} - Complete transcript data
   */
  generateTranscriptByCategory(category, type = 'college') {
    let categoryData;
    
    switch (category.toLowerCase()) {
      case 'failed':
        categoryData = this.generateFailedGradesCategory();
        break;
      case '2.5':
        categoryData = this.generate25GPACategory();
        break;
      case '3.74':
        categoryData = this.generate374GPACategory();
        break;
      default:
        throw new Error(`Unknown category: ${category}`);
    }

    const isHighSchool = type === 'high_school';
    
    const transcriptData = {
      type,
      data: {
        schoolName: isHighSchool ? 'Lincoln High School' : 'State University',
        schoolAddress: isHighSchool 
          ? '123 Main Street, Springfield, IL 62701'
          : '456 College Avenue, University City, ST 12345',
        studentName: this.generateStudentName(),
        studentId: this.generateStudentId(type),
        dateOfBirth: this.generateDateOfBirth(),
        ...(isHighSchool ? {
          gradeLevel: '12th',
          graduationDate: '2024-06-15'
        } : {
          major: 'Computer Science',
          degree: 'Bachelor of Science',
          expectedGraduation: '2025-05-15'
        }),
        cumulativeGPA: categoryData.stats.gpa.toFixed(2),
        courses: categoryData.courses
      },
      stats: categoryData.stats
    };

    return transcriptData;
  }

  /**
   * Get grade distribution
   */
  getGradeDistribution(courses) {
    const distribution = {};
    courses.forEach(course => {
      distribution[course.grade] = (distribution[course.grade] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Generate random student name
   */
  generateStudentName() {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate student ID
   */
  generateStudentId(type) {
    const prefix = type === 'high_school' ? 'HS' : 'CU';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Generate date of birth
   */
  generateDateOfBirth() {
    const year = new Date().getFullYear() - Math.floor(Math.random() * 4 + 18); // 18-22 years old
    const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
    const day = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get all available categories
   */
  getAvailableCategories() {
    return [
      {
        id: 'failed',
        name: 'Failed Grades',
        description: 'Student with multiple failed courses and very low GPA',
        expectedGPA: '< 1.0'
      },
      {
        id: '2.5',
        name: '2.5 GPA',
        description: 'Average student performance with mix of B and C grades',
        expectedGPA: '~2.5'
      },
      {
        id: '3.74',
        name: '3.74 GPA',
        description: 'High-achieving student with excellent academic performance',
        expectedGPA: '~3.74'
      }
    ];
  }

  /**
   * Generate diploma data for a specific GPA category with customer info
   */
  generateDiplomaForCategory(category, customerInfo = {}) {
    const {
      recipientName,
      studentId,
      schoolName,
      schoolLocation,
      major,
      degreeType,
      graduationDate,
      
      // Optional customization
      schoolInitials,
      foundedYear,
      logoStyle,
      paperTexture,
      fontStyle,
      primaryColor,
      accentColor,
      paperSize,
      orientation
    } = customerInfo;

    // Get category configuration
    const config = this.categoryConfig[category] || this.categoryConfig['2.5'];
    
    // Generate appropriate GPA for the category
    const targetGPA = ((config.minGPA + config.maxGPA) / 2).toFixed(2);
    
    // Generate transcript data for this category
    const transcriptData = this.generateForCategory(category, {
      studentName: recipientName,
      schoolName: schoolName,
      major: major
    });

    // Build diploma data structure
    const diplomaData = {
      // Basic information
      recipient_name: recipientName || transcriptData.studentName,
      student_id: studentId || transcriptData.studentId,
      school_name: schoolName || transcriptData.schoolName,
      school_location: schoolLocation || 'United States',
      
      // Academic information
      degree_type: degreeType || 'Bachelor of Science',
      major: major || transcriptData.major,
      honors: config.honors,
      graduation_date: graduationDate || new Date().toISOString().split('T')[0],
      gpa: parseFloat(targetGPA),
      
      // Custom text based on GPA category
      custom_text: config.customText,
      warning_note: config.warningNote,
      
      // Logo generation options
      generateLogo: true,
      school_initials: schoolInitials,
      founded_year: foundedYear || new Date().getFullYear() - 50,
      logo_style: logoStyle || 'shield',
      logo_primary_color: primaryColor || '#003366',
      logo_secondary_color: accentColor || '#FFD700',
      
      // Design preferences
      paper_texture: paperTexture || 'parchment',
      font_style: fontStyle || 'traditional',
      primary_color: primaryColor || '#003366',
      accent_color: accentColor || '#FFD700',
      border_style: 'ornate',
      enable_embossing: true,
      gold_foil: true,
      
      // Size and orientation
      paper_size: paperSize || 'letter',
      orientation: orientation || 'landscape',
      
      // Include course data for transcript
      courses: transcriptData.courses,
      transcript_data: transcriptData,
      
      // Metadata
      category: category,
      generated_at: new Date().toISOString()
    };

    // Add appropriate signatures based on category
    diplomaData.signatures = this.generateSignaturesForCategory(category, schoolName);

    return diplomaData;
  }

  /**
   * Generate appropriate signatures based on GPA category
   */
  generateSignaturesForCategory(category, schoolName = 'University') {
    const baseSigs = [
      {
        name: 'Dr. John Smith',
        title: 'President',
        organization: schoolName
      },
      {
        name: 'Dr. Jane Doe',
        title: 'Dean of Students',
        organization: schoolName
      }
    ];

    // For honors categories, add registrar signature
    if (['3.74', 'magna', 'summa'].includes(category)) {
      baseSigs.push({
        name: 'Robert Johnson',
        title: 'Registrar',
        organization: schoolName
      });
    }

    return baseSigs;
  }

  /**
   * Generate editable diploma template with placeholders
   */
  generateEditableDiplomaTemplate(category = '2.5') {
    return {
      recipient_name: '[Student Name]',
      student_id: '[Student ID]',
      school_name: '[School Name]',
      school_location: '[City, State]',
      degree_type: '[Degree Type]',
      major: '[Major/Program]',
      honors: this.categoryConfig[category]?.honors || null,
      graduation_date: new Date().toISOString().split('T')[0],
      gpa: ((this.categoryConfig[category]?.minGPA + this.categoryConfig[category]?.maxGPA) / 2).toFixed(2),
      custom_text: this.categoryConfig[category]?.customText || 'has completed all requirements',
      
      // Editable design options
      generateLogo: true,
      school_initials: '[INIT]',
      founded_year: new Date().getFullYear() - 50,
      logo_style: 'shield', // Options: shield, circle, square, crest
      
      // Editable design preferences
      paper_texture: 'parchment', // Options: parchment, linen, cotton, vellum
      font_style: 'traditional', // Options: traditional, calligraphy, elegant, modern, classic, formal
      primary_color: '#003366',
      accent_color: '#FFD700',
      border_style: 'ornate',
      enable_embossing: true,
      gold_foil: true,
      
      paper_size: 'letter', // Options: letter, a4, legal, tabloid, custom_landscape, custom_portrait
      orientation: 'landscape', // Options: landscape, portrait
      
      signatures: [
        { name: '[President Name]', title: 'President' },
        { name: '[Dean Name]', title: 'Dean' }
      ],
      
      category: category,
      editable: true
    };
  }

  /**
   * Validate and prepare diploma data for generation
   */
  prepareDiplomaData(diplomaData, category) {
    const config = this.categoryConfig[category] || this.categoryConfig['2.5'];
    
    // Ensure GPA is within category range
    if (diplomaData.gpa) {
      const gpa = parseFloat(diplomaData.gpa);
      if (gpa < config.minGPA || gpa > config.maxGPA) {
        console.warn(`GPA ${gpa} outside of category ${category} range (${config.minGPA}-${config.maxGPA})`);
      }
    }

    // Apply category defaults if not specified
    return {
      ...diplomaData,
      honors: diplomaData.honors !== undefined ? diplomaData.honors : config.honors,
      custom_text: diplomaData.custom_text || config.customText,
      warning_note: diplomaData.warning_note || config.warningNote,
      category: category
    };
  }

  /**
   * Get display name for category
   */
  getCategoryDisplayName(category) {
    const names = {
      'failed': 'Below Average (0.0-1.5)',
      '2.5': 'Average Performance (2.4-2.6)',
      '3.74': 'Cum Laude (3.7-3.85)',
      'magna': 'Magna Cum Laude (3.5-3.74)',
      'summa': 'Summa Cum Laude (3.85-4.0)'
    };
    return names[category] || category;
  }
}

module.exports = CategoryGenerator;
