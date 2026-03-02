-- Official Seals Table
CREATE TABLE IF NOT EXISTS official_seals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_path VARCHAR(255), -- Nullable - seal can be created without image initially
  image_data BYTEA, -- Store image binary data
  seal_type VARCHAR(50) NOT NULL, -- 'institutional', 'departmental', 'accreditation', 'registrar'
  is_active BOOLEAN DEFAULT true,
  metadata JSONB, -- Store additional seal information (dimensions, format, version, etc.)
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seal Usage Tracking Table
CREATE TABLE IF NOT EXISTS seal_usage (
  id SERIAL PRIMARY KEY,
  seal_id INTEGER REFERENCES official_seals(id) ON DELETE CASCADE,
  transcript_id INTEGER REFERENCES transcripts(id) ON DELETE CASCADE,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_by INTEGER REFERENCES users(id),
  verification_code VARCHAR(100) UNIQUE
);

-- Seal Verification Log Table
CREATE TABLE IF NOT EXISTS seal_verification_log (
  id SERIAL PRIMARY KEY,
  seal_id INTEGER REFERENCES official_seals(id),
  transcript_id INTEGER REFERENCES transcripts(id),
  verification_code VARCHAR(100),
  verification_result BOOLEAN,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verifier_info JSONB -- Store IP, user agent, etc.
);

-- Create indexes for better performance
CREATE INDEX idx_seals_type ON official_seals(seal_type);
CREATE INDEX idx_seals_active ON official_seals(is_active);
CREATE INDEX idx_seal_usage_transcript ON seal_usage(transcript_id);
CREATE INDEX idx_seal_usage_seal ON seal_usage(seal_id);
CREATE INDEX idx_seal_verification_code ON seal_usage(verification_code);

-- Create trigger to update updated_at timestamp for seals
CREATE TRIGGER update_seals_updated_at BEFORE UPDATE ON official_seals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add seal_id column to transcripts table if it doesn't exist
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS seal_id INTEGER REFERENCES official_seals(id);
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS seal_verification_code VARCHAR(100) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_transcripts_seal_id ON transcripts(seal_id);
