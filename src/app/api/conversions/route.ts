/**
 * Conversion API Routes - Connected to Supabase
 *
 * Endpoints:
 * GET    /api/conversions           - List conversions
 * POST   /api/conversions           - Create conversion
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { quickFraudCheck, type ConversionContext } from '@/lib/tracking/fraud-engine';

// GET /api/conversions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const programId = searchParams.get('program_id');
  const partnerId = searchParams.get('partner_id');
  const channel = searchParams.get('channel');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('conversions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) query = query.eq('status', status);
      if (programId) query = query.eq('program_id', programId);
      if (partnerId) query = query.eq('partner_id', partnerId);
      if (channel) query = query.eq('channel_type', channel);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: count || 0,
        valid: data?.filter(c => c.status === 'valid').length || 0,
        pending: data?.filter(c => c.status === 'pending').length || 0,
        rejected: data?.filter(c => c.status === 'rejected').length || 0,
        fraud: data?.filter(c => c.status === 'fraud').length || 0,
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
    } catch (error) {
      console.error('Error fetching conversions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch conversions' },
        { status: 500 }
      );
    }
  }

  // Fallback to mock data
  const { mockConversions } = await import('@/lib/mock-data');

  let result = [...mockConversions];

  if (status) result = result.filter(c => c.status === status);
  if (programId) result = result.filter(c => c.program_id === programId);
  if (partnerId) result = result.filter(c => c.partner_id === partnerId);
  if (channel) result = result.filter(c => c.channel_type === channel);

  const stats = {
    total: result.length,
    valid: result.filter(c => c.status === 'valid').length,
    pending: result.filter(c => c.status === 'pending').length,
    rejected: result.filter(c => c.status === 'rejected').length,
    fraud: result.filter(c => c.status === 'fraud').length,
  };

  const total = result.length;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    stats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/conversions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

    // Perform fraud check
    const fraudContext: ConversionContext = {
      partner_id: body.partner_id,
      program_id: body.program_id,
      ip_address: ip,
      fingerprint: body.fingerprint,
      email: body.email,
      device_id: body.device_id,
      user_agent: request.headers.get('user-agent') || undefined,
      partner_fraud_rate: body.partner_fraud_rate,
    };

    const fraudResult = quickFraudCheck(fraudContext);

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('conversions')
        .insert({
          program_id: body.program_id,
          partner_id: body.partner_id,
          channel_type: body.channel_type,
          conversion_type: body.conversion_type,
          user_identifier: body.user_identifier,
          ip_address: ip,
          device_id: body.device_id,
          fingerprint: body.fingerprint,
          utms: body.utms || {},
          status: fraudResult.recommendation === 'reject' ? 'fraud' : 'pending',
          payout_amount: body.payout_amount,
          quality_score: 100 - fraudResult.totalScore,
          fraud_signals: fraudResult.signals.map(s => s.type),
          fraud_score: fraudResult.totalScore,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data,
        fraudCheck: {
          score: fraudResult.totalScore,
          recommendation: fraudResult.recommendation,
          blocked: fraudResult.isBlocked,
        },
        message: 'Conversion recorded',
      }, { status: 201 });
    }

    // Fallback
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });

  } catch (error) {
    console.error('Create conversion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record conversion',
    }, { status: 400 });
  }
}
