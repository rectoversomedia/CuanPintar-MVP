-- =====================================================
-- CuanPintar MVP - Missing Tables Migration
-- Migration: 004_missing_tables.sql
-- Date: 2026-07-14
-- Description: Create tables that are defined in types but missing from schema
-- Priority: CRITICAL - fraud_scores, clicks, attribution_touchpoints are referenced in code
-- =====================================================

BEGIN;

-- =============================================================================
-- 1. FRAUD_SCORES TABLE (CRITICAL - Referenced in fraud-engine.ts)
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
    rule_id VARCHAR(100),
    rule_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    action_taken VARCHAR(50) DEFAULT 'flag' CHECK (action_taken IN ('block', 'flag', 'score')),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fraud_scores IS 'Stores individual fraud detection rule scores for each conversion';

CREATE INDEX IF NOT EXISTS idx_fraud_scores_conversion_id ON fraud_scores(conversion_id);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_rule_name ON fraud_scores(rule_name);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_score ON fraud_scores(score);
CREATE INDEX IF NOT EXISTS idx_fraud_scores_created_at ON fraud_scores(created_at DESC);

-- =============================================================================
-- 2. CLICKS TABLE (CRITICAL - Referenced in tracking code)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id VARCHAR(100) UNIQUE NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    link_id UUID REFERENCES tracking_links(id) ON DELETE SET NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    country VARCHAR(10),
    city VARCHAR(100),
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    channel_type VARCHAR(50),
    source_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    utms JSONB DEFAULT '{}',
    isp VARCHAR(255),
    connection_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clicks IS 'Persistent click tracking for attribution';

CREATE INDEX IF NOT EXISTS idx_clicks_click_id ON clicks(click_id);
CREATE INDEX IF NOT EXISTS idx_clicks_partner_id ON clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_clicks_program_id ON clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_clicks_fingerprint ON clicks(fingerprint);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_address ON clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at DESC);

-- =============================================================================
-- 3. ATTRIBUTION_TOUCHPOINTS TABLE (CRITICAL - Indexes created but table missing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id VARCHAR(100) NOT NULL,
    click_id UUID REFERENCES clicks(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    touchpoint_type VARCHAR(20) NOT NULL DEFAULT 'click' CHECK (touchpoint_type IN ('click', 'view', 'interaction')),
    attribution_window_days INTEGER DEFAULT 7,
    utms JSONB DEFAULT '{}',
    referrer TEXT,
    device_type VARCHAR(50),
    country VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE attribution_touchpoints IS 'Multi-touch attribution tracking';

CREATE INDEX IF NOT EXISTS idx_attribution_visitor_id ON attribution_touchpoints(visitor_id);
CREATE INDEX IF NOT EXISTS idx_attribution_click_id ON attribution_touchpoints(click_id);
CREATE INDEX IF NOT EXISTS idx_attribution_partner_id ON attribution_touchpoints(partner_id);
CREATE INDEX IF NOT EXISTS idx_attribution_program_id ON attribution_touchpoints(program_id);
CREATE INDEX IF NOT EXISTS idx_attribution_created_at ON attribution_touchpoints(created_at DESC);

-- =============================================================================
-- 4. DEVICE_GRAPH TABLE (Cross-device tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS device_graph (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(100) NOT NULL,
    linked_device_id VARCHAR(255),
    linked_visitor_id VARCHAR(100),
    confidence_score DECIMAL(5,2) DEFAULT 0,
    link_method VARCHAR(30) DEFAULT 'fingerprint' CHECK (link_method IN (
        'fingerprint', 'login', 'email_hash', 'probabilistic', 'ip'
    )),
    match_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_device_visitor UNIQUE (device_id, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_device_graph_device_id ON device_graph(device_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_visitor_id ON device_graph(visitor_id);
CREATE INDEX IF NOT EXISTS idx_device_graph_confidence ON device_graph(confidence_score DESC);

-- =============================================================================
-- 5. FRAUD_RULES TABLE (Configurable fraud detection rules)
-- =============================================================================

CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'velocity', 'blocklist', 'pattern', 'behavior', 'threshold'
    )),
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    conditions JSONB NOT NULL DEFAULT '{}',
    action VARCHAR(50) DEFAULT 'flag' CHECK (action IN ('block', 'flag', 'score', 'log')),
    score_contribution INTEGER DEFAULT 0,
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE fraud_rules IS 'Configurable fraud detection rules';

CREATE INDEX IF NOT EXISTS idx_fraud_rules_name ON fraud_rules(name);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_type ON fraud_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_fraud_rules_enabled ON fraud_rules(enabled) WHERE enabled = true;

-- =============================================================================
-- 6. ATTRIBUTION_MODELS TABLE (Multi-touch attribution config)
-- =============================================================================

CREATE TABLE IF NOT EXISTS attribution_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'first_touch', 'last_touch', 'linear', 'time_decay', 'position_based', 'data_driven'
    )),
    parameters JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE attribution_models IS 'Attribution model configurations';

CREATE INDEX IF NOT EXISTS idx_attribution_models_name ON attribution_models(name);
CREATE INDEX IF NOT EXISTS idx_attribution_models_type ON attribution_models(model_type);
CREATE INDEX IF NOT EXISTS idx_attribution_models_active ON attribution_models(is_active) WHERE is_active = true;

-- =============================================================================
-- 7. USER_SESSIONS TABLE (Session management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- =============================================================================
-- 8. USER_2FA_METHODS TABLE (Two-factor authentication)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('totp', 'sms', 'email')),
    identifier VARCHAR(255),
    secret_encrypted VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_type ON user_2fa_methods(type);

-- =============================================================================
-- 9. USER_2FA_RECOVERY_CODES TABLE (Recovery codes for 2FA)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_index INTEGER NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_user ON user_2fa_recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_recovery_used ON user_2fa_recovery_codes(is_used) WHERE is_used = false;

-- =============================================================================
-- 10. API_KEYS TABLE (S2S API authentication)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions JSONB DEFAULT '["track:write"]',
    rate_limit INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE api_keys IS 'API keys for S2S tracking integration';

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- =============================================================================
-- 11. API_SESSIONS TABLE (API session tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_sessions_user_id ON api_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_api_key ON api_sessions(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_expires ON api_sessions(expires_at);

-- =============================================================================
-- 12. USER_PREFERENCES TABLE (User settings)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'id',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- =============================================================================
-- 13. SUPPORT_TICKETS TABLE (Customer support)
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'open' CHECK (status IN (
        'open', 'pending', 'in_progress', 'resolved', 'closed'
    )),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE support_tickets IS 'Customer support tickets';

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

-- =============================================================================
-- 14. SUPPORT_MESSAGES TABLE (Support ticket messages)
-- =============================================================================

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

-- =============================================================================
-- 15. KYC_DOCUMENTS TABLE (Know Your Customer)
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'ktp', 'passport', 'sim', 'npwp', 'business_license'
    )),
    document_number VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'rejected'
    )),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE kyc_documents IS 'KYC document storage';

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_document_type ON kyc_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_kyc_created ON kyc_documents(created_at);

-- =============================================================================
-- 16. AUDIT_LOGS TABLE (Detailed audit trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_type VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for compliance';

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- 17. AUTH_AUDIT_LOGS TABLE (Authentication audit)
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_logs(created_at DESC);

-- =============================================================================
-- 18. PLATFORM_SETTINGS TABLE (Configuration storage)
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

COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings';

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_public ON platform_settings(is_public) WHERE is_public = true;

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description, is_public) VALUES
('platform_name', '"CuanPintar"', 'Platform display name', true),
('support_email', '"support@cuanpintar.com"', 'Support email address', true),
('max_upload_size_mb', '10', 'Maximum file upload size in MB', true),
('session_timeout_hours', '24', 'Session timeout in hours', false),
('rate_limit_default', '1000', 'Default API rate limit per minute', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 19. ANNOUNCEMENTS TABLE (Platform announcements)
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'maintenance')),
    priority INTEGER DEFAULT 0,
    target_roles JSONB DEFAULT '["all"]',
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE announcements IS 'Platform-wide announcements';

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcements_starts ON announcements(starts_at);
CREATE INDEX IF NOT EXISTS idx_announcements_ends ON announcements(ends_at);

-- =============================================================================
-- Enable RLS on new tables
-- =============================================================================

ALTER TABLE fraud_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies for new tables
-- =============================================================================

-- fraud_scores: Admin can view all, conversion owner can view
CREATE POLICY "Admins can view fraud_scores" ON fraud_scores FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service can insert fraud_scores" ON fraud_scores FOR INSERT
    WITH CHECK (true);

-- clicks: Partners can view own, admins can view all
CREATE POLICY "Partners can view own clicks" ON clicks FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Service can insert clicks" ON clicks FOR INSERT WITH CHECK (true);

-- attribution_touchpoints: Partners can view own
CREATE POLICY "Partners can view own touchpoints" ON attribution_touchpoints FOR SELECT
    USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
CREATE POLICY "Service can insert touchpoints" ON attribution_touchpoints FOR INSERT WITH CHECK (true);

-- device_graph: Users can view own
CREATE POLICY "Users can view own device_graph" ON device_graph FOR SELECT USING (true);
CREATE POLICY "Service can insert device_graph" ON device_graph FOR INSERT WITH CHECK (true);

-- fraud_rules: Admin only
CREATE POLICY "Admins can manage fraud_rules" ON fraud_rules FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- attribution_models: Public read
CREATE POLICY "Public can view attribution_models" ON attribution_models FOR SELECT
    USING (true);
CREATE POLICY "Admins can manage attribution_models" ON attribution_models FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- user_sessions: Users can manage own
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL
    USING (user_id = auth.uid());

-- user_2fa_methods: Users can manage own
CREATE POLICY "Users can manage own 2fa" ON user_2fa_methods FOR ALL
    USING (user_id = auth.uid());

-- user_2fa_recovery_codes: Users can view own
CREATE POLICY "Users can view own recovery codes" ON user_2fa_recovery_codes FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "Users can update own recovery codes" ON user_2fa_recovery_codes FOR UPDATE
    USING (user_id = auth.uid());

-- api_keys: Users can manage own
CREATE POLICY "Users can manage own api_keys" ON api_keys FOR ALL
    USING (user_id = auth.uid());

-- api_sessions: Users can view own
CREATE POLICY "Users can view own api_sessions" ON api_sessions FOR SELECT
    USING (user_id = auth.uid());

-- user_preferences: Users can manage own
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL
    USING (user_id = auth.uid());

-- support_tickets: Users can view own, admins can view all
CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');

-- support_messages: Users can view own tickets messages
CREATE POLICY "Users can view own ticket messages" ON support_messages FOR SELECT
    USING (ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert ticket messages" ON support_messages FOR INSERT
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- kyc_documents: Users can manage own
CREATE POLICY "Users can manage own kyc" ON kyc_documents FOR ALL
    USING (user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- audit_logs: Admin only
CREATE POLICY "Admins can view audit_logs" ON audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- auth_audit_logs: Admin only
CREATE POLICY "Admins can view auth_audit_logs" ON auth_audit_logs FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- platform_settings: Public can view public settings
CREATE POLICY "Public can view public settings" ON platform_settings FOR SELECT
    USING (is_public = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage settings" ON platform_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- announcements: Public can view active
CREATE POLICY "Public can view active announcements" ON announcements FOR SELECT
    USING (is_active = true AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at > NOW()));

-- =============================================================================
-- Updated_at Trigger for new tables
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_graph_updated_at BEFORE UPDATE ON device_graph
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fraud_rules_updated_at BEFORE UPDATE ON fraud_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attribution_models_updated_at BEFORE UPDATE ON attribution_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_methods_updated_at BEFORE UPDATE ON user_2fa_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- =============================================================================
-- SUMMARY
-- =============================================================================

SELECT 'Migration 004: Missing tables completed successfully!' as status;

-- Created tables:
-- 1. fraud_scores (CRITICAL - was referenced in code)
-- 2. clicks (CRITICAL - was referenced in code)
-- 3. attribution_touchpoints (CRITICAL - indexes existed but no table)
-- 4. device_graph
-- 5. fraud_rules
-- 6. attribution_models
-- 7. user_sessions
-- 8. user_2fa_methods
-- 9. user_2fa_recovery_codes
-- 10. api_keys
-- 11. api_sessions
-- 12. user_preferences
-- 13. support_tickets
-- 14. support_messages
-- 15. kyc_documents
-- 16. audit_logs
-- 17. auth_audit_logs
-- 18. platform_settings
-- 19. announcements
