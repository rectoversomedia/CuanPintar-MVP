/**
 * Program API Routes - Connected to Supabase
 * Protected: Requires authentication
 * Advertisers can only access their own programs
 * Admins can access all programs
 *
 * Endpoints:
 * GET    /api/programs           - List programs
 * POST   /api/programs           - Create program (advertisers only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAuth, requireAdvertiserOrAdmin, getPaginationParams, createPaginatedResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schemas
const createProgramSchema = z.object({
  name: z.string().min(3).max(255),
  brand_name: z.string().min(1).max(255),
  industry: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  objectives: z.array(z.string()).optional().default([]),
  target_audience: z.object({
    age_range: z.string().optional(),
    location: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
  budget: z.number().positive('Budget must be positive'),
  target_volume: z.number().int().positive().optional(),
  payout_model: z.enum(['cpa', 'cpl', 'cps', 'cpc', 'cpm', 'hybrid']),
  advertiser_price: z.number().positive().optional(),
  partner_payout: z.number().positive(),
  channels: z.array(z.enum(['social_media', 'content', 'email', 'sms', 'affiliate', 'influencer', 'display', 'search'])).optional().default([]),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  payout_amount: z.number().positive().optional(),
});

const listProgramsSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'ended', 'pending_review']).optional(),
  industry: z.string().optional(),
  advertiser_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/programs
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const { searchParams } = new URL(request.url);

    // Validate query params
    const queryResult = listProgramsSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, industry, advertiser_id, search, page, limit } = queryResult.data;
    const user = authResult.user;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('programs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Filter by advertiser if not admin
      if (user.role === 'advertiser' && user.advertiserId) {
        query = query.eq('advertiser_id', user.advertiserId);
      } else if (advertiser_id) {
        query = query.eq('advertiser_id', advertiser_id);
      }

      if (status) query = query.eq('status', status);
      if (industry) query = query.eq('industry', industry);
      if (search) {
        query = query.or(`name.ilike.%${search}%,brand_name.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      return createPaginatedResponse(data || [], count || 0, page, limit);
    }

    // Fallback to mock data if Supabase not configured
    const { mockPrograms } = await import('@/lib/mock-data');

    let filtered = [...mockPrograms];

    // Filter by advertiser if not admin
    if (user.role === 'advertiser' && user.advertiserId) {
      filtered = filtered.filter(p => p.advertiser_id === user.advertiserId);
    } else if (advertiser_id) {
      filtered = filtered.filter(p => p.advertiser_id === advertiser_id);
    }

    if (status) filtered = filtered.filter(p => p.status === status);
    if (industry) filtered = filtered.filter(p => p.industry === industry);
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return createPaginatedResponse(filtered, filtered.length, page, limit);
  } catch (error) {
    console.error('List programs error:', error);
    return errorResponse('Internal error', 'Failed to fetch programs', 500);
  }
}

// POST /api/programs
export async function POST(request: NextRequest) {
  try {
    // Require advertiser or admin role
    const authResult = await requireAdvertiserOrAdmin(request);
    if (!authResult.success) return authResult.response;

    const body = await request.json();

    // Validate body
    const parseResult = createProgramSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const user = authResult.user;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const advertiserId = user.advertiserId || body.advertiser_id;

      if (!advertiserId) {
        return errorResponse('Validation Error', 'Advertiser ID is required', 400);
      }

      const { data: program, error } = await supabase
        .from('programs')
        .insert({
          advertiser_id: advertiserId,
          name: data.name,
          brand_name: data.brand_name,
          industry: data.industry,
          description: data.description,
          objectives: data.objectives,
          target_audience: data.target_audience,
          budget: data.budget,
          target_volume: data.target_volume,
          payout_model: data.payout_model,
          advertiser_price: data.advertiser_price || data.payout_amount,
          partner_payout: data.partner_payout,
          status: 'draft',
          channels: data.channels,
          start_date: data.start_date,
          end_date: data.end_date,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return errorResponse('Database error', error.message, 400);
      }

      return NextResponse.json({
        success: true,
        data: program,
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
    return errorResponse('Server error', 'Failed to create program', 500);
  }
}
