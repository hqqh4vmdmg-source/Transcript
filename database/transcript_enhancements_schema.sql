-- Category 1: Transcript Generator Enhancements Schema
-- Supports templates, drafts, course catalog, batch processing, and analytics

-- 1.3: Transcript Templates (reusable configurations)
CREATE TABLE IF NOT EXISTS transcript_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) DEFAULT 'custom', -- 'system', 'custom', 'shared'
  
  -- Template configuration
  template_config JSONB NOT NULL,
  -- {
  --   schoolInfo: { name, address, logo },
  --   layoutSettings: { orientation, format, style },
  --   defaultCourses: [...],
  --   gradeScale: {...}
  -- }
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  category VARCHAR(50), -- 'high_school', 'college', 'university', 'vocational'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcript_templates_user ON transcript_templates(user_id);
CREATE INDEX idx_transcript_templates_type ON transcript_templates(template_type);
CREATE INDEX idx_transcript_templates_category ON transcript_templates(category);

-- 1.4: Draft Transcripts (save incomplete work)
CREATE TABLE IF NOT EXISTS transcript_drafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  template_id INTEGER REFERENCES transcript_templates(id),
  
  -- Draft data (allows partial completion)
  draft_data JSONB NOT NULL,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'review', 'completed'
  last_edited_section VARCHAR(100),
  
  -- Auto-save tracking
  auto_save_enabled BOOLEAN DEFAULT true,
  last_auto_save TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcript_drafts_user ON transcript_drafts(user_id);
CREATE INDEX idx_transcript_drafts_status ON transcript_drafts(status);

-- 1.5: Semester Records (for semester-by-semester GPA breakdown)
CREATE TABLE IF NOT EXISTS semester_records (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Semester information
  semester_name VARCHAR(100) NOT NULL, -- 'Fall 2023', 'Spring 2024'
  semester_number INTEGER, -- 1, 2, 3, 4, etc.
  year INTEGER,
  term VARCHAR(20), -- 'fall', 'spring', 'summer', 'winter'
  
  -- Semester GPA
  semester_gpa DECIMAL(3,2),
  semester_credits DECIMAL(5,2),
  semester_quality_points DECIMAL(7,2),
  
  -- Cumulative through this semester
  cumulative_gpa DECIMAL(3,2),
  cumulative_credits DECIMAL(5,2),
  
  -- Semester statistics
  courses_taken INTEGER DEFAULT 0,
  courses_passed INTEGER DEFAULT 0,
  honor_roll BOOLEAN DEFAULT false,
  dean_list BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_semester_records_transcript ON semester_records(transcript_id);
CREATE INDEX idx_semester_records_semester ON semester_records(semester_number);

-- 1.6: Course Catalog (for recommendations)
CREATE TABLE IF NOT EXISTS course_catalog (
  id SERIAL PRIMARY KEY,
  
  -- Course identification
  course_code VARCHAR(50) NOT NULL UNIQUE,
  course_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  
  -- Course details
  description TEXT,
  credits DECIMAL(3,1) NOT NULL,
  level VARCHAR(50), -- 'freshman', 'sophomore', 'junior', 'senior', 'graduate'
  
  -- Requirements and prerequisites
  prerequisites TEXT[], -- Array of course codes
  corequisites TEXT[],
  is_required BOOLEAN DEFAULT false,
  
  -- Recommendations
  major_programs TEXT[], -- Programs this course is recommended for
  difficulty_rating DECIMAL(3,2), -- 1.0 to 5.0
  popularity_score INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  semester_offered TEXT[], -- ['fall', 'spring', 'summer']
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_catalog_code ON course_catalog(course_code);
CREATE INDEX idx_course_catalog_level ON course_catalog(level);
CREATE INDEX idx_course_catalog_department ON course_catalog(department);

-- 1.7: Credit Tracking (dashboard data)
CREATE TABLE IF NOT EXISTS credit_tracking (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Credit totals
  total_credits_required DECIMAL(5,2),
  total_credits_earned DECIMAL(5,2),
  total_credits_in_progress DECIMAL(5,2),
  
  -- By category
  general_education_required DECIMAL(5,2),
  general_education_earned DECIMAL(5,2),
  major_required DECIMAL(5,2),
  major_earned DECIMAL(5,2),
  elective_required DECIMAL(5,2),
  elective_earned DECIMAL(5,2),
  
  -- Progress metrics
  completion_percentage DECIMAL(5,2),
  credits_remaining DECIMAL(5,2),
  semesters_remaining DECIMAL(3,1),
  on_track BOOLEAN DEFAULT true,
  
  -- Graduation projection
  projected_graduation_date DATE,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_tracking_transcript ON credit_tracking(transcript_id);

-- 1.9: Transcript Comparisons (for comparison tool)
CREATE TABLE IF NOT EXISTS transcript_comparisons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  
  -- Transcripts being compared
  transcript_ids INTEGER[] NOT NULL,
  comparison_name VARCHAR(200),
  
  -- Comparison results
  comparison_data JSONB,
  -- {
  --   gpaDifferences: {...},
  --   courseDifferences: {...},
  --   creditDifferences: {...},
  --   similarities: {...}
  -- }
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcript_comparisons_user ON transcript_comparisons(user_id);

-- 1.10: Academic Timeline (progress tracking)
CREATE TABLE IF NOT EXISTS academic_timeline (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Timeline event
  event_date DATE NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'enrollment', 'semester_start', 'semester_end', 'course_completion', 'milestone', 'graduation'
  event_title VARCHAR(200) NOT NULL,
  event_description TEXT,
  
  -- Associated data
  semester_id INTEGER REFERENCES semester_records(id),
  course_id INTEGER,
  
  -- Milestone tracking
  is_milestone BOOLEAN DEFAULT false,
  milestone_type VARCHAR(100), -- 'freshman', 'sophomore', 'junior', 'senior', 'halfway', 'graduation'
  
  -- Metadata
  metadata JSONB, -- Additional event-specific data
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_timeline_transcript ON academic_timeline(transcript_id);
CREATE INDEX idx_academic_timeline_date ON academic_timeline(event_date);
CREATE INDEX idx_academic_timeline_type ON academic_timeline(event_type);

-- 1.1: Batch Processing Jobs (for batch generation)
CREATE TABLE IF NOT EXISTS batch_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  
  -- Job details
  job_type VARCHAR(100) NOT NULL, -- 'transcript_generation', 'transcript_import', 'export'
  job_name VARCHAR(200),
  
  -- Job configuration
  job_config JSONB NOT NULL,
  input_file_path TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  success_items INTEGER DEFAULT 0,
  
  -- Results
  results JSONB,
  error_log TEXT[],
  output_file_path TEXT,
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_completion TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_batch_jobs_user ON batch_jobs(user_id);
CREATE INDEX idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX idx_batch_jobs_type ON batch_jobs(job_type);

-- 1.2: Import History (track CSV/Excel imports)
CREATE TABLE IF NOT EXISTS import_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  batch_job_id INTEGER REFERENCES batch_jobs(id),
  
  -- Import details
  import_type VARCHAR(50) NOT NULL, -- 'csv', 'excel', 'json', 'xml'
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  
  -- Import statistics
  rows_total INTEGER,
  rows_imported INTEGER,
  rows_failed INTEGER,
  
  -- Mapping configuration
  column_mapping JSONB, -- How columns were mapped to transcript fields
  
  -- Validation results
  validation_errors JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_history_user ON import_history(user_id);
CREATE INDEX idx_import_history_batch_job ON import_history(batch_job_id);

-- Insert sample course catalog entries
INSERT INTO course_catalog (course_code, course_name, department, credits, level, major_programs, semester_offered) VALUES
  ('MATH101', 'College Algebra', 'Mathematics', 3.0, 'freshman', ARRAY['Math', 'Engineering', 'Science'], ARRAY['fall', 'spring']),
  ('ENG101', 'English Composition I', 'English', 3.0, 'freshman', ARRAY['All'], ARRAY['fall', 'spring', 'summer']),
  ('CS101', 'Introduction to Computer Science', 'Computer Science', 4.0, 'freshman', ARRAY['Computer Science', 'Information Technology'], ARRAY['fall', 'spring']),
  ('HIST101', 'World History', 'History', 3.0, 'freshman', ARRAY['History', 'Social Studies'], ARRAY['fall', 'spring']),
  ('BIO101', 'Introduction to Biology', 'Biology', 4.0, 'freshman', ARRAY['Biology', 'Pre-Med', 'Nursing'], ARRAY['fall', 'spring']),
  ('CHEM101', 'General Chemistry I', 'Chemistry', 4.0, 'freshman', ARRAY['Chemistry', 'Pre-Med', 'Engineering'], ARRAY['fall']),
  ('PHYS101', 'Physics I', 'Physics', 4.0, 'sophomore', ARRAY['Physics', 'Engineering'], ARRAY['fall', 'spring']),
  ('ECON101', 'Principles of Microeconomics', 'Economics', 3.0, 'freshman', ARRAY['Economics', 'Business'], ARRAY['fall', 'spring']),
  ('PSYCH101', 'Introduction to Psychology', 'Psychology', 3.0, 'freshman', ARRAY['Psychology', 'Social Work'], ARRAY['fall', 'spring', 'summer']),
  ('ART101', 'Art History', 'Art', 3.0, 'freshman', ARRAY['Art', 'Art History'], ARRAY['fall', 'spring'])
ON CONFLICT (course_code) DO NOTHING;
