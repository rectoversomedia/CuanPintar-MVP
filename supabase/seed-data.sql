-- CuanPintar Seed Data
-- Run this in Supabase Dashboard > SQL Editor
-- https://vediyxsldxfptctwnnqh.supabase.co/project/-/editor

-- ============================================
-- INSERT USERS
-- ============================================
INSERT INTO users (id, email, password_hash, name, role, company_name, status) VALUES
(gen_random_uuid(), 'sarah@tunaiku.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Sarah Wijaya', 'advertiser', 'Tunaiku', 'active'),
(gen_random_uuid(), 'budi@jakselnews.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Budi Santoso', 'partner', 'JakselNews Media', 'active'),
(gen_random_uuid(), 'admin@cuanpintar.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Admin User', 'admin', 'CuanPintar', 'active'),
(gen_random_uuid(), 'andi@prudential.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Andi Pratama', 'advertiser', 'Prudential Indonesia', 'active'),
(gen_random_uuid(), 'dewi@financecreator.id', '$2a$10$demopasshash1234567890123456789012345678901234', 'Dewi Kusuma', 'partner', 'Finance Creator Jakarta', 'active'),
(gen_random_uuid(), 'rudi@xl.co.id', '$2a$10$demopasshash1234567890123456789012345678901234', 'Rudi Hermawan', 'advertiser', 'XL Axiata', 'active'),
(gen_random_uuid(), 'ani@parenting.id', '$2a$10$demopasshash1234567890123456789012345678901234', 'Ani Wulandari', 'partner', 'Parenting Community Indonesia', 'active'),
(gen_random_uuid(), 'hendra@pegadaian.co.id', '$2a$10$demopasshash1234567890123456789012345678901234', 'Hendra Wijaya', 'advertiser', 'Pegadaian', 'active'),
(gen_random_uuid(), 'fani@astrapay.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Fani Rahman', 'advertiser', 'AstraPay', 'active'),
(gen_random_uuid(), 'galih@banksaqu.com', '$2a$10$demopasshash1234567890123456789012345678901234', 'Galih Pratama', 'advertiser', 'Bank Saqu', 'active');

-- ============================================
-- INSERT ADVERTISERS
-- ============================================
INSERT INTO advertisers (user_id, company_name, industry, website, status, total_spend, active_programs)
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
    END,
    CASE u.company_name
        WHEN 'Tunaiku' THEN 'https://tunaiku.com'
        WHEN 'Prudential Indonesia' THEN 'https://prudential.co.id'
        WHEN 'XL Axiata' THEN 'https://xl.co.id'
        WHEN 'Pegadaian' THEN 'https://pegadaian.co.id'
        WHEN 'AstraPay' THEN 'https://astrapay.com'
        WHEN 'Bank Saqu' THEN 'https://banksaqu.com'
    END,
    'active',
    CASE u.company_name
        WHEN 'Tunaiku' THEN 125000000
        WHEN 'Prudential Indonesia' THEN 89000000
        WHEN 'XL Axiata' THEN 67000000
        WHEN 'Pegadaian' THEN 45000000
        WHEN 'AstraPay' THEN 38000000
        WHEN 'Bank Saqu' THEN 52000000
    END,
    CASE u.company_name
        WHEN 'Tunaiku' THEN 3
        WHEN 'Prudential Indonesia' THEN 2
        WHEN 'XL Axiata' THEN 1
        WHEN 'Pegadaian' THEN 2
        WHEN 'AstraPay' THEN 1
        WHEN 'Bank Saqu' THEN 2
    END
FROM users u WHERE u.role = 'advertiser';

-- ============================================
-- INSERT PARTNERS (with users)
-- ============================================
INSERT INTO partners (user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions)
SELECT
    u.id,
    u.company_name,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'media'
        WHEN 'Finance Creator Jakarta' THEN 'creator'
        WHEN 'Parenting Community Indonesia' THEN 'community'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'Lifestyle & Urban'
        WHEN 'Finance Creator Jakarta' THEN 'Personal Finance'
        WHEN 'Parenting Community Indonesia' THEN 'Parenting & Family'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 'Jakarta Selatan'
        WHEN 'Finance Creator Jakarta' THEN 'Jakarta'
        WHEN 'Parenting Community Indonesia' THEN 'Nasional'
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 2500000
        WHEN 'Finance Creator Jakarta' THEN 450000
        WHEN 'Parenting Community Indonesia' THEN 1200000
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 92
        WHEN 'Finance Creator Jakarta' THEN 88
        WHEN 'Parenting Community Indonesia' THEN 90
    END,
    'low',
    'active',
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 18500000
        WHEN 'Finance Creator Jakarta' THEN 12300000
        WHEN 'Parenting Community Indonesia' THEN 9500000
    END,
    CASE u.company_name
        WHEN 'JakselNews Media' THEN 740
        WHEN 'Finance Creator Jakarta' THEN 492
        WHEN 'Parenting Community Indonesia' THEN 380
    END
FROM users u WHERE u.role = 'partner';

-- ============================================
-- INSERT ADDITIONAL PARTNERS
-- ============================================
INSERT INTO partners (partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions) VALUES
('Campus Sales Team', 'sales', 'Student Acquisition', 'Jakarta', 50000, 78, 'medium', 'active', 4200000, 168),
('Affiliate Finance Partner', 'affiliate', 'Financial Products', 'Nasional', 320000, 82, 'low', 'active', 15600000, 624),
('Mission User Network', 'mission', 'Rewards & Incentives', 'Nasional', 150000, 65, 'high', 'active', 8900000, 356),
('Automotive Creator', 'creator', 'Motorcycle & Cars', 'Jakarta', 680000, 87, 'low', 'active', 10200000, 408),
('Muslim Family Media', 'media', 'Islamic Content', 'Nasional', 1800000, 91, 'low', 'active', 13400000, 536),
('Lifestyle Creator', 'creator', 'Lifestyle & Trends', 'Surabaya', 380000, 84, 'low', 'pending', 0, 0),
('Local Media Bandung', 'media', 'Local News', 'Bandung', 890000, 85, 'low', 'active', 7800000, 312),
('Tech Review Channel', 'creator', 'Technology Reviews', 'Nasional', 1200000, 89, 'low', 'active', 15800000, 632);

-- ============================================
-- INSERT PROGRAMS
-- ============================================
INSERT INTO programs (advertiser_id, name, brand_name, industry, description, objectives, target_audience, budget, payout_model, payout_amount, target_volume, status, start_date, end_date)
SELECT
    a.id,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 'Tunaiku Download + Registration'
        WHEN 'Prudential Indonesia' THEN 'PRULady Lead Form'
        WHEN 'XL Axiata' THEN 'XL eSIM Purchase'
        WHEN 'Pegadaian' THEN 'Pegadaian App Download'
        WHEN 'AstraPay' THEN 'AstraPay Review & Rating'
        WHEN 'Bank Saqu' THEN 'Bank Saqu Download + Registration'
    END,
    a.company_name,
    a.industry,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 'Acquire new Tunaiku app users through registration program targeting young professionals.'
        WHEN 'Prudential Indonesia' THEN 'Generate qualified insurance leads from female professionals.'
        WHEN 'XL Axiata' THEN 'Promote XL eSIM packages targeting tech-savvy users.'
        WHEN 'Pegadaian' THEN 'Digital transformation initiative to acquire app users.'
        WHEN 'AstraPay' THEN 'Increase app store ratings and reviews.'
        WHEN 'Bank Saqu' THEN 'Launch campaign for Bank Saqu digital banking app.'
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN '["app_install", "registration"]'
        WHEN 'Prudential Indonesia' THEN '["lead_form"]'
        WHEN 'XL Axiata' THEN '["purchase", "app_install"]'
        WHEN 'Pegadaian' THEN '["app_install", "registration"]'
        WHEN 'AstraPay' THEN '["review_rating", "app_install"]'
        WHEN 'Bank Saqu' THEN '["app_install", "registration"]'
    END::JSONB,
    CASE a.company_name
        WHEN 'Tunaiku' THEN '{"age": "21-35", "location": "Jakarta, Surabaya"}'
        WHEN 'Prudential Indonesia' THEN '{"age": "25-45", "gender": "female"}'
        WHEN 'XL Axiata' THEN '{"age": "18-35", "interest": "Technology"}'
        WHEN 'Pegadaian' THEN '{"age": "25-50"}'
        WHEN 'AstraPay' THEN '{"interest": "Digital Payment"}'
        WHEN 'Bank Saqu' THEN '{"age": "18-30", "interest": "Digital Banking"}'
    END::JSONB,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 50000000
        WHEN 'Prudential Indonesia' THEN 40000000
        WHEN 'XL Axiata' THEN 30000000
        WHEN 'Pegadaian' THEN 35000000
        WHEN 'AstraPay' THEN 20000000
        WHEN 'Bank Saqu' THEN 60000000
    END,
    CASE a.company_name WHEN 'Prudential Indonesia' THEN 'CPL' ELSE 'CPA' END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 25000
        WHEN 'Prudential Indonesia' THEN 50000
        WHEN 'XL Axiata' THEN 15000
        WHEN 'Pegadaian' THEN 20000
        WHEN 'AstraPay' THEN 10000
        WHEN 'Bank Saqu' THEN 35000
    END,
    CASE a.company_name
        WHEN 'Tunaiku' THEN 2000
        WHEN 'Prudential Indonesia' THEN 800
        WHEN 'XL Axiata' THEN 2000
        WHEN 'Pegadaian' THEN 1750
        WHEN 'AstraPay' THEN 2000
        WHEN 'Bank Saqu' THEN 1714
    END,
    'active',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '60 days'
FROM advertisers a WHERE a.status = 'active';

-- ============================================
-- INSERT SAMPLE CONVERSIONS
-- ============================================
INSERT INTO conversions (program_id, advertiser_id, partner_id, channel_type, conversion_type, user_identifier, ip_address, status, payout_amount, quality_score)
SELECT
    p.id,
    p.advertiser_id,
    (SELECT id FROM partners WHERE partner_type = 'media' LIMIT 1),
    'media',
    'registration',
    'user_' || generate_series(1, 20),
    '192.168.1.' || generate_series(1, 20),
    CASE WHEN random() > 0.15 THEN 'valid' ELSE 'pending' END,
    p.payout_amount,
    70 + floor(random() * 30)::INT
FROM programs p
LIMIT 20;

-- ============================================
-- INSERT SAMPLE NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, type, title, message, link) VALUES
((SELECT id FROM users WHERE role = 'partner' LIMIT 1), 'conversion', 'New Valid Conversion', 'You received a new valid conversion.', '/partner/conversions'),
((SELECT id FROM users WHERE role = 'partner' LIMIT 1), 'payout', 'Payout Processed', 'Your payout of Rp 5,250,000 has been processed.', '/partner/payouts'),
((SELECT id FROM users WHERE role = 'advertiser' LIMIT 1), 'conversion', 'Conversion Alert', 'Your program received 25 new conversions today.', '/advertiser/conversions');

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Users' as table_name, count(*) as count FROM users
UNION ALL SELECT 'Advertisers', count(*) FROM advertisers
UNION ALL SELECT 'Partners', count(*) FROM partners
UNION ALL SELECT 'Programs', count(*) FROM programs
UNION ALL SELECT 'Conversions', count(*) FROM conversions
UNION ALL SELECT 'Notifications', count(*) FROM notifications;
