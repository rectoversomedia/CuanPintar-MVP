/**
 * Partner API Routes - Dynamic
 *
 * Endpoints:
 * GET    /api/partners             - List partners
 * POST   /api/partners             - Create partner
 * GET    /api/partners/:id        - Get partner
 * PUT    /api/partners/:id        - Update partner
 * DELETE /api/partners/:id        - Delete partner
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/partners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockPartners } = await import('@/lib/mock-data');
      let data = [...mockPartners];

      if (status) data = data.filter(p => p.status === status);
      if (type) data = data.filter(p => p.partner_type === type);
      if (search) data = data.filter(p =>
        p.partner_name.toLowerCase().includes(search.toLowerCase()) ||
        p.niche?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
      );

      const total = data.length;
      const start = (page - 1) * limit;
      const paginatedData = data.slice(start, start + limit);

      return NextResponse.json({
        success: true,
        data: paginatedData,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Production mode
    let query = supabase
      .from('partners')
      .select('*, users!partners_user_id_fkey(name, email, avatar_url)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('partner_type', type);
    if (search) query = query.or(`partner_name.ilike.%${search}%,niche.ilike.%${search}%,location.ilike.%${search}%`);

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('quality_score', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('List partners error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST /api/partners
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, partnerName, partnerType, niche, location, audienceSize } = body;

    if (!partnerName || !partnerType) {
      return NextResponse.json(
        { success: false, error: 'Partner name and type are required' },
        { status: 400 }
      );
    }

    // Demo mode
    if (!isSupabaseConfigured()) {
      const newPartner = {
        id: `part_${Date.now()}`,
        user_id: userId,
        partner_name: partnerName,
        partner_type: partnerType,
        niche,
        location,
        audience_size: audienceSize || 0,
        quality_score: 50,
        fraud_risk: 'low',
        status: 'pending',
        total_earnings: 0,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: newPartner,
        message: 'Partner created (demo mode)',
      }, { status: 201 });
    }

    // Production mode
    const { data, error } = await supabase
      .from('partners')
      .insert({
        user_id: userId,
        partner_name: partnerName,
        partner_type: partnerType,
        niche,
        location,
        audience_size: audienceSize || 0,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Partner created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
