-- ============================================
-- CuanPintar MVP - Consolidated Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 1: Create all tables
-- ============================================

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
    email_verified BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
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

-- ============================================
-- STEP 2: Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_advertisers_user ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_partners_user ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_programs_advertiser ON programs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_payouts_partner ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ============================================
-- STEP 3: Insert seed data - USERS
-- ============================================
DO $$
DECLARE
    sarah_id UUID := gen_random_uuid();
    budi_id UUID := gen_random_uuid();
    admin_id UUID := gen_random_uuid();
    andi_id UUID := gen_random_uuid();
    dewi_id UUID := gen_random_uuid();
    rudi_id UUID := gen_random_uuid();
    ani_id UUID := gen_random_uuid();
    hendra_id UUID := gen_random_uuid();
    fani_id UUID := gen_random_uuid();
    galih_id UUID := gen_random_uuid();
BEGIN
    -- Clear existing data
    DELETE FROM payouts;
    DELETE FROM conversions;
    DELETE FROM programs;
    DELETE FROM partners;
    DELETE FROM advertisers;
    DELETE FROM notifications;
    DELETE FROM users;

    -- Insert users
    INSERT INTO users (id, email, name, role, company_name, status) VALUES
    (sarah_id, 'sarah@tunaiku.com', 'Sarah Wijaya', 'advertiser', 'Tunaiku', 'active'),
    (budi_id, 'budi@jakselnews.com', 'Budi Santoso', 'partner', 'JakselNews Media', 'active'),
    (admin_id, 'admin@cuanpintar.com', 'Admin User', 'admin', 'CuanPintar', 'active'),
    (andi_id, 'andi@prudential.com', 'Andi Pratama', 'advertiser', 'Prudential Indonesia', 'active'),
    (dewi_id, 'dewi@financecreator.id', 'Dewi Kusuma', 'partner', 'Finance Creator Jakarta', 'active'),
    (rudi_id, 'rudi@xl.co.id', 'Rudi Hermawan', 'advertiser', 'XL Axiata', 'active'),
    (ani_id, 'ani@parenting.id', 'Ani Wulandari', 'partner', 'Parenting Community Indonesia', 'active'),
    (hendra_id, 'hendra@pegadaian.co.id', 'Hendra Wijaya', 'advertiser', 'Pegadaian', 'active'),
    (fani_id, 'fani@astrapay.com', 'Fani Rahman', 'advertiser', 'AstraPay', 'active'),
    (galih_id, 'galih@banksaqu.com', 'Galih Pratama', 'advertiser', 'Bank Saqu', 'active');

    -- Insert advertisers
    INSERT INTO advertisers (user_id, company_name, industry, website, status, total_spend, active_programs, verified_at) VALUES
    (sarah_id, 'Tunaiku', 'Financial Services', 'https://tunaiku.com', 'active', 125000000, 3, NOW() - INTERVAL '30 days'),
    (andi_id, 'Prudential Indonesia', 'Insurance', 'https://prudential.co.id', 'active', 89000000, 2, NOW() - INTERVAL '45 days'),
    (rudi_id, 'XL Axiata', 'Telecommunications', 'https://xl.co.id', 'active', 67000000, 1, NOW() - INTERVAL '20 days'),
    (hendra_id, 'Pegadaian', 'Financial Services', 'https://pegadaian.co.id', 'active', 45000000, 2, NOW() - INTERVAL '35 days'),
    (fani_id, 'AstraPay', 'Fintech', 'https://astrapay.com', 'active', 38000000, 1, NOW() - INTERVAL '15 days'),
    (galih_id, 'Bank Saqu', 'Banking', 'https://banksaqu.com', 'active', 52000000, 2, NOW() - INTERVAL '25 days');

    -- Insert partners (with users)
    INSERT INTO partners (user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions, verified_at) VALUES
    (budi_id, 'JakselNews Media', 'media', 'Lifestyle & Urban', 'Jakarta Selatan', 2500000, 92, 'low', 'active', 18500000, 740, NOW() - INTERVAL '60 days'),
    (dewi_id, 'Finance Creator Jakarta', 'creator', 'Personal Finance', 'Jakarta', 450000, 88, 'low', 'active', 12300000, 492, NOW() - INTERVAL '55 days'),
    (ani_id, 'Parenting Community Indonesia', 'community', 'Parenting & Family', 'Nasional', 1200000, 90, 'low', 'active', 9500000, 380, NOW() - INTERVAL '50 days');

    -- Insert additional partners (without user relation)
    INSERT INTO partners (partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions, verified_at) VALUES
    ('Campus Sales Team', 'sales', 'Student Acquisition', 'Jakarta', 50000, 78, 'medium', 'active', 4200000, 168, NOW() - INTERVAL '45 days'),
    ('Affiliate Finance Partner', 'affiliate', 'Financial Products', 'Nasional', 320000, 82, 'low', 'active', 15600000, 624, NOW() - INTERVAL '50 days'),
    ('Mission User Network', 'mission', 'Rewards & Incentives', 'Nasional', 150000, 65, 'high', 'active', 8900000, 356, NOW() - INTERVAL '40 days'),
    ('Automotive Creator', 'creator', 'Motorcycle & Cars', 'Jakarta', 680000, 87, 'low', 'active', 10200000, 408, NOW() - INTERVAL '55 days'),
    ('Muslim Family Media', 'media', 'Islamic Content', 'Nasional', 1800000, 91, 'low', 'active', 13400000, 536, NOW() - INTERVAL '35 days'),
    ('Lifestyle Creator', 'creator', 'Lifestyle & Trends', 'Surabaya', 380000, 84, 'low', 'pending', 0, 0, NULL),
    ('Local Media Bandung', 'media', 'Local News', 'Bandung', 890000, 85, 'low', 'active', 7800000, 312, NOW() - INTERVAL '30 days'),
    ('Tech Review Channel', 'creator', 'Technology Reviews', 'Nasional', 1200000, 89, 'low', 'active', 15800000, 632, NOW() - INTERVAL '25 days');
END $$;

-- ============================================
-- STEP 4: Insert PROGRAMS
-- ============================================
DO $$
DECLARE
    tunaiku_id UUID;
    prudential_id UUID;
    xl_id UUID;
    pegadaian_id UUID;
    astrapay_id UUID;
    banksaqu_id UUID;
BEGIN
    -- Get advertiser IDs
    SELECT id INTO tunaiku_id FROM advertisers WHERE company_name = 'Tunaiku';
    SELECT id INTO prudential_id FROM advertisers WHERE company_name = 'Prudential Indonesia';
    SELECT id INTO xl_id FROM advertisers WHERE company_name = 'XL Axiata';
    SELECT id INTO pegadaian_id FROM advertisers WHERE company_name = 'Pegadaian';
    SELECT id INTO astrapay_id FROM advertisers WHERE company_name = 'AstraPay';
    SELECT id INTO banksaqu_id FROM advertisers WHERE company_name = 'Bank Saqu';

    -- Insert programs
    INSERT INTO programs (advertiser_id, name, brand_name, industry, description, objectives, target_audience, budget, payout_model, payout_amount, target_volume, status, start_date, end_date) VALUES
    (tunaiku_id, 'Tunaiku Download + Registration', 'Tunaiku', 'Financial Services', 'Acquire new Tunaiku app users through registration program targeting young professionals.', '["app_install", "registration"]'::JSONB, '{"age": "21-35", "location": "Jakarta, Surabaya"}'::JSONB, 50000000, 'CPA', 25000, 2000, 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days'),
    (tunaiku_id, 'Tunaiku Lead Generation', 'Tunaiku', 'Financial Services', 'Generate qualified leads for Tunaiku credit products.', '["lead_form"]'::JSONB, '{"age": "23-40", "income": "5-15 juta"}'::JSONB, 30000000, 'CPL', 35000, 857, 'active', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days'),
    (tunaiku_id, 'Tunaiku KYC Completion', 'Tunaiku', 'Financial Services', 'Drive KYC completion for existing users.', '["kyc"]'::JSONB, '{"existing_user": true}'::JSONB, 20000000, 'CPA', 15000, 1333, 'active', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '45 days'),
    (prudential_id, 'PRULady Lead Form', 'Prudential', 'Insurance', 'Generate qualified insurance leads from female professionals.', '["lead_form"]'::JSONB, '{"age": "25-45", "gender": "female"}'::JSONB, 40000000, 'CPL', 50000, 800, 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days'),
    (prudential_id, 'PRU Family Purchase', 'Prudential', 'Insurance', 'Drive insurance policy purchases.', '["purchase"]'::JSONB, '{"age": "25-50", "family": true}'::JSONB, 50000000, 'CPS', 250000, 200, 'active', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '65 days'),
    (xl_id, 'XL eSIM Purchase', 'XL Axiata', 'Telecommunications', 'Promote XL eSIM packages targeting tech-savvy users.', '["purchase", "app_install"]'::JSONB, '{"age": "18-35", "interest": "Technology"}'::JSONB, 30000000, 'CPA', 15000, 2000, 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days'),
    (pegadaian_id, 'Pegadaian App Download', 'Pegadaian', 'Financial Services', 'Digital transformation initiative to acquire app users.', '["app_install", "registration"]'::JSONB, '{"age": "25-50"}'::JSONB, 35000000, 'CPI', 20000, 1750, 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days'),
    (pegadaian_id, 'Pegadaian Gold Purchase', 'Pegadaian', 'Financial Services', 'Promote gold investment products.', '["purchase"]'::JSONB, '{"interest": "Investment"}'::JSONB, 25000000, 'CPS', 75000, 333, 'paused', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days'),
    (astrapay_id, 'AstraPay Review & Rating', 'AstraPay', 'Fintech', 'Increase app store ratings and reviews.', '["review_rating", "app_install"]'::JSONB, '{"interest": "Digital Payment"}'::JSONB, 20000000, 'CPA', 10000, 2000, 'active', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '45 days'),
    (banksaqu_id, 'Bank Saqu Download + Registration', 'Bank Saqu', 'Banking', 'Launch campaign for Bank Saqu digital banking app.', '["app_install", "registration"]'::JSONB, '{"age": "18-30", "interest": "Digital Banking"}'::JSONB, 60000000, 'CPA', 35000, 1714, 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days'),
    (banksaqu_id, 'Bank Saqu First Transaction', 'Bank Saqu', 'Banking', 'Drive first transaction on Bank Saqu.', '["purchase"]'::JSONB, '{"new_user": true}'::JSONB, 40000000, 'CPA', 50000, 800, 'active', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '50 days');
END $$;

-- ============================================
-- STEP 5: Insert CONVERSIONS (sample data)
-- ============================================
DO $$
DECLARE
    prog RECORD;
    part RECORD;
    i INTEGER;
BEGIN
    -- Get a random partner for conversions
    FOR prog IN SELECT id, advertiser_id, payout_amount FROM programs WHERE status = 'active' LOOP
        FOR part IN SELECT id FROM partners WHERE status = 'active' ORDER BY random() LIMIT 1 LOOP
            -- Insert 5-20 conversions per program
            FOR i IN 1..(5 + floor(random() * 16)::int) LOOP
                INSERT INTO conversions (
                    program_id, advertiser_id, partner_id, channel_type, conversion_type,
                    user_identifier, ip_address, status, payout_amount, quality_score,
                    created_at
                ) VALUES (
                    prog.id, prog.advertiser_id, part.id, part.id,
                    CASE WHEN random() > 0.7 THEN 'app_install' ELSE 'registration' END,
                    'user_' || floor(random() * 100000)::text,
                    ('192.168.' || floor(random() * 255)::int || '.' || floor(random() * 255)::int)::INET,
                    CASE
                        WHEN random() > 0.85 THEN 'pending'
                        WHEN random() > 0.95 THEN 'rejected'
                        ELSE 'valid'
                    END,
                    prog.payout_amount,
                    70 + floor(random() * 30)::int,
                    NOW() - (floor(random() * 30) || ' days')::interval
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- STEP 6: Insert NOTIFICATIONS
-- ============================================
DO $$
DECLARE
    budi_user_id UUID;
    sarah_user_id UUID;
    admin_user_id UUID;
BEGIN
    SELECT id INTO budi_user_id FROM users WHERE email = 'budi@jakselnews.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah@tunaiku.com';
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@cuanpintar.com';

    INSERT INTO notifications (user_id, type, title, message, link, read) VALUES
    (budi_user_id, 'conversion', 'Konversi Baru Valid', 'Anda menerima 5 konversi valid baru hari ini.', '/partner/programs', false),
    (budi_user_id, 'payout', 'Payout Diproses', 'Payout sebesar Rp 5,250,000 sedang diproses.', '/partner/earnings', false),
    (budi_user_id, 'program', 'Program Baru Tersedia', 'Tunaiku memiliki program baru yang mungkin sesuai dengan niche Anda.', '/partner/programs/prulady', false),
    (sarah_user_id, 'conversion', 'Alert Konversi', 'Program Anda menerima 25 konversi baru hari ini.', '/advertiser/conversions', false),
    (sarah_user_id, 'fraud', 'Peringatan Fraud', '3 konversi ditandai sebagai potential fraud.', '/advertiser/fraud', true),
    (sarah_user_id, 'budget', 'Budget Warning', 'Program Tunaiku Download + Registration sudah menghabiskan 75% budget.', '/advertiser/programs', false),
    (admin_user_id, 'system', 'System Update', 'Platform berhasil di-upgrade ke versi terbaru.', '/admin', false),
    (admin_user_id, 'kyc', 'New KYC Request', '3 partner baru menunggu verifikasi KYC.', '/admin/kyc', false);
END $$;

-- ============================================
-- STEP 7: Verify data
-- ============================================
SELECT 'Users' as table_name, count(*) as count FROM users
UNION ALL SELECT 'Advertisers', count(*) FROM advertisers
UNION ALL SELECT 'Partners', count(*) FROM partners
UNION ALL SELECT 'Programs', count(*) FROM programs
UNION ALL SELECT 'Conversions', count(*) FROM conversions
UNION ALL SELECT 'Notifications', count(*) FROM notifications;
