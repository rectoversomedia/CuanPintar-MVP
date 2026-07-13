/**
 * Single Link API Routes
 *
 * Endpoints:
 * GET /api/links/[id] - Get link details
 * PUT /api/links/[id] - Update link
 * DELETE /api/links/[id] - Deactivate link
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for updating a link
const updateLinkSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

// Demo mode in-memory storage (shared with parent route)
interface DemoLink {
  id: string;
  title: string;
  program_id: string;
  partner_id: string;
  short_code: string;
  url: string;
  clicks: number;
  conversions: number;
  created_at: string;
  is_active: boolean;
}

const demoLinks = new Map<string, DemoLink>();
declare global {
  var __demoLinks: Map<string, DemoLink> | undefined;
}
if (!global.__demoLinks) {
  global.__demoLinks = demoLinks;
}

// GET /api/links/[id] - Get link details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const link = global.__demoLinks?.get(id);
      if (!link) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: link });
    }

    // Production mode
    const { data, error } = await supabase
      .from('tracking_links')
      .select(`
        *,
        program:programs(id, name, brand_name, payout_model, payout_amount, advertiser:advertisers(id, company_name)),
        partner:partners(id, partner_name, partner_type)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get link error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/links/[id] - Update link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateLinkSchema.safeParse(body);
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

    const { title, description, is_active, expires_at } = validation.data;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const link = global.__demoLinks?.get(id);
      if (!link) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }

      const updatedLink = {
        ...link,
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
        ...(expires_at !== undefined && { expires_at }),
        updated_at: new Date().toISOString(),
      };

      global.__demoLinks?.set(id, updatedLink);
      return NextResponse.json({ success: true, data: updatedLink });
    }

    // Production mode
    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (expires_at !== undefined) updateData.expires_at = expires_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tracking_links')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        program:programs(id, name, brand_name)
      `)
      .single();

    if (error) {
      console.error('Error updating link:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update link error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/links/[id] - Deactivate link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo mode
    if (!isSupabaseConfigured()) {
      const link = global.__demoLinks?.get(id);
      if (!link) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }

      // Soft delete - just mark as inactive
      const updatedLink = {
        ...link,
        is_active: false,
        updated_at: new Date().toISOString(),
      };
      global.__demoLinks?.set(id, updatedLink);

      return NextResponse.json({
        success: true,
        message: 'Link deactivated successfully',
      });
    }

    // Production mode - Soft delete
    const { error } = await supabase
      .from('tracking_links')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating link:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Link deactivated successfully',
    });
  } catch (error) {
    console.error('Delete link error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
