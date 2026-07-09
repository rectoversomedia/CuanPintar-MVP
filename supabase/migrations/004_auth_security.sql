/**
 * CuanPintar - Auth Security Migration
 * Phase 1: Auth & Identity
 *
 * This migration adds:
 * - Account lockout (failed login tracking)
 * - Email verification
 * - Password reset tokens
 * - 2FA methods (TOTP/SMS)
 * - 2FA recovery codes
 * - Session management
 * - Auth audit logging
 */

-- =============================================================================
-- 1. ACCOUNT LOCKOUT - Add columns to users table
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- =============================================================================
-- 2. EMAIL VERIFICATION - Add columns to users table
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;

-- =============================================================================
-- 3. PASSWORD RESET - Add columns to users table
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_attempts INTEGER DEFAULT 0;

-- =============================================================================
-- 4. 2FA METHODS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('totp', 'sms')),
    identifier VARCHAR(255) NOT NULL, -- email for TOTP, phone number for SMS
    secret_encrypted BYTEA, -- TOTP secret (encrypted with AES-256)
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_2fa_type UNIQUE (user_id, type)
);

-- =============================================================================
-- 5. 2FA RECOVERY CODES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_2fa_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL, -- hashed recovery code
    code_index INTEGER NOT NULL, -- position of the code (1-10)
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. SESSION MANAGEMENT TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB, -- { browser, os, device_type, device_name }
    ip_address INET,
    user_agent TEXT,
    fingerprint VARCHAR(255),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false
);

-- =============================================================================
-- 7. AUTH AUDIT LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- login_success, login_failed, logout, password_change, etc.
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    metadata JSONB, -- extra data (e.g., { reason: 'wrong_password', attempts: 3 })
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. API SESSIONS (for API key based auth)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '["track:write"]',
    rate_limit INTEGER DEFAULT 10000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users table indexes for auth performance
CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- 2FA indexes
CREATE INDEX IF NOT EXISTS idx_2fa_user ON user_2fa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_user_type ON user_2fa_methods(user_id, type);
CREATE INDEX IF NOT EXISTS idx_2fa_recovery_user ON user_2fa_recovery_codes(user_id);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_type ON auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip ON auth_audit_logs(ip_address);

-- API sessions indexes
CREATE INDEX IF NOT EXISTS idx_api_sessions_user ON api_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_sessions_token ON api_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_api_sessions_active ON api_sessions(is_active) WHERE is_active = true;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to check if user account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_locked_until TIMESTAMPTZ;
    v_failed_attempts INTEGER;
BEGIN
    SELECT locked_until, failed_login_attempts INTO v_locked_until, v_failed_attempts
    FROM users WHERE id = p_user_id;

    IF v_locked_until IS NOT NULL AND v_locked_until > NOW() THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login_attempts(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_attempts INTEGER;
    v_locked_until TIMESTAMPTZ;
BEGIN
    SELECT failed_login_attempts INTO v_attempts FROM users WHERE id = p_user_id FOR UPDATE;

    v_attempts := COALESCE(v_attempts, 0) + 1;

    -- Lock account after 5 failed attempts (30 minute lockout)
    IF v_attempts >= 5 THEN
        v_locked_until := NOW() + INTERVAL '30 minutes';
    ELSE
        v_locked_until := NULL;
    END IF;

    UPDATE users SET
        failed_login_attempts = v_attempts,
        locked_until = v_locked_until,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to 2fa_methods
DROP TRIGGER IF EXISTS update_user_2fa_methods_updated_at ON user_2fa_methods;
CREATE TRIGGER update_user_2fa_methods_updated_at
    BEFORE UPDATE ON user_2fa_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CONSTRAINTS & CHECKS
-- =============================================================================

-- Ensure recovery codes are unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_recovery_code
    ON user_2fa_recovery_codes(user_id, code_index);

-- Ensure only one primary 2FA method per type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_primary_2fa
    ON user_2fa_methods(user_id, type) WHERE is_primary = true;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE user_2fa_methods IS 'Stores 2FA configurations (TOTP/SMS) for users';
COMMENT ON TABLE user_2fa_recovery_codes IS 'One-time recovery codes for 2FA account recovery';
COMMENT ON TABLE user_sessions IS 'Active user sessions for multi-device support';
COMMENT ON TABLE auth_audit_logs IS 'Immutable audit trail of authentication events';
COMMENT ON TABLE api_sessions IS 'API key based sessions for programmatic access';

COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Timestamp when account lockout expires';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email';
COMMENT ON COLUMN users.email_verification_token IS 'Token sent to user email for verification';
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset flow';
COMMENT ON COLUMN user_2fa_methods.secret_encrypted IS 'AES-256 encrypted TOTP secret';
COMMENT ON COLUMN user_sessions.fingerprint IS 'Browser/device fingerprint for session validation';

-- =============================================================================
-- DATA (for reference, not actual seed)
-- =============================================================================

-- Sample auth audit event types:
-- 'login_success', 'login_failed', 'logout', 'register', 'password_change',
-- 'password_reset_request', 'password_reset_complete', 'email_verification_sent',
-- 'email_verified', '2fa_enabled', '2fa_disabled', '2fa_verification_success',
-- '2fa_verification_failed', 'session_created', 'session_revoked',
-- 'account_locked', 'account_unlocked', 'suspicious_activity'
