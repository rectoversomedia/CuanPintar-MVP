/**
 * Platform Settings API
 * GET - List/get settings
 * PUT - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Query schema
const querySchema = z.object({
  key: z.string().optional(),
  is_public: z.coerce.boolean().optional(),
});

// GET /api/admin/settings - Get settings
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

    const { key, is_public } = queryResult.data;

    if (key) {
      // Get specific setting
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    // Get all settings (filter public only if requested)
    let query = supabase.from('platform_settings').select('*');

    if (is_public !== undefined) {
      query = query.eq('is_public', is_public);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Settings query error:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Convert to key-value format
    const settings = (data || []).reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update/create setting schema
const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown().refine((val) => {
    return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null;
  }, { message: 'Value must be string, number, boolean, or null' }),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
});

// PUT /api/admin/settings - Update or create setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = updateSettingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { key, value, description, is_public } = parseResult.data;
    supabase;

    // Upsert setting
    const { data, error } = await supabase
      .from('platform_settings')
      .upsert({
        key,
        value,
        description,
        is_public,
      }, {
        onConflict: 'key',
      })
      .select()
      .single();

    if (error) {
      console.error('Setting upsert error:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Setting update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
