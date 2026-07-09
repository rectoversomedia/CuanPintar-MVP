/**
 * Single Program API Routes
 *
 * Endpoints:
 * GET    /api/programs/:id        - Get program
 * PUT    /api/programs/:id        - Update program
 * DELETE /api/programs/:id        - Delete program
 * POST   /api/programs/:id/activate - Activate program
 * POST   /api/programs/:id/pause  - Pause program
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/programs/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

      return NextResponse.json({ success: true, data: program });
    }

    // Production mode
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
    const body = await request.json();

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPrograms } = await import('@/lib/mock-data');
      const index = mockPrograms.findIndex(p => p.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Program not found' },
          { status: 404 }
        );
      }

      const updated = { ...mockPrograms[index], ...body, updated_at: new Date().toISOString() };
      return NextResponse.json({ success: true, data: updated });
    }

    // Production mode
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
      await supabase.from('program_channels').delete().eq('program_id', id);

      // Insert new channels
      const channels = body.channels.map((ch: Record<string, unknown>) => ({
        program_id: id,
        channel_type: ch.channel_type,
        allocated_budget: ch.allocated_budget,
        estimated_volume: ch.estimated_volume,
        quality_score: ch.quality_score,
        fraud_risk: ch.fraud_risk,
      }));

      await supabase.from('program_channels').insert(channels);
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

    // Demo mode
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Program deleted (demo mode)',
      });
    }

    // Production mode
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
