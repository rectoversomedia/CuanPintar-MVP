-- CuanPintar Seed Data
-- Migration: 002_seed_data.sql
-- Description: Insert demo data for development and testing

-- ============================================
-- SEED USERS
-- ============================================
INSERT INTO users (id, email, password_hash, name, role, company_name, status) VALUES
(uuid_generate_v4(), 'sarah@tunaiku.com', '$2a$10$demopasswordhash123456789', 'Sarah Wijaya', 'advertiser', 'Tunaiku', 'active'),
(uuid_generate_v4(), 'budi@jakselnews.com', '$2a$10$demopasswordhash123456789', 'Budi Santoso', 'partner', 'JakselNews Media', 'active'),
(uuid_generate_v4(), 'admin@cuanpintar.com', '$2a$10$demopasswordhash123456789', 'Admin User', 'admin', 'CuanPintar', 'active'),
(uuid_generate_v4(), 'andi@prudential.com', '$2a$10$demopasswordhash123456789', 'Andi Pratama', 'advertiser', 'Prudential Indonesia', 'active'),
(uuid_generate_v4(), 'dewi@financecreator.id', '$2a$10$demopasswordhash123456789', 'Dewi Kusuma', 'partner', 'Finance Creator Jakarta', 'active'),
(uuid_generate_v4(), 'rudi@xl.co.id', '$2a$10$demopasswordhash123456789', 'Rudi Hermawan', 'advertiser', 'XL Axiata', 'active'),
(uuid_generate_v4(), 'ani@parenting.id', '$2a$10$demopasswordhash123456789', 'Ani Wulandari', 'partner', 'Parenting Community Indonesia', 'active'),
(uuid_generate_v4(), 'hendra@pegadaian.co.id', '$2a$10$demopasswordhash123456789', 'Hendra Wijaya', 'advertiser', 'Pegadaian', 'active'),
(uuid_generate_v4(), 'fani@astrapay.com', '$2a$10$demopasswordhash123456789', 'Fani Rahman', 'advertiser', 'AstraPay', 'active'),
(uuid_generate_v4(), 'galih@banksaqu.com', '$2a$10$demopasswordhash123456789', 'Galih Pratama', 'advertiser', 'Bank Saqu', 'active');

-- ============================================
-- SEED ADVERTISERS
-- ============================================
INSERT INTO advertisers (user_id, company_name, industry, website, status, total_spend, active_programs, verified_at)
SELECT
    u.id,
    u.company_name,
    CASE u.company_name
        WHEN 'Tunaiku' THEN 'Financial Services'
        WHEN 'Prudential Indonesia' THEN 'Insurance'
        WHEN 'XL Axiata' THEN 'Telecommunications'
        WHEN 'Pegadaian' THEN 'Financial Services'
        WHEN 'AstraPay' THEN 'Fintech'
        WHEN 'Bank Saqu' THEN 'Banking'
        ELSE 'General'
    END,
    CASE u.company_name
        WHEN 'Tunaiku' THEN 'https://tunaiku.com'
        WHEN 'Prudential Indonesia' THEN 'https://prudential.co.id'
        WHEN 'XL Axiata' THEN 'https://xl.co.id'
        WHEN 'Pegadaian' THEN 'https://pegadaian.co.id'
        WHEN 'AstraPay' THEN 'https://astrapay.com'
        WHEN 'Bank Saqu' THEN 'https://banksaqu.com'
        ELSE NULL
    END,
    'active',
    CASE u.company_name
        WHEN 'Tunaiku' THEN 125000000
        WHEN 'Prudential Indonesia' THEN 89000000
        WHEN 'XL Axiata' THEN 67000000
        WHEN 'Pegadaian' THEN 45000000
        WHEN 'AstraPay' THEN 38000000
        WHEN 'Bank Saqu' THEN 52000000
        ELSE 0
    END::DECIMAL,
    CASE u.company_name
        WHEN 'Tunaiku' THEN 3
        WHEN 'Prudential Indonesia' THEN 2
        WHEN 'XL Axiata' THEN 1
        WHEN 'Pegadaian' THEN 2
        WHEN 'AstraPay' THEN 1
        WHEN 'Bank Saqu' THEN 2
        ELSE 0
    END,
    NOW() - INTERVAL '30 days'
FROM users u WHERE u.role = 'advertiser';

-- ============================================
-- SEED PARTNERS
-- ============================================
INSERT INTO partners (user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions, verified_at)
SELECT
    u.id,
    u.company_name,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'media'
        WHEN 'Finance Creator Jakarta' THEN 'creator'
        WHEN 'Parenting Community Indonesia' THEN 'community'
        ELSE 'affiliate'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'Lifestyle & Urban'
        WHEN 'Finance Creator Jakarta' THEN 'Personal Finance'
        WHEN 'Parenting Community Indonesia' THEN 'Parenting & Family'
        ELSE 'General'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'Jakarta Selatan'
        WHEN 'Finance Creator Jakarta' THEN 'Jakarta'
        WHEN 'Parenting Community Indonesia' THEN 'Nasional'
        ELSE 'Nasional'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 2500000
        WHEN 'Finance Creator Jakarta' THEN 450000
        WHEN 'Parenting Community Indonesia' THEN 1200000
        ELSE 100000
    END::INTEGER,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 92
        WHEN 'Finance Creator Jakarta' THEN 88
        WHEN 'Parenting Community Indonesia' THEN 90
        ELSE 75
    END,
    'low',
    'active',
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 18500000
        WHEN 'Finance Creator Jakarta' THEN 12300000
        WHEN 'Parenting Community Indonesia' THEN 9500000
        ELSE 1000000
    END::DECIMAL,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 740
        WHEN 'Finance Creator Jakarta' THEN 492
        WHEN 'Parenting Community Indonesia' THEN 380
        ELSE 100
    END::INTEGER,
    NOW() - INTERVAL '60 days'
FROM users u WHERE u.role = 'partner';

-- Additional demo partners (without users)
INSERT INTO partners (user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions, verified_at) VALUES
(uuid_generate_v4(), 'Campus Sales Team', 'sales', 'Student Acquisition', 'Jakarta', 50000, 78, 'medium', 'active', 4200000, 168, NOW() - INTERVAL '45 days'),
(uuid_generate_v4(), 'Affiliate Finance Partner', 'affiliate', 'Financial Products', 'Nasional', 320000, 82, 'low', 'active', 15600000, 624, NOW() - INTERVAL '50 days'),
(uuid_generate_v4(), 'Mission User Network', 'mission', 'Rewards & Incentives', 'Nasional', 150000, 65, 'high', 'active', 8900000, 356, NOW() - INTERVAL '40 days'),
(uuid_generate_v4(), 'Automotive Creator', 'creator', 'Motorcycle & Cars', 'Jakarta', 680000, 87, 'low', 'active', 10200000, 408, NOW() - INTERVAL '55 days'),
(uuid_generate_v4(), 'Muslim Family Media', 'media', 'Islamic Content', 'Nasional', 1800000, 91, 'low', 'active', 13400000, 536, NOW() - INTERVAL '35 days'),
(uuid_generate_v4(), 'Lifestyle Creator', 'creator', 'Lifestyle & Trends', 'Surabaya', 380000, 84, 'low', 'pending', 0, 0, NULL),
(uuid_generate_v4(), 'Local Media Bandung', 'media', 'Local News', 'Bandung', 890000, 85, 'low', 'active', 7800000, 312, NOW() - INTERVAL '30 days'),
(uuid_generate_v4(), 'Tech Review Channel', 'creator', 'Technology Reviews', 'Nasional', 1200000, 89, 'low', 'active', 15800000, 632, NOW() - INTERVAL '25 days');

-- ============================================
-- SEED PROGRAMS
-- ============================================
INSERT INTO programs (advertiser_id, name, brand_name, industry, description, objectives, target_audience, budget, payout_model, payout_amount, target_volume, status, start_date, end_date, created_at)
SELECT
    a.id,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 'Tunaiku Download + Registration'
        WHEN 'Prudential Indonesia' THEN 'PRULady Lead Form'
        WHEN 'XL Axiata' THEN 'XL eSIM Purchase'
        WHEN 'Pegadaian' THEN 'Pegadaian App Download'
        WHEN 'AstraPay' THEN 'AstraPay Review & Rating'
        WHEN 'Bank Saqu' THEN 'Bank Saqu Download + Registration'
        ELSE 'Demo Program'
    END,
    a.company_name,
    a.industry,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 'Acquire new Tunaiku app users through registration program targeting young professionals in Jakarta and Surabaya.'
        WHEN 'Prudential Indonesia' THEN 'Generate qualified insurance leads from female professionals interested in women-focused insurance products.'
        WHEN 'XL Axiata' THEN 'Promote XL eSIM packages targeting tech-savvy users in urban areas.'
        WHEN 'Pegadaian' THEN 'Digital transformation initiative to acquire app users for Pegadaian digital services.'
        WHEN 'AstraPay' THEN 'Increase app store ratings and reviews for AstraPay to improve visibility.'
        WHEN 'Bank Saqu' THEN 'Launch campaign for Bank Saqu digital banking app targeting Gen Z and millennials.'
        ELSE 'Demo program description.'
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN '["app_install", "registration"]'::JSONB
        WHEN 'Prudential Indonesia' THEN '["lead_form"]'::JSONB
        WHEN 'XL Axiata' THEN '["purchase", "app_install"]'::JSONB
        WHEN 'Pegadaian' THEN '["app_install", "registration"]'::JSONB
        WHEN 'AstraPay' THEN '["review_rating", "app_install"]'::JSONB
        WHEN 'Bank Saqu' THEN '["app_install", "registration"]'::JSONB
        ELSE '["registration"]'::JSONB
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN '{"age": "21-35", "gender": "all", "location": "Jakarta, Surabaya, Bandung", "interest": "Personal Finance"}'::JSONB
        WHEN 'Prudential Indonesia' THEN '{"age": "25-45", "gender": "female", "location": "Nasional", "interest": "Insurance, Family Protection"}'::JSONB
        WHEN 'XL Axiata' THEN '{"age": "18-35", "gender": "all", "location": "Jakarta, Medan, Surabaya", "interest": "Technology, Gaming"}'::JSONB
        WHEN 'Pegadaian' THEN '{"age": "25-50", "gender": "all", "location": "Nasional", "interest": "Gold, Loans"}'::JSONB
        WHEN 'AstraPay' THEN '{"age": "20-40", "gender": "all", "location": "Nasional", "interest": "Digital Payment"}'::JSONB
        WHEN 'Bank Saqu' THEN '{"age": "18-30", "gender": "all", "location": "Jakarta, Bandung, Surabaya", "interest": "Digital Banking"}'::JSONB
        ELSE '{}'::JSONB
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 50000000
        WHEN 'Prudential Indonesia' THEN 40000000
        WHEN 'XL Axiata' THEN 30000000
        WHEN 'Pegadaian' THEN 35000000
        WHEN 'AstraPay' THEN 20000000
        WHEN 'Bank Saqu' THEN 60000000
        ELSE 25000000
    END::DECIMAL,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 'CPA'
        WHEN 'Prudential Indonesia' THEN 'CPL'
        WHEN 'XL Axiata' THEN 'CPA'
        WHEN 'Pegadaian' THEN 'CPA'
        WHEN 'AstraPay' THEN 'CPA'
        WHEN 'Bank Saqu' THEN 'CPA'
        ELSE 'CPA'
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 25000
        WHEN 'Prudential Indonesia' THEN 50000
        WHEN 'XL Axiata' THEN 15000
        WHEN 'Pegadaian' THEN 20000
        WHEN 'AstraPay' THEN 10000
        WHEN 'Bank Saqu' THEN 35000
        ELSE 15000
    END::DECIMAL,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 2000
        WHEN 'Prudential Indonesia' THEN 800
        WHEN 'XL Axiata' THEN 2000
        WHEN 'Pegadaian' THEN 1750
        WHEN 'AstraPay' THEN 2000
        WHEN 'Bank Saqu' THEN 1714
        ELSE 1000
    END::INTEGER,
    'active',
    CASE a.company_name
        WHEN 'Tunaiku' THEN '2024-04-01'::DATE
        WHEN 'Prudential Indonesia' THEN '2024-04-15'::DATE
        WHEN 'XL Axiata' THEN '2024-05-01'::DATE
        WHEN 'Pegadaian' THEN '2024-04-20'::DATE
        WHEN 'AstraPay' THEN '2024-05-15'::DATE
        WHEN 'Bank Saqu' THEN '2024-05-01'::DATE
        ELSE CURRENT_DATE
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN '2024-06-30'::DATE
        WHEN 'Prudential Indonesia' THEN '2024-07-15'::DATE
        WHEN 'XL Axiata' THEN '2024-08-31'::DATE
        WHEN 'Pegadaian' THEN '2024-07-20'::DATE
        WHEN 'AstraPay' THEN '2024-08-15'::DATE
        WHEN 'Bank Saqu' THEN '2024-08-01'::DATE
        ELSE CURRENT_DATE + INTERVAL '90 days'
    END,
    NOW() - INTERVAL '60 days'
FROM advertisers a WHERE a.company_name IN ('Tunaiku', 'Prudential Indonesia', 'XL Axiata', 'Pegadaian', 'AstraPay', 'Bank Saqu');

-- ============================================
-- SEED PROGRAM CHANNELS
-- ============================================
INSERT INTO program_channels (program_id, channel_type, allocated_budget, estimated_volume, quality_score, fraud_risk)
SELECT
    p.id,
    channel.channel_type,
    channel.allocated_budget,
    channel.estimated_volume,
    channel.quality_score,
    channel.fraud_risk
FROM programs p
CROSS JOIN (
    VALUES
        ('media', 20000000::DECIMAL, 800, 88, 'low'),
        ('creator', 15000000::DECIMAL, 600, 92, 'low'),
        ('affiliate', 10000000::DECIMAL, 400, 82, 'low'),
        ('sales', 3000000::DECIMAL, 120, 78, 'medium'),
        ('mission', 2000000::DECIMAL, 80, 65, 'high'),
        ('community', 5000000::DECIMAL, 200, 87, 'low')
) AS channel(channel_type, allocated_budget, estimated_volume, quality_score, fraud_risk)
WHERE p.company_name = 'Tunaiku';

-- ============================================
-- SEED MEDIA PARTNERS
-- ============================================
INSERT INTO media_partners (partner_id, media_name, category, region, monthly_reach, available_slots, avg_conversion_rate, quality_score, status)
SELECT
    p.id,
    m.media_name,
    m.category,
    m.region,
    m.monthly_reach,
    m.available_slots,
    m.avg_conversion_rate,
    m.quality_score,
    'active'
FROM partners p
CROSS JOIN (
    VALUES
        ('Kompas', 'national_news', 'Nasional', 25000000, 50, 3.2, 92),
        ('Tempo', 'national_news', 'Nasional', 18000000, 40, 3.5, 91),
        ('Detik News', 'national_news', 'Nasional', 45000000, 100, 2.8, 88),
        ('CNN Indonesia', 'national_news', 'Nasional', 35000000, 80, 3.1, 90),
        ('Katadata', 'finance', 'Nasional', 8500000, 30, 4.8, 95),
        ('Kontan', 'finance', 'Nasional', 5200000, 25, 4.5, 93),
        ('Otofriend', 'automotive', 'Nasional', 3500000, 20, 4.5, 91),
        ('Tekno Liputan6', 'tech', 'Nasional', 15000000, 50, 3.4, 89),
        ('Republika', 'muslim_family', 'Nasional', 12000000, 60, 3.6, 90),
        ('Femina', 'lifestyle', 'Nasional', 4500000, 25, 3.8, 88)
) AS m(media_name, category, region, monthly_reach, available_slots, avg_conversion_rate, quality_score)
WHERE p.partner_type = 'media'
LIMIT 10;

-- ============================================
-- SEED CONVERSIONS
-- ============================================
INSERT INTO conversions (program_id, advertiser_id, partner_id, channel_type, conversion_type, user_identifier, ip_address, device_id, fingerprint, status, payout_amount, quality_score, fraud_signals, created_at)
SELECT
    p.id,
    p.advertiser_id,
    part.id,
    'media',
    'registration',
    'user_' || generate_series(1, 50),
    '192.168.1.' || (generate_series(1, 50)::TEXT),
    'device_' || generate_series(1, 50),
    'fp_' || generate_series(1, 50),
    CASE WHEN random() > 0.15 THEN 'valid' ELSE 'pending' END,
    p.payout_amount,
    GREATEST(50, LEAST(100, 100 - (random() * 30)::INTEGER)),
    CASE WHEN random() < 0.1 THEN '["suspicious_velocity"]'::JSONB ELSE '[]'::JSONB END,
    NOW() - (random() * INTERVAL '30 days')
FROM programs p
CROSS JOIN LATERAL (
    SELECT id FROM partners WHERE partner_type = 'media' LIMIT 1
) part
WHERE p.status = 'active'
LIMIT 50;

-- ============================================
-- SEED PAYOUTS
-- ============================================
INSERT INTO payouts (partner_id, amount, platform_fee, net_amount, status, payment_method, bank_name, account_number, account_holder, approved_conversions, paid_at, created_at)
SELECT
    p.id,
    p.total_earnings * 0.3,
    p.total_earnings * 0.3 * 0.1,
    p.total_earnings * 0.3 * 0.9,
    'paid',
    'bank_transfer',
    'BCA',
    '1234567890',
    p.partner_name,
    (p.total_conversions * 0.3)::INTEGER,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '20 days'
FROM partners p WHERE p.total_earnings > 0
LIMIT 5;

-- ============================================
-- SEED PAYMENT METHODS
-- ============================================
INSERT INTO payment_methods (partner_id, type, bank_name, account_number, account_holder, is_default, is_verified)
SELECT
    p.id,
    'bank_transfer',
    'BCA',
    '1234567890',
    p.partner_name,
    true,
    true
FROM partners p WHERE p.partner_type = 'media' AND p.total_earnings > 0
LIMIT 5;

-- ============================================
-- SEED NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, title, message, icon, link, created_at)
SELECT
    u.id,
    'conversion',
    'New Valid Conversion',
    'You received a new valid conversion from JakselNews Media.',
    'check-circle',
    '/partner/conversions',
    NOW() - INTERVAL '1 day'
FROM users u WHERE u.role = 'partner'
LIMIT 5;

INSERT INTO notifications (user_id, type, title, message, icon, link, created_at)
SELECT
    u.id,
    'payout',
    'Payout Processed',
    'Your payout of Rp 5,250,000 has been processed.',
    'credit-card',
    '/partner/payouts',
    NOW() - INTERVAL '2 days'
FROM users u WHERE u.role = 'partner'
LIMIT 5;

INSERT INTO notifications (user_id, type, title, message, icon, link, created_at)
SELECT
    u.id,
    'program',
    'New Conversion Alert',
    'Your Tunaiku Download + Registration program received 25 new conversions today.',
    'activity',
    '/advertiser/conversions',
    NOW() - INTERVAL '3 hours'
FROM users u WHERE u.role = 'advertiser'
LIMIT 5;
