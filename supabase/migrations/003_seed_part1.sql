-- CuanPintar Seed Data - Part 1 (Users & Relations)
-- Migration: 003_seed_part1.sql

-- Insert users first
INSERT INTO users (id, email, password_hash, name, role, company_name, status) VALUES
(gen_random_uuid(), 'sarah@tunaiku.com', '$2a$10$demopasswordhash123456789', 'Sarah Wijaya', 'advertiser', 'Tunaiku', 'active'),
(gen_random_uuid(), 'budi@jakselnews.com', '$2a$10$demopasswordhash123456789', 'Budi Santoso', 'partner', 'JakselNews Media', 'active'),
(gen_random_uuid(), 'admin@cuanpintar.com', '$2a$10$demopasswordhash123456789', 'Admin User', 'admin', 'CuanPintar', 'active'),
(gen_random_uuid(), 'andi@prudential.com', '$2a$10$demopasswordhash123456789', 'Andi Pratama', 'advertiser', 'Prudential Indonesia', 'active'),
(gen_random_uuid(), 'dewi@financecreator.id', '$2a$10$demopasswordhash123456789', 'Dewi Kusuma', 'partner', 'Finance Creator Jakarta', 'active'),
(gen_random_uuid(), 'rudi@xl.co.id', '$2a$10$demopasswordhash123456789', 'Rudi Hermawan', 'advertiser', 'XL Axiata', 'active'),
(gen_random_uuid(), 'ani@parenting.id', '$2a$10$demopasswordhash123456789', 'Ani Wulandari', 'partner', 'Parenting Community Indonesia', 'active'),
(gen_random_uuid(), 'hendra@pegadaian.co.id', '$2a$10$demopasswordhash123456789', 'Hendra Wijaya', 'advertiser', 'Pegadaian', 'active'),
(gen_random_uuid(), 'fani@astrapay.com', '$2a$10$demopasswordhash123456789', 'Fani Rahman', 'advertiser', 'AstraPay', 'active'),
(gen_random_uuid(), 'galih@banksaqu.com', '$2a$10$demopasswordhash123456789', 'Galih Pratama', 'advertiser', 'Bank Saqu', 'active');

-- Insert advertisers using subquery
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

-- Insert partners with users using subquery
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
