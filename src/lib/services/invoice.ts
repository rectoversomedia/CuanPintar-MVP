/**
 * CuanPintar - Invoice Service
 * Phase 2: Payments & Billing
 *
 * Invoice generation with PPN (VAT) calculation
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
  id: string;
  invoice_number: string;
  advertiser_id: string;
  wallet_id?: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  platform_fee: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  payment_reference?: string;
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    province?: string;
    country: string;
  };
  npwp_number?: string;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  program_id?: string;
}

export interface CreateInvoiceResult {
  success: boolean;
  invoice?: Invoice;
  error?: string;
}

export interface InvoiceWithItems extends Invoice {
  line_items: InvoiceLineItem[];
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  advertiserId: string,
  lineItems: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    program_id?: string;
  }>,
  options?: {
    periodStart: string;
    periodEnd: string;
    walletId?: string;
    billingAddress?: Invoice['billing_address'];
    npwpNumber?: string;
    notes?: string;
    dueInDays?: number;
  }
): Promise<CreateInvoiceResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      invoice: {
        id: 'demo-invoice-' + Date.now(),
        invoice_number: 'INV-2026-000001',
        advertiser_id: advertiserId,
        period_start: options?.periodStart || new Date().toISOString(),
        period_end: options?.periodEnd || new Date().toISOString(),
        subtotal: lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
        platform_fee: 0,
        tax_rate: 0.11,
        tax_amount: lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 0.11,
        total: lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) * 1.11,
        currency: 'IDR',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    };
  }

  try {
    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxRate = 0.11; // PPN 11%
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    // Calculate due date
    const dueInDays = options?.dueInDays || 30;
    const dueDate = new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        advertiser_id: advertiserId,
        wallet_id: options?.walletId,
        period_start: options?.periodStart,
        period_end: options?.periodEnd,
        subtotal,
        platform_fee: 0,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        currency: 'IDR',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        billing_address: options?.billingAddress,
        npwp_number: options?.npwpNumber,
        notes: options?.notes,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Failed to create invoice:', invoiceError);
      return { success: false, error: 'Failed to create invoice' };
    }

    // Create line items
    const lineItemInserts = lineItems.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      program_id: item.program_id,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemInserts);

    if (itemsError) {
      console.error('Failed to create line items:', itemsError);
      // Rollback invoice
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return { success: false, error: 'Failed to create line items' };
    }

    return {
      success: true,
      invoice: invoice as Invoice,
    };
  } catch (err) {
    console.error('Create invoice error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceWithItems | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: 'demo-invoice',
      invoice_number: 'INV-2026-000001',
      advertiser_id: 'demo',
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      subtotal: 1000000,
      platform_fee: 0,
      tax_rate: 0.11,
      tax_amount: 110000,
      total: 1110000,
      currency: 'IDR',
      status: 'draft',
      issue_date: '2026-01-01',
      due_date: '2026-01-31',
      line_items: [],
    };
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) {
    return null;
  }

  const { data: lineItems } = await supabase
    .from('invoice_line_items')
    .select('*')
    .eq('invoice_id', invoiceId);

  return {
    ...invoice,
    line_items: (lineItems || []) as InvoiceLineItem[],
  };
}

/**
 * Get invoices for an advertiser
 */
export async function getAdvertiserInvoices(
  advertiserId: string,
  options?: {
    status?: InvoiceStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ invoices: Invoice[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { invoices: [], total: 0 };
  }

  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  let query = supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to get invoices:', error);
    return { invoices: [], total: 0 };
  }

  return {
    invoices: (data || []) as Invoice[],
    total: count || 0,
  };
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  options?: {
    paymentReference?: string;
    paidAt?: string;
  }
): Promise<CreateInvoiceResult> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const updates: Partial<Invoice> = { status };

  if (status === 'paid') {
    updates.paid_at = options?.paidAt || new Date().toISOString();
    updates.payment_reference = options?.paymentReference;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Failed to update invoice' };
  }

  return { success: true, invoice: data as Invoice };
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(
  invoiceId: string,
  paymentReference: string
): Promise<CreateInvoiceResult> {
  return updateInvoiceStatus(invoiceId, 'paid', { paymentReference });
}

/**
 * Check for overdue invoices and update status
 */
export async function checkOverdueInvoices(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('status', 'sent')
    .lt('due_date', today)
    .select('id');

  if (error) {
    console.error('Failed to check overdue invoices:', error);
    return 0;
  }

  return (data as unknown[])?.length || 0;
}

/**
 * Cancel invoice
 */
export async function cancelInvoice(invoiceId: string): Promise<CreateInvoiceResult> {
  return updateInvoiceStatus(invoiceId, 'cancelled');
}

/**
 * Generate invoice PDF data (for PDF generation service)
 */
export async function generateInvoicePDFData(
  invoiceId: string
): Promise<{
  success: boolean;
  data?: {
    invoice: InvoiceWithItems;
    advertiser: {
      company_name: string;
      npwp_number?: string;
      billing_address?: string;
    };
    platform: {
      name: string;
      address: string;
      npwp: string;
    };
  };
  error?: string;
}> {
  const invoice = await getInvoice(invoiceId);

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        invoice,
        advertiser: {
          company_name: 'Demo Company',
          npwp_number: '01.234.567.8-123.456',
          billing_address: 'Jl. Demo No. 123, Jakarta',
        },
        platform: {
          name: 'CuanPintar',
          address: 'Jl. Sudirman No. 1, Jakarta',
          npwp: '12.345.678.9-012.345',
        },
      },
    };
  }

  // Get advertiser info
  const { data: advertiser } = await supabase
    .from('advertisers')
    .select('company_name, npwp_number')
    .eq('id', invoice.advertiser_id)
    .single();

  return {
    success: true,
    data: {
      invoice,
      advertiser: {
        company_name: advertiser?.company_name || 'Unknown',
        npwp_number: advertiser?.npwp_number,
        billing_address: invoice.billing_address
          ? `${invoice.billing_address.street}, ${invoice.billing_address.city} ${invoice.billing_address.postal_code}`
          : undefined,
      },
      platform: {
        name: 'PT CuanPintar Teknologi',
        address: 'Jl. Sudirman No. 1, Jakarta Pusat 10220',
        npwp: '12.345.678.9-012.345',
      },
    },
  };
}

/**
 * Calculate PPN (VAT) amount
 */
export function calculatePPN(subtotal: number, rate: number = 0.11): {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
} {
  const taxAmount = Math.round(subtotal * rate * 100) / 100;
  return {
    subtotal,
    taxRate: rate,
    taxAmount,
    total: Math.round((subtotal + taxAmount) * 100) / 100,
  };
}

/**
 * Validate NPWP format
 */
export function isValidNPWP(npwp: string): boolean {
  // Remove dots and dashes
  const cleaned = npwp.replace(/[.-]/g, '');

  // Check length (15 digits)
  if (cleaned.length !== 15) return false;

  // Check all digits
  if (!/^\d+$/.test(cleaned)) return false;

  return true;
}

export default {
  createInvoice,
  getInvoice,
  getAdvertiserInvoices,
  updateInvoiceStatus,
  markInvoicePaid,
  checkOverdueInvoices,
  cancelInvoice,
  generateInvoicePDFData,
  calculatePPN,
  isValidNPWP,
};
