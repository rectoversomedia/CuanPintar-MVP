-- =====================================================
-- CuanPintar MVP - Complete Database Schema
-- Consolidated Migration - Applied via SQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('advertiser', 'partner', 'admin')),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    password_reset_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- 2. ADVERTISERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(500),
    logo_url TEXT,
    address TEXT,
    pic_name VARCHAR(255),
    pic_phone VARCHAR(50),
    pic_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_company ON advertisers(company_name);

-- =====================================================
-- 3. PARTNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency')),
    niche VARCHAR(100),
    location VARCHAR(255),
    audience_size INTEGER DEFAULT 0,
    audience_description TEXT,
    social_links JSONB DEFAULT '{}',
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    fraud_risk VARCHAR(50) DEFAULT 'low' CHECK (fraud_risk IN ('low', 'medium', 'high')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_payout DECIMAL(15,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    fraud_rate DECIMAL(5,2) DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    avg_payout_per_conversion DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_fraud_risk ON partners(fraud_risk);
CREATE INDEX IF NOT EXISTS idx_partners_quality ON partners(quality_score);

-- =====================================================
-- 4. PROGRAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    industry VARCHAR(100),
    description TEXT,
    objectives JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    budget DECIMAL(15,2) NOT NULL,
    target_volume INTEGER NOT NULL,
    payout_model VARCHAR(50) NOT NULL CHECK (payout_model IN ('CPL', 'CPA', 'CPI', 'CPS', 'hybrid')),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_programs_advertiser ON programs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_created ON programs(created_at);

-- =====================================================
-- 5. CONVERSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    channel_type VARCHAR(50),
    conversion_type VARCHAR(100),
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
    quality_score INTEGER DEFAULT 0,
    fraud_signals JSONB DEFAULT '[]',
    fraud_score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP,
    validation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created ON conversions(created_at);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint ON conversions(fingerprint);

-- =====================================================
-- 6. PAYOUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'failed', 'rejected')),
    payment_method VARCHAR(50),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),
    approved_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    transaction_id VARCHAR(255),
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    processed_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at);

-- =====================================================
-- 7. MEDIA PARTNERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS media_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    media_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    region VARCHAR(100),
    monthly_reach INTEGER DEFAULT 0,
    available_slots INTEGER DEFAULT 0,
    avg_conversion_rate DECIMAL(5,2) DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_category ON media_partners(category);
CREATE INDEX IF NOT EXISTS idx_media_region ON media_partners(region);
CREATE INDEX IF NOT EXISTS idx_media_status ON media_partners(status);

-- =====================================================
-- 8. TRACKING LINKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_partner ON tracking_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_links_program ON tracking_links(program_id);
CREATE INDEX IF NOT EXISTS idx_links_unique_code ON tracking_links(unique_code);
CREATE INDEX IF NOT EXISTS idx_links_active ON tracking_links(is_active) WHERE is_active = true;

-- =====================================================
-- 9. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    icon VARCHAR(50),
    link TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- =====================================================
-- 10. WEBHOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events JSONB DEFAULT '[]',
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);

-- =====================================================
-- 11. FRAUD BLOCKLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fraud_blocklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ip', 'email', 'email_domain', 'device_id', 'fingerprint')),
    value VARCHAR(255) NOT NULL,
    reason TEXT,
    added_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_blocklist_type_value UNIQUE(type, value)
);

CREATE INDEX IF NOT EXISTS idx_blocklist_type ON fraud_blocklist(type);
CREATE INDEX IF NOT EXISTS idx_blocklist_value ON fraud_blocklist(value);
CREATE INDEX IF NOT EXISTS idx_blocklist_active ON fraud_blocklist(is_active) WHERE is_active = true;

-- =====================================================
-- 12. TRACKING CLICKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    link_id UUID REFERENCES tracking_links(id) ON DELETE SET NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    country VARCHAR(10),
    city VARCHAR(100),
    device_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clicks_partner ON tracking_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_program ON tracking_clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fingerprint ON tracking_clicks(fingerprint);
CREATE INDEX IF NOT EXISTS idx_clicks_created ON tracking_clicks(created_at);

-- =====================================================
-- INSERT DEMO DATA
-- =====================================================

-- Demo Admin User
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cuanpintar.com', '$2a$10$dummy', 'admin', true, true);

-- Demo Advertiser User & Profile
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000002', 'Sarah Wijaya', 'sarah@tunaiku.com', '$2a$10$dummy', 'advertiser', true, true);

INSERT INTO advertisers (id, user_id, company_name, industry, website, status) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 'Tunaiku', 'Financial Services', 'https://tunaiku.com', 'active');

-- Demo Partner User & Profile
INSERT INTO users (id, name, email, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000003', 'Budi Santoso', 'budi@jakselnews.com', '$2a$10$dummy', 'partner', true, true);

INSERT INTO partners (id, user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_paid, pending_payout, total_conversions, valid_conversions) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000003', 'JakselNews Media Network', 'media', 'Lifestyle & Urban', 'Jakarta Selatan', 2500000, 92, 'low', 'active', 18500000, 14800000, 3700000, 370, 333);

-- Demo Program
INSERT INTO programs (id, advertiser_id, name, brand_name, industry, description, objectives, target_audience, budget, target_volume, payout_model, advertiser_price, partner_payout, status, channels) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'Tunaiku Download + Registration', 'Tunaiku', 'Financial Services', 'Acquire new Tunaiku app users through registration program targeting young professionals in Jakarta and Surabaya.', '["app_install", "registration"]', '{"age": "21-35", "gender": "all", "location": "Jakarta, Surabaya, Bandung", "interest": "Personal Finance, Investment", "device": "Mobile"}', 50000000, 2000, 'CPA', 30000, 25000, 'active', '[{"channel_type": "media", "allocated_budget": 20000000, "estimated_volume": 800, "quality_score": 88, "fraud_risk": "low"}]');

PRINT 'CuanPintar database schema created successfully!';
