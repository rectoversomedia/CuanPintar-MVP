# CuanPintar - Manual Supabase Setup

## Quick Setup

1. Go to https://supabase.com/dashboard/project/vediyxsldxfptctwnnqh/sql

2. Run this SQL to create all tables:

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
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

-- ADVERTISERS TABLE
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

-- PARTNERS TABLE
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

-- PROGRAMS TABLE
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

-- CONVERSIONS TABLE
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

-- PAYOUTS TABLE
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

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRACKING LINKS TABLE
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_conversions_program ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner ON conversions(partner_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to read their own data)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Advertisers can read own data" ON advertisers FOR SELECT USING (true);
CREATE POLICY "Partners can read own data" ON partners FOR SELECT USING (true);
CREATE POLICY "Programs can be read by all" ON programs FOR SELECT USING (true);
CREATE POLICY "Advertisers can insert programs" ON programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Advertisers can update programs" ON programs FOR UPDATE USING (true);
CREATE POLICY "Conversions can be read by all" ON conversions FOR SELECT USING (true);
CREATE POLICY "Partners can insert conversions" ON conversions FOR INSERT WITH CHECK (true);
```

3. Click "Run" to execute

4. Refresh your Supabase dashboard to reload schema cache
