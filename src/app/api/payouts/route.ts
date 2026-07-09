/**
 * Payout API Routes
 *
 * Endpoints:
 * GET    /api/payouts             - List payouts
 * POST   /api/payouts             - Create payout request
 * PUT    /api/payouts/:id         - Update payout (approve/process)
 * GET    /api/payouts/stats        - Payout statistics
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
const payouts = new Map<string, Payout>();
const paymentMethods = new Map<string, PaymentMethod>();

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
    partner_id: 'part_001',
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
  {
    id: 'payout_002',
    partner_id: 'part_002',
    partner_name: 'Finance Creator Jakarta',
    amount: 3500000,
    status: 'processing',
    payment_method: 'bank_transfer',
    bank_account: '9876543210',
    bank_name: 'Mandiri',
    account_holder: 'Budi Santoso',
    approved_conversions: 140,
    created_at: '2024-06-02T11:00:00Z',
  },
  {
    id: 'payout_003',
    partner_id: 'part_003',
    partner_name: 'Parenting Community Indonesia',
    amount: 2800000,
    status: 'pending',
    payment_method: 'gopay',
    ewallet_number: '081234567890',
    ewallet_type: 'gopay',
    approved_conversions: 56,
    created_at: '2024-06-03T10:00:00Z',
  },
];

mockPayouts.forEach(p => payouts.set(p.id, p));

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    partner_id: 'part_001',
    type: 'bank_transfer',
    bank_name: 'BCA',
    account_number: '1234567890',
    account_holder: 'PT JakselNews Media',
    is_default: true,
    verified: true,
  },
  {
    id: 'pm_002',
    partner_id: 'part_001',
    type: 'gopay',
    ewallet_number: '081234567890',
    is_default: false,
    verified: true,
  },
];

mockPaymentMethods.forEach(pm => paymentMethods.set(pm.id, pm));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/payouts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const partnerId = searchParams.get('partner_id');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let result = Array.from(payouts.values());

  // Filters
  if (status) result = result.filter(p => p.status === status);
  if (partnerId) result = result.filter(p => p.partner_id === partnerId);
  if (dateFrom) result = result.filter(p => p.created_at >= dateFrom);
  if (dateTo) result = result.filter(p => p.created_at <= dateTo);

  // Sort by date
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Stats
  const stats = {
    totalPayouts: result.length,
    pendingAmount: result.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    processingAmount: result.filter(p => p.status === 'processing').reduce((sum, p) => sum + p.amount, 0),
    paidAmount: result.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    totalPaid: result.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  };

  // Pagination
  const total = result.length;
  const start = (page - 1) * limit;
  const paginatedResult = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginatedResult,
    stats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/payouts - Create payout request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get partner's payment method
    const methods = Array.from(paymentMethods.values())
      .filter(pm => pm.partner_id === body.partner_id && pm.is_default);

    const method = methods[0];

    if (!method) {
      return NextResponse.json({
        success: false,
        error: 'No payment method configured. Please add a payment method first.',
      }, { status: 400 });
    }

    const payout: Payout = {
      id: generateId('payout'),
      partner_id: body.partner_id,
      partner_name: body.partner_name,
      amount: body.amount,
      status: 'pending',
      payment_method: method.type,
      bank_account: method.account_number,
      bank_name: method.bank_name,
      account_holder: method.account_holder,
      ewallet_number: method.ewallet_number,
      ewallet_type: method.type,
      approved_conversions: body.approved_conversions || 0,
      created_at: new Date().toISOString(),
    };

    payouts.set(payout.id, payout);

    // In production, this would trigger:
    // 1. Email notification to partner
    // 2. Webhook to payment gateway
    // 3. SMS notification

    return NextResponse.json({
      success: true,
      data: payout,
      message: 'Payout request submitted successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create payout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payout request',
    }, { status: 400 });
  }
}

// PATCH /api/payouts - Update payout status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { payout_id, action, notes } = body;

    const payout = payouts.get(payout_id);
    if (!payout) {
      return NextResponse.json({
        success: false,
        error: 'Payout not found',
      }, { status: 404 });
    }

    switch (action) {
      case 'approve':
        payout.status = 'processing';
        payout.processed_at = new Date().toISOString();
        // In production: trigger payment gateway
        break;

      case 'process':
        // Simulate payment processing
        payout.status = 'paid';
        payout.paid_at = new Date().toISOString();
        payout.transaction_id = `TRX_${payout.payment_method}_${Date.now()}`;
        break;

      case 'reject':
        payout.status = 'rejected';
        payout.notes = notes;
        break;

      case 'fail':
        payout.status = 'failed';
        payout.notes = notes || 'Payment failed';
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }

    payouts.set(payout_id, payout);

    // In production, trigger webhooks and notifications
    // await triggerWebhook('payout.updated', payout);

    return NextResponse.json({
      success: true,
      data: payout,
      message: `Payout ${action}d successfully`,
    });

  } catch (error) {
    console.error('Update payout error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update payout',
    }, { status: 400 });
  }
}
