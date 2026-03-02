-- Category 5: API/Backend Enhancements Schema
-- 10 features for enterprise-grade API infrastructure

-- ========================================
-- 5.1: GraphQL Schema Storage
-- ========================================
CREATE TABLE IF NOT EXISTS graphql_schemas (
    id SERIAL PRIMARY KEY,
    version VARCHAR(10) NOT NULL UNIQUE,
    schema_definition TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_graphql_schemas_active ON graphql_schemas(is_active);

-- ========================================
-- 5.2: Webhook System
-- ========================================
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    events TEXT[] NOT NULL, -- Array of event types to subscribe to
    secret VARCHAR(255), -- For signature verification
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_ms INTEGER DEFAULT 30000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(response_status);

-- ========================================
-- 5.3: API Rate Limiting
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limit_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    endpoint_pattern VARCHAR(500), -- Regex pattern for endpoints
    requests_per_minute INTEGER DEFAULT 60,
    requests_per_hour INTEGER DEFAULT 1000,
    requests_per_day INTEGER DEFAULT 10000,
    burst_limit INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limit_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    api_key VARCHAR(255),
    ip_address INET,
    endpoint VARCHAR(500) NOT NULL,
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_limit_usage_user ON rate_limit_usage(user_id, window_start);
CREATE INDEX idx_rate_limit_usage_ip ON rate_limit_usage(ip_address, window_start);
CREATE INDEX idx_rate_limit_usage_endpoint ON rate_limit_usage(endpoint, window_start);

-- ========================================
-- 5.4: API Versioning
-- ========================================
CREATE TABLE IF NOT EXISTS api_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(10) NOT NULL UNIQUE, -- e.g., 'v1', 'v2'
    release_date DATE NOT NULL,
    deprecation_date DATE,
    sunset_date DATE,
    is_stable BOOLEAN DEFAULT false,
    is_deprecated BOOLEAN DEFAULT false,
    changelog TEXT,
    migration_guide TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial versions
INSERT INTO api_versions (version, release_date, is_stable) VALUES
('v1', '2024-01-01', true),
('v2', '2026-02-19', true)
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- 5.5: Bulk Operations
-- ========================================
CREATE TABLE IF NOT EXISTS bulk_operations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
    resource_type VARCHAR(100) NOT NULL, -- 'transcript', 'certificate', etc.
    total_items INTEGER NOT NULL,
    processed_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    input_data JSONB,
    results JSONB,
    error_log TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bulk_operations_user ON bulk_operations(user_id);
CREATE INDEX idx_bulk_operations_status ON bulk_operations(status);
CREATE INDEX idx_bulk_operations_type ON bulk_operations(operation_type, resource_type);

-- ========================================
-- 5.6: Advanced Search/Filtering
-- ========================================
CREATE TABLE IF NOT EXISTS search_filters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    filter_criteria JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_filters_user ON search_filters(user_id);
CREATE INDEX idx_search_filters_resource ON search_filters(resource_type);
CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);

-- ========================================
-- 5.7: Data Export API
-- ========================================
CREATE TABLE IF NOT EXISTS export_jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(100) NOT NULL, -- 'full', 'filtered', 'custom'
    resource_types TEXT[] NOT NULL,
    format VARCHAR(50) NOT NULL, -- 'json', 'csv', 'xml', 'excel'
    filters JSONB,
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
    file_path VARCHAR(1000),
    file_size BIGINT,
    download_url VARCHAR(1000),
    expires_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_export_jobs_user ON export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);

-- ========================================
-- 5.8: Audit Logging System
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'read', 'update', 'delete'
    resource_type VARCHAR(100) NOT NULL,
    resource_id INTEGER,
    changes JSONB, -- Before/after values
    ip_address INET,
    user_agent TEXT,
    api_version VARCHAR(10),
    request_id VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ========================================
-- 5.9: API Analytics
-- ========================================
CREATE TABLE IF NOT EXISTS api_metrics (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
    response_time_ms INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    api_version VARCHAR(10),
    error_message TEXT,
    request_size BIGINT,
    response_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_analytics_summary (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    min_response_time_ms INTEGER,
    max_response_time_ms INTEGER,
    p50_response_time_ms INTEGER,
    p95_response_time_ms INTEGER,
    p99_response_time_ms INTEGER,
    total_data_transferred BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, endpoint, method)
);

CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint, created_at DESC);
CREATE INDEX idx_api_metrics_user ON api_metrics(user_id, created_at DESC);
CREATE INDEX idx_api_metrics_status ON api_metrics(status_code);
CREATE INDEX idx_api_analytics_summary_date ON api_analytics_summary(date DESC);

-- ========================================
-- 5.10: Developer Sandbox
-- ========================================
CREATE TABLE IF NOT EXISTS sandbox_environments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    request_limit INTEGER DEFAULT 1000, -- Per day
    expires_at TIMESTAMP,
    allowed_endpoints TEXT[], -- Whitelist of endpoints
    sample_data_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sandbox_requests (
    id SERIAL PRIMARY KEY,
    sandbox_id INTEGER REFERENCES sandbox_environments(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sandbox_environments_user ON sandbox_environments(user_id);
CREATE INDEX idx_sandbox_environments_key ON sandbox_environments(api_key);
CREATE INDEX idx_sandbox_requests_sandbox ON sandbox_requests(sandbox_id, created_at DESC);

-- ========================================
-- Sample Data
-- ========================================

-- Sample rate limit rules
INSERT INTO rate_limit_rules (name, endpoint_pattern, requests_per_minute, requests_per_hour, requests_per_day) VALUES
('Standard API', '.*', 60, 1000, 10000),
('Bulk Operations', '/api/bulk/.*', 10, 100, 500),
('Export API', '/api/export/.*', 5, 50, 200),
('GraphQL API', '/api/graphql', 100, 2000, 20000)
ON CONFLICT DO NOTHING;

-- Sample webhooks events
-- Note: Actual webhooks will be created by users via API

COMMENT ON TABLE webhooks IS 'Stores user-configured webhooks for event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Tracks webhook delivery attempts and responses';
COMMENT ON TABLE rate_limit_rules IS 'Defines rate limiting rules for different API endpoints';
COMMENT ON TABLE rate_limit_usage IS 'Tracks API usage for rate limiting enforcement';
COMMENT ON TABLE api_versions IS 'Manages different API versions and their lifecycle';
COMMENT ON TABLE bulk_operations IS 'Tracks bulk operation jobs for batch processing';
COMMENT ON TABLE search_filters IS 'Stores reusable search filters and criteria';
COMMENT ON TABLE export_jobs IS 'Manages data export jobs in various formats';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail of all system actions';
COMMENT ON TABLE api_metrics IS 'Real-time API performance metrics and monitoring';
COMMENT ON TABLE api_analytics_summary IS 'Daily aggregated API analytics for reporting';
COMMENT ON TABLE sandbox_environments IS 'Developer sandbox environments for testing';
