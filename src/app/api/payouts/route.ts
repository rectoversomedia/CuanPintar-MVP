/**
 * Payout API Routes - Protected
 * Partners can view/create their own payouts
 * Admins can manage all payouts
 *
 * Endpoints:
 * GET    /api/payouts             - List payouts
 * POST   /api/payouts             - Create payout request (partner)
 * PATCH  /api/payouts             - Update payout status (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth, requireAdmin, requirePartner, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// In-memory storage for demo mode (should be replaced with database)
const demoPayouts = new Map<string, Payout>();
const demoPaymentMethods = new Map<string, PaymentMethod>();

interface Payout {
  id: string;
  partner_id: string;
  partner_name: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'rejected';
  payment_method: string;
  bank_account?: string;
  bank_name?: string;
  account_holder?: string;
  ewallet_number?: string;
  ewallet_type?: string;
  approved_conversions: number;
  paid_at?: string;
  created_at: string;
  processed_at?: string;
  transaction_id?: string;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  partner_id: string;
  type: 'bank_transfer' | 'gopay' | 'ovo' | 'dana' | 'linkaja';
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  ewallet_number?: string;
  is_default: boolean;
  verified: boolean;
}

// Initialize mock data
const mockPayouts: Payout[] = [
  {
    id: 'payout_001',
    partner_id: 'demo-part-001',
    partner_name: 'JakselNews Media Network',
    amount: 5250000,
    status: 'paid',
    payment_method: 'bank_transfer',
    bank_account: '1234567890',
    bank_name: 'BCA',
    account_holder: 'PT JakselNews Media',
    approved_conversions: 150,
    paid_at: '2024-06-01T00:00:00Z',
    created_at: '2024-05-25T10:00:00Z',
    transaction_id: 'TRX_BCA_001',
  },
];

mockPayouts.forEach(p => demoPayouts.set(p.id, p));

// Validation schemas
const createPayoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  payment_method_id: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const updatePayoutSchema = z.object({
  payout_id: z.string().min(1),
  action: z.enum(['approve', 'process', 'reject', 'fail']),
  notes: z.string().max(500).optional(),
  transaction_id: z.string().optional(),
});

const listPayoutsSchema = z.object({
  status: z.enum(['pending', 'processing', 'paid', 'failed', 'rejected']).optional(),
  partner_id: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/payouts
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const { searchParams } = new URL(request.url);

    // Validate query params
    const queryResult = listPayoutsSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, date_from, date_to, page, limit } = queryResult.data;

    // Partners can only see their own payouts
    let partnerIdFilter = queryResult.data.partner_id;
    if (user.role === 'partner' && user.partnerId) {
      partnerIdFilter = user.partnerId;
    }

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('payouts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) query = query.eq('status', status);
      if (partnerIdFilter) query = query.eq('partner_id', partnerIdFilter);
      if (date_from) query = query.gte('created_at', date_from);
      if (date_to) query = query.lte('created_at', date_to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate stats
      const stats = {
        totalPayouts: count || 0,
        pendingAmount: (data || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        processingAmount: (data || []).filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0),
        paidAmount: (data || []).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      };

      return NextResponse.json({
        success: true,
        data: data || [],
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Demo mode
    let result = Array.from(demoPayouts.values());

    if (status) result = result.filter(p => p.status === status);
    if (partnerIdFilter) result = result.filter(p => p.partner_id === partnerIdFilter);
    if (date_from) result = result.filter(p => p.created_at >= date_from);
    if (date_to) result = result.filter(p => p.created_at <= date_to);

    // Partners can only see their own payouts
    if (user.role === 'partner' && user.partnerId) {
      result = result.filter(p => p.partner_id === user.partnerId);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Stats
    const stats = {
      totalPayouts: result.length,
      pendingAmount: result.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      processingAmount: result.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0),
      paidAmount: result.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    };

    const total = result.length;
    const start = (page - 1) * limit;
    const paginatedResult = result.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginatedResult,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('List payouts error:', error);
    return errorResponse('Internal error', 'Failed to fetch payouts', 500);
  }
}

// POST /api/payouts - Create payout request
export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePartner(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    // Validate body
    const parseResult = createPayoutSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // In production, verify partner has sufficient balance
    // For now, we'll skip balance check in demo mode

    // Get partner's payment method
    let paymentMethod: PaymentMethod | null = null;

    if (isSupabaseConfigured()) {
      // Fetch from database
      const { data: pm } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('partner_id', user.partnerId)
        .eq('is_default', true)
        .single();

      paymentMethod = pm;
    } else {
      // Demo mode - find any payment method for partner
      const methods = Array.from(demoPaymentMethods.values())
        .find(pm => pm.partner_id === user.partnerId && pm.is_default);

      // Use default if none set
      if (!methods) {
        paymentMethod = {
          id: 'pm_default',
          partner_id: user.partnerId!,
          type: 'bank_transfer',
          bank_name: 'BCA',
          account_number: '1234567890',
          account_holder: user.email,
          is_default: true,
          verified: true,
        };
      } else {
        paymentMethod = methods;
      }
    }

    if (!paymentMethod) {
      return errorResponse('Payment method required', 'Please add a payment method first', 400);
    }

    const payout: Payout = {
      id: generateId('payout'),
      partner_id: user.partnerId!,
      partner_name: user.email,
      amount: data.amount,
      status: 'pending',
      payment_method: paymentMethod.type,
      bank_account: paymentMethod.account_number,
      bank_name: paymentMethod.bank_name,
      account_holder: paymentMethod.account_holder,
      ewallet_number: paymentMethod.ewallet_number,
      ewallet_type: paymentMethod.type,
      approved_conversions: 0,
      created_at: new Date().toISOString(),
      notes: data.notes,
    };

    // Store payout
    if (isSupabaseConfigured()) {
      const { data: savedPayout, error } = await supabase
        .from('payouts')
        .insert({
          partner_id: payout.partner_id,
          partner_name: payout.partner_name,
          amount: payout.amount,
          status: payout.status,
          payment_method: payout.payment_method,
          bank_account: payout.bank_account,
          bank_name: payout.bank_name,
          account_holder: payout.account_holder,
          ewallet_number: payout.ewallet_number,
          ewallet_type: payout.ewallet_type,
          notes: payout.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return successResponse(savedPayout, 'Payout request submitted', 201);
    }

    // Demo mode
    demoPayouts.set(payout.id, payout);
    return successResponse(payout, 'Payout request submitted (demo mode)', 201);

  } catch (error) {
    console.error('Create payout error:', error);
    return errorResponse('Internal error', 'Failed to create payout', 500);
  }
}

// PATCH /api/payouts - Update payout status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const body = await request.json();

    // Validate body
    const parseResult = updatePayoutSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { payout_id, action, notes, transaction_id } = parseResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      // Fetch current payout
      const { data: existing, error: fetchError } = await supabase
        .from('payouts')
        .select('*')
        .eq('id', payout_id)
        .single();

      if (fetchError || !existing) {
        return errorResponse('Not found', 'Payout not found', 404);
      }

      // Build update
      const updates: Partial<Payout> = {
        processed_at: new Date().toISOString(),
      };

      switch (action) {
        case 'approve':
          updates.status = 'processing';
          break;
        case 'process':
          updates.status = 'paid';
          updates.paid_at = new Date().toISOString();
          updates.transaction_id = transaction_id || `TRX_${Date.now()}`;
          break;
        case 'reject':
          updates.status = 'rejected';
          updates.notes = notes;
          break;
        case 'fail':
          updates.status = 'failed';
          updates.notes = notes || 'Payment failed';
          break;
      }

      const { data: updated, error: updateError } = await supabase
        .from('payouts')
        .update(updates)
        .eq('id', payout_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return successResponse(updated, `Payout ${action}d successfully`);
    }

    // Demo mode
    const payout = demoPayouts.get(payout_id);
    if (!payout) {
      return errorResponse('Not found', 'Payout not found', 404);
    }

    switch (action) {
      case 'approve':
        payout.status = 'processing';
        payout.processed_at = new Date().toISOString();
        break;
      case 'process':
        payout.status = 'paid';
        payout.paid_at = new Date().toISOString();
        payout.transaction_id = transaction_id || `TRX_${Date.now()}`;
        break;
      case 'reject':
        payout.status = 'rejected';
        payout.notes = notes;
        break;
      case 'fail':
        payout.status = 'failed';
        payout.notes = notes || 'Payment failed';
        break;
    }

    demoPayouts.set(payout_id, payout);
    return successResponse(payout, `Payout ${action}d successfully (demo mode)`);

  } catch (error) {
    console.error('Update payout error:', error);
    return errorResponse('Internal error', 'Failed to update payout', 500);
  }
}
