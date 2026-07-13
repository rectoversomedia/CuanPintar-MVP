/**
 * CuanPintar - Links System Migration
 * Phase 6: QR Code Links & Per-Link Analytics
 *
 * This migration creates:
 * - tracking_links table for managing unique tracking URLs
 * - link_daily_stats table for per-link analytics
 * - Updates clicks table with link_id reference
 */

-- ============================================================================
-- 1. TRACKING_LINKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tracking_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
    channel_type VARCHAR(50),

    -- Unique identifier for short link (e.g., "abc123")
    unique_code VARCHAR(20) UNIQUE NOT NULL,

    -- Full tracking URL
    tracking_url TEXT NOT NULL,

    -- Short URL (e.g., "cuanpintar.com/r/abc123")
    short_url TEXT,

    -- Metadata
    title VARCHAR(255),
    description TEXT,

    -- Denormalized stats for fast reads
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    pending_conversions INTEGER DEFAULT 0,
    rejected_conversions INTEGER DEFAULT 0,
    fraud_conversions INTEGER DEFAULT 0,
    total_payout DECIMAL(15,2) DEFAULT 0,

    -- Settings
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate links for same partner/program/channel combination
    CONSTRAINT unique_partner_program_channel UNIQUE(partner_id, program_id, channel_type)
);

-- Indexes for tracking_links
CREATE INDEX idx_tracking_links_partner ON tracking_links(partner_id);
CREATE INDEX idx_tracking_links_program ON tracking_links(program_id);
CREATE INDEX idx_tracking_links_unique_code ON tracking_links(unique_code);
CREATE INDEX idx_tracking_links_channel ON tracking_links(channel_type);
CREATE INDEX idx_tracking_links_active ON tracking_links(is_active) WHERE is_active = true;
CREATE INDEX idx_tracking_links_created ON tracking_links(created_at DESC);

-- ============================================================================
-- 2. LINK_DAILY_STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS link_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID REFERENCES tracking_links(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,

    -- Basic metrics
    clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    valid_conversions INTEGER DEFAULT 0,
    payout_amount DECIMAL(15,2) DEFAULT 0,

    -- Device breakdown
    desktop_clicks INTEGER DEFAULT 0,
    mobile_clicks INTEGER DEFAULT 0,
    tablet_clicks INTEGER DEFAULT 0,

    -- Browser breakdown (JSONB for flexibility)
    browser_stats JSONB DEFAULT '{}',

    -- Country breakdown (top countries as JSONB)
    country_stats JSONB DEFAULT '{}',

    -- UTM source breakdown
    utm_source_stats JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate stats for same link/date
    CONSTRAINT unique_link_date UNIQUE(link_id, date)
);

-- Indexes for link_daily_stats
CREATE INDEX idx_link_daily_stats_link ON link_daily_stats(link_id);
CREATE INDEX idx_link_daily_stats_date ON link_daily_stats(date);
CREATE INDEX idx_link_daily_stats_link_date ON link_daily_stats(link_id, date DESC);

-- ============================================================================
-- 3. UPDATE CLICKS TABLE - Add link_id reference
-- ============================================================================
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS link_id UUID REFERENCES tracking_links(id) ON DELETE SET NULL;

-- Create index for link_id on clicks
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks(link_id) WHERE link_id IS NOT NULL;

-- ============================================================================
-- 4. QR_CODE_PRESETS TABLE (Optional customization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS qr_code_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,

    -- Visual customization
    foreground_color VARCHAR(7) DEFAULT '#000000',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    size INTEGER DEFAULT 300,
    margin INTEGER DEFAULT 4,
    error_correction_level VARCHAR(1) DEFAULT 'M',

    -- Logo (optional)
    logo_url TEXT,
    logo_size INTEGER DEFAULT 50,
    logo_margin INTEGER DEFAULT 10,

    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_preset_name UNIQUE(user_id, name)
);

CREATE INDEX idx_qr_presets_user ON qr_code_presets(user_id);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

/**
 * Generate a unique short code for links
 */
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    chars TEXT := 'abcdefghijkmnpqrstuvwxyz23456789'; -- Removed confusing chars: 0, 1, l, o
    code VARCHAR(20);
    exists_count INTEGER;
BEGIN
    -- Try up to 10 times to generate a unique code
    FOR i IN 1..10 LOOP
        code := '';
        FOR j IN 1..8 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        -- Check if code already exists
        SELECT COUNT(*) INTO exists_count FROM tracking_links WHERE unique_code = code;
        IF exists_count = 0 THEN
            RETURN code;
        END IF;
    END LOOP;

    -- If we couldn't find a unique code, use a longer one with timestamp
    RETURN substr(md5(random()::text || now()::text), 1, 12);
END;
$$ LANGUAGE plpgsql;

/**
 * Update tracking link stats after a click
 */
CREATE OR REPLACE FUNCTION update_link_stats_on_click(
    p_link_id UUID,
    p_device_type VARCHAR(20),
    p_country VARCHAR(10),
    p_utm_source VARCHAR(255),
    p_is_unique BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_existing_id UUID;
BEGIN
    -- Update denormalized stats on tracking_links
    UPDATE tracking_links SET
        total_clicks = total_clicks + 1,
        updated_at = NOW()
    WHERE id = p_link_id;

    -- Upsert daily stats
    SELECT id INTO v_existing_id
    FROM link_daily_stats
    WHERE link_id = p_link_id AND date = v_today;

    IF v_existing_id IS NOT NULL THEN
        -- Update existing daily stats
        UPDATE link_daily_stats SET
            clicks = clicks + 1,
            unique_clicks = unique_clicks + CASE WHEN p_is_unique THEN 1 ELSE 0 END,
            desktop_clicks = desktop_clicks + CASE WHEN p_device_type = 'desktop' THEN 1 ELSE 0 END,
            mobile_clicks = mobile_clicks + CASE WHEN p_device_type = 'mobile' THEN 1 ELSE 0 END,
            tablet_clicks = tablet_clicks + CASE WHEN p_device_type = 'tablet' THEN 1 ELSE 0 END,
            country_stats = jsonb_set(
                COALESCE(country_stats, '{}'),
                ARRAY[p_country],
                to_jsonb(COALESCE((country_stats->>p_country)::int, 0) + 1)
            ),
            utm_source_stats = jsonb_set(
                COALESCE(utm_source_stats, '{}'),
                ARRAY[COALESCE(p_utm_source, 'direct')],
                to_jsonb(COALESCE((utm_source_stats->>COALESCE(p_utm_source, 'direct'))::int, 0) + 1)
            )
        WHERE id = v_existing_id;
    ELSE
        -- Insert new daily stats
        INSERT INTO link_daily_stats (
            link_id, date, clicks, unique_clicks,
            desktop_clicks, mobile_clicks, tablet_clicks,
            country_stats, utm_source_stats
        ) VALUES (
            p_link_id, v_today, 1, CASE WHEN p_is_unique THEN 1 ELSE 0 END,
            CASE WHEN p_device_type = 'desktop' THEN 1 ELSE 0 END,
            CASE WHEN p_device_type = 'mobile' THEN 1 ELSE 0 END,
            CASE WHEN p_device_type = 'tablet' THEN 1 ELSE 0 END,
            CASE WHEN p_country IS NOT NULL THEN
                jsonb_build_object(p_country, 1)
            ELSE '{}' END,
            jsonb_build_object(COALESCE(p_utm_source, 'direct'), 1)
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

/**
 * Update tracking link stats after conversion
 */
CREATE OR REPLACE FUNCTION update_link_stats_on_conversion(
    p_link_id UUID,
    p_status VARCHAR(50),
    p_payout DECIMAL(15,2) DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    v_valid INTEGER := 0;
    v_pending INTEGER := 0;
    v_rejected INTEGER := 0;
    v_fraud INTEGER := 0;
BEGIN
    -- Determine status
    v_valid := CASE WHEN p_status = 'valid' THEN 1 ELSE 0 END;
    v_pending := CASE WHEN p_status = 'pending' THEN 1 ELSE 0 END;
    v_rejected := CASE WHEN p_status = 'rejected' THEN 1 ELSE 0 END;
    v_fraud := CASE WHEN p_status = 'fraud' THEN 1 ELSE 0 END;

    -- Update denormalized stats on tracking_links
    UPDATE tracking_links SET
        total_conversions = total_conversions + 1,
        valid_conversions = valid_conversions + v_valid,
        pending_conversions = pending_conversions + v_pending,
        rejected_conversions = rejected_conversions + v_rejected,
        fraud_conversions = fraud_conversions + v_fraud,
        total_payout = total_payout + CASE WHEN p_status = 'valid' THEN p_payout ELSE 0 END,
        updated_at = NOW()
    WHERE id = p_link_id;

    -- Update daily stats if link_id exists
    IF p_link_id IS NOT NULL THEN
        UPDATE link_daily_stats SET
            conversions = conversions + 1,
            valid_conversions = valid_conversions + v_valid,
            payout_amount = payout_amount + CASE WHEN p_status = 'valid' THEN p_payout ELSE 0 END
        WHERE link_id = p_link_id AND date = CURRENT_DATE;
    END IF;
END;
$$ LANGUAGE plpgsql;

/**
 * Get link analytics summary
 */
CREATE OR REPLACE FUNCTION get_link_analytics(
    p_link_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_clicks BIGINT,
    unique_clicks BIGINT,
    total_conversions BIGINT,
    valid_conversions BIGINT,
    conversion_rate DECIMAL(10,4),
    avg_daily_clicks DECIMAL(10,2),
    top_country VARCHAR(10),
    top_device VARCHAR(20),
    peak_hour INTEGER
) AS $$
DECLARE
    v_stats RECORD;
    v_total_clicks BIGINT := 0;
    v_unique_clicks BIGINT := 0;
    v_conversions BIGINT := 0;
    v_valid BIGINT := 0;
    v_days_count INTEGER;
BEGIN
    -- Get from denormalized stats
    SELECT total_clicks, total_conversions, valid_conversions
    INTO v_stats
    FROM tracking_links
    WHERE id = p_link_id;

    v_total_clicks := COALESCE(v_stats.total_clicks, 0);
    v_conversions := COALESCE(v_stats.total_conversions, 0);
    v_valid := COALESCE(v_stats.valid_conversions, 0);

    -- Get daily stats for unique clicks and other metrics
    SELECT
        SUM(unique_clicks) as unique_clicks,
        COUNT(*) as days_count,
        (
            SELECT key
            FROM jsonb_each_text(country_stats)
            ORDER BY value DESC
            LIMIT 1
        ) as top_country,
        CASE
            WHEN SUM(desktop_clicks) >= SUM(mobile_clicks) AND SUM(desktop_clicks) >= SUM(tablet_clicks) THEN 'desktop'
            WHEN SUM(mobile_clicks) >= SUM(tablet_clicks) THEN 'mobile'
            ELSE 'tablet'
        END as top_device
    INTO v_unique_clicks, v_days_count, top_country, top_device
    FROM link_daily_stats
    WHERE link_id = p_link_id
    AND date >= CURRENT_DATE - (p_days || ' days')::INTERVAL;

    total_clicks := v_total_clicks;
    unique_clicks := COALESCE(v_unique_clicks, 0);
    total_conversions := v_conversions;
    valid_conversions := v_valid;
    conversion_rate := CASE WHEN v_total_clicks > 0 THEN
        ROUND((v_valid::DECIMAL / v_total_clicks) * 10000, 4)
    ELSE 0 END;
    avg_daily_clicks := CASE WHEN v_days_count > 0 THEN
        ROUND(v_total_clicks::DECIMAL / v_days_count, 2)
    ELSE 0 END;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

/**
 * Get link performance over time
 */
CREATE OR REPLACE FUNCTION get_link_performance_trend(
    p_link_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    clicks INTEGER,
    unique_clicks INTEGER,
    conversions INTEGER,
    valid_conversions INTEGER,
    payout DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lds.date,
        lds.clicks,
        lds.unique_clicks,
        lds.conversions,
        lds.valid_conversions,
        lds.payout_amount as payout
    FROM link_daily_stats lds
    WHERE lds.link_id = p_link_id
    AND lds.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    ORDER BY lds.date ASC;
END;
$$ LANGUAGE plpgsql;

/**
 * Get device breakdown for a link
 */
CREATE OR REPLACE FUNCTION get_link_device_breakdown(p_link_id UUID)
RETURNS TABLE (
    device_type VARCHAR(20),
    clicks INTEGER,
    percentage DECIMAL(5,2)
) AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COALESCE(SUM(desktop_clicks + mobile_clicks + tablet_clicks), 1) INTO v_total
    FROM link_daily_stats
    WHERE link_id = p_link_id;

    RETURN QUERY
    SELECT
        'desktop' as device_type,
        COALESCE(SUM(desktop_clicks), 0) as clicks,
        ROUND(COALESCE(SUM(desktop_clicks), 0)::DECIMAL / NULLIF(v_total, 0) * 100, 2) as percentage
    FROM link_daily_stats
    WHERE link_id = p_link_id;

    RETURN QUERY
    SELECT
        'mobile' as device_type,
        COALESCE(SUM(mobile_clicks), 0) as clicks,
        ROUND(COALESCE(SUM(mobile_clicks), 0)::DECIMAL / NULLIF(v_total, 0) * 100, 2) as percentage
    FROM link_daily_stats
    WHERE link_id = p_link_id;

    RETURN QUERY
    SELECT
        'tablet' as device_type,
        COALESCE(SUM(tablet_clicks), 0) as clicks,
        ROUND(COALESCE(SUM(tablet_clicks), 0)::DECIMAL / NULLIF(v_total, 0) * 100, 2) as percentage
    FROM link_daily_stats
    WHERE link_id = p_link_id;
END;
$$ LANGUAGE plpgsql;

/**
 * Get geographic breakdown for a link
 */
CREATE OR REPLACE FUNCTION get_link_geo_breakdown(p_link_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    country VARCHAR(10),
    clicks INTEGER,
    conversions INTEGER,
    percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH country_data AS (
        SELECT
            key as country,
            value::int as clicks
        FROM link_daily_stats, jsonb_each_text(link_daily_stats.country_stats)
        WHERE link_id = p_link_id
    ),
    totals AS (
        SELECT SUM(clicks) as total_clicks FROM country_data
    )
    SELECT
        cd.country,
        cd.clicks,
        COALESCE(SUM(lds.valid_conversions), 0)::int as conversions,
        ROUND(cd.clicks::DECIMAL / NULLIF(t.total_clicks, 0) * 100, 2) as percentage
    FROM country_data cd
    CROSS JOIN totals t
    GROUP BY cd.country, cd.clicks, t.total_clicks
    ORDER BY cd.clicks DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

/**
 * Auto-update updated_at timestamp
 */
CREATE OR REPLACE FUNCTION update_tracking_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracking_links
DROP TRIGGER IF EXISTS update_tracking_links_updated_at ON tracking_links;
CREATE TRIGGER update_tracking_links_updated_at
    BEFORE UPDATE ON tracking_links
    FOR EACH ROW EXECUTE FUNCTION update_tracking_links_updated_at();

-- Create trigger for qr_code_presets
DROP TRIGGER IF EXISTS update_qr_code_presets_updated_at ON qr_code_presets;
CREATE TRIGGER update_qr_code_presets_updated_at
    BEFORE UPDATE ON qr_code_presets
    FOR EACH ROW EXECUTE FUNCTION update_tracking_links_updated_at();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_code_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can only see their own links
CREATE POLICY "Partners can view own links"
    ON tracking_links FOR SELECT
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can create own links"
    ON tracking_links FOR INSERT
    WITH CHECK (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can update own links"
    ON tracking_links FOR UPDATE
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can delete own links"
    ON tracking_links FOR DELETE
    USING (
        partner_id IN (
            SELECT id FROM partners WHERE user_id = auth.uid()
        )
    );

-- Policy: Partners can view their link daily stats
CREATE POLICY "Partners can view own link stats"
    ON link_daily_stats FOR SELECT
    USING (
        link_id IN (
            SELECT id FROM tracking_links
            WHERE partner_id IN (
                SELECT id FROM partners WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Users can manage their QR presets
CREATE POLICY "Users can manage own QR presets"
    ON qr_code_presets FOR ALL
    USING (user_id = auth.uid());

-- Admin can access all
CREATE POLICY "Admins can view all links"
    ON tracking_links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 7. SEED DEFAULT QR PRESET
-- ============================================================================
-- Insert default QR preset for a user (to be used as template)
-- This will be done programmatically when user first creates a QR code

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================
COMMENT ON TABLE tracking_links IS 'Unique tracking links with QR code support and per-link analytics';
COMMENT ON TABLE link_daily_stats IS 'Daily aggregated statistics per tracking link';
COMMENT ON TABLE qr_code_presets IS 'User-customizable QR code visual presets';

COMMENT ON COLUMN tracking_links.unique_code IS 'Short alphanumeric code for shortened URLs (e.g., abc123)';
COMMENT ON COLUMN tracking_links.short_url IS 'Full shortened URL (e.g., https://cuanpintar.com/r/abc123)';
COMMENT ON COLUMN tracking_links.total_clicks IS 'Denormalized total click count for fast reads';
COMMENT ON COLUMN tracking_links.total_conversions IS 'Denormalized total conversion count';
COMMENT ON COLUMN link_daily_stats.country_stats IS 'JSON object with country code as key and click count as value';
COMMENT ON COLUMN link_daily_stats.utm_source_stats IS 'JSON object with UTM source as key and click count as value';
