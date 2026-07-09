/**
 * Single Conversion API Routes
 *
 * Endpoints:
 * GET    /api/conversions/:id        - Get conversion
 * PUT    /api/conversions/:id        - Update conversion (validate/reject)
 * POST   /api/conversions/:id/validate - Validate conversion
 * POST   /api/conversions/:id/reject  - Reject conversion
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversions/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockConversions } = await import('@/lib/mock-data');
      const conversion = mockConversions.find(c => c.id === id);

      if (!conversion) {
        return NextResponse.json(
          { success: false, error: 'Conversion not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: conversion });
    }

    // Production mode
    const { data, error } = await supabase
      .from('conversions')
      .select(`
        *,
        programs:program_id(name, brand_name, payout_amount),
        partners:partner_id(partner_name, partner_type)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Conversion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get conversion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversion' },
      { status: 500 }
    );
  }
}

// PUT /api/conversions/:id - Update status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockConversions } = await import('@/lib/mock-data');
      const index = mockConversions.findIndex(c => c.id === id);

      if (index === -1) {
        return NextResponse.json(
          { success: false, error: 'Conversion not found' },
          { status: 404 }
        );
      }

      const updated = { ...mockConversions[index], ...body };
      return NextResponse.json({ success: true, data: updated });
    }

    // Production mode
    const { data, error } = await supabase
      .from('conversions')
      .update({
        status: body.status,
        validated_at: body.status ? new Date().toISOString() : undefined,
        validation_notes: body.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update partner stats if conversion is validated
    if (body.status === 'valid' || body.status === 'rejected') {
      const conversion = data;
      if (conversion?.partner_id) {
        await updatePartnerStats(conversion.partner_id);
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Conversion updated successfully',
    });
  } catch (error) {
    console.error('Update conversion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update conversion' },
      { status: 500 }
    );
  }
}

// POST /api/conversions/:id/validate
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Demo mode
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: { id, status: 'valid', validated_at: new Date().toISOString() },
        message: 'Conversion validated (demo mode)',
      });
    }

    // Production mode
    const { data, error } = await supabase
      .from('conversions')
      .update({
        status: 'valid',
        quality_score: body.quality_score || 100,
        validated_at: new Date().toISOString(),
        validation_notes: body.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update partner stats
    if (data?.partner_id) {
      await updatePartnerStats(data.partner_id);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Conversion validated',
    });
  } catch (error) {
    console.error('Validate conversion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate conversion' },
      { status: 500 }
    );
  }
}

// Helper: Update partner stats after conversion validation
async function updatePartnerStats(partnerId: string) {
  // Get conversion stats for this partner
  const { data: conversions } = await supabase
    .from('conversions')
    .select('status, payout_amount')
    .eq('partner_id', partnerId);

  if (!conversions) return;

  const totalConversions = conversions.length;
  const validConversions = conversions.filter(c => c.status === 'valid').length;
  const totalEarnings = conversions
    .filter(c => c.status === 'valid')
    .reduce((sum, c) => sum + (c.payout_amount || 0), 0);

  await supabase
    .from('partners')
    .update({
      total_conversions: totalConversions,
      total_earnings: totalEarnings,
    })
    .eq('id', partnerId);
}
