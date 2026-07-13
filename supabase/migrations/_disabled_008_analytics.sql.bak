/**
 * CuanPintar - Analytics Migration
 * Phase 5: Analytics & Reporting
 *
 * This migration adds:
 * - Daily aggregated stats
 * - Scheduled reports
 * - Cohort tracking
 * - LTV calculations
 */

-- =============================================================================
-- 1. DAILY STATS (Aggregated for performance)
-- =============================================================================

CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('platform', 'advertiser', 'partner', 'program', 'channel')),
    entity_id UUID, -- NULL for platform-wide
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    payout DECIMAL(15,2) DEFAULT 0,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0, -- click-through rate
    cvr DECIMAL(5,4) DEFAULT 0, -- conversion rate
    epc DECIMAL(15,2) DEFAULT 0, -- earnings per click
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_daily_stats UNIQUE(date, entity_type, entity_id)
);

-- =============================================================================
-- 2. PROGRAM DAILY STATS (More granular)
-- =============================================================================

CREATE TABLE IF NOT EXISTS program_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    channel_type VARCHAR(50),
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    payout_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_program_daily_stats UNIQUE(program_id, date, channel_type, partner_id)
);

-- =============================================================================
-- 3. COHORT ANALYSIS
-- =============================================================================

CREATE TABLE IF NOT EXISTS cohort_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_date DATE NOT NULL, -- First conversion date for this cohort
    cohort_type VARCHAR(20) NOT NULL, -- 'partner', 'advertiser', 'program'
    entity_id UUID, -- partner_id or advertiser_id
    initial_users INTEGER DEFAULT 0, -- Number of new entities in this cohort
    period_month INTEGER NOT NULL, -- 0 = month 0, 1 = month 1, etc.
    retained_users INTEGER DEFAULT 0,
    churned_users INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    retention_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_cohort_period UNIQUE(cohort_date, cohort_type, entity_id, period_month)
);

-- =============================================================================
-- 4. PARTNER LTV (Lifetime Value)
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_ltv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    ltv_tier VARCHAR(20) DEFAULT 'new' CHECK (ltv_tier IN ('new', 'active', 'engaged', 'champion', 'at_risk', 'churned')),
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_payout DECIMAL(15,2) DEFAULT 0,
    avg_monthly_revenue DECIMAL(15,2) DEFAULT 0,
    avg_conversion_value DECIMAL(15,2) DEFAULT 0,
    lifetime_months INTEGER DEFAULT 0,
    last_activity_date DATE,
    predicted_ltv DECIMAL(15,2), -- ML prediction
    churn_probability DECIMAL(5,4) DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_id)
);

-- =============================================================================
-- 5. SCHEDULED REPORTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'summary', 'detailed', 'conversion', 'financial', 'partner_performance',
        'advertiser_performance', 'fraud', 'retention'
    )),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule VARCHAR(20) NOT NULL CHECK (schedule IN ('daily', 'weekly', 'monthly')),
    recipients JSONB NOT NULL, -- [{ email: string, name?: string }]
    filters JSONB, -- { entity_ids?: [], date_range?: {}, status?: [] }
    format VARCHAR(20) DEFAULT 'csv' CHECK (format IN ('csv', 'pdf', 'xlsx', 'email')),
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. REPORT DELIVERY LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES scheduled_reports(id) ON DELETE CASCADE,
    run_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    file_url TEXT,
    file_size INTEGER,
    recipient_count INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. ANOMALY ALERTS
-- =============================================================================

CREATE TABLE IF EXISTS anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL, -- 'conversion_spike', 'fraud_spike', 'revenue_drop'
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    entity_type VARCHAR(30),
    entity_id UUID,
    metric VARCHAR(50),
    current_value DECIMAL(15,2),
    expected_value DECIMAL(15,2),
    deviation_percent DECIMAL(5,2),
    message TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Daily stats indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_entity ON daily_stats(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_lookup ON daily_stats(date, entity_type, entity_id);

-- Program daily stats indexes
CREATE INDEX IF NOT EXISTS idx_program_stats_program ON program_daily_stats(program_id);
CREATE INDEX IF NOT EXISTS idx_program_stats_date ON program_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_program_stats_partner ON program_daily_stats(partner_id);

-- Cohort indexes
CREATE INDEX IF NOT EXISTS idx_cohort_date ON cohort_periods(cohort_date);
CREATE INDEX IF NOT EXISTS idx_cohort_entity ON cohort_periods(cohort_type, entity_id);

-- Partner LTV indexes
CREATE INDEX IF NOT EXISTS idx_partner_ltv_tier ON partner_ltv(ltv_tier);
CREATE INDEX IF NOT EXISTS idx_partner_ltv_churn ON partner_ltv(churn_probability);

-- Scheduled reports indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_owner ON scheduled_reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(is_active, next_run_at) WHERE is_active = true;

-- Report deliveries indexes
CREATE INDEX IF NOT EXISTS idx_report_deliveries_report ON report_deliveries(report_id);
CREATE INDEX IF NOT EXISTS idx_report_deliveries_status ON report_deliveries(status);

-- Anomaly alerts indexes
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_type ON anomaly_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_severity ON anomaly_alerts(severity, is_resolved);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_entity ON anomaly_alerts(entity_type, entity_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to calculate LTV tier
CREATE OR REPLACE FUNCTION calculate_ltv_tier(p_total_revenue DECIMAL)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF p_total_revenue >= 50000000 THEN RETURN 'champion';
    ELSIF p_total_revenue >= 10000000 THEN RETURN 'engaged';
    ELSIF p_total_revenue >= 1000000 THEN RETURN 'active';
    ELSE RETURN 'new';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats(
    p_date DATE,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_clicks INTEGER DEFAULT 0,
    p_conversions INTEGER DEFAULT 0,
    p_revenue DECIMAL DEFAULT 0,
    p_payout DECIMAL DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_stats (
        date, entity_type, entity_id, clicks, conversions, revenue, payout
    ) VALUES (
        p_date, p_entity_type, p_entity_id, p_clicks, p_conversions, p_revenue, p_payout
    )
    ON CONFLICT (date, entity_type, entity_id)
    DO UPDATE SET
        clicks = daily_stats.clicks + p_clicks,
        conversions = daily_stats.conversions + p_conversions,
        revenue = daily_stats.revenue + p_revenue,
        payout = daily_stats.payout + p_payout,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily stats from conversions
CREATE OR REPLACE FUNCTION aggregate_conversion_stats(p_date DATE)
RETURNS VOID AS $$
BEGIN
    -- Platform-wide stats
    INSERT INTO daily_stats (date, entity_type, clicks, conversions, valid_conversions, revenue)
    SELECT
        p_date,
        'platform',
        COALESCE((SELECT SUM(clicks) FROM clicks WHERE DATE(created_at) = p_date), 0),
        COUNT(*) FILTER (WHERE status IN ('valid', 'pending')),
        COUNT(*) FILTER (WHERE status = 'valid'),
        COALESCE(SUM(payout_amount) FILTER (WHERE status = 'valid'), 0)
    FROM conversions
    WHERE DATE(created_at) = p_date
    ON CONFLICT (date, entity_type, entity_id)
    DO UPDATE SET
        clicks = EXCLUDED.clicks,
        conversions = EXCLUDED.conversions,
        valid_conversions = EXCLUDED.valid_conversions,
        revenue = EXCLUDED.revenue;

    -- Per-program stats
    INSERT INTO daily_stats (date, entity_type, entity_id, conversions, revenue)
    SELECT
        p_date,
        'program',
        program_id,
        COUNT(*) FILTER (WHERE status IN ('valid', 'pending')),
        COALESCE(SUM(payout_amount) FILTER (WHERE status = 'valid'), 0)
    FROM conversions
    WHERE DATE(created_at) = p_date AND program_id IS NOT NULL
    GROUP BY program_id
    ON CONFLICT (date, entity_type, entity_id)
    DO UPDATE SET
        conversions = EXCLUDED.conversions,
        revenue = EXCLUDED.revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to update partner LTV
CREATE OR REPLACE FUNCTION update_partner_ltv(p_partner_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_revenue DECIMAL;
    v_total_conversions INTEGER;
    v_total_payout DECIMAL;
    v_avg_monthly DECIMAL;
    v_lifetime_months INTEGER;
    v_last_activity DATE;
    v_tier VARCHAR(20);
BEGIN
    SELECT
        COALESCE(SUM(payout_amount), 0),
        COUNT(*),
        MAX(created_at)::DATE
    INTO v_total_revenue, v_total_conversions, v_last_activity
    FROM conversions
    WHERE partner_id = p_partner_id AND status = 'valid';

    SELECT COALESCE(SUM(amount), 0) INTO v_total_payout
    FROM payouts
    WHERE partner_id = p_partner_id AND status = 'paid';

    v_avg_monthly := CASE
        WHEN v_lifetime_months > 0 THEN v_total_revenue / v_lifetime_months
        ELSE 0
    END;

    v_tier := calculate_ltv_tier(v_total_revenue);

    INSERT INTO partner_ltv (
        partner_id, total_revenue, total_conversions, total_payout,
        avg_monthly_revenue, lifetime_months, last_activity_date, ltv_tier
    ) VALUES (
        p_partner_id, v_total_revenue, v_total_conversions, v_total_payout,
        v_avg_monthly, v_lifetime_months, v_last_activity, v_tier
    )
    ON CONFLICT (partner_id)
    DO UPDATE SET
        total_revenue = v_total_revenue,
        total_conversions = v_total_conversions,
        total_payout = v_total_payout,
        avg_monthly_revenue = v_avg_monthly,
        lifetime_months = v_lifetime_months,
        last_activity_date = v_last_activity,
        ltv_tier = v_tier,
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE daily_stats IS 'Pre-aggregated daily metrics for fast dashboard queries';
COMMENT ON TABLE program_daily_stats IS 'Granular program/channel/partner daily breakdown';
COMMENT ON TABLE cohort_periods IS 'Cohort analysis data for retention tracking';
COMMENT ON TABLE partner_ltv IS 'Partner lifetime value calculations and tiers';
COMMENT ON TABLE scheduled_reports IS 'Automated report generation and delivery';
COMMENT ON TABLE report_deliveries IS 'Report generation execution logs';
COMMENT ON TABLE anomaly_alerts IS 'Automated anomaly detection alerts';

COMMENT ON COLUMN daily_stats.epc IS 'Earnings per click = revenue / clicks';
COMMENT ON COLUMN daily_stats.cvr IS 'Conversion rate = conversions / clicks';
COMMENT ON COLUMN partner_ltv.ltv_tier IS 'partner lifecycle stage: new → active → engaged → champion';
COMMENT ON COLUMN partner_ltv.predicted_ltv IS 'ML-based LTV prediction';
COMMENT ON COLUMN partner_ltv.churn_probability IS '0-1 churn risk score';
