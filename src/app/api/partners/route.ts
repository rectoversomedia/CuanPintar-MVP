/**
 * Partner API Routes - Protected
 * Admin can access all partners
 * Partners can only access their own profile
 *
 * Endpoints:
 * GET    /api/partners             - List partners (admin only)
 * POST   /api/partners             - Create partner
 * GET    /api/partners/me         - Get own profile (partner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth, requireAdmin, requirePartner, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schemas
const createPartnerSchema = z.object({
  partner_name: z.string().min(2).max(255),
  partner_type: z.enum(['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency']),
  niche: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  audience_size: z.number().int().min(0).optional().default(0),
  website: z.string().url().optional(),
  social_media: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }).optional(),
});

const listPartnersSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'rejected']).optional(),
  type: z.enum(['media', 'creator', 'affiliate', 'sales', 'mission', 'community', 'agency']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/partners - List partners (admin only)
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const { searchParams } = new URL(request.url);

    // Validate query params
    const queryResult = listPartnersSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, type, search, page, limit } = queryResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('partners')
        .select('*, users!partners_user_id_fkey(name, email, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) query = query.eq('status', status);
      if (type) query = query.eq('partner_type', type);
      if (search) {
        query = query.or(`partner_name.ilike.%${search}%,niche.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

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
    }

    // Fallback mock data
    const { mockPartners } = await import('@/lib/mock-data');
    let data = [...mockPartners];

    if (status) data = data.filter(p => p.status === status);
    if (type) data = data.filter(p => p.partner_type === type);
    if (search) data = data.filter(p =>
      p.partner_name.toLowerCase().includes(search.toLowerCase()) ||
      p.niche?.toLowerCase().includes(search.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: data.length, totalPages: Math.ceil(data.length / limit) },
    });
  } catch (error) {
    console.error('List partners error:', error);
    return errorResponse('Internal error', 'Failed to fetch partners', 500);
  }
}

// POST /api/partners - Create partner profile
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    // Validate body
    const parseResult = createPartnerSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const newPartner = {
        id: `part_${Date.now()}`,
        user_id: user.id,
        partner_name: data.partner_name,
        partner_type: data.partner_type,
        niche: data.niche,
        location: data.location,
        audience_size: data.audience_size,
        website: data.website,
        social_media: data.social_media,
        quality_score: 50,
        fraud_risk: 'low',
        status: 'pending',
        total_earnings: 0,
        created_at: new Date().toISOString(),
      };

      return successResponse(newPartner, 'Partner created successfully', 201);
    }

    // Production mode
    const { data: partner, error } = await supabase
      .from('partners')
      .insert({
        user_id: user.id,
        partner_name: data.partner_name,
        partner_type: data.partner_type,
        niche: data.niche,
        location: data.location,
        audience_size: data.audience_size,
        website: data.website,
        social_media: data.social_media,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Create partner error:', error);
      return errorResponse('Database error', error.message, 500);
    }

    return successResponse(partner, 'Partner created successfully', 201);
  } catch (error) {
    console.error('Create partner error:', error);
    return errorResponse('Internal error', 'Failed to create partner', 500);
  }
}
