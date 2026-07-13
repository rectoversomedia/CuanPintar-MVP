/**
 * Program API Routes - Connected to Supabase
 *
 * Endpoints:
 * GET    /api/programs           - List programs
 * POST   /api/programs           - Create program
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/programs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const industry = searchParams.get('industry');
  const advertiserId = searchParams.get('advertiser_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Use Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('programs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) {
        query = query.eq('status', status);
      }
      if (industry) {
        query = query.eq('industry', industry);
      }
      if (advertiserId) {
        query = query.eq('advertiser_id', advertiserId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // Fallback to mock data if Supabase not configured
  const { mockPrograms } = await import('@/lib/mock-data');

  let filtered = [...mockPrograms];

  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  if (industry) {
    filtered = filtered.filter(p => p.industry === industry);
  }
  if (advertiserId) {
    filtered = filtered.filter(p => p.advertiser_id === advertiserId);
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}

// POST /api/programs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          advertiser_id: body.advertiser_id,
          name: body.name,
          brand_name: body.brand_name,
          industry: body.industry,
          description: body.description,
          objectives: body.objectives || [],
          target_audience: body.target_audience || {},
          budget: body.budget,
          target_volume: body.target_volume,
          payout_model: body.payout_model,
          advertiser_price: body.advertiser_price || body.payout_amount,
          partner_payout: body.partner_payout || body.payout_amount,
          status: 'draft',
          channels: body.channels || [],
          start_date: body.start_date,
          end_date: body.end_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Program created successfully',
      }, { status: 201 });
    }

    // Fallback: return error if Supabase not configured
    return NextResponse.json({
      success: false,
      error: 'Database not configured. Please setup Supabase.',
    }, { status: 503 });

  } catch (error) {
    console.error('Create program error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create program',
    }, { status: 400 });
  }
}
