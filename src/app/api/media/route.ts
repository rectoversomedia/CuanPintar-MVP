/**
 * Media Partners API Routes
 *
 * Endpoints:
 * GET /api/media                    - List media partners
 * GET /api/media/:id               - Get media partner
 * GET /api/media/categories        - Get available categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockMediaInventory } = await import('@/lib/mock-data');
      let data = [...mockMediaInventory];

      if (category) data = data.filter(m => m.category === category);
      if (region) data = data.filter(m => m.region === region);
      if (status) data = data.filter(m => m.status === status);
      if (search) data = data.filter(m =>
        m.media_name.toLowerCase().includes(search.toLowerCase())
      );

      // Sort by quality score
      data.sort((a, b) => b.quality_score - a.quality_score);

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
      .from('media_partners')
      .select('*, partners:partner_id(partner_name, quality_score)', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (region) query = query.eq('region', region);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('media_name', `%${search}%`);

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
    console.error('List media error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media partners' },
      { status: 500 }
    );
  }
}
