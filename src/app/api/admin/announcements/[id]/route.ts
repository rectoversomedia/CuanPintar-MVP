/**
 * Announcement Detail API
 * GET - Get announcement
 * PATCH - Update announcement
 * DELETE - Delete announcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/announcements/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    supabase;

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        creator:users!created_by(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Announcement detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update announcement schema
const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['info', 'warning', 'maintenance', 'urgent']).optional(),
  target_roles: z.array(z.enum(['advertiser', 'partner', 'admin'])).nullable().optional(),
  is_published: z.boolean().optional(),
  is_dismissible: z.boolean().optional(),
  starts_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional(),
});

// PATCH /api/admin/announcements/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = updateAnnouncementSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    supabase;

    // If publishing for first time, set published_at
    const { data: current } = await supabase
      .from('announcements')
      .select('is_published, published_at')
      .eq('id', id)
      .single();

    const updateData: Record<string, unknown> = { ...parseResult.data };
    if (parseResult.data.is_published === true && current && !current.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Announcement update error:', error);
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Announcement update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/announcements/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    supabase;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Announcement delete error:', error);
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Announcement delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
