/**
 * CuanPintar - Tracking & Attribution Migration
 * Phase 3: Tracking & Attribution
 *
 * This migration adds:
 * - Click tracking (persistent storage)
 * - Attribution touchpoints (multi-touch)
 * - Device graph (cross-device tracking)
 * - S2S API keys
 * - Fraud rules configuration
 * - Fraud blocklist
 */

-- =============================================================================
-- 1. CLICKS TABLE (Persistent click tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id VARCHAR(100) UNIQUE NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    channel_type VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    source_url TEXT,
    utms JSONB, -- { utm_source, utm_medium, utm_campaign, utm_term, utm_content }
    referrer TEXT,
    device_type VARCHAR(20),
    device_id VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(10),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    isp VARCHAR(255),
    connection_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. ATTRIBUTION TOUCHPOINTS (Multi-touch)
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL, -- hashed identifier
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    touchpoint_type VARCHAR(20) NOT NULL CHECK (touchpoint_type IN ('click', 'view', 'interaction')),
    attribution_window_days INTEGER DEFAULT 7, -- configurable per program
    utms JSONB,
    referrer TEXT,
    device_type VARCHAR(20),
    country VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. DEVICE GRAPH (Cross-device matching)
-- =============================================================================

CREATE TABLE IF NOT EXISTS device_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    linked_device_id VARCHAR(255),
    linked_visitor_id VARCHAR(100),
    confidence_score DECIMAL(5,2) DEFAULT 0,
    link_method VARCHAR(30) DEFAULT 'fingerprint' CHECK (link_method IN (
        'fingerprint', 'login', 'email_hash', 'probabilistic', 'ip'
    )),
    match_data JSONB, -- additional matching data used
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_device_visitor UNIQUE (device_id, visitor_id)
);

-- =============================================================================
-- 4. API KEYS (S2S tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(10) NOT NULL, -- first 8 chars for identification
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '["track:write"]',
    rate_limit INTEGER DEFAULT 10000, -- per minute
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. FRAUD RULES CONFIGURATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'velocity', 'pattern', 'blocklist', 'threshold'
    conditions JSONB NOT NULL, -- e.g., {"field": "ip_count", "operator": "gt", "value": 3}
    action VARCHAR(20) DEFAULT 'flag' CHECK (action IN ('block', 'flag', 'score')),
    score_penalty INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- higher = checked first
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fraud rules
INSERT INTO fraud_rules (name, description, rule_type, conditions, action, score_penalty, priority) VALUES
    ('Duplicate IP (same hour)', 'Same fingerprint appearing from same IP within 1 hour', 'velocity',
     '{"field": "ip_fingerprint_hour", "operator": "gt", "value": 3}', 'flag', 20, 100),
    ('VPN/Proxy Detected', 'VPN or proxy connection detected', 'pattern',
     '{"field": "is_vpn", "operator": "eq", "value": true}', 'block', 100, 90),
    ('Headless Browser', 'Headless browser automation detected', 'pattern',
     '{"field": "is_headless", "operator": "eq", "value": true}', 'block', 100, 95),
    ('Suspicious Velocity', 'More than 10 conversions from same fingerprint in a day', 'velocity',
     '{"field": "fingerprint_daily", "operator": "gt", "value": 10}', 'flag', 30, 80),
    ('Email Domain Blocklist', 'Free/disposable email domains', 'blocklist',
     '{"field": "email_domain", "operator": "in", "value": ["gmail.com", "yahoo.com"]}', 'score', 5, 50);

-- =============================================================================
-- 6. FRAUD BLOCKLIST
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL CHECK (type IN ('ip', 'email_domain', 'device_id', 'fingerprint', 'email')),
    value VARCHAR(255) NOT NULL UNIQUE,
    reason TEXT,
    added_by UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. FRAUD SCORES (Per conversion)
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id UUID REFERENCES conversions(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES fraud_rules(id) ON DELETE SET NULL,
    rule_name VARCHAR(100),
    score INTEGER NOT NULL,
    action_taken VARCHAR(20),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. ATTRIBUTION_MODELS (Configurable per program)
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default attribution models
INSERT INTO attribution_models (name, display_name, description) VALUES
    ('first_click', 'First Touch', '100% credit to first interaction'),
    ('last_click', 'Last Touch', '100% credit to last interaction'),
    ('linear', 'Linear', 'Equal credit across all touchpoints'),
    ('time_decay', 'Time Decay', 'More credit to recent interactions'),
    ('position_based', 'Position Based', '40% first, 20% last, 40% middle');

-- =============================================================================
-- 9. CONVERSION_ATTRIBUTION (Links conversions to touchpoints)
-- =============================================================================

ALTER TABLE conversions ADD COLUMN IF NOT EXISTS click_id UUID REFERENCES clicks(id) ON DELETE SET NULL;
ALTER TABLE conversions ADD COLUMN IF NOT EXISTS attribution_model VARCHAR(20) DEFAULT 'last_click';
ALTER TABLE conversions ADD COLUMN IF NOT EXISTS attributed_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;
ALTER TABLE conversions ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMPTZ;
ALTER TABLE conversions ADD COLUMN IF NOT EXISTS view_through BOOLEAN DEFAULT false;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Clicks indexes
CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks(click_id);
CREATE INDEX IF NOT EXISTS idx_clicks_program ON clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_clicks_partner ON clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fingerprint ON clicks(fingerprint);
CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_created ON clicks(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_device ON clicks(device_id);

-- Attribution touchpoints indexes
CREATE INDEX IF NOT EXISTS idx_touchpoints_visitor ON attribution_touchpoints(visitor_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_program ON attribution_touchpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_created ON attribution_touchpoints(created_at);
CREATE INDEX IF NOT EXISTS idx_touchpoints_conversion ON attribution_touchpoints(created_at DESC);

-- Device graph indexes
CREATE INDEX IF NOT EXISTS idx_device_graph_visitor ON device_graph(visitor_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_device ON device_graph(device_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_confidence ON device_graph(confidence_score);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Fraud rules indexes
CREATE INDEX IF NOT EXISTS idx_fraud_rules_active ON fraud_rules(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fraud_rules_type ON fraud_rules(rule_type);

-- Fraud blocklist indexes
CREATE INDEX IF NOT EXISTS idx_blocklist_type ON fraud_blocklist(type);
CREATE INDEX IF NOT EXISTS idx_blocklist_value ON fraud_blocklist(value);
CREATE INDEX IF NOT EXISTS idx_blocklist_active ON fraud_blocklist(is_active, expires_at) WHERE is_active = true;

-- Fraud scores indexes
CREATE INDEX IF NOT EXISTS idx_fraud_scores_conversion ON fraud_scores(conversion_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_rule ON fraud_scores(rule_id);

-- Conversion attribution indexes
CREATE INDEX IF NOT EXISTS idx_conversions_click ON conversions(click_id) WHERE click_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_attribution ON conversions(attribution_model);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate attribution using first-click model
CREATE OR REPLACE FUNCTION calculate_first_click_attribution(
    p_visitor_id VARCHAR,
    p_program_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
BEGIN
    SELECT partner_id INTO v_partner_id
    FROM attribution_touchpoints
    WHERE visitor_id = p_visitor_id
      AND program_id = p_program_id
      AND touchpoint_type = 'click'
    ORDER BY created_at ASC
    LIMIT 1;

    RETURN v_partner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate attribution using last-click model
CREATE OR REPLACE FUNCTION calculate_last_click_attribution(
    p_visitor_id VARCHAR,
    p_program_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_partner_id UUID;
BEGIN
    SELECT partner_id INTO v_partner_id
    FROM attribution_touchpoints
    WHERE visitor_id = p_visitor_id
      AND program_id = p_program_id
      AND touchpoint_type = 'click'
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN v_partner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if IP/device is blocklisted
CREATE OR REPLACE FUNCTION is_blocklisted(
    p_type VARCHAR,
    p_value VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM fraud_blocklist
    WHERE type = p_type
      AND value = p_value
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW());

    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get fingerprint hash
CREATE OR REPLACE FUNCTION hash_fingerprint(
    p_fingerprint VARCHAR
)
RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(sha256(p_fingerprint::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to update API key last used
CREATE OR REPLACE FUNCTION update_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_used_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_api_key_last_used ON api_keys;
CREATE TRIGGER update_api_key_last_used
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_api_key_usage();

-- Function to update device graph updated_at
CREATE OR REPLACE FUNCTION update_device_graph_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_device_graph_ts ON device_graph;
CREATE TRIGGER update_device_graph_ts
    BEFORE UPDATE ON device_graph
    FOR EACH ROW EXECUTE FUNCTION update_device_graph_timestamp();

-- Function to update fraud rules timestamp
CREATE OR REPLACE FUNCTION update_fraud_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fraud_rules_ts ON fraud_rules;
CREATE TRIGGER update_fraud_rules_ts
    BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_fraud_rules_timestamp();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE clicks IS 'Persistent click tracking for attribution';
COMMENT ON TABLE attribution_touchpoints IS 'Multi-touch attribution data - all interactions before conversion';
COMMENT ON TABLE device_graph IS 'Cross-device matching for user stitching';
COMMENT ON TABLE api_keys IS 'API keys for server-to-server (S2S) tracking';
COMMENT ON TABLE fraud_rules IS 'Configurable fraud detection rules';
COMMENT ON TABLE fraud_blocklist IS 'Blocklisted IPs, devices, emails';
COMMENT ON TABLE fraud_scores IS 'Per-conversion fraud rule evaluation results';
COMMENT ON TABLE attribution_models IS 'Attribution model configurations';

COMMENT ON COLUMN clicks.click_id IS 'External click identifier (passed in tracking URL)';
COMMENT ON COLUMN clicks.fingerprint IS 'Browser/device fingerprint hash';
COMMENT ON COLUMN attribution_touchpoints.visitor_id IS 'Hashed user identifier for cross-session tracking';
COMMENT ON COLUMN device_graph.confidence_score IS 'Match confidence 0-100%';
COMMENT ON COLUMN fraud_scores.score IS 'Penalty score added to fraud_score';
