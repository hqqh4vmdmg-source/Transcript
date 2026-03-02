-- Enhanced Transcript Features Schema
-- Adds class rank, year levels, graduation requirements, and letterhead support

-- Add new columns to transcripts table
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS class_rank INTEGER;
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS class_size INTEGER;
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS year_level VARCHAR(20); -- 'freshman', 'sophomore', 'junior', 'senior'
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS letterhead_config JSONB;
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS signature_ids INTEGER[];
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS seal_id INTEGER REFERENCES seals(id);

-- Graduation Requirements Table
CREATE TABLE IF NOT EXISTS graduation_requirements (
  id SERIAL PRIMARY KEY,
  school_type VARCHAR(20) NOT NULL, -- 'high_school' or 'college'
  requirement_category VARCHAR(100) NOT NULL, -- 'English', 'Math', 'Science', etc.
  credits_required DECIMAL(4,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transcript Requirements (tracks progress toward graduation)
CREATE TABLE IF NOT EXISTS transcript_requirements (
  id SERIAL PRIMARY KEY,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  requirement_id INTEGER REFERENCES graduation_requirements(id),
  credits_earned DECIMAL(4,2) DEFAULT 0,
  credits_required DECIMAL(4,2) NOT NULL,
  is_fulfilled BOOLEAN DEFAULT false,
  courses TEXT[], -- Array of course IDs/codes that fulfill this requirement
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School Letterhead Configuration
CREATE TABLE IF NOT EXISTS school_letterheads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  school_name VARCHAR(200) NOT NULL,
  school_address TEXT,
  school_phone VARCHAR(50),
  school_email VARCHAR(100),
  school_website VARCHAR(200),
  logo_url TEXT,
  header_style JSONB, -- Styling configuration
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transcript_requirements_transcript_id ON transcript_requirements(transcript_id);
CREATE INDEX IF NOT EXISTS idx_school_letterheads_user_id ON school_letterheads(user_id);

-- Insert default graduation requirements for high school
INSERT INTO graduation_requirements (school_type, requirement_category, credits_required, description) VALUES
('high_school', 'English/Language Arts', 4.0, 'Four years of English required'),
('high_school', 'Mathematics', 3.0, 'Three years of Mathematics (Algebra I and above)'),
('high_school', 'Science', 3.0, 'Three years of Science (including lab sciences)'),
('high_school', 'Social Studies', 3.0, 'Three years of Social Studies (including U.S. History)'),
('high_school', 'Foreign Language', 2.0, 'Two years of the same foreign language'),
('high_school', 'Physical Education', 2.0, 'Two years of Physical Education'),
('high_school', 'Fine Arts', 1.0, 'One year of Fine Arts or Performing Arts'),
('high_school', 'Electives', 6.0, 'Six credits of elective courses'),
('high_school', 'Total Credits', 24.0, 'Minimum 24 credits required for graduation')
ON CONFLICT DO NOTHING;

-- Insert default graduation requirements for college
INSERT INTO graduation_requirements (school_type, requirement_category, credits_required, description) VALUES
('college', 'General Education', 30.0, 'General Education core requirements'),
('college', 'Major Requirements', 36.0, 'Major-specific course requirements'),
('college', 'Minor Requirements', 18.0, 'Minor course requirements (if applicable)'),
('college', 'Electives', 36.0, 'Free elective credits'),
('college', 'Total Credits', 120.0, 'Minimum 120 credits required for Bachelor degree')
ON CONFLICT DO NOTHING;

-- Update trigger for transcript_requirements
CREATE TRIGGER IF NOT EXISTS update_transcript_requirements_updated_at 
  BEFORE UPDATE ON transcript_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_school_letterheads_updated_at 
  BEFORE UPDATE ON school_letterheads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update class rank
CREATE OR REPLACE FUNCTION calculate_class_rank(p_transcript_id INTEGER)
RETURNS TABLE(rank INTEGER, class_size INTEGER) AS $$
DECLARE
  v_gpa DECIMAL(3,2);
  v_school_name TEXT;
  v_year_level TEXT;
  v_rank INTEGER;
  v_class_size INTEGER;
BEGIN
  -- Get the transcript's GPA, school, and year
  SELECT 
    (data->>'cumulativeGPA')::DECIMAL,
    data->>'schoolName',
    year_level
  INTO v_gpa, v_school_name, v_year_level
  FROM transcripts
  WHERE id = p_transcript_id;

  -- Calculate rank among students with same school and year level
  SELECT COUNT(*) + 1
  INTO v_rank
  FROM transcripts
  WHERE data->>'schoolName' = v_school_name
    AND year_level = v_year_level
    AND (data->>'cumulativeGPA')::DECIMAL > v_gpa;

  -- Get total class size
  SELECT COUNT(*)
  INTO v_class_size
  FROM transcripts
  WHERE data->>'schoolName' = v_school_name
    AND year_level = v_year_level;

  RETURN QUERY SELECT v_rank, v_class_size;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE graduation_requirements IS 'Standard graduation requirements by school type';
COMMENT ON TABLE transcript_requirements IS 'Tracks student progress toward graduation requirements';
COMMENT ON TABLE school_letterheads IS 'Customizable school letterhead configurations';
COMMENT ON COLUMN transcripts.class_rank IS 'Student ranking within their class';
COMMENT ON COLUMN transcripts.class_size IS 'Total number of students in the class';
COMMENT ON COLUMN transcripts.year_level IS 'Academic year: freshman, sophomore, junior, senior';
