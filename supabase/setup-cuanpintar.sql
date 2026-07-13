-- =====================================================
-- CuanPintar MVP - Complete Database Schema
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/sql
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

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
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    total_spend DECIMAL(15,2) DEFAULT 0,
    active_programs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_advertisers_user ON advertisers(user_id);

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
    quality_score INTEGER DEFAULT 0,
    fraud_risk VARCHAR(50) DEFAULT 'low',
    status VARCHAR(50) DEFAULT 'pending',
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_payout DECIMAL(15,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

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
    payout_model VARCHAR(50) NOT NULL,
    advertiser_price DECIMAL(15,2) NOT NULL,
    partner_payout DECIMAL(15,2) NOT NULL,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    channels JSONB DEFAULT '[]',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);

-- =====================================================
-- 5. CONVERSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    channel_type VARCHAR(50),
    conversion_type VARCHAR(100),
    user_identifier TEXT,
    ip_address VARCHAR(45),
    device_id VARCHAR(255),
    fingerprint VARCHAR(255),
    utms JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    payout_amount DECIMAL(15,2),
    quality_score INTEGER DEFAULT 0,
    fraud_signals JSONB DEFAULT '[]',
    fraud_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);

-- =====================================================
-- 6. PAYOUTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    approved_conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. TRACKING LINKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    unique_code VARCHAR(20) UNIQUE NOT NULL,
    tracking_url TEXT NOT NULL,
    short_url TEXT,
    title VARCHAR(255),
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    total_payout DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_code ON tracking_links(unique_code);

-- =====================================================
-- 9. FRAUD BLOCKLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fraud_blocklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_blocklist UNIQUE(type, value)
);

-- =====================================================
-- 10. TRACKING CLICKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tracking_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_clicks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies (permissive for demo)
-- =====================================================
CREATE POLICY "allow_all_users" ON users FOR SELECT USING (true);
CREATE POLICY "allow_all_advertisers" ON advertisers FOR SELECT USING (true);
CREATE POLICY "allow_all_partners" ON partners FOR SELECT USING (true);
CREATE POLICY "allow_all_programs" ON programs FOR SELECT USING (true);
CREATE POLICY "allow_all_conversions" ON conversions FOR SELECT USING (true);
CREATE POLICY "allow_all_payouts" ON payouts FOR SELECT USING (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "allow_all_links" ON tracking_links FOR SELECT USING (true);
CREATE POLICY "allow_all_blocklist" ON fraud_blocklist FOR SELECT USING (true);
CREATE POLICY "allow_all_clicks" ON tracking_clicks FOR SELECT USING (true);

-- Insert demo users
INSERT INTO users (id, name, email, password_hash, role, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cuanpintar.com', '$2a$10$dummy', 'admin', true),
('00000000-0000-0000-0000-000000000002', 'Sarah Wijaya', 'sarah@tunaiku.com', '$2a$10$dummy', 'advertiser', true),
('00000000-0000-0000-0000-000000000003', 'Budi Santoso', 'budi@jakselnews.com', '$2a$10$dummy', 'partner', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO advertisers (id, user_id, company_name, industry, website, status) VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 'Tunaiku', 'Financial Services', 'https://tunaiku.com', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO partners (id, user_id, partner_name, partner_type, niche, location, audience_size, quality_score, status, total_earnings, valid_conversions) VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000003', 'JakselNews Media Network', 'media', 'Lifestyle & Urban', 'Jakarta Selatan', 2500000, 92, 'active', 18500000, 333)
ON CONFLICT (id) DO NOTHING;

INSERT INTO programs (id, advertiser_id, name, brand_name, industry, description, objectives, budget, target_volume, payout_model, advertiser_price, partner_payout, status, channels) VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', 'Tunaiku Download + Registration', 'Tunaiku', 'Financial Services', 'Acquire new Tunaiku app users', '["app_install", "registration"]', 50000000, 2000, 'CPA', 30000, 25000, 'active', '[{"channel_type": "media", "allocated_budget": 20000000, "estimated_volume": 800, "quality_score": 88}]')
ON CONFLICT (id) DO NOTHING;

SELECT 'CuanPintar database setup complete!' as status;
