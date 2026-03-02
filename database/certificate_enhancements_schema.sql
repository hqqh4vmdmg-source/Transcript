-- Category 2: Certificate/Diploma Enhancements Schema
-- Advanced design features, multi-language, borders, patterns, fonts

-- 2.4: Border Library (20+ styles)
CREATE TABLE IF NOT EXISTS border_library (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50), -- 'classic', 'modern', 'ornate', 'simple', 'academic'
  description TEXT,
  
  -- Border configuration (SVG or CSS-based)
  border_config JSONB NOT NULL,
  -- {
  --   type: 'svg' | 'css',
  --   svgPath: '...' | cssStyle: {...},
  --   width: number,
  --   color: 'customizable' | fixed,
  --   corners: { topLeft, topRight, bottomLeft, bottomRight }
  -- }
  
  -- Preview
  preview_svg TEXT,
  thumbnail TEXT,
  
  -- Metadata
  is_premium BOOLEAN DEFAULT false,
  popularity DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.5: Background Patterns (15 options)
CREATE TABLE IF NOT EXISTS background_patterns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  pattern_type VARCHAR(50), -- 'texture', 'geometric', 'gradient', 'watermark'
  category VARCHAR(50),
  
  -- Pattern configuration
  pattern_config JSONB NOT NULL,
  -- {
  --   type: 'repeating' | 'full',
  --   imageData: base64 | svgPattern | cssGradient,
  --   opacity: 0.0-1.0,
  --   blend_mode: 'multiply' | 'overlay' | 'screen'
  -- }
  
  preview_image TEXT,
  
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.6: Ribbon and Banner Elements
CREATE TABLE IF NOT EXISTS decorative_elements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  element_type VARCHAR(50), -- 'ribbon', 'banner', 'seal_accent', 'corner_ornament', 'divider'
  style VARCHAR(50), -- 'classic', 'modern', 'elegant', 'bold'
  
  -- SVG or image data
  element_data TEXT NOT NULL, -- SVG code or base64 image
  
  -- Positioning hints
  default_position JSONB,
  -- { x: percent, y: percent, width: px, height: px, rotation: deg }
  
  -- Customization options
  customizable_colors BOOLEAN DEFAULT true,
  customizable_text BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3: Custom Fonts Library
CREATE TABLE IF NOT EXISTS custom_fonts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  font_name VARCHAR(200) NOT NULL,
  font_family VARCHAR(200) NOT NULL,
  
  -- Font files
  font_file_path TEXT NOT NULL,
  font_format VARCHAR(20), -- 'ttf', 'otf', 'woff', 'woff2'
  file_size INTEGER,
  
  -- Font metadata
  font_style VARCHAR(50), -- 'normal', 'italic', 'oblique'
  font_weight VARCHAR(50), -- 'normal', 'bold', '100'-'900'
  is_serif BOOLEAN DEFAULT true,
  
  -- License and usage
  license_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  
  -- Status
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_fonts_user ON custom_fonts(user_id);
CREATE INDEX idx_custom_fonts_family ON custom_fonts(font_family);

-- 2.7: Multi-Language Support
CREATE TABLE IF NOT EXISTS certificate_translations (
  id SERIAL PRIMARY KEY,
  language_code VARCHAR(10) NOT NULL, -- 'en', 'es', 'fr', 'de', 'zh'
  language_name VARCHAR(100) NOT NULL,
  
  -- Translation strings
  translations JSONB NOT NULL,
  -- {
  --   "certificate_of_achievement": "...",
  --   "has_successfully_completed": "...",
  --   "on_this_day": "...",
  --   "signature": "...",
  --   etc.
  -- }
  
  -- RTL support
  is_rtl BOOLEAN DEFAULT false,
  
  -- Font recommendations for this language
  recommended_fonts TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(language_code)
);

-- 2.8: Digital Signatures
CREATE TABLE IF NOT EXISTS digital_signatures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  signature_name VARCHAR(200) NOT NULL,
  
  -- Signature type
  signature_type VARCHAR(50), -- 'drawn', 'uploaded', 'typed', 'cryptographic'
  
  -- Signature data
  signature_data TEXT NOT NULL, -- Base64 image or SVG path
  signature_format VARCHAR(20), -- 'png', 'svg', 'jpg'
  
  -- For typed signatures
  font_family VARCHAR(200),
  font_size INTEGER,
  
  -- For cryptographic signatures
  public_key TEXT,
  certificate_chain TEXT,
  
  -- Metadata
  default_title VARCHAR(200), -- e.g., "President", "Dean"
  default_name VARCHAR(200),
  
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_digital_signatures_user ON digital_signatures(user_id);
CREATE INDEX idx_digital_signatures_type ON digital_signatures(signature_type);

-- 2.9: Watermark Configurations
CREATE TABLE IF NOT EXISTS watermark_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  
  -- Watermark content
  watermark_type VARCHAR(50), -- 'text', 'image', 'logo', 'pattern'
  content TEXT NOT NULL, -- Text or base64 image
  
  -- Positioning
  position VARCHAR(50), -- 'center', 'diagonal', 'top_right', 'bottom_left', 'repeat'
  rotation DECIMAL(5,2), -- Degrees
  
  -- Styling
  opacity DECIMAL(3,2) DEFAULT 0.1,
  color VARCHAR(20),
  font_size INTEGER,
  font_family VARCHAR(200),
  
  -- Behavior
  blend_mode VARCHAR(50) DEFAULT 'multiply',
  z_index INTEGER DEFAULT -1,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_watermark_configs_user ON watermark_configs(user_id);

-- 2.10: Certificate Versions (already exists in certificate_schema.sql, but enhance it)
-- This table is already created, so we'll add an index
CREATE INDEX IF NOT EXISTS idx_certificate_versions_certificate ON design_versions(design_id, design_type);

-- 2.2: Logo Variants (for multiple logo support)
CREATE TABLE IF NOT EXISTS logo_variants (
  id SERIAL PRIMARY KEY,
  parent_logo_id INTEGER, -- Can reference seals table or be standalone
  variant_type VARCHAR(50), -- 'department', 'athletic', 'school', 'college'
  
  -- Logo identification
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Logo data
  logo_data TEXT NOT NULL, -- SVG or base64 image
  logo_format VARCHAR(20), -- 'svg', 'png'
  
  -- Positioning for multi-logo layouts
  default_position VARCHAR(50), -- 'top_left', 'top_center', 'top_right', 'bottom'
  size_ratio DECIMAL(3,2) DEFAULT 1.0, -- Relative to main logo
  
  -- Association
  institution_id INTEGER,
  department_name VARCHAR(200),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logo_variants_parent ON logo_variants(parent_logo_id);
CREATE INDEX idx_logo_variants_type ON logo_variants(variant_type);

-- Insert 20+ border styles
INSERT INTO border_library (name, category, border_config, preview_svg) VALUES
  ('Classic Double Border', 'classic', '{"type":"css","width":4,"style":"double","color":"customizable"}', '<rect stroke="#000" stroke-width="4"/>'),
  ('Ornate Gold Frame', 'ornate', '{"type":"svg","width":20,"color":"#FFD700","pattern":"floral"}', '<path d="M0,0 L100,0..."/>'),
  ('Simple Thin Line', 'simple', '{"type":"css","width":1,"style":"solid","color":"customizable"}', '<rect stroke="#000" stroke-width="1"/>'),
  ('Academic Triple Border', 'academic', '{"type":"css","width":3,"style":"triple","spacing":2}', '<rect stroke="#000" stroke-width="3"/>'),
  ('Modern Geometric', 'modern', '{"type":"svg","width":15,"pattern":"geometric"}', '<path d="M0,0..."/>'),
  ('Victorian Scroll', 'ornate', '{"type":"svg","width":25,"pattern":"scroll","color":"#8B4513"}', '<path d="M0,0..."/>'),
  ('Art Deco Lines', 'modern', '{"type":"svg","width":12,"pattern":"deco"}', '<path d="M0,0..."/>'),
  ('Laurel Wreath', 'academic', '{"type":"svg","width":30,"pattern":"laurel"}', '<path d="M0,0..."/>'),
  ('Celtic Knot', 'ornate', '{"type":"svg","width":18,"pattern":"celtic"}', '<path d="M0,0..."/>'),
  ('Minimalist Bar', 'modern', '{"type":"css","width":8,"style":"solid","color":"customizable"}', '<rect stroke="#000" stroke-width="8"/>'),
  ('Rope Border', 'classic', '{"type":"svg","width":15,"pattern":"rope"}', '<path d="M0,0..."/>'),
  ('Ivy Corner Accents', 'classic', '{"type":"svg","corners":true,"pattern":"ivy"}', '<path d="M0,0..."/>'),
  ('Greek Key Pattern', 'academic', '{"type":"svg","width":20,"pattern":"greek_key"}', '<path d="M0,0..."/>'),
  ('Baroque Flourish', 'ornate', '{"type":"svg","width":35,"pattern":"baroque"}', '<path d="M0,0..."/>'),
  ('Ribbon Weave', 'ornate', '{"type":"svg","width":22,"pattern":"ribbon"}', '<path d="M0,0..."/>'),
  ('Shadow Box', 'modern', '{"type":"css","width":10,"style":"shadow","offset":3}', '<rect stroke="#000" stroke-width="10"/>'),
  ('Dotted Elegant', 'elegant', '{"type":"css","width":2,"style":"dotted","spacing":1}', '<rect stroke="#000" stroke-width="2"/>'),
  ('Heraldic Shield', 'academic', '{"type":"svg","width":25,"pattern":"heraldic"}', '<path d="M0,0..."/>'),
  ('Wave Pattern', 'modern', '{"type":"svg","width":15,"pattern":"wave"}', '<path d="M0,0..."/>'),
  ('Chain Link', 'classic', '{"type":"svg","width":18,"pattern":"chain"}', '<path d="M0,0..."/>'),
  ('Starburst Corners', 'modern', '{"type":"svg","corners":true,"pattern":"starburst"}', '<path d="M0,0..."/>'),
  ('Oak Leaf Border', 'academic', '{"type":"svg","width":28,"pattern":"oak_leaf"}', '<path d="M0,0..."/>'),
  ('Art Nouveau Curves', 'ornate', '{"type":"svg","width":32,"pattern":"art_nouveau"}', '<path d="M0,0..."/>'),
  ('Clean Corporate', 'simple', '{"type":"css","width":5,"style":"solid","color":"#003366"}', '<rect stroke="#003366" stroke-width="5"/>'),
  ('Embossed Ridge', 'modern', '{"type":"css","width":8,"style":"ridge","color":"customizable"}', '<rect stroke="#000" stroke-width="8"/>')
ON CONFLICT (name) DO NOTHING;

-- Insert 15 background patterns
INSERT INTO background_patterns (name, pattern_type, category, pattern_config) VALUES
  ('Subtle Parchment', 'texture', 'classic', '{"type":"texture","opacity":0.15,"blend_mode":"multiply"}'),
  ('Linen Fabric', 'texture', 'elegant', '{"type":"texture","opacity":0.2,"blend_mode":"overlay"}'),
  ('Marble Veins', 'texture', 'luxury', '{"type":"texture","opacity":0.1,"blend_mode":"screen"}'),
  ('Fine Crosshatch', 'geometric', 'classic', '{"type":"pattern","opacity":0.08,"scale":0.5}'),
  ('Diagonal Stripes', 'geometric', 'modern', '{"type":"pattern","opacity":0.05,"angle":45}'),
  ('Honeycomb', 'geometric', 'modern', '{"type":"pattern","opacity":0.06,"scale":0.3}'),
  ('Subtle Grid', 'geometric', 'academic', '{"type":"pattern","opacity":0.04,"spacing":20}'),
  ('Watermark Seal', 'watermark', 'security', '{"type":"watermark","opacity":0.03,"position":"center"}'),
  ('Corner Flourishes', 'decorative', 'ornate', '{"type":"corners","opacity":0.2}'),
  ('Radial Gradient Glow', 'gradient', 'modern', '{"type":"radial","opacity":0.15,"colors":["#FFF","#F5F5F5"]}'),
  ('Vintage Cream', 'texture', 'vintage', '{"type":"texture","opacity":0.25,"color":"#FFF8DC"}'),
  ('Fiber Paper', 'texture', 'elegant', '{"type":"texture","opacity":0.18,"blend_mode":"multiply"}'),
  ('Subtle Damask', 'pattern', 'ornate', '{"type":"pattern","opacity":0.07,"scale":0.8}'),
  ('Linear Gradient Fade', 'gradient', 'modern', '{"type":"linear","opacity":0.1,"angle":90}'),
  ('Embossed Seal Pattern', 'watermark', 'security', '{"type":"repeat","opacity":0.02,"scale":0.4}')
ON CONFLICT (name) DO NOTHING;

-- Insert supported languages
INSERT INTO certificate_translations (language_code, language_name, translations, is_rtl, recommended_fonts) VALUES
  ('en', 'English', '{"certificate_of":"Certificate of","achievement":"Achievement","completion":"Completion","has_successfully_completed":"has successfully completed","on_this_day":"on this day","signature":"Signature","date":"Date","awarded_to":"Awarded to","in_recognition":"In recognition of"}', false, ARRAY['Georgia', 'Times New Roman', 'Garamond']),
  ('es', 'Spanish', '{"certificate_of":"Certificado de","achievement":"Logro","completion":"Finalización","has_successfully_completed":"ha completado exitosamente","on_this_day":"en este día","signature":"Firma","date":"Fecha","awarded_to":"Otorgado a","in_recognition":"En reconocimiento de"}', false, ARRAY['Georgia', 'Times New Roman', 'Arial']),
  ('fr', 'French', '{"certificate_of":"Certificat de","achievement":"Réussite","completion":"Achèvement","has_successfully_completed":"a réussi","on_this_day":"ce jour","signature":"Signature","date":"Date","awarded_to":"Décerné à","in_recognition":"En reconnaissance de"}', false, ARRAY['Garamond', 'Book Antiqua']),
  ('de', 'German', '{"certificate_of":"Zertifikat für","achievement":"Leistung","completion":"Abschluss","has_successfully_completed":"hat erfolgreich abgeschlossen","on_this_day":"an diesem Tag","signature":"Unterschrift","date":"Datum","awarded_to":"Verliehen an","in_recognition":"In Anerkennung"}', false, ARRAY['Times New Roman', 'Georgia']),
  ('zh', 'Chinese', '{"certificate_of":"证书","achievement":"成就","completion":"完成","has_successfully_completed":"已成功完成","on_this_day":"于此日","signature":"签名","date":"日期","awarded_to":"授予","in_recognition":"为表彰"}', false, ARRAY['SimSun', 'Microsoft YaHei'])
ON CONFLICT (language_code) DO NOTHING;
