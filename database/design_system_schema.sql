-- Design System Schema
-- Supports themes, design versions, brand guidelines, and accessibility

-- Design Themes Table
CREATE TABLE IF NOT EXISTS design_themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'custom', -- 'preset', 'custom', 'user'
  description TEXT,
  user_id INTEGER REFERENCES users(id),
  
  -- Theme configuration
  theme_config JSONB NOT NULL,
  -- {
  --   colors: { primary, secondary, accent, background, text },
  --   fonts: { heading, body, signature },
  --   layout: { orientation, margins, spacing },
  --   elements: { border, seal, watermark }
  -- }
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  
  -- Preview
  preview_image TEXT,
  thumbnail TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design Versions Table (for history tracking)
CREATE TABLE IF NOT EXISTS design_versions (
  id SERIAL PRIMARY KEY,
  design_id INTEGER, -- Can reference certificates, themes, etc.
  design_type VARCHAR(50) NOT NULL, -- 'certificate', 'theme', 'template'
  version_number INTEGER NOT NULL,
  
  -- Version data
  design_data JSONB NOT NULL,
  changes_description TEXT,
  
  -- Metadata
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(design_id, design_type, version_number)
);

-- Brand Guidelines Table
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  organization_name VARCHAR(200) NOT NULL,
  
  -- Brand assets
  logo_url TEXT,
  style_guide_url TEXT,
  
  -- Brand colors
  primary_colors JSONB, -- Array of hex colors
  secondary_colors JSONB,
  accent_colors JSONB,
  
  -- Typography
  approved_fonts JSONB, -- Array of font names
  font_sizes JSONB,
  
  -- Logo usage rules
  logo_usage_rules JSONB,
  -- {
  --   minSize: { width, height },
  --   clearSpace: number,
  --   doNot: [rules],
  --   colorVariations: [...]
  -- }
  
  -- Design rules
  design_rules JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Color Palettes Table
CREATE TABLE IF NOT EXISTS color_palettes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  
  -- Palette colors (5 colors typically)
  colors JSONB NOT NULL,
  -- [
  --   { hex: '#003366', name: 'Primary Navy', role: 'primary' },
  --   { hex: '#FFD700', name: 'Gold Accent', role: 'accent' },
  --   ...
  -- ]
  
  -- Palette metadata
  palette_type VARCHAR(50), -- 'monochromatic', 'complementary', 'analogous', 'triadic'
  source VARCHAR(100), -- 'generated', 'uploaded', 'extracted'
  
  -- Accessibility scores
  wcag_aa_compliant BOOLEAN DEFAULT false,
  wcag_aaa_compliant BOOLEAN DEFAULT false,
  contrast_ratios JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accessibility Audit Results
CREATE TABLE IF NOT EXISTS accessibility_audits (
  id SERIAL PRIMARY KEY,
  design_id INTEGER,
  design_type VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  
  -- Audit results
  wcag_level VARCHAR(10), -- 'A', 'AA', 'AAA'
  overall_score DECIMAL(5,2),
  
  -- Detailed results
  color_contrast JSONB,
  text_size JSONB,
  alt_text JSONB,
  keyboard_navigation JSONB,
  
  -- Issues found
  issues JSONB,
  -- [
  --   { severity: 'error|warning|info', message: '...', suggestion: '...' }
  -- ]
  
  passed_checks INTEGER DEFAULT 0,
  failed_checks INTEGER DEFAULT 0,
  
  audited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Print Specifications Table
CREATE TABLE IF NOT EXISTS print_specifications (
  id SERIAL PRIMARY KEY,
  design_id INTEGER,
  design_type VARCHAR(50),
  
  -- Paper specifications
  paper_size VARCHAR(50), -- 'letter', 'a4', 'legal', etc.
  paper_weight VARCHAR(50), -- '80lb', '100lb', etc.
  paper_finish VARCHAR(50), -- 'matte', 'glossy', 'linen', etc.
  
  -- Print specifications
  color_mode VARCHAR(20), -- 'RGB', 'CMYK'
  resolution INTEGER DEFAULT 300, -- DPI
  bleed_size DECIMAL(5,2), -- in mm
  
  -- Color values
  cmyk_colors JSONB,
  rgb_colors JSONB,
  pantone_colors JSONB,
  
  -- Specifications document
  spec_file_url TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_design_themes_user_id ON design_themes(user_id);
CREATE INDEX idx_design_themes_category ON design_themes(category);
CREATE INDEX idx_design_versions_design ON design_versions(design_id, design_type);
CREATE INDEX idx_brand_guidelines_user_id ON brand_guidelines(user_id);
CREATE INDEX idx_color_palettes_user_id ON color_palettes(user_id);
CREATE INDEX idx_accessibility_audits_design ON accessibility_audits(design_id, design_type);

-- Insert 15 preset themes
INSERT INTO design_themes (name, category, description, theme_config, is_public) VALUES

-- 1. Classic Navy & Gold
('Classic Navy & Gold', 'preset', 'Traditional academic colors with professional appeal', 
  '{"colors":{"primary":"#003366","secondary":"#FFD700","accent":"#C0A062","background":"#FFFEF0","text":"#1A1A1A"},"fonts":{"heading":"Garamond","body":"Times New Roman","signature":"Brush Script MT"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"ornate","seal":"embossed-gold","watermark":"light"}}', 
  true),

-- 2. Ivy League Crimson
('Ivy League Crimson', 'preset', 'Deep crimson and white for prestigious institutions',
  '{"colors":{"primary":"#A51C30","secondary":"#FFFFFF","accent":"#8B0000","background":"#FFFEF8","text":"#2C2C2C"},"fonts":{"heading":"Playfair Display","body":"Garamond","signature":"Playfair Display"},"layout":{"orientation":"landscape","margins":{"top":"25mm","right":"25mm","bottom":"25mm","left":"25mm"},"spacing":"generous"},"elements":{"border":"elegant-double","seal":"embossed-silver","watermark":"medium"}}',
  true),

-- 3. Modern Blue
('Modern Blue', 'preset', 'Clean, contemporary blue palette',
  '{"colors":{"primary":"#1976D2","secondary":"#FFA726","accent":"#42A5F5","background":"#FAFAFA","text":"#212121"},"fonts":{"heading":"Open Sans","body":"Roboto","signature":"Open Sans"},"layout":{"orientation":"portrait","margins":{"top":"15mm","right":"15mm","bottom":"15mm","left":"15mm"},"spacing":"compact"},"elements":{"border":"minimal","seal":"modern-flat","watermark":"none"}}',
  true),

-- 4. Elegant Black & Gold
('Elegant Black & Gold', 'preset', 'Sophisticated black and gold combination',
  '{"colors":{"primary":"#000000","secondary":"#FFD700","accent":"#C0A062","background":"#FFF8E7","text":"#1A1A1A"},"fonts":{"heading":"Baskerville","body":"Garamond","signature":"Brush Script MT"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"ornate-gold","seal":"embossed-gold","watermark":"light"}}',
  true),

-- 5. Forest Green
('Forest Green', 'preset', 'Natural green tones for environmental programs',
  '{"colors":{"primary":"#2E7D32","secondary":"#FFD54F","accent":"#66BB6A","background":"#F1F8E9","text":"#1B5E20"},"fonts":{"heading":"Georgia","body":"Times New Roman","signature":"Georgia"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"nature-inspired","seal":"embossed-green","watermark":"light"}}',
  true),

-- 6. Royal Purple
('Royal Purple', 'preset', 'Regal purple for distinguished achievements',
  '{"colors":{"primary":"#6A1B9A","secondary":"#FFD700","accent":"#BA68C8","background":"#F3E5F5","text":"#4A148C"},"fonts":{"heading":"Playfair Display","body":"Book Antiqua","signature":"Playfair Display"},"layout":{"orientation":"landscape","margins":{"top":"22mm","right":"22mm","bottom":"22mm","left":"22mm"},"spacing":"generous"},"elements":{"border":"royal","seal":"embossed-gold","watermark":"medium"}}',
  true),

-- 7. Sunset Orange
('Sunset Orange', 'preset', 'Warm orange tones for creative fields',
  '{"colors":{"primary":"#E65100","secondary":"#FFF59D","accent":"#FF9800","background":"#FFF3E0","text":"#BF360C"},"fonts":{"heading":"Open Sans","body":"Helvetica","signature":"Brush Script MT"},"layout":{"orientation":"portrait","margins":{"top":"18mm","right":"18mm","bottom":"18mm","left":"18mm"},"spacing":"standard"},"elements":{"border":"modern-gradient","seal":"modern-flat","watermark":"light"}}',
  true),

-- 8. Ocean Blue
('Ocean Blue', 'preset', 'Deep blue ocean colors',
  '{"colors":{"primary":"#01579B","secondary":"#FFD700","accent":"#0288D1","background":"#E1F5FE","text":"#01579B"},"fonts":{"heading":"Garamond","body":"Georgia","signature":"Brush Script MT"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"wave-pattern","seal":"embossed-silver","watermark":"medium"}}',
  true),

-- 9. Emerald
('Emerald', 'preset', 'Rich emerald green',
  '{"colors":{"primary":"#00695C","secondary":"#FFD700","accent":"#26A69A","background":"#E0F2F1","text":"#004D40"},"fonts":{"heading":"Book Antiqua","body":"Palatino","signature":"Book Antiqua"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"elegant","seal":"embossed-gold","watermark":"light"}}',
  true),

-- 10. Ruby Red
('Ruby Red', 'preset', 'Bold ruby red theme',
  '{"colors":{"primary":"#B71C1C","secondary":"#FFD700","accent":"#EF5350","background":"#FFEBEE","text":"#7F0000"},"fonts":{"heading":"Playfair Display","body":"Garamond","signature":"Playfair Display"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"ornate","seal":"embossed-gold","watermark":"medium"}}',
  true),

-- 11. Sapphire
('Sapphire', 'preset', 'Deep sapphire blue',
  '{"colors":{"primary":"#0D47A1","secondary":"#FFD700","accent":"#42A5F5","background":"#E3F2FD","text":"#01579B"},"fonts":{"heading":"Baskerville","body":"Georgia","signature":"Baskerville"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"classic","seal":"embossed-silver","watermark":"light"}}',
  true),

-- 12. Platinum
('Platinum', 'preset', 'Metallic platinum theme',
  '{"colors":{"primary":"#37474F","secondary":"#B0BEC5","accent":"#78909C","background":"#ECEFF1","text":"#263238"},"fonts":{"heading":"Helvetica","body":"Arial","signature":"Helvetica"},"layout":{"orientation":"portrait","margins":{"top":"15mm","right":"15mm","bottom":"15mm","left":"15mm"},"spacing":"compact"},"elements":{"border":"modern-metal","seal":"modern-flat","watermark":"none"}}',
  true),

-- 13. Bronze
('Bronze', 'preset', 'Warm bronze metallic',
  '{"colors":{"primary":"#5D4037","secondary":"#CD7F32","accent":"#8D6E63","background":"#EFEBE9","text":"#3E2723"},"fonts":{"heading":"Georgia","body":"Book Antiqua","signature":"Georgia"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"ornate","seal":"embossed-bronze","watermark":"light"}}',
  true),

-- 14. Silver & Blue
('Silver & Blue', 'preset', 'Cool silver and blue combination',
  '{"colors":{"primary":"#455A64","secondary":"#B0BEC5","accent":"#90CAF9","background":"#ECEFF1","text":"#263238"},"fonts":{"heading":"Open Sans","body":"Roboto","signature":"Open Sans"},"layout":{"orientation":"landscape","margins":{"top":"18mm","right":"18mm","bottom":"18mm","left":"18mm"},"spacing":"standard"},"elements":{"border":"modern","seal":"embossed-silver","watermark":"light"}}',
  true),

-- 15. Midnight
('Midnight', 'preset', 'Dark midnight theme with gold accents',
  '{"colors":{"primary":"#1A237E","secondary":"#FFD700","accent":"#3F51B5","background":"#E8EAF6","text":"#0D47A1"},"fonts":{"heading":"Playfair Display","body":"Garamond","signature":"Playfair Display"},"layout":{"orientation":"landscape","margins":{"top":"20mm","right":"20mm","bottom":"20mm","left":"20mm"},"spacing":"standard"},"elements":{"border":"elegant-double","seal":"embossed-gold","watermark":"medium"}}',
  true);

-- Update triggers
CREATE TRIGGER update_design_themes_updated_at BEFORE UPDATE ON design_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_guidelines_updated_at BEFORE UPDATE ON brand_guidelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE design_themes IS 'Stores design themes with 15 presets and custom user themes';
COMMENT ON TABLE design_versions IS 'Version history for all designs with change tracking';
COMMENT ON TABLE brand_guidelines IS 'Brand guidelines for organizations including colors, fonts, and logo rules';
COMMENT ON TABLE color_palettes IS 'Color palettes with accessibility scores';
COMMENT ON TABLE accessibility_audits IS 'WCAG compliance audit results';
COMMENT ON TABLE print_specifications IS 'Professional print specifications for diplomas';
