-- Performance Schema: Category 9 - Performance Enhancements
-- All 10 performance features database schema

-- ============================================================================
-- Feature 9.2: Redis Caching System
-- ============================================================================

CREATE TABLE IF NOT EXISTS cache_config (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- 'memory', 'redis', 'cdn'
    ttl_seconds INTEGER DEFAULT 3600,
    tier VARCHAR(20) DEFAULT 'L2', -- 'L1' (memory), 'L2' (redis)
    hit_count BIGINT DEFAULT 0,
    miss_count BIGINT DEFAULT 0,
    last_hit_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cache_config_key ON cache_config(cache_key);
CREATE INDEX idx_cache_config_type ON cache_config(cache_type);

-- ============================================================================
-- Feature 9.3: CDN Integration
-- ============================================================================

CREATE TABLE IF NOT EXISTS cdn_assets (
    id SERIAL PRIMARY KEY,
    asset_path VARCHAR(500) NOT NULL,
    cdn_url VARCHAR(500) NOT NULL,
    asset_type VARCHAR(50), -- 'image', 'css', 'js', 'font', 'pdf'
    file_size BIGINT,
    cache_control VARCHAR(255),
    purged_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    access_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cdn_assets_path ON cdn_assets(asset_path);
CREATE INDEX idx_cdn_assets_type ON cdn_assets(asset_type);

-- ============================================================================
-- Feature 9.5: Background Job Processing (Bull Queue)
-- ============================================================================

CREATE TABLE IF NOT EXISTS background_jobs (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- 'pdf_generation', 'email', 'import', 'export', 'optimization'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'failed', 'delayed'
    priority INTEGER DEFAULT 0,
    data JSONB,
    result JSONB,
    error TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_background_jobs_job_id ON background_jobs(job_id);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_created_at ON background_jobs(created_at);

-- ============================================================================
-- Feature 9.6: Database Query Optimization
-- ============================================================================

CREATE TABLE IF NOT EXISTS query_performance (
    id SERIAL PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL, -- MD5 hash of query
    query_text TEXT NOT NULL,
    execution_time_ms DECIMAL(10, 2),
    rows_examined BIGINT,
    rows_returned BIGINT,
    index_used VARCHAR(255),
    optimization_suggestion TEXT,
    is_slow BOOLEAN DEFAULT FALSE, -- TRUE if > 1000ms
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);

CREATE INDEX idx_query_performance_hash ON query_performance(query_hash);
CREATE INDEX idx_query_performance_slow ON query_performance(is_slow);
CREATE INDEX idx_query_performance_executed_at ON query_performance(executed_at);

-- ============================================================================
-- Feature 9.10: Performance Monitoring Dashboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'response_time', 'memory', 'cpu', 'disk', 'network'
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12, 4),
    p50_value DECIMAL(12, 4), -- 50th percentile
    p95_value DECIMAL(12, 4), -- 95th percentile
    p99_value DECIMAL(12, 4), -- 99th percentile
    unit VARCHAR(20), -- 'ms', 'bytes', 'percent', 'count'
    endpoint VARCHAR(255),
    status_code INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
CREATE INDEX idx_performance_metrics_endpoint ON performance_metrics(endpoint);

-- ============================================================================
-- Insert Sample Data
-- ============================================================================

-- Sample cache configurations
INSERT INTO cache_config (cache_key, cache_type, ttl_seconds, tier) VALUES
('transcripts:list', 'redis', 3600, 'L2'),
('certificates:templates', 'redis', 86400, 'L2'),
('themes:all', 'memory', 3600, 'L1'),
('gpa:categories', 'memory', 7200, 'L1'),
('api:docs', 'cdn', 86400, 'L2');

-- Sample CDN assets
INSERT INTO cdn_assets (asset_path, cdn_url, asset_type, file_size, cache_control) VALUES
('/static/css/main.css', 'https://cdn.example.com/css/main.css', 'css', 45678, 'max-age=31536000'),
('/static/js/bundle.js', 'https://cdn.example.com/js/bundle.js', 'js', 234567, 'max-age=31536000'),
('/assets/logo.png', 'https://cdn.example.com/assets/logo.png', 'image', 12345, 'max-age=31536000');

-- Sample background job types with default priorities
INSERT INTO background_jobs (job_id, job_type, status, priority, data) VALUES
('pdf-gen-001', 'pdf_generation', 'pending', 10, '{"transcript_id": 1, "format": "pdf"}'),
('email-001', 'email', 'pending', 5, '{"to": "user@example.com", "template": "welcome"}'),
('import-001', 'import', 'pending', 3, '{"file": "students.csv", "type": "csv"}');

COMMENT ON TABLE cache_config IS 'Feature 9.2: Redis caching system configuration';
COMMENT ON TABLE cdn_assets IS 'Feature 9.3: CDN integration asset tracking';
COMMENT ON TABLE background_jobs IS 'Feature 9.5: Background job processing with Bull queue';
COMMENT ON TABLE query_performance IS 'Feature 9.6: Database query optimization tracking';
COMMENT ON TABLE performance_metrics IS 'Feature 9.10: Performance monitoring dashboard metrics';
