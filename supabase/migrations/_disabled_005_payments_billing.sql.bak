/**
 * CuanPintar - Payments & Billing Migration
 * Phase 2: Payments & Billing
 *
 * This migration adds:
 * - Wallet system for advertisers and partners
 * - Invoice generation with PPN (VAT)
 * - Refund handling
 * - NPWP validation for tax compliance
 */

-- =============================================================================
-- 1. WALLETS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL, -- references users(id) or advertisers(id)
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('user', 'advertiser', 'partner')),
    currency VARCHAR(3) DEFAULT 'IDR',
    balance DECIMAL(15,2) DEFAULT 0,
    pending_balance DECIMAL(15,2) DEFAULT 0, -- escrowed amount (pending payouts)
    total_earned DECIMAL(15,2) DEFAULT 0,
    total_withdrawn DECIMAL(15,2) DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_wallet_owner UNIQUE(owner_id, owner_type)
);

-- =============================================================================
-- 2. WALLET TRANSACTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'topup', 'withdrawal', 'earning', 'payout', 'refund', 'fee', 'adjustment', 'charge'
    )),
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    reference_type VARCHAR(50), -- 'conversion', 'payout', 'midtrans', 'xendit', 'invoice'
    reference_id UUID,
    description TEXT,
    idempotency_key VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_idempotency_key UNIQUE(wallet_id, idempotency_key)
);

-- =============================================================================
-- 3. INVOICES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    platform_fee DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0.11, -- 11% PPN for Indonesia
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'
    )),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(255),
    payment_method VARCHAR(50),
    billing_address JSONB, -- { street, city, postal_code, province, country }
    npwp_number VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. INVOICE LINE ITEMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. REFUNDS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    wallet_id UUID REFERENCES wallets(id),
    original_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    reason TEXT NOT NULL,
    reason_category VARCHAR(50) CHECK (reason_category IN (
        'duplicate_charge', 'service_issue', 'conversion_rejected', 'billing_error', 'customer_request', 'other'
    )),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'processing', 'completed', 'rejected'
    )),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TAX CONFIGURATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS tax_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_type VARCHAR(20) DEFAULT 'PPN', -- PPN, PPnBM, etc.
    rate DECIMAL(5,2) DEFAULT 0.11, -- 11%
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default PPN config
INSERT INTO tax_config (tax_type, rate, effective_date) VALUES ('PPN', 0.11, '2022-04-01');

-- =============================================================================
-- 7. NPWP VALIDATION - Add to advertisers table
-- =============================================================================

ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS npwp_number VARCHAR(20);
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS npwp_verified BOOLEAN DEFAULT false;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS npwp_verified_at TIMESTAMPTZ;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS tax_address TEXT;
ALTER TABLE advertisers ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true;

-- =============================================================================
-- 8. PAYMENT GATEWAY CONFIG
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_gateway_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway VARCHAR(30) NOT NULL CHECK (gateway IN ('midtrans', 'xendit', 'ovo', 'dana', 'gopay')),
    environment VARCHAR(20) DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
    is_active BOOLEAN DEFAULT true,
    config JSONB, -- { api_key, client_key, merchant_id, etc. }
    webhook_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_gateway_env UNIQUE(gateway, environment)
);

-- =============================================================================
-- 9. PAYMENT TRANSACTIONS (for Midtrans/Xendit)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    gateway VARCHAR(30) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'payout', 'refund')),
    owner_type VARCHAR(20) NOT NULL,
    owner_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'paid', 'failed', 'cancelled', 'expired'
    )),
    gateway_response JSONB,
    payment_type VARCHAR(50), -- bank_transfer, ewallet, qris, etc.
    payment_channel VARCHAR(50),
    va_number VARCHAR(100),
    qr_code TEXT,
    expiry_time TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_id, owner_type);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balance);

-- Wallet transaction indexes
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_reference ON wallet_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_idempotency ON wallet_transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_advertiser ON invoices(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at);

-- Invoice line item indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_program ON invoice_line_items(program_id);

-- Refund indexes
CREATE INDEX IF NOT EXISTS idx_refunds_advertiser ON refunds(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_number ON refunds(refund_number);
CREATE INDEX IF NOT EXISTS idx_refunds_created ON refunds(created_at);

-- Payment transaction indexes
CREATE INDEX IF NOT EXISTS idx_payment_tx_gateway ON payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_tx_owner ON payment_transactions(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_created ON payment_transactions(created_at);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type IN ('topup', 'refund', 'adjustment') THEN
            UPDATE wallets SET
                balance = balance + NEW.net_amount,
                total_earned = total_earned + NEW.net_amount,
                updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF NEW.type IN ('withdrawal', 'payout', 'charge', 'fee') THEN
            UPDATE wallets SET
                balance = balance - NEW.amount,
                total_withdrawn = total_withdrawn + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.wallet_id;
        ELSIF NEW.type = 'earning' THEN
            UPDATE wallets SET
                pending_balance = pending_balance + NEW.amount,
                total_earned = total_earned + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.wallet_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle balance adjustments
        UPDATE wallets SET updated_at = NOW() WHERE id = NEW.wallet_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet transactions
DROP TRIGGER IF EXISTS wallet_balance_trigger ON wallet_transactions;
CREATE TRIGGER wallet_balance_trigger
    AFTER INSERT OR UPDATE ON wallet_transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Function to calculate invoice totals with PPN
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(15,2);
    v_tax_rate DECIMAL(5,2);
    v_tax_amount DECIMAL(15,2);
    v_total DECIMAL(15,2);
BEGIN
    -- Calculate subtotal from line items
    SELECT COALESCE(SUM(total), 0) INTO v_subtotal
    FROM invoice_line_items
    WHERE invoice_id = NEW.invoice_id;

    -- Get tax rate from invoice
    SELECT tax_rate INTO v_tax_rate FROM invoices WHERE id = NEW.invoice_id;
    v_tax_rate := COALESCE(v_tax_rate, 0.11);

    -- Calculate tax and total
    v_tax_amount := ROUND(v_subtotal * v_tax_rate, 2);
    v_total := v_subtotal + v_tax_amount;

    -- Update invoice
    UPDATE invoices SET
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice line items
DROP TRIGGER IF EXISTS invoice_totals_trigger ON invoice_line_items;
CREATE TRIGGER invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_seq INTEGER;
    v_prefix VARCHAR(10);
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');
    v_prefix := 'INV';

    -- Get next sequence for this month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 10 FOR 6) AS INTEGER)
    ), 0) + 1 INTO v_seq
    FROM invoices
    WHERE invoice_number LIKE v_prefix || '-' || v_year || v_month || '-%';

    NEW.invoice_number := v_prefix || '-' || v_year || v_month || '-' || LPAD(v_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice number generation
DROP TRIGGER IF EXISTS invoice_number_trigger ON invoices;
CREATE TRIGGER invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Function to generate refund number
CREATE OR REPLACE FUNCTION generate_refund_number()
RETURNS TRIGGER AS $$
DECLARE
    v_year VARCHAR(4);
    v_month VARCHAR(2);
    v_seq INTEGER;
    v_prefix VARCHAR(10);
BEGIN
    v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');
    v_prefix := 'REF';

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(refund_number FROM 10 FOR 6) AS INTEGER)
    ), 0) + 1 INTO v_seq
    FROM refunds
    WHERE refund_number LIKE v_prefix || '-' || v_year || v_month || '-%';

    NEW.refund_number := v_prefix || '-' || v_year || v_month || '-' || LPAD(v_seq::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for refund number generation
DROP TRIGGER IF EXISTS refund_number_trigger ON refunds;
CREATE TRIGGER refund_number_trigger
    BEFORE INSERT ON refunds
    FOR EACH ROW EXECUTE FUNCTION generate_refund_number();

-- Function to validate NPWP format
CREATE OR REPLACE FUNCTION validate_npwp(npwp_number VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_cleaned VARCHAR(20);
    v_sum INTEGER := 0;
    v_check DIGIT;
    v_weights INTEGER[] := ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    v_mod INTEGER;
BEGIN
    -- Remove dots and dashes
    v_cleaned := REPLACE(REPLACE(npwp_number, '.', ''), '-', '');

    -- Check length (should be 15 or 16 digits)
    IF LENGTH(v_cleaned) NOT IN (15, 16) THEN
        RETURN FALSE;
    END IF;

    -- Check all digits
    IF v_cleaned ~ '[^0-9]' THEN
        RETURN FALSE;
    END IF;

    -- Simplified checksum validation for NPWP
    -- Real NPWP has specific checksum algorithm
    -- This is a basic format check
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to wallets
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to refunds
DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to payment_transactions
DROP TRIGGER IF EXISTS update_payment_tx_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_tx_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE wallets IS 'Wallet balances for advertisers (spend) and partners (earnings)';
COMMENT ON TABLE wallet_transactions IS 'Immutable ledger of all wallet balance changes';
COMMENT ON TABLE invoices IS 'Billing invoices with PPN (VAT) support';
COMMENT ON TABLE invoice_line_items IS 'Line items for invoice breakdown';
COMMENT ON TABLE refunds IS 'Refund requests and processing';
COMMENT ON TABLE tax_config IS 'Tax rate configuration (PPN 11%)';
COMMENT ON TABLE payment_gateway_config IS 'Payment gateway credentials (Midtrans, Xendit, etc.)';
COMMENT ON TABLE payment_transactions IS 'Payment gateway transaction records';

COMMENT ON COLUMN wallets.pending_balance IS 'Escrowed amount - pending payout release';
COMMENT ON COLUMN wallets.total_earned IS 'Cumulative earnings (for partners) or deposits (for advertisers)';
COMMENT ON COLUMN invoices.tax_rate IS 'Indonesia PPN is 11% (effective April 2022)';
COMMENT ON COLUMN wallet_transactions.idempotency_key IS 'Prevent duplicate transactions';
COMMENT ON COLUMN refunds.original_transaction_id IS 'Link to the original wallet transaction being refunded';
