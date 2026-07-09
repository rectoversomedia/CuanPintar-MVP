/**
 * Single Partner API Routes
 *
 * Endpoints:
 * GET    /api/partners/:id        - Get partner
 * PUT    /api/partners/:id        - Update partner
 * DELETE /api/partners/:id        - Delete partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/partners/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPartners } = await import('@/lib/mock-data');
      const partner = mockPartners.find(p => p.id === id);

      if (!partner) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: partner });
    }

    // Production mode
    const { data, error } = await supabase
      .from('partners')
      .select('*, users!partners_user_id_fkey(name, email, avatar_url, phone)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

// PUT /api/partners/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPartners } = await import('@/lib/mock-data');
      const index = mockPartners.findIndex(p => p.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }

      const updated = { ...mockPartners[index], ...body };
      return NextResponse.json({ success: true, data: updated });
    }

    // Production mode
    const allowedFields = [
      'partner_name', 'partner_type', 'niche', 'location',
      'audience_size', 'audience_age_group', 'audience_gender',
      'audience_location', 'status'
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('partners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Partner updated successfully',
    });
  } catch (error) {
    console.error('Update partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE /api/partners/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Demo mode
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Partner deleted (demo mode)',
      });
    }

    // Production mode
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    console.error('Delete partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
