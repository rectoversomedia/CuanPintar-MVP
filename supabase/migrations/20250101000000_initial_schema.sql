-- =====================================================
-- CuanPintar MVP - Database Migration
-- Version: 2025.01.00
-- Description: Initial schema with pricing model
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =====================================================
-- ADVERTISERS TABLE
-- =====================================================
CREATE TABLE advertisers (
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

CREATE INDEX idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX idx_advertisers_status ON advertisers(status);
CREATE INDEX idx_advertisers_company ON advertisers(company_name);

-- =====================================================
-- PARTNERS TABLE
-- =====================================================
CREATE TABLE partners (
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

    -- Earnings tracking
    total_earnings DECIMAL(15,2) DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_payout DECIMAL(15,2) DEFAULT 0,

    -- Performance stats
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

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_fraud_risk ON partners(fraud_risk);
CREATE INDEX idx_partners_quality ON partners(quality_score);

-- =====================================================
-- PROGRAMS TABLE
-- =====================================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    industry VARCHAR(100),
    description TEXT,
    objectives JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',

    -- Budget & Volume
    budget DECIMAL(15,2) NOT NULL,
    target_volume INTEGER NOT NULL,

    -- PRICING MODEL - Core Business Logic
    payout_model VARCHAR(50) NOT NULL CHECK (payout_model IN ('CPL', 'CPA', 'CPI', 'CPS', 'hybrid')),

    -- Harga ke Advertiser (yang advertiser bayar ke kita)
    advertiser_price DECIMAL(15,2) NOT NULL,

    -- Yang partner dapet (dari kita)
    partner_payout DECIMAL(15,2) NOT NULL,

    -- Profit kita per conversion
    platform_profit DECIMAL(15,2) GENERATED ALWAYS AS (advertiser_price - partner_payout) STORED,

    -- Calculated totals (will be updated via triggers)
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,

    -- Financial totals
    total_advertiser_cost DECIMAL(15,2) DEFAULT 0,
    total_partner_payout DECIMAL(15,2) DEFAULT 0,
    total_platform_profit DECIMAL(15,2) DEFAULT 0,

    -- Quality metrics
    avg_quality_score DECIMAL(5,2) DEFAULT 0,
    avg_fraud_rate DECIMAL(5,2) DEFAULT 0,

    -- Channel allocation
    channels JSONB DEFAULT '[]',

    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'rejected')),
    start_date DATE,
    end_date DATE,

    notes TEXT,
    internal_notes TEXT, -- Notes only visible to platform admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_programs_advertiser ON programs(advertiser_id);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_dates ON programs(start_date, end_date);
CREATE INDEX idx_programs_created ON programs(created_at);

-- =====================================================
-- PROGRAM PARTNERS (Many-to-Many)
-- =====================================================
CREATE TABLE program_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    application_note TEXT,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(program_id, partner_id)
);

CREATE INDEX idx_program_partners_program ON program_partners(program_id);
CREATE INDEX idx_program_partners_partner ON program_partners(partner_id);
CREATE INDEX idx_program_partners_status ON program_partners(status);

-- =====================================================
-- CONVERSIONS TABLE
-- =====================================================
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

    program_name VARCHAR(255),
    partner_name VARCHAR(255),

    -- Conversion details
    conversion_type VARCHAR(100) NOT NULL,
    user_identifier VARCHAR(500), -- hashed email/phone
    customer_data JSONB DEFAULT '{}', -- encrypted customer info

    -- Partner link info
    link_id UUID, -- references unique_links(id)
    channel_type VARCHAR(50),

    -- Technical tracking
    ip_address VARCHAR(45),
    device_id VARCHAR(255),
    fingerprint VARCHAR(255),
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),

    -- PRICING BREAKDOWN - Critical for business
    advertiser_price DECIMAL(15,2) NOT NULL, -- Harga ke advertiser
    partner_payout DECIMAL(15,2) NOT NULL, -- Yang partner dapet
    platform_profit DECIMAL(15,2) NOT NULL, -- Profit kita

    -- Status & Quality
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'rejected', 'fraud')),
    quality_score INTEGER DEFAULT 100,
    fraud_signals JSONB DEFAULT '[]',
    fraud_reason TEXT,

    -- Validation
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP,
    validation_note TEXT,

    -- Attribution
    attributed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversions_program ON conversions(program_id);
CREATE INDEX idx_conversions_partner ON conversions(partner_id);
CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_created ON conversions(created_at);
CREATE INDEX idx_conversions_ip ON conversions(ip_address);
CREATE INDEX idx_conversions_fingerprint ON conversions(fingerprint);
CREATE INDEX idx_conversions_link ON conversions(link_id);

-- =====================================================
-- UNIQUE LINKS TABLE
-- =====================================================
CREATE TABLE unique_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    link_code VARCHAR(50) UNIQUE NOT NULL,

    full_url TEXT NOT NULL,
    short_url TEXT,
    qr_code_data TEXT,

    -- Stats
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    earnings DECIMAL(15,2) DEFAULT 0,

    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(partner_id, program_id) -- One link per partner-program combination
);

CREATE INDEX idx_unique_links_partner ON unique_links(partner_id);
CREATE INDEX idx_unique_links_program ON unique_links(program_id);
CREATE INDEX idx_unique_links_code ON unique_links(link_code);
CREATE INDEX idx_unique_links_active ON unique_links(is_active);

-- =====================================================
-- PAYOUTS TABLE
-- =====================================================
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

    -- Amount partner dapet (dari kita)
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR',

    -- Conversion breakdown
    conversion_ids UUID[],
    approved_conversions INTEGER DEFAULT 0,

    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'rejected')),

    -- Payment details
    payment_method VARCHAR(50),
    bank_name VARCHAR(100),
    bank_account VARCHAR(255),
    account_holder VARCHAR(255),

    -- Processing
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    paid_at TIMESTAMP,
    failure_reason TEXT,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payouts_partner ON payouts(partner_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created ON payouts(created_at);

-- =====================================================
-- FRAUD BLOCKLIST TABLE
-- =====================================================
CREATE TABLE fraud_blocklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ip', 'email', 'email_domain', 'device_id', 'fingerprint')),
    value VARCHAR(500) NOT NULL,
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    added_by UUID REFERENCES users(id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(type, value)
);

CREATE INDEX idx_fraud_blocklist_type ON fraud_blocklist(type);
CREATE INDEX idx_fraud_blocklist_active ON fraud_blocklist(is_active);

-- =====================================================
-- FRAUD SCORES TABLE (Audit trail)
-- =====================================================
CREATE TABLE fraud_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversion_id UUID REFERENCES conversions(id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    action_taken VARCHAR(50),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_scores_conversion ON fraud_scores(conversion_id);

-- =====================================================
-- PAYMENT METHODS TABLE
-- =====================================================
CREATE TABLE partner_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('bank_transfer', 'gopay', 'ovo', 'dana', 'linkaja', 'qris')),

    -- Bank transfer
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),

    -- E-wallet
    ewallet_number VARCHAR(50),

    is_default BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_methods_partner ON partner_payment_methods(partner_id);

-- =====================================================
-- INVOICES TABLE (Optional - if needed for billing)
-- =====================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    advertiser_id UUID REFERENCES advertisers(id),

    -- Amount dari advertiser
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,

    -- Conversion summary
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    conversion_ids UUID[],

    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

    due_date DATE,
    paid_at TIMESTAMP,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_advertiser ON invoices(advertiser_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Update program stats when conversion changes
CREATE OR REPLACE FUNCTION update_program_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE programs
        SET
            total_conversions = total_conversions + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.program_id;

        IF NEW.status = 'valid' THEN
            UPDATE programs
            SET
                valid_conversions = valid_conversions + 1,
                total_advertiser_cost = total_advertiser_cost + NEW.advertiser_price,
                total_partner_payout = total_partner_payout + NEW.partner_payout,
                total_platform_profit = total_platform_profit + NEW.platform_profit
            WHERE id = NEW.program_id;
        ELSIF NEW.status = 'pending' THEN
            UPDATE programs SET pending_conversions = pending_conversions + 1 WHERE id = NEW.program_id;
        ELSIF NEW.status IN ('rejected', 'fraud') THEN
            UPDATE programs
            SET
                rejected_conversions = rejected_conversions + 1,
                fraud_conversions = fraud_conversions + 1
            WHERE id = NEW.program_id;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != NEW.status THEN
            -- Decrement old status
            IF OLD.status = 'valid' THEN
                UPDATE programs
                SET
                    valid_conversions = valid_conversions - 1,
                    total_advertiser_cost = total_advertiser_cost - OLD.advertiser_price,
                    total_partner_payout = total_partner_payout - OLD.partner_payout,
                    total_platform_profit = total_platform_profit - OLD.platform_profit
                WHERE id = NEW.program_id;
            ELSIF OLD.status = 'pending' THEN
                UPDATE programs SET pending_conversions = pending_conversions - 1 WHERE id = NEW.program_id;
            END IF;

            -- Increment new status
            IF NEW.status = 'valid' THEN
                UPDATE programs
                SET
                    valid_conversions = valid_conversions + 1,
                    total_advertiser_cost = total_advertiser_cost + NEW.advertiser_price,
                    total_partner_payout = total_partner_payout + NEW.partner_payout,
                    total_platform_profit = total_platform_profit + NEW.platform_profit
                WHERE id = NEW.program_id;
            ELSIF NEW.status = 'pending' THEN
                UPDATE programs SET pending_conversions = pending_conversions + 1 WHERE id = NEW.program_id;
            ELSIF NEW.status IN ('rejected', 'fraud') THEN
                UPDATE programs
                SET
                    rejected_conversions = rejected_conversions + 1,
                    fraud_conversions = fraud_conversions + 1
                WHERE id = NEW.program_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conversion_stats
    AFTER INSERT OR UPDATE ON conversions
    FOR EACH ROW EXECUTE FUNCTION update_program_stats();

-- Update partner stats when conversion changes
CREATE OR REPLACE FUNCTION update_partner_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE partners
        SET
            total_conversions = total_conversions + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.partner_id;

        IF NEW.status = 'valid' THEN
            UPDATE partners
            SET
                valid_conversions = valid_conversions + 1,
                total_earnings = total_earnings + NEW.partner_payout,
                pending_payout = pending_payout + NEW.partner_payout,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.partner_id;
        ELSIF NEW.status = 'pending' THEN
            UPDATE partners SET pending_conversions = pending_conversions + 1 WHERE id = NEW.partner_id;
        ELSIF NEW.status IN ('rejected', 'fraud') THEN
            UPDATE partners
            SET
                rejected_conversions = rejected_conversions + 1,
                fraud_conversions = fraud_conversions + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.partner_id;
        END IF;

        -- Update fraud rate
        UPDATE partners
        SET fraud_rate = CASE
            WHEN total_conversions > 0 THEN
                ROUND(((fraud_conversions + rejected_conversions)::DECIMAL / total_conversions * 100, 2)
            ELSE 0
        END,
        conversion_rate = CASE
            WHEN total_conversions > 0 THEN
                ROUND((valid_conversions)::DECIMAL / total_conversions * 100, 2)
            ELSE 0
        END
        WHERE id = NEW.partner_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partner_stats
    AFTER INSERT ON conversions
    FOR EACH ROW EXECUTE FUNCTION update_partner_stats();

-- =====================================================
-- SEED DATA (Demo)
-- =====================================================

-- Admin user
INSERT INTO users (id, name, email, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@cuanpintar.com', 'admin');

-- Sample advertisers
INSERT INTO users (id, name, email, role) VALUES
    ('00000000-0000-0000-0000-000000000011', 'Sarah Wijaya', 'sarah@tunaiku.com', 'advertiser');

INSERT INTO advertisers (id, user_id, company_name, industry, status) VALUES
    ('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000011', 'Tunaiku', 'Financial Services', 'active');

-- Sample partners
INSERT INTO users (id, name, email, role) VALUES
    ('00000000-0000-0000-0000-000000000021', 'Budi Santoso', 'budi@jakselnews.com', 'partner');

INSERT INTO partners (id, user_id, partner_name, partner_type, fraud_risk, status, quality_score, fraud_rate, total_conversions, valid_conversions, fraud_conversions, total_earnings) VALUES
    ('00000000-0000-0000-0002-000000000021', '00000000-0000-0000-0000-000000000021', 'JakselNews Media Network', 'media', 'low', 'active', 92, 4.0, 500, 450, 20, 25000000);

-- Sample program with pricing
INSERT INTO programs (id, advertiser_id, name, payout_model, budget, target_volume, advertiser_price, partner_payout, total_conversions, valid_conversions, total_advertiser_cost, total_partner_payout, total_platform_profit, status) VALUES
    ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0001-000000000011', 'Tunaiku App Install + Registration', 'CPA', 60000000, 2000, 30000, 5000, 1500, 1400, 42000000, 7000000, 35000000, 'active');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE programs IS 'Marketing programs with pricing model:
- advertiser_price: Price advertiser pays to us (per conversion)
- partner_payout: Amount partner receives (from us)
- platform_profit: Our margin = advertiser_price - partner_payout';

COMMENT ON TABLE conversions IS 'Conversion tracking with full pricing breakdown:
- advertiser_price: Billable amount to advertiser
- partner_payout: Payable amount to partner
- platform_profit: Our earnings per conversion';

COMMENT ON TABLE partners IS 'Partner tracking with fraud metrics:
- fraud_rate: Percentage of fraudulent/rejected conversions
- quality_score: Overall quality rating (0-100)
- pending_payout: Amount earned but not yet paid out';
