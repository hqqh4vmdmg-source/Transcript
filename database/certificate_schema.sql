-- Certificate Templates Schema
-- Stores pre-designed certificate/diploma templates

CREATE TABLE IF NOT EXISTS certificate_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'diploma', 'certificate', 'achievement', 'completion'
  category VARCHAR(50), -- 'graduation', 'honor_roll', 'course_completion', etc.
  description TEXT,
  layout VARCHAR(20) NOT NULL DEFAULT 'portrait', -- 'portrait' or 'landscape'
  style VARCHAR(50) NOT NULL DEFAULT 'traditional', -- 'traditional', 'modern', 'elegant', 'classic'
  design_config JSONB NOT NULL, -- Stores design configuration (colors, fonts, borders, etc.)
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  preview_image TEXT, -- URL or path to preview image
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table (user-created certificates)
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES certificate_templates(id),
  certificate_type VARCHAR(50) NOT NULL, -- 'diploma', 'certificate', 'award'
  title VARCHAR(200) NOT NULL, -- e.g., "Bachelor of Science Diploma"
  
  -- School/Institution Information
  school_name VARCHAR(200) NOT NULL,
  school_location VARCHAR(300),
  school_logo_url TEXT,
  
  -- Recipient Information
  recipient_name VARCHAR(200) NOT NULL,
  student_id VARCHAR(100),
  
  -- Program/Achievement Details
  program_name VARCHAR(200), -- e.g., "Computer Science"
  degree_type VARCHAR(100), -- e.g., "Bachelor of Science"
  honors VARCHAR(100), -- e.g., "Summa Cum Laude", "With Honors"
  graduation_date DATE,
  completion_date DATE,
  
  -- Customization Data
  custom_text TEXT, -- Additional custom text
  custom_fields JSONB, -- Flexible custom fields
  
  -- Design Overrides
  design_overrides JSONB, -- Override template design settings
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'finalized', 'issued'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signatures Table (for administrators, deans, presidents)
CREATE TABLE IF NOT EXISTS signatures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(200) NOT NULL, -- Signatory name
  title VARCHAR(200) NOT NULL, -- e.g., "President", "Dean of Students", "Registrar"
  organization VARCHAR(200), -- School/Institution name
  signature_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'drawn'
  signature_data TEXT, -- Base64 image data or text
  signature_style VARCHAR(50) DEFAULT 'script', -- Font style for text signatures
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificate Signatures (many-to-many relationship)
CREATE TABLE IF NOT EXISTS certificate_signatures (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id) ON DELETE CASCADE,
  signature_id INTEGER REFERENCES signatures(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 1, -- Order of signature on certificate
  alignment VARCHAR(20) DEFAULT 'left', -- 'left', 'center', 'right'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design Elements (borders, seals, watermarks)
CREATE TABLE IF NOT EXISTS design_elements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  element_type VARCHAR(50) NOT NULL, -- 'border', 'seal', 'watermark', 'ornament'
  category VARCHAR(50), -- 'classic', 'modern', 'decorative'
  svg_data TEXT, -- SVG markup for the element
  image_url TEXT, -- Alternative: URL to image
  config JSONB, -- Element-specific configuration
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_template_id ON certificates(template_id);
CREATE INDEX idx_certificate_signatures_cert_id ON certificate_signatures(certificate_id);
CREATE INDEX idx_signatures_user_id ON signatures(user_id);
CREATE INDEX idx_certificate_templates_type ON certificate_templates(type);

-- Insert default templates
INSERT INTO certificate_templates (name, type, category, description, layout, style, design_config) VALUES
('Traditional Diploma', 'diploma', 'graduation', 'Classic diploma with ornate border and gold seal', 'landscape', 'traditional', 
  '{"borderStyle": "ornate", "sealType": "gold", "fontFamily": "Garamond", "primaryColor": "#003366", "accentColor": "#FFD700"}'),
  
('Modern Certificate', 'certificate', 'achievement', 'Clean, modern certificate design', 'portrait', 'modern',
  '{"borderStyle": "minimal", "sealType": "blue", "fontFamily": "Open Sans", "primaryColor": "#1976D2", "accentColor": "#FFA726"}'),
  
('Elegant Diploma', 'diploma', 'graduation', 'Sophisticated diploma with subtle flourishes', 'landscape', 'elegant',
  '{"borderStyle": "elegant", "sealType": "embossed", "fontFamily": "Playfair Display", "primaryColor": "#2C3E50", "accentColor": "#C0A062"}'),
  
('Honor Roll Certificate', 'certificate', 'honor_roll', 'Recognition certificate for academic excellence', 'portrait', 'classic',
  '{"borderStyle": "double", "sealType": "star", "fontFamily": "Georgia", "primaryColor": "#8B0000", "accentColor": "#FFD700"}'),
  
('Course Completion Certificate', 'certificate', 'completion', 'Professional course completion certificate', 'landscape', 'modern',
  '{"borderStyle": "simple", "sealType": "checkmark", "fontFamily": "Roboto", "primaryColor": "#27AE60", "accentColor": "#3498DB"}');

-- Insert default design elements
INSERT INTO design_elements (name, element_type, category, svg_data, config) VALUES
('Classic Gold Border', 'border', 'classic', 
  '<svg viewBox="0 0 800 600"><rect x="10" y="10" width="780" height="580" fill="none" stroke="#FFD700" stroke-width="8" /></svg>',
  '{"width": "8px", "color": "#FFD700", "style": "solid"}'),
  
('Ornate Border', 'border', 'decorative',
  '<svg viewBox="0 0 800 600"><rect x="20" y="20" width="760" height="560" fill="none" stroke="#C0A062" stroke-width="4" /><rect x="15" y="15" width="770" height="570" fill="none" stroke="#C0A062" stroke-width="2" /></svg>',
  '{"style": "double", "ornamental": true}'),
  
('Embossed Gold Seal', 'seal', 'premium',
  NULL,
  '{"type": "embossed", "color": "#FFD700", "metallic": true, "raised": true}');

-- Update trigger for certificates table
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signatures_updated_at BEFORE UPDATE ON signatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
