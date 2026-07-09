/**
 * Advertisers API Routes
 *
 * Endpoints:
 * GET    /api/advertisers          - List advertisers
 * POST   /api/advertisers          - Create advertiser
 * GET    /api/advertisers/:id     - Get advertiser
 * PUT    /api/advertisers/:id     - Update advertiser
 * DELETE /api/advertisers/:id     - Delete advertiser
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/advertisers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockAdvertisers } = await import('@/lib/mock-data');
      let data = [...mockAdvertisers];

      if (status) data = data.filter(a => a.status === status);
      if (industry) data = data.filter(a => a.industry === industry);
      if (search) data = data.filter(a =>
        a.company_name.toLowerCase().includes(search.toLowerCase())
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
      .from('advertisers')
      .select('*, users!advertisers_user_id_fkey(name, email, avatar_url)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (industry) query = query.eq('industry', industry);
    if (search) query = query.ilike('company_name', `%${search}%`);

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('List advertisers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advertisers' },
      { status: 500 }
    );
  }
}

// POST /api/advertisers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyName, industry, website } = body;

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Demo mode
    if (!isSupabaseConfigured()) {
      const newAdvertiser = {
        id: `adv_${Date.now()}`,
        user_id: userId,
        company_name: companyName,
        industry,
        website,
        status: 'pending',
        total_spend: 0,
        active_programs: 0,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: newAdvertiser,
        message: 'Advertiser created (demo mode)',
      }, { status: 201 });
    }

    // Production mode
    const { data, error } = await supabase
      .from('advertisers')
      .insert({
        user_id: userId,
        company_name: companyName,
        industry,
        website,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: 'Advertiser created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create advertiser error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create advertiser' },
      { status: 500 }
    );
  }
}
