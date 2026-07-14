/**
 * Single Program API Routes
 *
 * Endpoints:
 * GET    /api/programs/:id        - Get program
 * PUT    /api/programs/:id        - Update program
 * DELETE /api/programs/:id        - Delete program
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth, errorResponse } from '@/lib/auth/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/programs/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate request
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;
    const user = authResult.user;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPrograms } = await import('@/lib/mock-data');
      const program = mockPrograms.find(p => p.id === id);

      if (!program) {
        return NextResponse.json(
          { success: false, error: 'Program not found' },
          { status: 404 }
        );
      }

      // Authorization: advertisers can only view their own programs
      if (user.role === 'advertiser' && program.advertiser_id !== user.advertiserId) {
        return errorResponse('Forbidden', 'You do not have access to this program', 403);
      }

      return NextResponse.json({ success: true, data: program });
    }

    // Production mode - fetch program first
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (user.role === 'advertiser') {
      // Verify advertiser owns this program
      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (advertiser?.id !== program.advertiser_id) {
        return errorResponse('Forbidden', 'You do not have access to this program', 403);
      }
    }
    // Admins can access all programs (no additional check needed)

    // Fetch with relations
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        advertisers:advertiser_id(company_name, industry),
        program_channels(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT /api/programs/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate and require advertiser or admin
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;
    const user = authResult.user;

    // Require advertiser or admin role
    if (user.role !== 'advertiser' && user.role !== 'admin') {
      return errorResponse('Forbidden', 'Only advertisers and admins can update programs', 403);
    }

    const body = await request.json();

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPrograms } = await import('@/lib/mock-data');
      const program = mockPrograms.find(p => p.id === id);

      if (!program) {
        return NextResponse.json(
          { success: false, error: 'Program not found' },
          { status: 404 }
        );
      }

      // Authorization check
      if (user.role === 'advertiser' && program.advertiser_id !== user.advertiserId) {
        return errorResponse('Forbidden', 'You do not have access to this program', 403);
      }

      const updated = { ...program, ...body, updated_at: new Date().toISOString() };
      return NextResponse.json({ success: true, data: updated });
    }

    // Production mode
    // Verify ownership first
    if (user.role === 'advertiser') {
      const { data: program } = await supabase
        .from('programs')
        .select('advertiser_id')
        .eq('id', id)
        .single();

      if (program?.advertiser_id !== user.advertiserId) {
        return errorResponse('Forbidden', 'You do not have access to this program', 403);
      }
    }

    const allowedFields = [
      'name', 'brand_name', 'description', 'objectives',
      'target_audience', 'budget', 'payout_model', 'payout_amount',
      'target_volume', 'status', 'start_date', 'end_date', 'tracking_pixel'
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('programs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update channels if provided
    if (body.channels && Array.isArray(body.channels)) {
      // Delete existing channels
      const { error: deleteError } = await supabase
        .from('program_channels')
        .delete()
        .eq('program_id', id);
      if (deleteError) console.error('Channel delete error:', deleteError);

      // Insert new channels
      const channels = body.channels.map((ch: Record<string, unknown>) => ({
        program_id: id,
        channel_type: ch.channel_type,
        allocated_budget: ch.allocated_budget,
        estimated_volume: ch.estimated_volume,
        quality_score: ch.quality_score,
        fraud_risk: ch.fraud_risk,
      }));

      const { error: insertError } = await supabase
        .from('program_channels')
        .insert(channels);
      if (insertError) console.error('Channel insert error:', insertError);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Program updated successfully',
    });
  } catch (error) {
    console.error('Update program error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE /api/programs/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Authenticate and require advertiser or admin
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;
    const user = authResult.user;

    // Require advertiser or admin role
    if (user.role !== 'advertiser' && user.role !== 'admin') {
      return errorResponse('Forbidden', 'Only advertisers and admins can delete programs', 403);
    }

    // Demo mode
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Program deleted (demo mode)',
      });
    }

    // Production mode - verify ownership first
    if (user.role === 'advertiser') {
      const { data: program } = await supabase
        .from('programs')
        .select('advertiser_id')
        .eq('id', id)
        .single();

      if (program?.advertiser_id !== user.advertiserId) {
        return errorResponse('Forbidden', 'You do not have access to this program', 403);
      }
    }

    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    console.error('Delete program error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
