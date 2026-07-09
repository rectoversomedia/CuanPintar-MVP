/**
 * Announcements API
 * GET - List announcements
 * POST - Create announcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Query schema
const querySchema = z.object({
  is_published: z.coerce.boolean().optional(),
  type: z.enum(['info', 'warning', 'maintenance', 'urgent']).optional(),
  target_role: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/admin/announcements - List announcements
export async function GET(request: NextRequest) {
  try {
    supabase;
    const searchParams = request.nextUrl.searchParams;

    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { is_published, type, target_role, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('announcements')
      .select(`
        *,
        creator:users!created_by(id, name, email)
      `, { count: 'exact' });

    if (is_published !== undefined) {
      query = query.eq('is_published', is_published);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (target_role) {
      query = query.contains('target_roles', [target_role]);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Announcements query error:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Announcements API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create announcement schema
const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  type: z.enum(['info', 'warning', 'maintenance', 'urgent']).default('info'),
  target_roles: z.array(z.enum(['advertiser', 'partner', 'admin'])).nullable().optional(),
  is_published: z.boolean().default(false),
  is_dismissible: z.boolean().default(true),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
});

// POST /api/admin/announcements - Create announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = createAnnouncementSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    supabase;

    // Set published_at if publishing immediately
    if (data.is_published && !data.published_at) {
      data.published_at = new Date().toISOString();
    }

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Announcement insert error:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error('Announcement creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
