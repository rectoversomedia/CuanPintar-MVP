-- CuanPintar Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create all core tables for CuanPintar MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('advertiser', 'partner', 'admin')),
    company_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADVERTISERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- PROGRAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- PROGRAM CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS program_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- CONVERSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- PAYOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- MEDIA PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- WEBHOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- WEBHOOK DELIVERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- INDEXES
-- ============================================
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
CREATE INDEX IF NOT EXISTS idx_programs_created ON programs(created_at);
CREATE INDEX IF NOT EXISTS idx_program_channels_program ON program_channels(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created ON conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint ON conversions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_partner ON payment_methods(partner_id);
CREATE INDEX IF NOT EXISTS idx_media_partners_partner ON media_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_media_partners_category ON media_partners(category);
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for advertisers
DROP TRIGGER IF EXISTS update_advertisers_updated_at ON advertisers;
CREATE TRIGGER update_advertisers_updated_at
    BEFORE UPDATE ON advertisers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for partners
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for programs
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for program_channels
DROP TRIGGER IF EXISTS update_program_channels_updated_at ON program_channels;
CREATE TRIGGER update_program_channels_updated_at
    BEFORE UPDATE ON program_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate partner quality score
CREATE OR REPLACE FUNCTION calculate_partner_quality_score(p_partner_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_conversions INTEGER;
    v_valid_conversions INTEGER;
    v_avg_quality DECIMAL;
    v_recent_conversions INTEGER;
    v_score INTEGER;
BEGIN
    -- Get conversion stats for last 30 days
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'valid'),
        COALESCE(AVG(quality_score), 100),
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
    INTO v_total_conversions, v_valid_conversions, v_avg_quality, v_recent_conversions
    FROM conversions
    WHERE partner_id = p_partner_id;

    -- Calculate score based on metrics
    -- Base score from average quality
    v_score := ROUND(v_avg_quality)::INTEGER;

    -- Adjust for valid rate (max ±20 points)
    IF v_total_conversions > 0 THEN
        v_score := v_score + ROUND(((v_valid_conversions::DECIMAL / v_total_conversions) - 0.9) * 200)::INTEGER;
    END IF;

    -- Adjust for recent activity (max ±10 points)
    IF v_recent_conversions > 50 THEN
        v_score := v_score + 10;
    ELSIF v_recent_conversions < 10 THEN
        v_score := v_score - 10;
    END IF;

    -- Clamp between 0 and 100
    v_score := GREATEST(0, LEAST(100, v_score));

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: Users can see their own profile, admins can see all
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Advertisers: Users can see their own advertiser profile
CREATE POLICY "Users can view own advertiser" ON advertisers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own advertiser" ON advertisers
    FOR UPDATE USING (auth.uid() = user_id);

-- Partners: Users can see their own partner profile
CREATE POLICY "Users can view own partner" ON partners
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own partner" ON partners
    FOR UPDATE USING (auth.uid() = user_id);

-- Programs: Advertisers can manage their programs
CREATE POLICY "Advertisers can view own programs" ON programs
    FOR SELECT USING (
        advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
    );

CREATE POLICY "Advertisers can manage own programs" ON programs
    FOR ALL USING (
        advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
    );

-- Conversions: Advertisers see conversions for their programs
CREATE POLICY "Advertisers can view own conversions" ON conversions
    FOR SELECT USING (
        advertiser_id IN (SELECT id FROM advertisers WHERE user_id = auth.uid())
        OR partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
    );

-- Admin can see all
CREATE POLICY "Admins can view all conversions" ON conversions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
