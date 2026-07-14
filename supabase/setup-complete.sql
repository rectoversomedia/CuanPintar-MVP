-- =====================================================
-- CuanPintar MVP - Complete Database Schema
-- CONSOLIDATED MIGRATION FILE
-- Run this in Supabase SQL Editor for complete setup
-- https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/sql
-- =====================================================
-- Version: 1.0.0
-- Last Updated: 2026-07-14
-- Tables: 33
-- =====================================================

BEGIN;

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('advertiser', 'partner', 'admin')),
    phone VARCHAR(50),
    avatar_url TEXT,
    company_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    password_reset_attempts INTEGER DEFAULT 0,
    password_changed_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage users" ON users FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 2. ADVERTISERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website TEXT,
    logo_url TEXT,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    pic_name VARCHAR(255),
    pic_phone VARCHAR(50),
    pic_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    notes TEXT,
    total_spend DECIMAL(15,2) DEFAULT 0,
    active_programs INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_company ON advertisers(company_name);

ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own profile" ON advertisers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Advertisers can update own profile" ON advertisers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage advertisers" ON advertisers FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 3. PARTNERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency')),
    niche VARCHAR(255),
    location VARCHAR(255),
    audience_size INTEGER DEFAULT 0,
    audience_age_group VARCHAR(50),
    audience_gender VARCHAR(20),
    audience_location VARCHAR(255),
    audience_description TEXT,
    social_links JSONB DEFAULT '{}',
    quality_score INTEGER DEFAULT 50 CHECK (quality_score >= 0 AND quality_score <= 100),
    fraud_risk VARCHAR(20) DEFAULT 'low' CHECK (fraud_risk IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_payout DECIMAL(15,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    fraud_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_payout_per_conversion DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_fraud_risk ON partners(fraud_risk);
CREATE INDEX IF NOT EXISTS idx_partners_quality ON partners(quality_score);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at DESC);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own profile" ON partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Partners can update own profile" ON partners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage partners" ON partners FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 4. PROGRAMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    industry VARCHAR(100),
    description TEXT,
    objectives JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    budget DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    payout_model VARCHAR(20) NOT NULL CHECK (payout_model IN ('CPL', 'CPA', 'CPI', 'CPS', 'hybrid')),
    payout_amount DECIMAL(15,2) NOT NULL,
    hybrid_config JSONB,
    target_volume INTEGER,
    achieved_volume INTEGER DEFAULT 0,
    advertiser_price DECIMAL(15,2) NOT NULL,
    partner_payout DECIMAL(15,2) NOT NULL,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    total_advertiser_cost DECIMAL(15,2) DEFAULT 0,
    total_partner_payout DECIMAL(15,2) DEFAULT 0,
    total_platform_profit DECIMAL(15,2) DEFAULT 0,
    channels JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected')),
    start_date DATE,
    end_date DATE,
    tracking_pixel TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_advertiser_id ON programs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_payout_model ON programs(payout_model);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_programs_start_date ON programs(start_date);
CREATE INDEX IF NOT EXISTS idx_programs_end_date ON programs(end_date);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own programs" ON programs FOR SELECT
    USING (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Advertisers can create own programs" ON programs FOR INSERT
    WITH CHECK (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()));
CREATE POLICY "Advertisers can update own programs" ON programs FOR UPDATE
    USING (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Advertisers can delete own programs" ON programs FOR DELETE
    USING (advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 5. PROGRAM_CHANNELS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS program_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency')),
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

CREATE INDEX IF NOT EXISTS idx_program_channels_program ON program_channels(program_id);
CREATE INDEX IF NOT EXISTS idx_program_channels_channel ON program_channels(channel_type);

ALTER TABLE program_channels ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. PAYMENT_METHODS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_payment_methods_partner ON payment_methods(partner_id);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage own payment methods" ON payment_methods FOR ALL
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));

-- =============================================================================
-- 7. MEDIA_PARTNERS TABLE
-- =============================================================================

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

CREATE INDEX IF NOT EXISTS idx_media_partners_partner ON media_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_media_partners_category ON media_partners(category);
CREATE INDEX IF NOT EXISTS idx_media_partners_region ON media_partners(region);

ALTER TABLE media_partners ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 8. TRACKING_LINKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tracking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    channel_type VARCHAR(50),
    unique_code VARCHAR(20) UNIQUE NOT NULL,
    tracking_url TEXT NOT NULL,
    short_url TEXT,
    title VARCHAR(255),
    description TEXT,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    total_payout DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_links_partner ON tracking_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_program ON tracking_links(program_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_unique_code ON tracking_links(unique_code);
CREATE INDEX IF NOT EXISTS idx_tracking_links_active ON tracking_links(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tracking_links_created_at ON tracking_links(created_at DESC);

ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage own links" ON tracking_links FOR ALL
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 9. CLICKS TABLE (Click tracking for attribution)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id VARCHAR(100) UNIQUE NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    link_id UUID REFERENCES tracking_links(id) ON DELETE SET NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    country VARCHAR(10),
    city VARCHAR(100),
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    channel_type VARCHAR(50),
    source_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    utms JSONB DEFAULT '{}',
    isp VARCHAR(255),
    connection_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks(click_id);
CREATE INDEX IF NOT EXISTS idx_clicks_partner_id ON clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_program_id ON clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fingerprint ON clicks(fingerprint);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_address ON clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at DESC);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can insert clicks" ON clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Partners can view own clicks" ON clicks FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 10. CONVERSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    channel_type VARCHAR(50),
    conversion_type VARCHAR(50),
    user_identifier TEXT,
    user_data JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    ip_country VARCHAR(10),
    ip_city VARCHAR(100),
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    fingerprint VARCHAR(255),
    utms JSONB DEFAULT '{}',
    source_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'rejected', 'fraud')),
    payout_amount DECIMAL(15,2),
    quality_score INTEGER DEFAULT 100,
    fraud_signals JSONB DEFAULT '[]',
    fraud_score INTEGER DEFAULT 0,
    attributed_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    attribution_model VARCHAR(50),
    attributed_at TIMESTAMPTZ,
    view_through BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint ON conversions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_conversions_ip_address ON conversions(ip_address);
CREATE INDEX IF NOT EXISTS idx_conversions_device_id ON conversions(device_id);
CREATE INDEX IF NOT EXISTS idx_conversions_conversion_type ON conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversions_channel_type ON conversions(channel_type);
CREATE INDEX IF NOT EXISTS idx_conversions_fraud_score ON conversions(fraud_score);
CREATE INDEX IF NOT EXISTS idx_conversions_program_status ON conversions(program_id, status);
CREATE INDEX IF NOT EXISTS idx_conversions_partner_status ON conversions(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint_created ON conversions(fingerprint, created_at DESC);

ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own conversions" ON conversions FOR SELECT
    USING (program_id IN (SELECT id FROM programs WHERE advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Partners can view own conversions" ON conversions FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Service can insert conversions" ON conversions FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 11. ATTRIBUTION_TOUCHPOINTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL,
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    touchpoint_type VARCHAR(20) NOT NULL DEFAULT 'click' CHECK (touchpoint_type IN ('click', 'view', 'interaction')),
    attribution_window_days INTEGER DEFAULT 7,
    utms JSONB DEFAULT '{}',
    referrer TEXT,
    device_type VARCHAR(50),
    country VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_visitor_id ON attribution_touchpoints(visitor_id);
CREATE INDEX IF NOT EXISTS idx_attribution_click_id ON attribution_touchpoints(click_id);
CREATE INDEX IF NOT EXISTS idx_attribution_partner_id ON attribution_touchpoints(partner_id);
CREATE INDEX IF NOT EXISTS idx_attribution_program_id ON attribution_touchpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_attribution_created_at ON attribution_touchpoints(created_at DESC);

ALTER TABLE attribution_touchpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own touchpoints" ON attribution_touchpoints FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 12. ATTRIBUTION_MODELS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven')),
    parameters JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attribution_models_name ON attribution_models(name);
CREATE INDEX IF NOT EXISTS idx_attribution_models_type ON attribution_models(model_type);
CREATE INDEX IF NOT EXISTS idx_attribution_models_active ON attribution_models(is_active) WHERE is_active = true;

ALTER TABLE attribution_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view attribution_models" ON attribution_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage attribution_models" ON attribution_models FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default attribution models
INSERT INTO attribution_models (name, display_name, description, model_type, is_default) VALUES
('first_touch', 'First Touch', 'Credit goes to the first touchpoint', 'first_touch', false),
('last_touch', 'Last Touch', 'Credit goes to the last touchpoint', 'last_touch', true),
('linear', 'Linear', 'Equal credit to all touchpoints', 'linear', false),
('time_decay', 'Time Decay', 'More credit to recent touchpoints', 'time_decay', false)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 13. DEVICE_GRAPH TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS device_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    linked_device_id VARCHAR(255),
    linked_visitor_id VARCHAR(100),
    confidence_score DECIMAL(5,2) DEFAULT 0,
    link_method VARCHAR(30) DEFAULT 'fingerprint' CHECK (link_method IN ('fingerprint', 'login', 'email_hash', 'probabilistic', 'ip')),
    match_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_device_visitor UNIQUE (device_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_device_graph_device_id ON device_graph(device_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_visitor_id ON device_graph(visitor_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_confidence ON device_graph(confidence_score DESC);

ALTER TABLE device_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own device_graph" ON device_graph FOR SELECT USING (true);

-- =============================================================================
-- 14. PAYOUTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'failed', 'rejected')),
    payment_method VARCHAR(50),
    ewallet_type VARCHAR(50),
    ewallet_number VARCHAR(50),
    bank_name VARCHAR(100),
    account_number VARCHAR(100),
    account_holder VARCHAR(255),
    approved_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    transaction_id VARCHAR(255),
    payment_reference VARCHAR(255),
    admin_notes TEXT,
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own payouts" ON payouts FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Admins can manage payouts" ON payouts FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 15. FRAUD_BLOCKLIST TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ip', 'email', 'email_domain', 'device_id', 'fingerprint')),
    value VARCHAR(255) NOT NULL,
    reason TEXT,
    added_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_blocklist_type_value UNIQUE(type, value)
);

CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_type ON fraud_blocklist(type);
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_value ON fraud_blocklist(value);
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_active ON fraud_blocklist(is_active) WHERE is_active = true;

ALTER TABLE fraud_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active blocklist" ON fraud_blocklist FOR SELECT
    USING (is_active = true);
CREATE POLICY "Admins can manage blocklist" ON fraud_blocklist FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 16. FRAUD_RULES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('velocity', 'blocklist', 'pattern', 'behavior', 'threshold')),
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    conditions JSONB NOT NULL DEFAULT '{}',
    action VARCHAR(50) DEFAULT 'flag' CHECK (action IN ('block', 'flag', 'score', 'log')),
    score_contribution INTEGER DEFAULT 0,
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_rules_name ON fraud_rules(name);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_type ON fraud_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_enabled ON fraud_rules(enabled) WHERE enabled = true;

ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage fraud_rules" ON fraud_rules FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default fraud rules
INSERT INTO fraud_rules (name, description, rule_type, action, score_contribution) VALUES
('duplicate_ip', 'Flag conversions from same IP', 'velocity', 'flag', 20),
('duplicate_device', 'Flag conversions from same device', 'velocity', 'flag', 30),
('disposable_email', 'Block disposable email domains', 'blocklist', 'block', 80),
('headless_browser', 'Block headless browser detection', 'pattern', 'block', 100)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 17. FRAUD_SCORES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
    rule_id VARCHAR(100),
    rule_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    action_taken VARCHAR(50) DEFAULT 'flag' CHECK (action_taken IN ('block', 'flag', 'score')),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_scores_conversion_id ON fraud_scores(conversion_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_rule_name ON fraud_scores(rule_name);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_score ON fraud_scores(score);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_created_at ON fraud_scores(created_at DESC);

ALTER TABLE fraud_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view fraud_scores" ON fraud_scores FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service can insert fraud_scores" ON fraud_scores FOR INSERT WITH CHECK (true);

-- =============================================================================
-- 18. WEBHOOKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events JSONB DEFAULT '[]',
    headers JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    total_deliveries INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 100,
    failed_deliveries INTEGER DEFAULT 0,
    last_triggered TIMESTAMPTZ,
    last_success TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active) WHERE active = true;

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks" ON webhooks FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 19. WEBHOOK_DELIVERIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    response_time INTEGER,
    success BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success) WHERE success = false;

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 20. NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL
    USING (user_id = auth.uid());

-- =============================================================================
-- 21. USER_SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL
    USING (user_id = auth.uid());

-- =============================================================================
-- 22. USER_2FA_METHODS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('totp', 'sms', 'email')),
    identifier VARCHAR(255),
    secret_encrypted VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_type ON user_2fa_methods(type);

ALTER TABLE user_2fa_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own 2fa" ON user_2fa_methods FOR ALL
    USING (user_id = auth.uid());

-- =============================================================================
-- 23. USER_2FA_RECOVERY_CODES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_index INTEGER NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_user ON user_2fa_recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_unused ON user_2fa_recovery_codes(is_used) WHERE is_used = false;

ALTER TABLE user_2fa_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recovery codes" ON user_2fa_recovery_codes FOR ALL
    USING (user_id = auth.uid());

-- =============================================================================
-- 24. USER_PREFERENCES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL
    USING (user_id = auth.uid());

-- =============================================================================
-- 25. API_KEYS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions JSONB DEFAULT '["track:write"]',
    rate_limit INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api_keys" ON api_keys FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 26. API_SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_sessions_user_id ON api_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_api_key ON api_sessions(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_expires ON api_sessions(expires_at);

ALTER TABLE api_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api_sessions" ON api_sessions FOR SELECT
    USING (user_id = auth.uid());

-- =============================================================================
-- 27. SUPPORT_TICKETS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'pending', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 28. SUPPORT_MESSAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ticket messages" ON support_messages FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 29. KYC_DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('ktp', 'passport', 'sim', 'npwp', 'business_license')),
    document_number VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON kyc_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_created ON kyc_documents(created_at);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own kyc" ON kyc_documents FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- =============================================================================
-- 30. AUDIT_LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit_logs" ON audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 31. AUTH_AUDIT_LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_logs(created_at DESC);

ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view auth_audit_logs" ON auth_audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 32. PLATFORM_SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON platform_settings(is_public) WHERE is_public = true;

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public settings" ON platform_settings FOR SELECT
    USING (is_public = true)
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Admins can manage settings" ON platform_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description, is_public) VALUES
('platform_name', '"CuanPintar"', 'Platform display name', true),
('support_email', '"support@cuanpintar.com"', 'Support email address', true),
('max_upload_size_mb', '10', 'Maximum file upload size in MB', true),
('session_timeout_hours', '24', 'Session timeout in hours', false),
('rate_limit_default', '1000', 'Default API rate limit per minute', false),
('fraud_block_threshold', '80', 'Fraud score threshold for auto-block', false),
('fraud_flag_threshold', '30', 'Fraud score threshold for flagging', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 33. ANNOUNCEMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'maintenance')),
    priority INTEGER DEFAULT 0,
    target_roles JSONB DEFAULT '["all"]',
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcements_starts ON announcements(starts_at);
CREATE INDEX IF NOT EXISTS idx_announcements_ends ON announcements(ends_at);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active announcements" ON announcements FOR SELECT
    USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at > NOW()));
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_channels_updated_at BEFORE UPDATE ON program_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_partners_updated_at BEFORE UPDATE ON media_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracking_links_updated_at BEFORE UPDATE ON tracking_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_methods_updated_at BEFORE UPDATE ON user_2fa_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_graph_updated_at BEFORE UPDATE ON device_graph
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attribution_models_updated_at BEFORE UPDATE ON attribution_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Demo Admin User
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cuanpintar.com', '$2a$10$dummy', 'admin', true, true)
ON CONFLICT (id) DO NOTHING;

-- Demo Advertiser User & Profile
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000002', 'Sarah Wijaya', 'sarah@tunaiku.com', '$2a$10$dummy', 'advertiser', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO advertisers (id, user_id, company_name, industry, website, status) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 'Tunaiku', 'Financial Services', 'https://tunaiku.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Demo Partner User & Profile
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000003', 'Budi Santoso', 'budi@jakselnews.com', '$2a$10$dummy', 'partner', true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO partners (id, user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_paid, pending_payout, total_conversions, valid_conversions) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000003', 'JakselNews Media Network', 'media', 'Lifestyle & Urban', 'Jakarta Selatan', 2500000, 92, 'low', 'active', 18500000, 14800000, 3700000, 370, 333)
ON CONFLICT (id) DO NOTHING;

-- Demo Program
INSERT INTO programs (id, advertiser_id, name, brand_name, industry, description, objectives, target_audience, budget, target_volume, payout_model, advertiser_price, partner_payout, status, channels) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'Tunaiku Download + Registration', 'Tunaiku', 'Financial Services', 'Acquire new Tunaiku app users through registration program targeting young professionals in Jakarta and Surabaya.', '["app_install", "registration"]', '{"age": "21-35", "gender": "all", "location": "Jakarta, Surabaya, Bandung"}', 50000000, 2000, 'CPA', 30000, 25000, 'active', '[{"channel_type": "media", "allocated_budget": 20000000, "estimated_volume": 800, "quality_score": 88}]')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

SELECT '========================================' as separator;
SELECT 'CuanPintar Database Setup Complete!' as status;
SELECT 'Tables Created: 33' as tables;
SELECT 'Version: 1.0.0' as version;
SELECT 'Last Updated: 2026-07-14' as updated;
SELECT '========================================' as separator;
