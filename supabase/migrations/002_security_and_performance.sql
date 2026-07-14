-- CuanPintar Database Migration
-- Migration: 002_security_and_performance.sql
-- Description: Add Row Level Security (RLS) policies and performance indexes

-- Enable RLS on all tables
-- ============================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Advertisers table
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own profile"
  ON advertisers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Advertisers can update own profile"
  ON advertisers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage advertisers"
  ON advertisers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Partners table
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own profile"
  ON partners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can update own profile"
  ON partners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Programs table
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM advertisers WHERE id = programs.advertiser_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Advertisers can create own programs"
  ON programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM advertisers WHERE id = advertiser_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advertisers can update own programs"
  ON programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM advertisers WHERE id = programs.advertiser_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Advertisers can delete own programs"
  ON programs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM advertisers WHERE id = programs.advertiser_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Conversions table
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers can view own conversions"
  ON conversions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM programs WHERE id = conversions.program_id AND advertiser_id IN (
        SELECT id FROM advertisers WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM partners WHERE id = conversions.partner_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Partners can view own conversions"
  ON conversions FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payouts table
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own payouts"
  ON payouts FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage payouts"
  ON payouts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tracking links table
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own tracking links"
  ON tracking_links FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Partners can create tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Support tickets table
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NOTE: This migration only contains indexes for tables already defined in 001_initial_schema.sql
-- Tables fraud_scores, clicks, attribution_touchpoints indexes are now in migration 004_missing_tables.sql
-- (Indexes were referencing non-existent tables - fixed by moving them to 004)

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Advertisers indexes
CREATE INDEX IF NOT EXISTS idx_advertisers_user_id ON advertisers(user_id);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON advertisers(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_created_at ON advertisers(created_at DESC);

-- Partners indexes
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_partner_type ON partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_quality_score ON partners(quality_score);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at DESC);

-- Programs indexes
CREATE INDEX IF NOT EXISTS idx_programs_advertiser_id ON programs(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_payout_model ON programs(payout_model);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_programs_start_date ON programs(start_date);
CREATE INDEX IF NOT EXISTS idx_programs_end_date ON programs(end_date);

-- Tracking links indexes
CREATE INDEX IF NOT EXISTS idx_tracking_links_partner_id ON tracking_links(partner_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_program_id ON tracking_links(program_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_unique_code ON tracking_links(unique_code);
CREATE INDEX IF NOT EXISTS idx_tracking_links_is_active ON tracking_links(is_active);
CREATE INDEX IF NOT EXISTS idx_tracking_links_created_at ON tracking_links(created_at DESC);

-- Conversions indexes (CRITICAL for high-volume tracking)
CREATE INDEX IF NOT EXISTS idx_conversions_program_id ON conversions(program_id);
CREATE INDEX IF NOT EXISTS idx_conversions_partner_id ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint ON conversions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_conversions_ip_address ON conversions(ip_address);
CREATE INDEX IF NOT EXISTS idx_conversions_device_id ON conversions(device_id);
CREATE INDEX IF NOT EXISTS idx_conversions_conversion_type ON conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_conversions_channel_type ON conversions(channel_type);
CREATE INDEX IF NOT EXISTS idx_conversions_fraud_score ON conversions(fraud_score);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversions_program_status ON conversions(program_id, status);
CREATE INDEX IF NOT EXISTS idx_conversions_partner_status ON conversions(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_status ON conversions(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_conversions_fingerprint_created ON conversions(fingerprint, created_at DESC);

-- NOTE: Removed indexes for clicks, attribution_touchpoints, fraud_scores
-- These are now in migration 004_missing_tables.sql with their CREATE TABLE statements

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_partner_id ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts(created_at DESC);

-- Fraud blocklist indexes
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_type_value ON fraud_blocklist(type, value) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_fraud_blocklist_created_at ON fraud_blocklist(created_at DESC);

-- NOTE: Removed indexes for fraud_scores, support_tickets, audit_logs
-- These are now in migration 004_missing_tables.sql with their CREATE TABLE statements

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- NOTE: Removed indexes for support_tickets and audit_logs
-- These are now in migration 004_missing_tables.sql with their CREATE TABLE statements

-- ============================================
-- UPDATED TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON advertisers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracking_links_updated_at BEFORE UPDATE ON tracking_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_channels_updated_at BEFORE UPDATE ON program_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_partners_updated_at BEFORE UPDATE ON media_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
