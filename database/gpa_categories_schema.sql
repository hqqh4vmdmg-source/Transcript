-- Category 3: GPA Categories Enhancements Schema
-- Expanded GPA categories, analytics, recommendations

-- 3.1: Expanded GPA Categories (10 total, up from 5)
CREATE TABLE IF NOT EXISTS gpa_categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  category_code VARCHAR(50) NOT NULL UNIQUE,
  
  -- GPA range
  min_gpa DECIMAL(3,2) NOT NULL,
  max_gpa DECIMAL(3,2) NOT NULL,
  
  -- Classification
  academic_standing VARCHAR(100), -- 'Failing', 'Poor', 'Below Average', 'Average', 'Above Average', 'Good', 'Very Good', 'Excellent', 'Outstanding', 'Perfect'
  honor_designation VARCHAR(100), -- NULL, 'Cum Laude', 'Magna Cum Laude', 'Summa Cum Laude', 'Honors', 'High Honors', 'Highest Honors'
  
  -- Descriptive text
  description TEXT,
  completion_text TEXT,
  
  -- Recommendations
  recommended_actions TEXT[],
  improvement_suggestions TEXT[],
  
  -- Statistics
  percentile_low DECIMAL(5,2),
  percentile_high DECIMAL(5,2),
  
  -- Metadata
  is_passing BOOLEAN DEFAULT true,
  requires_intervention BOOLEAN DEFAULT false,
  is_honor_eligible BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.2: Custom Category Builder
CREATE TABLE IF NOT EXISTS custom_gpa_categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category_name VARCHAR(100) NOT NULL,
  
  -- Custom range
  min_gpa DECIMAL(3,2) NOT NULL,
  max_gpa DECIMAL(3,2) NOT NULL,
  
  -- Custom settings
  custom_designation VARCHAR(100),
  custom_text TEXT,
  custom_color VARCHAR(20),
  
  -- Usage
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_gpa_categories_user ON custom_gpa_categories(user_id);

-- 3.5: Category Analytics Dashboard
CREATE TABLE IF NOT EXISTS category_analytics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES gpa_categories(id),
  
  -- Usage statistics
  total_transcripts INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  
  -- Time-based stats
  this_month_count INTEGER DEFAULT 0,
  this_year_count INTEGER DEFAULT 0,
  
  -- Trends
  trend_direction VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  growth_percentage DECIMAL(5,2),
  
  -- Distribution
  by_school_type JSONB, -- { "high_school": 45, "college": 32, "university": 23 }
  by_major JSONB,
  by_year JSONB,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_analytics_category ON category_analytics(category_id);

-- 3.7: GPA Trend Analysis
CREATE TABLE IF NOT EXISTS gpa_trend_records (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Trend data points
  semester_number INTEGER NOT NULL,
  gpa_at_semester DECIMAL(3,2) NOT NULL,
  cumulative_gpa DECIMAL(3,2) NOT NULL,
  
  -- Trend indicators
  gpa_change DECIMAL(3,2), -- Change from previous semester
  trend_direction VARCHAR(20), -- 'improving', 'declining', 'stable'
  
  -- Predictions
  projected_final_gpa DECIMAL(3,2),
  confidence_level DECIMAL(3,2), -- 0.0 to 1.0
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gpa_trend_records_transcript ON gpa_trend_records(transcript_id);
CREATE INDEX idx_gpa_trend_records_semester ON gpa_trend_records(semester_number);

-- 3.8: Honor Society Recommendations
CREATE TABLE IF NOT EXISTS honor_societies (
  id SERIAL PRIMARY KEY,
  society_name VARCHAR(200) NOT NULL,
  society_acronym VARCHAR(50),
  
  -- Requirements
  min_gpa_requirement DECIMAL(3,2) NOT NULL,
  min_credits_requirement DECIMAL(5,2),
  specific_requirements TEXT[],
  
  -- Categories
  academic_field VARCHAR(100), -- 'General', 'Engineering', 'Business', 'Science', 'Arts'
  level VARCHAR(50), -- 'undergraduate', 'graduate', 'all'
  
  -- Information
  description TEXT,
  benefits TEXT[],
  website_url TEXT,
  
  -- Metadata
  is_prestigious BOOLEAN DEFAULT false,
  recognition_level VARCHAR(50), -- 'local', 'national', 'international'
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_honor_societies_gpa ON honor_societies(min_gpa_requirement);
CREATE INDEX idx_honor_societies_field ON honor_societies(academic_field);

-- 3.9: Scholarship Eligibility
CREATE TABLE IF NOT EXISTS scholarships (
  id SERIAL PRIMARY KEY,
  scholarship_name VARCHAR(200) NOT NULL,
  provider_name VARCHAR(200),
  
  -- Eligibility requirements
  min_gpa_requirement DECIMAL(3,2) NOT NULL,
  max_gpa_requirement DECIMAL(3,2),
  min_credits DECIMAL(5,2),
  
  -- Award details
  award_amount_min DECIMAL(10,2),
  award_amount_max DECIMAL(10,2),
  award_type VARCHAR(50), -- 'one-time', 'annual', 'semester', 'renewable'
  
  -- Criteria
  eligible_majors TEXT[],
  eligible_years TEXT[], -- ['freshman', 'sophomore', 'junior', 'senior']
  additional_requirements TEXT[],
  
  -- Application
  deadline_month INTEGER,
  deadline_day INTEGER,
  application_url TEXT,
  
  -- Metadata
  is_need_based BOOLEAN DEFAULT false,
  is_merit_based BOOLEAN DEFAULT true,
  competitiveness VARCHAR(50), -- 'low', 'medium', 'high', 'very_high'
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scholarships_gpa ON scholarships(min_gpa_requirement);
CREATE INDEX idx_scholarships_type ON scholarships(award_type);

-- 3.10: Career Path Suggestions
CREATE TABLE IF NOT EXISTS career_paths (
  id SERIAL PRIMARY KEY,
  career_title VARCHAR(200) NOT NULL,
  career_field VARCHAR(100),
  
  -- GPA relevance
  typical_gpa_range_min DECIMAL(3,2),
  typical_gpa_range_max DECIMAL(3,2),
  min_gpa_competitive DECIMAL(3,2),
  
  -- Career information
  description TEXT,
  required_education VARCHAR(100),
  typical_majors TEXT[],
  
  -- Outlook
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  job_growth_rate DECIMAL(5,2), -- Percentage
  job_outlook VARCHAR(50), -- 'poor', 'fair', 'good', 'excellent'
  
  -- Requirements
  key_skills TEXT[],
  certifications_needed TEXT[],
  
  -- Resources
  resource_links JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_paths_gpa ON career_paths(typical_gpa_range_min, typical_gpa_range_max);
CREATE INDEX idx_career_paths_field ON career_paths(career_field);

-- Insert 10 GPA categories
INSERT INTO gpa_categories (category_name, category_code, min_gpa, max_gpa, academic_standing, honor_designation, description, completion_text, is_passing, requires_intervention, is_honor_eligible, percentile_low, percentile_high) VALUES
  ('Failing', 'failing', 0.00, 1.49, 'Failing', NULL, 'Student is not meeting minimum academic standards', 'has completed the prescribed course of study', false, true, false, 0, 10),
  ('Below Average', 'below_avg', 1.50, 1.99, 'Below Average', NULL, 'Student needs significant improvement', 'has completed requirements', true, true, false, 10, 25),
  ('Average Low', 'avg_low', 2.00, 2.49, 'Average', NULL, 'Student is meeting basic requirements', 'has satisfactorily completed requirements', true, false, false, 25, 40),
  ('Average', 'average', 2.50, 2.99, 'Average', NULL, 'Student is performing at average level', 'has satisfactorily completed all requirements', true, false, false, 40, 60),
  ('Above Average', 'above_avg', 3.00, 3.49, 'Above Average', NULL, 'Student is performing well', 'has successfully completed all requirements', true, false, false, 60, 75),
  ('Good - Cum Laude', 'good', 3.50, 3.69, 'Good', 'Cum Laude', 'Student demonstrates strong academic performance', 'has completed with distinction all requirements', true, false, true, 75, 85),
  ('Very Good', 'very_good', 3.70, 3.84, 'Very Good', 'Magna Cum Laude', 'Student demonstrates very strong performance', 'has completed with high distinction all requirements', true, false, true, 85, 92),
  ('Excellent', 'excellent', 3.85, 3.94, 'Excellent', 'Summa Cum Laude', 'Student demonstrates excellent academic achievement', 'has completed with highest distinction all requirements', true, false, true, 92, 97),
  ('Outstanding', 'outstanding', 3.95, 3.99, 'Outstanding', 'Summa Cum Laude with Honors', 'Student demonstrates outstanding academic excellence', 'has completed with highest honors all requirements', true, false, true, 97, 99),
  ('Perfect', 'perfect', 4.00, 4.00, 'Perfect', 'Summa Cum Laude with Highest Honors', 'Student has achieved perfect academic record', 'has achieved perfect academic excellence in all requirements', true, false, true, 99, 100)
ON CONFLICT (category_code) DO NOTHING;

-- Insert honor societies
INSERT INTO honor_societies (society_name, society_acronym, min_gpa_requirement, min_credits_requirement, academic_field, level, description, is_prestigious, recognition_level) VALUES
  ('Phi Beta Kappa', 'PBK', 3.75, 75, 'Liberal Arts', 'undergraduate', 'The oldest and most prestigious honor society', true, 'national'),
  ('Tau Beta Pi', 'TBP', 3.50, 60, 'Engineering', 'undergraduate', 'Engineering honor society', true, 'national'),
  ('Beta Gamma Sigma', 'BGS', 3.50, 50, 'Business', 'undergraduate', 'Business honor society', true, 'international'),
  ('Phi Kappa Phi', 'PKP', 3.50, 72, 'General', 'all', 'Multidisciplinary honor society', true, 'national'),
  ('Golden Key', 'GK', 3.40, 48, 'General', 'undergraduate', 'Top 15% academic honor society', false, 'international'),
  ('Alpha Lambda Delta', 'ALD', 3.50, 12, 'General', 'undergraduate', 'Freshman honor society', false, 'national'),
  ('Sigma Xi', 'SX', 3.30, 0, 'Science', 'all', 'Scientific research honor society', true, 'international'),
  ('Psi Chi', 'PC', 3.00, 9, 'Psychology', 'undergraduate', 'Psychology honor society', false, 'international')
ON CONFLICT DO NOTHING;

-- Insert sample scholarships
INSERT INTO scholarships (scholarship_name, provider_name, min_gpa_requirement, award_amount_min, award_amount_max, award_type, eligible_years, is_merit_based, competitiveness) VALUES
  ('Presidential Scholarship', 'University', 3.80, 5000, 10000, 'annual', ARRAY['freshman', 'sophomore', 'junior', 'senior'], true, 'very_high'),
  ('Dean''s Merit Award', 'University', 3.50, 2500, 5000, 'annual', ARRAY['sophomore', 'junior', 'senior'], true, 'high'),
  ('Academic Excellence Award', 'University', 3.30, 1000, 3000, 'semester', ARRAY['all'], true, 'medium'),
  ('STEM Scholarship', 'Foundation', 3.20, 3000, 7500, 'annual', ARRAY['junior', 'senior'], true, 'medium'),
  ('Community Service Award', 'Local Org', 2.80, 500, 2000, 'one-time', ARRAY['all'], false, 'low')
ON CONFLICT DO NOTHING;

-- Insert career paths
INSERT INTO career_paths (career_title, career_field, typical_gpa_range_min, typical_gpa_range_max, min_gpa_competitive, description, required_education, salary_range_min, salary_range_max, job_outlook, typical_majors) VALUES
  ('Software Engineer', 'Technology', 3.00, 3.80, 3.20, 'Design and develop software applications', 'Bachelor''s Degree', 70000, 150000, 'excellent', ARRAY['Computer Science', 'Software Engineering']),
  ('Data Scientist', 'Technology', 3.20, 3.90, 3.50, 'Analyze complex data to inform business decisions', 'Master''s Degree', 85000, 160000, 'excellent', ARRAY['Data Science', 'Statistics', 'Computer Science']),
  ('Physician', 'Healthcare', 3.60, 4.00, 3.70, 'Diagnose and treat patients', 'Medical Degree', 180000, 350000, 'good', ARRAY['Pre-Med', 'Biology', 'Chemistry']),
  ('Lawyer', 'Legal', 3.40, 3.95, 3.60, 'Represent clients in legal matters', 'Law Degree', 75000, 200000, 'fair', ARRAY['Political Science', 'Criminal Justice', 'Pre-Law']),
  ('Accountant', 'Business', 2.80, 3.60, 3.00, 'Manage financial records and taxes', 'Bachelor''s Degree', 50000, 95000, 'good', ARRAY['Accounting', 'Finance']),
  ('Teacher', 'Education', 2.70, 3.50, 2.80, 'Educate students in K-12 or higher education', 'Bachelor''s Degree', 40000, 75000, 'fair', ARRAY['Education', 'Subject Major'])
ON CONFLICT DO NOTHING;
