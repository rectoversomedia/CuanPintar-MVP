/**
 * Links API Routes
 *
 * Endpoints:
 * GET /api/links - List partner's tracking links
 * POST /api/links - Create new tracking link
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for creating a link
const createLinkSchema = z.object({
  program_id: z.string().uuid('Invalid program ID'),
  channel_type: z.string().min(1, 'Channel type is required'),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  description: z.string().max(1000).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
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
  utms?: { source?: string; medium?: string; campaign?: string }
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com';
  let url = `${baseUrl}/track/${programId}/${partnerId}?ch=${channel}`;

  const params = new URLSearchParams();
  if (utms?.source) params.set('utm_source', utms.source);
  if (utms?.medium) params.set('utm_medium', utms.medium);
  if (utms?.campaign) params.set('utm_campaign', utms.campaign);

  const queryString = params.toString();
  if (queryString) {
    url += '&' + queryString;
  }

  return url;
}

// GET /api/links - List tracking links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');
    const programId = searchParams.get('program_id');
    const status = searchParams.get('status'); // active, inactive, expired
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Demo mode
    if (!isSupabaseConfigured() || !partnerId) {
      // Return demo data
      const allLinks = Array.from(demoLinks.values());

      // Filter by partner_id if provided
      const filtered = partnerId
        ? allLinks.filter((l) => l.partner_id === partnerId)
        : allLinks;

      return NextResponse.json({
        success: true,
        data: filtered,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      });
    }

    // Production mode
    let query = supabase
      .from('tracking_links')
      .select(`
        *,
        program:programs(id, name, brand_name, payout_model, payout_amount)
      `)
      .eq('partner_id', partnerId);

    // Apply filters
    if (programId) {
      query = query.eq('program_id', programId);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    } else if (status === 'expired') {
      query = query.lte('expires_at', new Date().toISOString());
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,unique_code.ilike.%${search}%`
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching links:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const summary = {
      total_links: data?.length || 0,
      total_clicks: data?.reduce((sum, l) => sum + (l.total_clicks || 0), 0) || 0,
      total_conversions:
        data?.reduce((sum, l) => sum + (l.total_conversions || 0), 0) || 0,
      total_payout:
        data?.reduce((sum, l) => sum + parseFloat(l.total_payout || '0'), 0) || 0,
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
  } catch (error) {
    console.error('Links GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create new tracking link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { program_id, channel_type, title, description, utm_source, utm_medium, utm_campaign } =
      validation.data;

    // Get partner_id from header or body (in real app, this would come from auth)
    const partnerId = request.headers.get('x-partner-id') || body.partner_id;

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    // Generate unique code
    const uniqueCode = generateShortCode();

    // Build tracking URL
    const trackingUrl = buildTrackingUrl(program_id, partnerId, channel_type, {
      source: utm_source,
      medium: utm_medium,
      campaign: utm_campaign,
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
        program_id,
        channel_type,
        unique_code: uniqueCode,
        tracking_url: trackingUrl,
        short_url: shortUrl,
        title: title || `${channel_type} - ${new Date().toLocaleDateString()}`,
        description: description || '',
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

      return NextResponse.json(
        {
          success: true,
          data: newLink,
          message: 'Link created successfully',
        },
        { status: 201 }
      );
    }

    // Production mode - Insert into Supabase
    const { data, error } = await supabase
      .from('tracking_links')
      .insert({
        partner_id: partnerId,
        program_id,
        channel_type,
        unique_code: uniqueCode,
        tracking_url: trackingUrl,
        short_url: shortUrl,
        title: title || `${channel_type} - ${new Date().toLocaleDateString()}`,
        description,
      })
      .select(`
        *,
        program:programs(id, name, brand_name, payout_model, payout_amount)
      `)
      .single();

    if (error) {
      console.error('Error creating link:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'A link for this program and channel already exists',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create link' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Link created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Links POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
