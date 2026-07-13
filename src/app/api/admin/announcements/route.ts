/**
 * Announcements API - Protected
 * Admin only for creating and publishing
 * All authenticated users can view published announcements
 *
 * Endpoints:
 * GET    /api/admin/announcements   - List announcements
 * POST   /api/admin/announcements   - Create announcement (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Query schema
const querySchema = z.object({
  is_published: z.coerce.boolean().optional(),
  type: z.enum(['info', 'warning', 'maintenance', 'urgent']).optional(),
  target_role: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

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
});

// In-memory storage for demo mode
const demoAnnouncements = new Map<string, Announcement>();

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'urgent';
  target_roles: string[] | null;
  is_published: boolean;
  is_dismissible: boolean;
  starts_at?: string;
  ends_at?: string;
  published_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Initialize mock data
const mockAnnouncements: Announcement[] = [
  {
    id: 'ann_001',
    title: 'Pemberitahuan Pemeliharaan Sistem',
    content: 'Akan dilakukan pemeliharaan sistem pada tanggal 15 Juni 2024 pukul 02:00-04:00 WIB.',
    type: 'maintenance',
    target_roles: ['advertiser', 'partner', 'admin'],
    is_published: true,
    is_dismissible: true,
    published_at: '2024-06-10T10:00:00Z',
    created_by: 'admin_001',
    created_at: '2024-06-10T09:00:00Z',
    updated_at: '2024-06-10T10:00:00Z',
  },
];

mockAnnouncements.forEach(a => demoAnnouncements.set(a.id, a));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/admin/announcements - List announcements
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

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

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('announcements')
        .select(`
          *,
          creator:users!created_by(id, name, email)
        `, { count: 'exact' });

      if (is_published !== undefined) {
        query = query.eq('is_published', is_published);
      }
      if (type) query = query.eq('type', type);
      if (target_role) query = query.contains('target_roles', [target_role]);

      query = query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Announcements query error:', error);
        return errorResponse('Database error', error.message, 500);
      }

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

    // Demo mode
    let result = Array.from(demoAnnouncements.values());

    if (is_published !== undefined) result = result.filter(a => a.is_published === is_published);
    if (type) result = result.filter(a => a.type === type);
    if (target_role) result = result.filter(a => !a.target_roles || a.target_roles.includes(target_role));

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = result.length;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Announcements API error:', error);
    return errorResponse('Internal error', 'Failed to fetch announcements', 500);
  }
}

// POST /api/admin/announcements - Create announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    const parseResult = createAnnouncementSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Set published_at if publishing immediately
    const publishedAt = data.is_published ? new Date().toISOString() : undefined;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert({
          title: data.title,
          content: data.content,
          type: data.type,
          target_roles: data.target_roles,
          is_published: data.is_published,
          is_dismissible: data.is_dismissible,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
          published_at: publishedAt,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Announcement insert error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      return successResponse(announcement, 'Announcement created', 201);
    }

    // Demo mode
    const announcement: Announcement = {
      id: generateId('ann'),
      title: data.title,
      content: data.content,
      type: data.type,
      target_roles: data.target_roles || null,
      is_published: data.is_published,
      is_dismissible: data.is_dismissible,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      published_at: publishedAt,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoAnnouncements.set(announcement.id, announcement);
    return successResponse(announcement, 'Announcement created (demo mode)', 201);
  } catch (error) {
    console.error('Announcement creation error:', error);
    return errorResponse('Internal error', 'Failed to create announcement', 500);
  }
}
