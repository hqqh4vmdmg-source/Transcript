import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import transcriptService from '../services/transcriptService';
import GPACalculator from '../utils/GPACalculator';
import './TranscriptGenerator.css';

const TranscriptGenerator = ({ mode }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    studentName: '',
    studentId: '',
    dateOfBirth: '',
    cumulativeGPA: '',
    // High school specific
    gradeLevel: '',
    graduationDate: '',
    // College specific
    major: '',
    degree: '',
    expectedGraduation: ''
  });

  const [courses, setCourses] = useState([
    {
      code: '',
      name: '',
      semester_year: '',
      credits: '',
      grade: '',
      teacher_professor: ''
    }
  ]);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoCalculateGPA, setAutoCalculateGPA] = useState(true);
  const [calculatedGPA, setCalculatedGPA] = useState(null);
  const [createdId, setCreatedId] = useState(null);

  // Auto-calculate GPA when courses change
  useEffect(() => {
    if (autoCalculateGPA && courses.length > 0) {
      const calculator = new GPACalculator();
      const result = calculator.calculate(courses);
      setCalculatedGPA(result);
      
      if (result.gpa > 0) {
        setFormData(prev => ({
          ...prev,
          cumulativeGPA: result.gpa.toString()
        }));
      }
    }
  }, [courses, autoCalculateGPA]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        code: '',
        name: '',
        semester_year: '',
        credits: '',
        grade: '',
        teacher_professor: ''
      }
    ]);
  };

  const removeCourse = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const transcriptData = {
        ...formData,
        courses: courses.filter(c => c.name && c.code)
      };

      const response = await transcriptService.createTranscript(token, mode, transcriptData);
      setCreatedId(response.transcript?.id || null);
      setMessage('Transcript created successfully!');
      
      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          schoolName: '',
          schoolAddress: '',
          studentName: '',
          studentId: '',
          dateOfBirth: '',
          cumulativeGPA: '',
          gradeLevel: '',
          graduationDate: '',
          major: '',
          degree: '',
          expectedGraduation: ''
        });
        setCourses([{
          code: '',
          name: '',
          semester_year: '',
          credits: '',
          grade: '',
          teacher_professor: ''
        }]);
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error creating transcript:', error);
      setMessage(error.response?.data?.message || 'Failed to create transcript');
    } finally {
      setLoading(false);
    }
  };

  const isHighSchool = mode === 'high_school';

  return (
    <div className="transcript-generator">
      <div className="transcript-generator__header">
        <h2>{isHighSchool ? 'High School' : 'College'} Transcript Generator</h2>
        <p>Fill in the information below to generate your transcript</p>
      </div>

      <form onSubmit={handleSubmit} className="transcript-form">
        {/* School Information */}
        <div className="form-section">
          <h3>School Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>School Name *</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                required
                placeholder={isHighSchool ? 'Enter high school name' : 'Enter college/university name'}
              />
            </div>
            <div className="form-group">
              <label>School Address</label>
              <input
                type="text"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleInputChange}
                placeholder="Enter school address"
              />
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="form-section">
          <h3>Student Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                placeholder="Enter student ID"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                Cumulative GPA * 
                {autoCalculateGPA && calculatedGPA && calculatedGPA.totalCredits > 0 && (
                  <span className="auto-calculated"> (Auto: {calculatedGPA.gpa})</span>
                )}
              </label>
              <div className="gpa-input-group">
                <input
                  type="text"
                  name="cumulativeGPA"
                  value={formData.cumulativeGPA}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 3.75"
                  pattern="[0-4](\.[0-9]{1,2})?"
                  disabled={autoCalculateGPA}
                />
                <label className="auto-gpa-toggle">
                  <input
                    type="checkbox"
                    checked={autoCalculateGPA}
                    onChange={(e) => setAutoCalculateGPA(e.target.checked)}
                  />
                  Auto-calculate
                </label>
              </div>
            </div>
          </div>

          {/* High School Specific Fields */}
          {isHighSchool && (
            <div className="form-row">
              <div className="form-group">
                <label>Grade Level *</label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select grade level</option>
                  <option value="9th">9th Grade</option>
                  <option value="10th">10th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="12th">12th Grade</option>
                </select>
              </div>
              <div className="form-group">
                <label>Graduation Date *</label>
                <input
                  type="date"
                  name="graduationDate"
                  value={formData.graduationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}

          {/* College Specific Fields */}
          {!isHighSchool && (
            <div className="form-row">
              <div className="form-group">
                <label>Major *</label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Degree *</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select degree</option>
                  <option value="Associate">Associate</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>
            </div>
          )}

          {!isHighSchool && (
            <div className="form-row">
              <div className="form-group">
                <label>Expected Graduation *</label>
                <input
                  type="date"
                  name="expectedGraduation"
                  value={formData.expectedGraduation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Courses */}
        <div className="form-section">
          <div className="courses-header">
            <h3>Courses</h3>
            {calculatedGPA && calculatedGPA.totalCredits > 0 && (
              <div className="gpa-summary">
                <span>Credits: {calculatedGPA.totalCredits}</span>
                <span>Quality Pts: {calculatedGPA.qualityPoints}</span>
                <span className="gpa-highlight">GPA: {calculatedGPA.gpa}</span>
              </div>
            )}
          </div>
          {courses.map((course, index) => (
            <div key={index} className="course-entry">
              <div className="course-header">
                <h4>Course {index + 1}</h4>
                {courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCourse(index)}
                    className="btn btn--remove"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={course.code}
                    onChange={(e) => handleCourseChange(index, 'code', e.target.value)}
                    placeholder="e.g., MATH101"
                  />
                </div>
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                    placeholder="e.g., Calculus I"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester/Year</label>
                  <input
                    type="text"
                    value={course.semester_year}
                    onChange={(e) => handleCourseChange(index, 'semester_year', e.target.value)}
                    placeholder="e.g., Fall 2023"
                  />
                </div>
                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    value={course.credits}
                    onChange={(e) => handleCourseChange(index, 'credits', e.target.value)}
                    placeholder="e.g., 3"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={course.grade}
                    onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                  >
                    <option value="">Select grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                    <option value="P">P (Pass)</option>
                    <option value="W">W (Withdraw)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{isHighSchool ? 'Teacher' : 'Professor'}</label>
                  <input
                    type="text"
                    value={course.teacher_professor}
                    onChange={(e) => handleCourseChange(index, 'teacher_professor', e.target.value)}
                    placeholder={isHighSchool ? 'Teacher name' : 'Professor name'}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" onClick={addCourse} className="btn btn--add">
            Add Another Course
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'message--success' : 'message--error'}`}>
            {message}
            {message.includes('success') && createdId && (
              <div className="success-actions">
                <Link to="/transcripts" className="success-link">View My Transcripts</Link>
                <button
                  type="button"
                  className="btn btn--download-inline"
                  onClick={() => transcriptService.downloadPDF(token, createdId)}
                >
                  Download PDF
                </button>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? 'Creating...' : 'Create Transcript'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TranscriptGenerator;
