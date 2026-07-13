-- ==========================================
-- CuanPintar MVP - Consolidated Schema
-- All migrations combined for easy setup
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function to generate UUID
CREATE OR REPLACE FUNCTION generate_uuid()
RETURNS UUID AS $$
BEGIN
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- CORE TABLES
-- ==========================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('advertiser', 'partner', 'admin')),
    company_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADVERTISERS TABLE
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website TEXT,
    logo_url TEXT,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
    total_spend DECIMAL(15,2) DEFAULT 0,
    active_programs INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTNERS TABLE
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency')),
    niche VARCHAR(255),
    location VARCHAR(255),
    audience_size INTEGER DEFAULT 0,
    audience_age_group VARCHAR(50),
    audience_gender VARCHAR(20),
    audience_location VARCHAR(255),
    quality_score INTEGER DEFAULT 50 CHECK (quality_score >= 0 AND quality_score <= 100),
    fraud_risk VARCHAR(20) DEFAULT 'low' CHECK (fraud_risk IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    pending_payout DECIMAL(15,2) DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    description TEXT,
    objectives JSONB NOT NULL DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    budget DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    payout_model VARCHAR(20) NOT NULL CHECK (payout_model IN ('CPL', 'CPA', 'CPI', 'CPS', 'hybrid')),
    payout_amount DECIMAL(15,2) NOT NULL,
    hybrid_config JSONB,
    target_volume INTEGER,
    achieved_volume INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected')),
    rejection_reason TEXT,
    start_date DATE,
    end_date DATE,
    tracking_pixel TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAM CHANNELS TABLE
CREATE TABLE IF NOT EXISTS program_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('media', 'creator', 'affiliate', 'sales', 'mission', 'community')),
    allocated_budget DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    estimated_volume INTEGER DEFAULT 0,
    achieved_volume INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 50,
    fraud_risk VARCHAR(20) DEFAULT 'low',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, channel_type)
);

-- CONVERSIONS TABLE
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    channel_type VARCHAR(50) NOT NULL,
    conversion_type VARCHAR(50) NOT NULL,
    user_identifier VARCHAR(255),
    user_data JSONB DEFAULT '{}',
    ip_address INET,
    ip_country VARCHAR(10),
    ip_city VARCHAR(100),
    device_type VARCHAR(20),
    device_id VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    fingerprint VARCHAR(255),
    utms JSONB DEFAULT '{}',
    source_url TEXT,
    click_id UUID,
    attribution_model VARCHAR(20) DEFAULT 'last_click',
    attributed_partner_id UUID,
    attributed_at TIMESTAMPTZ,
    view_through BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'rejected', 'fraud')),
    payout_amount DECIMAL(15,2),
    quality_score INTEGER DEFAULT 100,
    fraud_signals JSONB DEFAULT '[]',
    fraud_score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id),
    validation_notes TEXT
);

-- PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'failed', 'rejected')),
    payment_method VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    account_number VARCHAR(100),
    account_holder VARCHAR(255),
    ewallet_type VARCHAR(50),
    ewallet_number VARCHAR(50),
    approved_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bank_transfer', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay')),
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    account_number VARCHAR(100),
    account_holder VARCHAR(255),
    ewallet_number VARCHAR(50),
    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA PARTNERS TABLE
CREATE TABLE IF NOT EXISTS media_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    media_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) CHECK (category IN ('national_news', 'local_news', 'finance', 'lifestyle', 'parenting', 'automotive', 'education', 'tech', 'muslim_family', 'entertainment')),
    region VARCHAR(255),
    monthly_reach INTEGER DEFAULT 0,
    monthly_pageviews INTEGER DEFAULT 0,
    available_slots INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    avg_conversion_rate DECIMAL(5,2) DEFAULT 0,
    quality_score INTEGER DEFAULT 50,
    rate_card JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events JSONB DEFAULT '[]',
    headers JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    success_rate DECIMAL(5,2) DEFAULT 100,
    total_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_triggered TIMESTAMPTZ,
    last_success TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOK DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_time INTEGER,
    success BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    icon VARCHAR(50),
    link VARCHAR(500),
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TRACKING & ATTRIBUTION TABLES
-- ==========================================

-- CLICKS TABLE
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
    utms JSONB,
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

-- ATTRIBUTION TOUCHPOINTS TABLE
CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    touchpoint_type VARCHAR(20) NOT NULL CHECK (touchpoint_type IN ('click', 'view', 'interaction')),
    attribution_window_days INTEGER DEFAULT 7,
    utms JSONB,
    referrer TEXT,
    device_type VARCHAR(20),
    country VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEVICE GRAPH TABLE
CREATE TABLE IF NOT EXISTS device_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    linked_device_id VARCHAR(255),
    linked_visitor_id VARCHAR(100),
    confidence_score DECIMAL(5,2) DEFAULT 0,
    link_method VARCHAR(30) DEFAULT 'fingerprint',
    match_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_device_visitor UNIQUE (device_id, visitor_id)
);

-- API KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '["track:write"]',
    rate_limit INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRAUD RULES TABLE
CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    action VARCHAR(20) DEFAULT 'flag' CHECK (action IN ('block', 'flag', 'score')),
    score_penalty INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRAUD BLOCKLIST TABLE
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

-- FRAUD SCORES TABLE
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

-- ATTRIBUTION MODELS TABLE
CREATE TABLE IF NOT EXISTS attribution_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ADMIN & PLATFORM TABLES
-- ==========================================

-- SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- SUPPORT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other')),
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'api')),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance', 'urgent')),
    target_roles JSONB,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_dismissible BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_user ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_partners_user ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_programs_advertiser ON programs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_program_channels_program ON program_channels(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created ON conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint ON conversions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_partner ON payment_methods(partner_id);
CREATE INDEX IF NOT EXISTS idx_media_partners_partner ON media_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Tracking indexes
CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks(click_id);
CREATE INDEX IF NOT EXISTS idx_clicks_program ON clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fingerprint ON clicks(fingerprint);
CREATE INDEX IF NOT EXISTS idx_touchpoints_visitor ON attribution_touchpoints(visitor_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_program ON attribution_touchpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_visitor ON device_graph(visitor_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_active ON fraud_rules(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_blocklist_type ON fraud_blocklist(type);
CREATE INDEX IF NOT EXISTS idx_blocklist_value ON fraud_blocklist(value);

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_program_channels_updated_at BEFORE UPDATE ON program_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ticket number generator
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_seq INTEGER;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');

    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 10 FOR 6) AS INTEGER)), 0) + 1 INTO v_seq
    FROM support_tickets
    WHERE ticket_number LIKE 'TKT-' || v_year || v_month || '-%';

    NEW.ticket_number := 'TKT-' || v_year || v_month || '-' || LPAD(v_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_number_trigger BEFORE INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Calculate partner quality score
CREATE OR REPLACE FUNCTION calculate_partner_quality_score(p_partner_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_conversions INTEGER;
    v_valid_conversions INTEGER;
    v_avg_quality DECIMAL;
    v_recent_conversions INTEGER;
    v_score INTEGER;
BEGIN
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'valid'),
        COALESCE(AVG(quality_score), 100),
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
    INTO v_total_conversions, v_valid_conversions, v_avg_quality, v_recent_conversions
    FROM conversions
    WHERE partner_id = p_partner_id;

    v_score := ROUND(v_avg_quality)::INTEGER;

    IF v_total_conversions > 0 THEN
        v_score := v_score + ROUND(((v_valid_conversions::DECIMAL / v_total_conversions) - 0.9) * 200)::INTEGER;
    END IF;

    IF v_recent_conversions > 50 THEN
        v_score := v_score + 10;
    ELSIF v_recent_conversions < 10 THEN
        v_score := v_score - 10;
    END IF;

    v_score := GREATEST(0, LEAST(100, v_score));
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Hash fingerprint
CREATE OR REPLACE FUNCTION hash_fingerprint(p_fingerprint VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(sha256(p_fingerprint::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- DEFAULT FRAUD RULES
-- ==========================================

INSERT INTO fraud_rules (name, description, rule_type, conditions, action, score_penalty, priority) VALUES
    ('Duplicate IP (same hour)', 'Same fingerprint appearing from same IP within 1 hour', 'velocity',
     '{"field": "ip_fingerprint_hour", "operator": "gt", "value": 3}', 'flag', 20, 100),
    ('VPN/Proxy Detected', 'VPN or proxy connection detected', 'pattern',
     '{"field": "is_vpn", "operator": "eq", "value": true}', 'block', 100, 90),
    ('Headless Browser', 'Headless browser automation detected', 'pattern',
     '{"field": "is_headless", "operator": "eq", "value": true}', 'block', 100, 95),
    ('Suspicious Velocity', 'More than 10 conversions from same fingerprint in a day', 'velocity',
     '{"field": "fingerprint_daily", "operator": "gt", "value": 10}', 'flag', 30, 80);

-- ==========================================
-- DEFAULT ATTRIBUTION MODELS
-- ==========================================

INSERT INTO attribution_models (name, display_name, description) VALUES
    ('first_click', 'First Touch', '100% credit to first interaction'),
    ('last_click', 'Last Touch', '100% credit to last interaction'),
    ('linear', 'Linear', 'Equal credit across all touchpoints'),
    ('time_decay', 'Time Decay', 'More credit to recent interactions'),
    ('position_based', 'Position Based', '40% first, 20% last, 40% middle');

-- ==========================================
-- DEFAULT PLATFORM SETTINGS
-- ==========================================

INSERT INTO platform_settings (key, value, description, is_public) VALUES
    ('platform_name', '"CuanPintar"', 'Platform display name', true),
    ('support_email', '"support@cuanpintar.com"', 'Support email address', true),
    ('maintenance_mode', 'false', 'Platform maintenance mode', false),
    ('min_payout_amount', '50000', 'Minimum partner payout (IDR)', true),
    ('payout_schedule', '"weekly"', 'Payout schedule', true),
    ('default_tax_rate', '0.11', 'Default PPN rate', true);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Advertisers policies
CREATE POLICY "Users can view own advertiser" ON advertisers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own advertiser" ON advertisers FOR UPDATE USING (auth.uid() = user_id);

-- Partners policies
CREATE POLICY "Users can view own partner" ON partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own partner" ON partners FOR UPDATE USING (auth.uid() = user_id);

-- Programs policies
CREATE POLICY "Advertisers can view own programs" ON programs FOR SELECT USING (
    advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
);
CREATE POLICY "Advertisers can manage own programs" ON programs FOR ALL USING (
    advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
);

-- Conversions policies
CREATE POLICY "Users can view own conversions" ON conversions FOR SELECT USING (
    advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
    OR partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- ENABLE REALTIME
-- ==========================================

ALTER PUBLICATION supabase_realtime ADD TABLE conversions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payouts;
