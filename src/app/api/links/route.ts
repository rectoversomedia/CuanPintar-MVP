/**
 * Links API Routes - Protected
 * Partners can only access their own links
 *
 * Endpoints:
 * GET    /api/links             - List partner's tracking links
 * POST   /api/links             - Create new tracking link
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requirePartnerOrAdmin, requirePartner, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schema for creating a link
const createLinkSchema = z.object({
  program_id: z.string().min(1, 'Program ID is required'),
  channel_type: z.enum(['social_media', 'content', 'email', 'sms', 'affiliate', 'influencer', 'display', 'search', 'organic']).default('organic'),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_term: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
});

const listLinksSchema = z.object({
  program_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Demo mode in-memory storage
const demoLinks = new Map<string, LinkData>();
let demoLinkCounter = 1;

interface LinkData {
  id: string;
  partner_id: string;
  program_id: string;
  channel_type: string;
  unique_code: string;
  tracking_url: string;
  short_url: string;
  title: string;
  description: string;
  total_clicks: number;
  total_conversions: number;
  valid_conversions: number;
  pending_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;
  total_payout: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  program?: {
    name: string;
    brand_name: string;
    payout_model: string;
    payout_amount: number;
  };
}

function generateShortCode(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function buildTrackingUrl(
  programId: string,
  partnerId: string,
  channel: string,
  utms?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com';
  const params = new URLSearchParams({
    ch: channel,
    pid: partnerId,
  });

  if (utms?.source) params.set('utm_source', utms.source);
  if (utms?.medium) params.set('utm_medium', utms.medium);
  if (utms?.campaign) params.set('utm_campaign', utms.campaign);
  if (utms?.term) params.set('utm_term', utms.term);
  if (utms?.content) params.set('utm_content', utms.content);

  return `${baseUrl}/track/${programId}?${params.toString()}`;
}

// GET /api/links - List tracking links
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const { searchParams } = new URL(request.url);

    const queryResult = listLinksSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { program_id, status, search, page, limit } = queryResult.data;

    // Partners can only see their own links
    const partnerId = user.role === 'partner' && user.partnerId ? user.partnerId : undefined;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('tracking_links')
        .select(`
          *,
          program:programs(id, name, brand_name, payout_model, payout_amount)
        `, { count: 'exact' });

      // Filter by partner if not admin
      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      if (program_id) query = query.eq('program_id', program_id);

      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      } else if (status === 'expired') {
        query = query.lte('expires_at', new Date().toISOString());
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,unique_code.ilike.%${search}%`);
      }

      query = query.range((page - 1) * limit, page * limit - 1);
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Links query error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      // Calculate summary stats
      const summary = {
        total_links: data?.length || 0,
        total_clicks: data?.reduce((sum, l) => sum + (l.total_clicks || 0), 0) || 0,
        total_conversions: data?.reduce((sum, l) => sum + (l.total_conversions || 0), 0) || 0,
        total_payout: data?.reduce((sum, l) => sum + parseFloat(l.total_payout || '0'), 0) || 0,
      };

      return NextResponse.json({
        success: true,
        data: data || [],
        summary,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Demo mode
    let result = Array.from(demoLinks.values());

    // Filter by partner if not admin
    if (partnerId) {
      result = result.filter(l => l.partner_id === partnerId);
    }

    if (program_id) result = result.filter(l => l.program_id === program_id);
    if (status === 'active') result = result.filter(l => l.is_active);
    if (status === 'inactive') result = result.filter(l => !l.is_active);
    if (search) result = result.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.unique_code.toLowerCase().includes(search.toLowerCase())
    );

    const summary = {
      total_links: result.length,
      total_clicks: result.reduce((sum, l) => sum + l.total_clicks, 0),
      total_conversions: result.reduce((sum, l) => sum + l.total_conversions, 0),
      total_payout: result.reduce((sum, l) => sum + l.total_payout, 0),
    };

    const total = result.length;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      summary,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Links GET error:', error);
    return errorResponse('Internal error', 'Failed to fetch links', 500);
  }
}

// POST /api/links - Create new tracking link
export async function POST(request: NextRequest) {
  try {
    // Require partner role
    const authResult = await requirePartner(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    const parseResult = createLinkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const partnerId = user.partnerId!;

    // Generate unique code
    const uniqueCode = generateShortCode();

    // Build tracking URL
    const trackingUrl = buildTrackingUrl(data.program_id, partnerId, data.channel_type, {
      source: data.utm_source,
      medium: data.utm_medium,
      campaign: data.utm_campaign,
      term: data.utm_term,
      content: data.utm_content,
    });

    // Build short URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com';
    const shortUrl = `${baseUrl}/r/${uniqueCode}`;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const linkId = `demo-link-${demoLinkCounter++}`;
      const newLink: LinkData = {
        id: linkId,
        partner_id: partnerId,
        program_id: data.program_id,
        channel_type: data.channel_type,
        unique_code: uniqueCode,
        tracking_url: trackingUrl,
        short_url: shortUrl,
        title: data.title || `${data.channel_type} - ${new Date().toLocaleDateString()}`,
        description: data.description || '',
        total_clicks: 0,
        total_conversions: 0,
        valid_conversions: 0,
        pending_conversions: 0,
        rejected_conversions: 0,
        fraud_conversions: 0,
        total_payout: 0,
        is_active: true,
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      demoLinks.set(linkId, newLink);

      return NextResponse.json({
        success: true,
        data: newLink,
        message: 'Link created successfully',
      }, { status: 201 });
    }

    // Production mode
    const { data: link, error } = await supabase
      .from('tracking_links')
      .insert({
        partner_id: partnerId,
        program_id: data.program_id,
        channel_type: data.channel_type,
        unique_code: uniqueCode,
        tracking_url: trackingUrl,
        short_url: shortUrl,
        title: data.title || `${data.channel_type} - ${new Date().toLocaleDateString()}`,
        description: data.description,
      })
      .select(`
        *,
        program:programs(id, name, brand_name, payout_model, payout_amount)
      `)
      .single();

    if (error) {
      console.error('Link insert error:', error);

      if (error.code === '23505') {
        return errorResponse('Conflict', 'A link for this program and channel already exists', 409);
      }

      return errorResponse('Database error', error.message, 500);
    }

    return successResponse(link, 'Link created successfully', 201);
  } catch (error) {
    console.error('Links POST error:', error);
    return errorResponse('Internal error', 'Failed to create link', 500);
  }
}
