-- ==========================================
-- CuanPintar MVP - Seed Data
-- Production-ready sample data
-- ==========================================

-- ==========================================
-- USERS (with bcrypt hashed password 'demo123')
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6
-- ==========================================

-- Admin User
INSERT INTO users (id, email, password_hash, name, role, status, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@cuanpintar.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Admin CuanPintar', 'admin', 'active', true);

-- Advertiser Users
INSERT INTO users (id, email, password_hash, name, role, company_name, phone, status, is_active) VALUES
('00000000-0000-0000-0000-000000000011', 'sarah@tunaiku.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Sarah Wijaya', 'advertiser', 'Tunaiku', '+6281234567801', 'active', true),
('00000000-0000-0000-0000-000000000012', 'budi@prudential.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Budi Santoso', 'advertiser', 'Prudential Indonesia', '+6281234567802', 'active', true),
('00000000-0000-0000-0000-000000000013', 'dewi@xlaxiata.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Dewi Kumala', 'advertiser', 'XL Axiata', '+6281234567803', 'active', true),
('00000000-0000-0000-0000-000000000014', 'andi@mandiri.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Andi Prasetyo', 'advertiser', 'Bank Mandiri', '+6281234567804', 'active', true),
('00000000-0000-0000-0000-000000000015', 'rini@bca.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Rini Andriani', 'advertiser', 'Bank BCA', '+6281234567805', 'active', true),
('00000000-0000-0000-0000-000000000016', 'fajar@gojek.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Fajar Nugroho', 'advertiser', 'Gojek Indonesia', '+6281234567806', 'active', true),
('00000000-0000-0000-0000-000000000017', 'novi@traveloka.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Novi Rahman', 'advertiser', 'Traveloka', '+6281234567807', 'active', true),
('00000000-0000-0000-0000-000000000018', 'hendra@blibli.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Hendra Wijaya', 'advertiser', 'Blibli', '+6281234567808', 'active', true),
('00000000-0000-0000-0000-000000000019', 'lina@telkomsel.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Lina Marlina', 'advertiser', 'Telkomsel', '+6281234567809', 'active', true),
('00000000-0000-0000-0000-00000000001a', 'rio@accai.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Rio Fernando', 'advertiser', 'ACCA Insurance', '+6281234567810', 'active', true);

-- Partner Users
INSERT INTO users (id, email, password_hash, name, role, company_name, phone, status, is_active) VALUES
('00000000-0000-0000-0000-000000000021', 'media@kompas.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Media Partner Jakarta', 'partner', 'Kompas Media', '+6281234567821', 'active', true),
('00000000-0000-0000-0000-000000000022', 'creator@andika.web.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Andika Creator', 'partner', 'Andika Channel', '+6281234567822', 'active', true),
('00000000-0000-0000-0000-000000000023', 'affiliate@budi.aff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Budi Affiliate', 'partner', 'Budi Network', '+6281234567823', 'active', true),
('00000000-0000-0000-0000-000000000024', 'sales@rani.biz', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Rani Sales', 'partner', 'Rani Sales Team', '+6281234567824', 'active', true),
('00000000-0000-0000-0000-000000000025', 'community@ ibuibukita.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'IbuIbuKita Community', 'partner', 'Ibu-Ibu Kita', '+6281234567825', 'active', true),
('00000000-0000-0000-0000-000000000026', 'agency@digital.marketing', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Digital Marketing Agency', 'partner', 'Digital Agency Pro', '+6281234567826', 'active', true),
('00000000-0000-0000-0000-000000000027', 'creator@mama.cerdas', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'MamaCerdas Channel', 'partner', 'Mama Cerdas', '+6281234567827', 'active', true),
('00000000-0000-0000-0000-000000000028', 'media@tempo.co.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'Tempo Media Network', 'partner', 'Tempo Media', '+6281234567828', 'active', true),
('00000000-0000-0000-0000-000000000029', 'creator@papa.invest', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'PapaInvest Channel', 'partner', 'Papa Invest', '+6281234567829', 'active', true),
('00000000-0000-0000-0000-00000000002a', 'affiliate@money.jago', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rMzO8XxbXLF4lKxW6', 'MoneyJago Network', 'partner', 'Money Jago', '+6281234567830', 'active', true);

-- ==========================================
-- ADVERTISERS
-- ==========================================

INSERT INTO advertisers (id, user_id, company_name, industry, website, status, total_spend, active_programs, verified_at) VALUES
('00000000-0000-0000-0000-100000000011', '00000000-0000-0000-0000-000000000011', 'Tunaiku', 'Finance', 'https://tunaiku.com', 'active', 500000000, 3, NOW()),
('00000000-0000-0000-0000-100000000012', '00000000-0000-0000-0000-000000000012', 'Prudential Indonesia', 'Insurance', 'https://prudential.co.id', 'active', 750000000, 4, NOW()),
('00000000-0000-0000-0000-100000000013', '00000000-0000-0000-0000-000000000013', 'XL Axiata', 'Telecom', 'https://xlaxiata.co.id', 'active', 300000000, 2, NOW()),
('00000000-0000-0000-0000-100000000014', '00000000-0000-0000-0000-000000000014', 'Bank Mandiri', 'Banking', 'https://mandiri.co.id', 'active', 1000000000, 5, NOW()),
('00000000-0000-0000-0000-100000000015', '00000000-0000-0000-0000-000000000015', 'Bank BCA', 'Banking', 'https://bca.co.id', 'active', 800000000, 3, NOW()),
('00000000-0000-0000-0000-100000000016', '00000000-0000-0000-0000-000000000016', 'Gojek Indonesia', 'Tech', 'https://gojek.com', 'active', 600000000, 4, NOW()),
('00000000-0000-0000-0000-100000000017', '00000000-0000-0000-0000-000000000017', 'Traveloka', 'Travel', 'https://traveloka.com', 'active', 400000000, 2, NOW()),
('00000000-0000-0000-0000-100000000018', '00000000-0000-0000-0000-000000000018', 'Blibli', 'E-commerce', 'https://blibli.com', 'active', 350000000, 2, NOW()),
('00000000-0000-0000-0000-100000000019', '00000000-0000-0000-0000-000000000019', 'Telkomsel', 'Telecom', 'https://telkomsel.com', 'active', 450000000, 3, NOW()),
('00000000-0000-0000-0000-10000000001a', '00000000-0000-0000-0000-00000000001a', 'ACCA Insurance', 'Insurance', 'https://accai.co.id', 'active', 200000000, 1, NOW());

-- ==========================================
-- PARTNERS
-- ==========================================

INSERT INTO partners (id, user_id, partner_name, partner_type, niche, location, audience_size, quality_score, fraud_risk, status, total_earnings, total_conversions, verified_at) VALUES
('00000000-0000-0000-0000-200000000021', '00000000-0000-0000-0000-000000000021', 'Kompas Media', 'media', 'General News', 'Jakarta', 5000000, 85, 'low', 'active', 150000000, 5000, NOW()),
('00000000-0000-0000-0000-200000000022', '00000000-0000-0000-0000-000000000022', 'Andika Channel', 'creator', 'Finance & Investment', 'Bandung', 800000, 92, 'low', 'active', 85000000, 2800, NOW()),
('00000000-0000-0000-0000-200000000023', '00000000-0000-0000-0000-000000000023', 'Budi Network', 'affiliate', 'Finance', 'Surabaya', 150000, 78, 'low', 'active', 45000000, 1500, NOW()),
('00000000-0000-0000-0000-200000000024', '00000000-0000-0000-0000-000000000024', 'Rani Sales Team', 'sales', 'Corporate', 'Jakarta', 50000, 88, 'low', 'active', 120000000, 4000, NOW()),
('00000000-0000-0000-0000-200000000025', '00000000-0000-0000-0000-000000000025', 'Ibu-Ibu Kita', 'community', 'Parenting & Family', 'Nationwide', 2000000, 90, 'low', 'active', 200000000, 6500, NOW()),
('00000000-0000-0000-0000-200000000026', '00000000-0000-0000-0000-000000000026', 'Digital Agency Pro', 'agency', 'Digital Marketing', 'Jakarta', 1000000, 82, 'low', 'active', 95000000, 3200, NOW()),
('00000000-0000-0000-0000-200000000027', '00000000-0000-0000-0000-000000000027', 'Mama Cerdas', 'creator', 'Parenting', 'Online', 1200000, 95, 'low', 'active', 180000000, 6000, NOW()),
('00000000-0000-0000-0000-200000000028', '00000000-0000-0000-0000-000000000028', 'Tempo Media', 'media', 'News & Business', 'Jakarta', 3000000, 88, 'low', 'active', 130000000, 4300, NOW()),
('00000000-0000-0000-0000-200000000029', '00000000-0000-0000-0000-000000000029', 'Papa Invest', 'creator', 'Investment & Crypto', 'Online', 450000, 86, 'low', 'active', 75000000, 2500, NOW()),
('00000000-0000-0000-0000-20000000002a', '00000000-0000-0000-0000-00000000002a', 'Money Jago', 'affiliate', 'Fintech', 'Online', 200000, 80, 'low', 'active', 55000000, 1800, NOW());

-- ==========================================
-- PROGRAMS
-- ==========================================

INSERT INTO programs (id, advertiser_id, name, brand_name, industry, description, budget, payout_model, payout_amount, target_volume, achieved_volume, status, start_date, end_date) VALUES
-- Tunaiku Programs
('00000000-0000-0000-0001-100000000011', '00000000-0000-0000-0000-100000000011', 'Tunaiku Pinjaman Online', 'Tunaiku', 'Finance', 'Program pinjaman online mudah untuk pekerja informal dengan tenor fleksibel', 150000000, 'CPL', 25000, 6000, 4200, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000012', '00000000-0000-0000-0000-100000000011', 'Tunaiku Aplikasi Download', 'Tunaiku', 'Finance', 'Download dan registrasi aplikasi Tunaiku', 80000000, 'CPI', 15000, 5000, 3500, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000013', '00000000-0000-0000-0000-100000000011', 'Tunaiku KTA Promotion', 'Tunaiku', 'Finance', 'Kredit tanpa agunan dengan bunga rendah', 200000000, 'CPA', 75000, 3000, 1800, 'active', '2024-03-01', '2024-09-30'),

-- Prudential Programs
('00000000-0000-0000-0001-100000000021', '00000000-0000-0000-0000-100000000012', 'Prudential Proteksi Keluarga', 'Prudential', 'Insurance', 'Asuransi jiwa keluarga dengan perlindungan lengkap', 250000000, 'CPL', 50000, 5000, 3200, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000022', '00000000-0000-0000-0000-100000000012', 'Prudential Critical Illness', 'Prudential', 'Insurance', 'Asuransi penyakit kritis dengan manfaat penuh', 180000000, 'CPA', 150000, 1200, 850, 'active', '2024-02-01', '2024-08-31'),
('00000000-0000-0000-0001-100000000023', '00000000-0000-0000-0000-100000000012', 'Prudential Education Plan', 'Prudential', 'Insurance', 'Asuransi pendidikan untuk anak', 120000000, 'CPL', 45000, 2500, 1600, 'active', '2024-01-15', '2024-12-15'),
('00000000-0000-0000-0001-100000000024', '00000000-0000-0000-0000-100000000012', 'Prudential Medical Card', 'Prudential', 'Insurance', 'Kartu kesehatan dengan cashless di RS partner', 200000000, 'CPA', 100000, 2000, 1100, 'active', '2024-03-01', '2024-10-31'),

-- XL Axiata Programs
('00000000-0000-0000-0001-100000000031', '00000000-0000-0000-0000-100000000013', 'XL Paket Internet', 'XL Axiata', 'Telecom', 'Paket internet murah untuk streaming dan gaming', 100000000, 'CPA', 20000, 5000, 3800, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000032', '00000000-0000-0000-0000-100000000013', 'XL Prabayar Upgrade', 'XL Axiata', 'Telecom', 'Migrasi pelanggan prabayar ke paket lebih tinggi', 80000000, 'CPS', 15000, 6000, 4200, 'active', '2024-02-01', '2024-09-30'),

-- Bank Mandiri Programs
('00000000-0000-0000-0001-100000000041', '00000000-0000-0000-0000-100000000014', 'Mandiri Tabungan Digital', 'Bank Mandiri', 'Banking', 'Buka tabungan online tanpa ke cabang', 150000000, 'CPL', 30000, 5000, 3600, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000042', '00000000-0000-0000-0000-100000000014', 'Mandiri Kartu Kredit', 'Bank Mandiri', 'Banking', 'Kartu kredit dengan berbagai benefit', 200000000, 'CPA', 80000, 2500, 1500, 'active', '2024-01-15', '2024-12-31'),
('00000000-0000-0000-0001-100000000043', '00000000-0000-0000-0000-100000000014', 'Mandiri KPR', 'Bank Mandiri', 'Banking', 'Kredit rumah dengan bunga kompetitif', 180000000, 'CPA', 250000, 700, 420, 'active', '2024-02-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000044', '00000000-0000-0000-0000-100000000014', 'Mandiri Livin', 'Bank Mandiri', 'Banking', 'Download dan aktivasi aplikasi Livin', 100000000, 'CPI', 20000, 5000, 3200, 'active', '2024-03-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000045', '00000000-0000-0000-0000-100000000014', 'Mandiri Deposito', 'Bank Mandiri', 'Banking', 'Deposito online dengan bunga tinggi', 80000000, 'CPL', 35000, 2000, 1100, 'active', '2024-01-01', '2024-12-31'),

-- BCA Programs
('00000000-0000-0000-0001-100000000051', '00000000-0000-0000-0000-100000000015', 'BCA Flazz Activation', 'Bank BCA', 'Banking', 'Aktivasi dan top up Flazz BCA', 120000000, 'CPI', 15000, 8000, 5800, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000052', '00000000-0000-0000-0000-100000000015', 'BCA Digital Account', 'Bank BCA', 'Banking', 'Buka rekening BCA secara digital', 150000000, 'CPL', 40000, 3500, 2100, 'active', '2024-02-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000053', '00000000-0000-0000-0000-100000000015', 'BCA Credit Card', 'Bank BCA', 'Banking', 'Kartu kredit BCA dengan reward menarik', 180000000, 'CPA', 90000, 2000, 1200, 'active', '2024-03-01', '2024-12-31'),

-- Gojek Programs
('00000000-0000-0000-0001-100000000061', '00000000-0000-0000-0000-100000000016', 'Gojek Driver Recruitment', 'Gojek', 'Tech', 'Rekrutmen driver baru Gojek', 200000000, 'CPA', 150000, 1500, 950, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000062', '00000000-0000-0000-0000-100000000016', 'Gojek First Order', 'Gojek', 'Tech', 'User baru GoPay first order', 150000000, 'CPI', 25000, 6000, 4200, 'active', '2024-01-15', '2024-12-31'),
('00000000-0000-0000-0001-100000000063', '00000000-0000-0000-0000-100000000016', 'Gojek Premium Upgrade', 'Gojek', 'Tech', 'Upgrade ke Gojek Premium', 80000000, 'CPA', 30000, 2500, 1500, 'active', '2024-02-01', '2024-09-30'),
('00000000-0000-0000-0001-100000000064', '00000000-0000-0000-0000-100000000016', 'Gojek Merchant Join', 'Gojek', 'Tech', 'Gabung sebagai merchant Gojek', 170000000, 'CPA', 100000, 1700, 980, 'active', '2024-03-01', '2024-12-31'),

-- Traveloka Programs
('00000000-0000-0000-0001-100000000071', '00000000-0000-0000-0000-100000000017', 'Traveloka Flight Booking', 'Traveloka', 'Travel', 'Pemesanan tiket pesawat via Traveloka', 200000000, 'CPS', 35000, 6000, 3800, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000072', '00000000-0000-0000-0000-100000000017', 'Traveloka Hotel Booking', 'Traveloka', 'Travel', 'Booking hotel dengan discount', 200000000, 'CPS', 40000, 5000, 3100, 'active', '2024-01-01', '2024-12-31'),

-- Blibli Programs
('00000000-0000-0000-0001-100000000081', '00000000-0000-0000-0000-100000000018', 'Blibli First Purchase', 'Blibli', 'E-commerce', 'Diskon pertama kali belanja', 180000000, 'CPA', 30000, 6000, 4000, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000082', '00000000-0000-0000-0000-100000000018', 'Blibli Gopay Integration', 'Blibli', 'E-commerce', 'Integrasi pembayaran GoPay', 170000000, 'CPA', 25000, 7000, 4800, 'active', '2024-02-01', '2024-12-31'),

-- Telkomsel Programs
('00000000-0000-0000-0001-100000000091', '00000000-0000-0000-0000-100000000019', 'Telkomsel Paket Data', 'Telkomsel', 'Telecom', 'Paket internet Telkomsel', 200000000, 'CPS', 20000, 10000, 7500, 'active', '2024-01-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000092', '00000000-0000-0000-0000-100000000019', 'Telkomsel BYOD', 'Telkomsel', 'Telecom', 'Bring Your Own Device', 150000000, 'CPA', 35000, 4000, 2800, 'active', '2024-02-01', '2024-12-31'),
('00000000-0000-0000-0001-100000000093', '00000000-0000-0000-0000-100000000019', 'Telkomsel Halo Number', 'Telkomsel', 'Telecom', 'Pindah ke nomor Halo', 100000000, 'CPA', 50000, 2000, 1200, 'active', '2024-03-01', '2024-09-30'),

-- ACCA Insurance Programs
('00000000-0000-0000-0001-1000000000a1', '00000000-0000-0000-0000-10000000001a', 'ACCA Micro Insurance', 'ACCA Insurance', 'Insurance', 'Asuransi mikro terjangkau', 200000000, 'CPL', 30000, 7000, 4800, 'active', '2024-01-01', '2024-12-31');

-- ==========================================
-- SAMPLE CONVERSIONS
-- ==========================================

-- Generate conversions for each program
INSERT INTO conversions (program_id, advertiser_id, partner_id, channel_type, conversion_type, status, payout_amount, quality_score, ip_country, device_type, created_at)
SELECT
    p.id as program_id,
    p.advertiser_id as advertiser_id,
    pt.id as partner_id,
    CASE WHEN pt.partner_type = 'media' THEN 'display'
         WHEN pt.partner_type = 'creator' THEN 'social_media'
         WHEN pt.partner_type = 'affiliate' THEN 'affiliate'
         WHEN pt.partner_type = 'sales' THEN 'content'
         ELSE 'organic' END as channel_type,
    CASE WHEN p.payout_model = 'CPI' THEN 'install'
         WHEN p.payout_model = 'CPA' THEN 'purchase'
         ELSE 'signup' END as conversion_type,
    CASE
        WHEN random() < 0.75 THEN 'valid'
        WHEN random() < 0.90 THEN 'pending'
        WHEN random() < 0.97 THEN 'rejected'
        ELSE 'fraud'
    END as status,
    p.payout_amount as payout_amount,
    CASE
        WHEN random() < 0.80 THEN 100
        WHEN random() < 0.90 THEN 80
        WHEN random() < 0.95 THEN 60
        ELSE 40
    END as quality_score,
    'ID' as ip_country,
    CASE WHEN random() < 0.6 THEN 'mobile' WHEN random() < 0.9 THEN 'desktop' ELSE 'tablet' END as device_type,
    NOW() - (random() * INTERVAL '90 days') as created_at
FROM programs p
CROSS JOIN LATERAL (
    SELECT id FROM partners ORDER BY random() LIMIT 3
) pt
CROSS JOIN LATERAL (
    SELECT generate_series(1, (p.achieved_volume / 3)::int) as seq
) seq;

-- ==========================================
-- SAMPLE PAYOUTS
-- ==========================================

INSERT INTO payouts (partner_id, amount, platform_fee, net_amount, status, payment_method, bank_name, account_number, account_holder, approved_conversions, created_at)
SELECT
    p.id as partner_id,
    (p.total_earnings * 0.8)::bigint as amount,
    (p.total_earnings * 0.2)::bigint as platform_fee,
    (p.total_earnings * 0.8)::bigint as net_amount,
    CASE WHEN random() < 0.7 THEN 'paid' WHEN random() < 0.9 THEN 'approved' ELSE 'pending' END as status,
    'bank_transfer' as payment_method,
    'Bank BCA' as bank_name,
    '1234567890' as account_number,
    p.partner_name as account_holder,
    (p.total_conversions * 0.85)::int as approved_conversions,
    NOW() - (random() * INTERVAL '60 days') as created_at
FROM partners p
WHERE p.total_earnings > 0;

-- ==========================================
-- MEDIA PARTNERS (for media partner inventory)
-- ==========================================

INSERT INTO media_partners (partner_id, media_name, category, region, monthly_reach, monthly_pageviews, available_slots, avg_conversion_rate, quality_score, status)
SELECT
    p.id as partner_id,
    p.partner_name || ' Online' as media_name,
    CASE
        WHEN p.niche LIKE '%news%' THEN 'national_news'
        WHEN p.niche LIKE '%finance%' THEN 'finance'
        WHEN p.niche LIKE '%parenting%' THEN 'parenting'
        WHEN p.niche LIKE '%lifestyle%' THEN 'lifestyle'
        ELSE 'local_news'
    END as category,
    p.location as region,
    (p.audience_size * 0.5)::int as monthly_reach,
    (p.audience_size * 1.5)::int as monthly_pageviews,
    (random() * 10 + 5)::int as available_slots,
    (random() * 3 + 1)::decimal as avg_conversion_rate,
    p.quality_score as quality_score,
    'active' as status
FROM partners p
WHERE p.partner_type = 'media';

-- ==========================================
-- USER PREFERENCES
-- ==========================================

INSERT INTO user_preferences (user_id, email_notifications, push_notifications, language, timezone)
SELECT id, true, true, 'id', 'Asia/Jakarta' FROM users;

-- ==========================================
-- ANNOUNCEMENTS
-- ==========================================

INSERT INTO announcements (title, content, type, is_published, published_at, starts_at, is_dismissible, created_by)
VALUES
('Selamat Datang di CuanPintar!', 'Platform Customer Acquisition OS nomor 1 di Indonesia. Mulai promosikan program dan dapatkan komisi.', 'info', true, NOW(), NOW(), true, '00000000-0000-0000-0000-000000000001'),
('Update Sistem - 15 Juli 2024', 'Kami telah meningkatkan sistem tracking dan fraud detection untuk hasil yang lebih akurat.', 'info', true, NOW(), NOW(), true, '00000000-0000-0000-0000-000000000001'),
('Jadwal Payout Mingguan', 'Payout mingguan akan diproses setiap hari Jumat. Pastikan data pembayaran sudah lengkap.', 'info', true, NOW(), NOW(), false, '00000000-0000-0000-0000-000000000001');

-- ==========================================
-- UPDATE spent_amount based on conversions
-- ==========================================

UPDATE programs p SET spent_amount = subquery.total
FROM (
    SELECT program_id, SUM(payout_amount) as total
    FROM conversions
    WHERE status IN ('valid', 'pending')
    GROUP BY program_id
) subquery
WHERE p.id = subquery.program_id;
