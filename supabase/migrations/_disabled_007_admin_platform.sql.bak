/**
 * CuanPintar - Admin & Platform Migration
 * Phase 4: Admin & Platform Tools
 *
 * This migration adds:
 * - Support tickets
 * - KYC documents
 * - Immutable audit logs
 * - Platform announcements
 */

-- =============================================================================
-- 1. SUPPORT TICKETS
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN (
        'open', 'pending', 'in_progress', 'resolved', 'closed'
    )),
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- =============================================================================
-- 2. SUPPORT MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- visible to staff only
    attachments JSONB, -- [{ name: string, url: string, size: number }]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. KYC DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other'
    )),
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'rejected', 'expired'
    )),
    rejection_reason TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. IMMUTABLE AUDIT LOGS (Enhanced from activity_logs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID, -- users(id) or NULL for system
    actor_type VARCHAR(20) DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'api')),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. PLATFORM ANNOUNCEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance', 'urgent')),
    target_roles JSONB, -- null = all users
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_dismissible BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. USER PREFERENCES (for notifications, etc)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. PLATFORM SETTINGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description, is_public) VALUES
    ('platform_name', '"CuanPintar"', 'Platform display name', true),
    ('support_email', '"support@cuanpintar.com"', 'Support email address', true),
    ('maintenance_mode', 'false', 'Platform maintenance mode', false),
    ('min_payout_amount', '50000', 'Minimum partner payout (IDR)', true),
    ('payout_schedule', '"weekly"', 'Payout schedule: weekly, biweekly, monthly', true),
    ('default_tax_rate', '0.11', 'Default PPN rate', true),
    ('max_conversion_caps', '10000', 'Max conversions per program', false);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);

-- Support messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON support_messages(created_at);

-- KYC indexes
CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_type ON kyc_documents(document_type);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_logs(ip_address);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, starts_at, ends_at) WHERE is_published = true;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_seq INTEGER;
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(ticket_number FROM 10 FOR 6) AS INTEGER)
    ), 0) + 1 INTO v_seq
    FROM support_tickets
    WHERE ticket_number LIKE 'TKT-' || v_year || v_month || '-%';

    NEW.ticket_number := 'TKT-' || v_year || v_month || '-' || LPAD(v_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket number
DROP TRIGGER IF EXISTS ticket_number_trigger ON support_tickets;
CREATE TRIGGER ticket_number_trigger
    BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Function to update ticket timestamps
CREATE OR REPLACE FUNCTION update_ticket_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    IF TG_OP = 'UPDATE' AND NEW.status = 'in_progress' AND OLD.status = 'open' THEN
        NEW.first_response_at = COALESCE(OLD.first_response_at, NOW());
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;

    IF TG_OP = 'UPDATE' AND NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket timestamps
DROP TRIGGER IF EXISTS update_ticket_timestamps ON support_tickets;
CREATE TRIGGER update_ticket_timestamps
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_ticket_timestamps();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_support_messages_updated_at ON support_messages;
CREATE TRIGGER update_support_messages_updated_at
    BEFORE UPDATE ON support_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_kyc_updated_at ON kyc_documents;
CREATE TRIGGER update_kyc_updated_at
    BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
    p_actor_id UUID,
    p_actor_type VARCHAR,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_old_data JSONB,
    p_new_data JSONB,
    p_ip_address INET,
    p_user_agent TEXT,
    p_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        actor_id, actor_type, action, entity_type, entity_id,
        old_data, new_data, ip_address, user_agent, metadata
    ) VALUES (
        p_actor_id, p_actor_type, p_action, p_entity_type, p_entity_id,
        p_old_data, p_new_data, p_ip_address, p_user_agent, p_metadata
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE support_tickets IS 'Customer support ticket system';
COMMENT ON TABLE support_messages IS 'Messages/replies in support tickets';
COMMENT ON TABLE kyc_documents IS 'Identity and business verification documents';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance';
COMMENT ON TABLE announcements IS 'Platform-wide announcements to users';
COMMENT ON TABLE user_preferences IS 'User notification and display preferences';
COMMENT ON TABLE platform_settings IS 'Platform configuration settings';

COMMENT ON COLUMN support_tickets.ticket_number IS 'Auto-generated: TKT-YYYYMM-000001';
COMMENT ON COLUMN support_tickets.first_response_at IS 'Time until first staff response (SLA tracking)';
COMMENT ON COLUMN kyc_documents.verification_status IS 'Pending → Verified or Rejected';
COMMENT ON COLUMN audit_logs.actor_type IS 'user, system, or api';
COMMENT ON COLUMN announcements.target_roles IS 'null = all, otherwise array of roles';
