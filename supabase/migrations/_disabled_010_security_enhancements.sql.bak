-- Migration: 010_security_enhancements.sql
-- Description: Adds security, fraud, analytics and behavioral tracking tables
-- Created: 2024-01-13

-- ============================================
-- USER BEHAVIOR PROFILES
-- ============================================
-- Stores behavioral patterns for each user for anomaly detection

CREATE TABLE IF NOT EXISTS user_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Session metrics (exponential moving averages)
    avg_session_duration_ms INTEGER DEFAULT 300000, -- 5 minutes
    avg_clicks_per_session DECIMAL(5,2) DEFAULT 5.0,
    avg_conversions_per_day DECIMAL(5,2) DEFAULT 1.0,

    -- Velocity metrics (events per minute)
    click_velocity DECIMAL(6,4) DEFAULT 0.5,
    conversion_velocity DECIMAL(6,4) DEFAULT 0.01,

    -- Time patterns
    active_hours INTEGER[] DEFAULT ARRAY[
        0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
    ], -- 0-23 hours
    common_timezones TEXT[] DEFAULT ARRAY['Asia/Jakarta'],
    common_countries TEXT[] DEFAULT ARRAY['ID'],

    -- Device patterns
    device_types JSONB DEFAULT '{"mobile": 0.7, "desktop": 0.3}'::jsonb,
    common_user_agents TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Risk scoring
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    last_risk_update TIMESTAMPTZ,

    -- Metadata
    data_points_count INTEGER DEFAULT 0,
    profile_version INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_behavior_user_id ON user_behavior_profiles(user_id);
CREATE INDEX idx_user_behavior_risk_score ON user_behavior_profiles(risk_score);
CREATE INDEX idx_user_behavior_updated ON user_behavior_profiles(updated_at);

-- RLS
ALTER TABLE user_behavior_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own behavior profile"
    ON user_behavior_profiles FOR SELECT
    USING (user_id = auth.uid());

-- Only service role can update profiles (managed by application)
CREATE POLICY "Service role can manage behavior profiles"
    ON user_behavior_profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ANOMALY LOGS
-- ============================================
-- Records detected anomalies for audit and ML training

CREATE TABLE IF NOT EXISTS anomaly_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,

    -- Event info
    event_type TEXT NOT NULL, -- 'click', 'conversion', 'session', 'login'
    entity_type TEXT, -- 'conversion', 'click', 'session', etc.
    entity_id UUID,

    -- Anomaly details
    anomaly_type TEXT NOT NULL CHECK (
        anomaly_type IN (
            'velocity', 'pattern', 'geolocation', 'timing',
            'device', 'browser', 'network', 'behavioral'
        )
    ),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),

    -- Factors that contributed to the score
    factors JSONB DEFAULT '[]'::jsonb, -- Array of {type, weight, value, threshold, description}

    -- Decision
    action_taken TEXT NOT NULL CHECK (
        action_taken IN ('allow', 'review', 'block', 'flagged', 'ignored')
    ),
    action_reason TEXT,

    -- Additional context
    ip_address INET,
    user_agent TEXT,
    fingerprint TEXT,
    country_code TEXT,
    timezone TEXT,
    device_type TEXT,

    -- Request context
    request_data JSONB, -- Original request payload
    response_data JSONB, -- What was returned

    -- Resolution (for review items)
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    review_decision TEXT CHECK (
        review_decision IN ('confirmed', 'false_positive', 'escalated')
    ),

    -- ML Training
    ml_model_version TEXT,
    ml_confidence_override BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Retention
    expires_at TIMESTAMPTZ -- For data retention policies
);

-- Indexes for common queries
CREATE INDEX idx_anomaly_user_id ON anomaly_logs(user_id);
CREATE INDEX idx_anomaly_partner_id ON anomaly_logs(partner_id);
CREATE INDEX idx_anomaly_type ON anomaly_logs(anomaly_type);
CREATE INDEX idx_anomaly_action ON anomaly_logs(action_taken);
CREATE INDEX idx_anomaly_created ON anomaly_logs(created_at DESC);
CREATE INDEX idx_anomaly_event_time ON anomaly_logs(event_timestamp DESC);
CREATE INDEX idx_anomaly_score ON anomaly_logs(score DESC) WHERE score >= 70;
CREATE INDEX idx_anomaly_unreviewed ON anomaly_logs(created_at DESC)
    WHERE action_taken = 'review' AND reviewed_at IS NULL;

-- RLS
ALTER TABLE anomaly_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view their own anomalies
CREATE POLICY "Users can view own anomaly logs"
    ON anomaly_logs FOR SELECT
    USING (
        user_id = auth.uid() OR
        partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()) OR
        advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
    );

-- Admins can view all
CREATE POLICY "Admins can view all anomaly logs"
    ON anomaly_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only service role can insert/update (managed by application)
CREATE POLICY "Service role can manage anomaly logs"
    ON anomaly_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- FRAUD BLOCKLIST ENHANCEMENTS
-- ============================================

ALTER TABLE fraud_blocklist
ADD COLUMN IF NOT EXISTS geo_data JSONB,
ADD COLUMN IF NOT EXISTS threat_intel_source TEXT,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS hit_count INTEGER DEFAULT 0;

-- Index for faster blocklist checks
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_active ON fraud_blocklist(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_expires ON fraud_blocklist(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- GEO-LOCATION CACHE
-- ============================================
-- Cache for IP geolocation data to reduce API calls

CREATE TABLE IF NOT EXISTS geo_cache (
    ip_address INET PRIMARY KEY,
    country_code TEXT NOT NULL,
    country_name TEXT,
    region TEXT,
    city TEXT,
    isp TEXT,
    org TEXT,
    asn TEXT,
    timezone TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    accuracy INTEGER,

    -- Threat intelligence
    is_proxy BOOLEAN DEFAULT FALSE,
    is_vpn BOOLEAN DEFAULT FALSE,
    is_tor BOOLEAN DEFAULT FALSE,
    is_datacenter BOOLEAN DEFAULT FALSE,
    is_mobile BOOLEAN DEFAULT FALSE,

    -- Cache management
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    hit_count INTEGER DEFAULT 0,

    -- Source
    source TEXT DEFAULT 'ip-api.com'
);

-- Indexes
CREATE INDEX idx_geo_cache_expires ON geo_cache(expires_at);
CREATE INDEX idx_geo_cache_country ON geo_cache(country_code);
CREATE INDEX idx_geo_cache_threat ON geo_cache(is_proxy, is_vpn, is_tor)
    WHERE is_proxy OR is_vpn OR is_tor;

-- RLS - allow service role only
ALTER TABLE geo_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage geo cache"
    ON geo_cache FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- WEBHOOK LOGS
-- ============================================
-- Detailed logs for incoming webhooks

CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Direction
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),

    -- Provider/Endpoint info
    provider TEXT, -- 'midtrans', 'xendit', 'custom', etc.
    endpoint_url TEXT,
    webhook_id UUID, -- Reference to webhooks table for outgoing

    -- Event info
    event_type TEXT NOT NULL,
    event_id TEXT, -- External event ID from provider

    -- Payload
    payload JSONB NOT NULL,
    headers JSONB,

    -- Verification
    signature_verified BOOLEAN DEFAULT FALSE,
    verification_error TEXT,

    -- Processing
    is_valid BOOLEAN DEFAULT TRUE,
    processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,
    error TEXT,
    error_code TEXT,

    -- Response (for outgoing)
    response_status INTEGER,
    response_body TEXT,
    response_time_ms INTEGER,

    -- Retry tracking
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    last_retry_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Cleanup
    expires_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_webhook_logs_direction ON webhook_logs(direction);
CREATE INDEX idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_unprocessed ON webhook_logs(created_at DESC)
    WHERE processed = FALSE AND retry_count < max_retries;
CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);

-- RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own webhook logs
CREATE POLICY "Users can view own webhook logs"
    ON webhook_logs FOR SELECT
    USING (
        webhook_id IN (
            SELECT id FROM webhooks WHERE user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only service role can manage
CREATE POLICY "Service role can manage webhook logs"
    ON webhook_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- CONVERSION ANALYTICS ENHANCEMENTS
-- ============================================

ALTER TABLE conversions
ADD COLUMN IF NOT EXISTS geo_data JSONB,
ADD COLUMN IF NOT EXISTS anomaly_score INTEGER,
ADD COLUMN IF NOT EXISTS anomaly_log_id UUID REFERENCES anomaly_logs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS behavioral_flags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS client_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deduplication_hash TEXT,
ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES conversions(id) ON DELETE SET NULL;

-- Index for deduplication
CREATE INDEX IF NOT EXISTS idx_conversions_dedup_hash ON conversions(deduplication_hash)
    WHERE deduplication_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversions_anomaly ON conversions(anomaly_score DESC)
    WHERE anomaly_score IS NOT NULL AND anomaly_score >= 70;
CREATE INDEX IF NOT EXISTS idx_conversions_geo ON conversions(geo_data)
    USING GIN (geo_data);

-- ============================================
-- TRACKING CLICKS ENHANCEMENTS
-- ============================================

ALTER TABLE tracking_clicks
ADD COLUMN IF NOT EXISTS geo_data JSONB,
ADD COLUMN IF NOT EXISTS device_info JSONB,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS visitor_id UUID,
ADD COLUMN IF NOT EXISTS fingerprint_score INTEGER,
ADD COLUMN IF NOT EXISTS bot_probability DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clicks_visitor ON tracking_clicks(visitor_id);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON tracking_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_bot_prob ON tracking_clicks(bot_probability DESC)
    WHERE bot_probability > 0.5;

-- ============================================
-- FUNCTION: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
CREATE TRIGGER update_user_behavior_profiles_updated
    BEFORE UPDATE ON user_behavior_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Increment hit count on blocklist
-- ============================================

CREATE OR REPLACE FUNCTION increment_blocklist_hit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fraud_blocklist
    SET hit_count = hit_count + 1,
        last_seen = NOW()
    WHERE value = NEW.ip_address AND type = 'ip';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_blocklist_hit
    AFTER INSERT ON conversions
    FOR EACH ROW
    WHEN (NEW.ip_address IS NOT NULL)
    EXECUTE FUNCTION increment_blocklist_hit();

-- ============================================
-- FUNCTION: Update behavior profile on conversion
-- ============================================

CREATE OR REPLACE FUNCTION update_behavior_on_conversion()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_partner_id UUID;
BEGIN
    -- Get user_id from partner_id or advertiser_id
    IF NEW.partner_id IS NOT NULL THEN
        SELECT user_id INTO v_user_id FROM partners WHERE id = NEW.partner_id;
    ELSIF NEW.advertiser_id IS NOT NULL THEN
        SELECT user_id INTO v_user_id FROM advertisers WHERE id = NEW.advertiser_id;
    END IF;

    IF v_user_id IS NOT NULL THEN
        -- Update data points count
        UPDATE user_behavior_profiles
        SET data_points_count = data_points_count + 1,
            updated_at = NOW()
        WHERE user_id = v_user_id;

        -- If no profile exists, create one
        IF NOT FOUND THEN
            INSERT INTO user_behavior_profiles (user_id, data_points_count)
            VALUES (v_user_id, 1);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_behavior_on_conversion
    AFTER INSERT ON conversions
    FOR EACH ROW
    EXECUTE FUNCTION update_behavior_on_conversion();

-- ============================================
-- SEED DATA: Initial behavior thresholds
-- ============================================

INSERT INTO platform_settings (key, value, description, is_public) VALUES
    ('anomaly_velocity_threshold', 5, 'Multiplier for velocity anomaly detection', FALSE),
    ('anomaly_confidence_threshold', 0.7, 'Minimum confidence for automated actions', FALSE),
    ('anomaly_auto_block_threshold', 80, 'Score threshold for automatic blocking', FALSE),
    ('anomaly_auto_review_threshold', 40, 'Score threshold for manual review', FALSE),
    ('geo_cache_ttl_hours', 24, 'Hours to cache geo-location data', FALSE),
    ('geo_max_age_days', 90, 'Days to retain geo analytics data', FALSE)
ON CONFLICT (key) DO NOTHING;
