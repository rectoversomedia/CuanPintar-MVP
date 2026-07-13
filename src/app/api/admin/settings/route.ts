/**
 * Platform Settings API - Protected
 * Admin only - all endpoints require admin role
 *
 * Endpoints:
 * GET    /api/admin/settings     - Get settings
 * PUT    /api/admin/settings     - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAdmin, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Query schema
const querySchema = z.object({
  key: z.string().optional(),
  is_public: z.coerce.boolean().optional(),
});

// Update/create setting schema
const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
});

// Bulk update schema
const bulkUpdateSchema = z.object({
  settings: z.array(updateSettingSchema),
});

// In-memory storage for demo mode
const demoSettings = new Map<string, Setting>();

interface Setting {
  key: string;
  value: unknown;
  description?: string;
  is_public: boolean;
  updated_at: string;
}

// Initialize default settings
const defaultSettings: Setting[] = [
  { key: 'platform_name', value: 'CuanPintar', is_public: true, updated_at: new Date().toISOString() },
  { key: 'min_payout_amount', value: 50000, description: 'Minimum payout amount in IDR', is_public: true, updated_at: new Date().toISOString() },
  { key: 'payout_schedule', value: 'weekly', description: 'Payout schedule', is_public: false, updated_at: new Date().toISOString() },
  { key: 'fraud_threshold', value: 60, description: 'Fraud score threshold for rejection', is_public: false, updated_at: new Date().toISOString() },
  { key: 'max_ip_conversions_per_hour', value: 3, description: 'Max conversions per IP per hour', is_public: false, updated_at: new Date().toISOString() },
];

defaultSettings.forEach(s => demoSettings.set(s.key, s));

// GET /api/admin/settings - Get settings
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const searchParams = request.nextUrl.searchParams;

    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { key, is_public } = queryResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      if (key) {
        // Get specific setting
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('key', key)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return errorResponse('Not found', 'Setting not found', 404);
          }
          return errorResponse('Database error', error.message, 500);
        }

        return successResponse(data);
      }

      // Get all settings
      let query = supabase.from('platform_settings').select('*');
      if (is_public !== undefined) {
        query = query.eq('is_public', is_public);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Settings query error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      // Convert to key-value format
      const settings = (data || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, unknown>);

      return successResponse(settings);
    }

    // Demo mode
    if (key) {
      const setting = demoSettings.get(key);
      if (!setting) {
        return errorResponse('Not found', 'Setting not found', 404);
      }
      return successResponse(setting);
    }

    let settings = Array.from(demoSettings.values());

    if (is_public !== undefined) {
      settings = settings.filter(s => s.is_public === is_public);
    }

    // Convert to key-value format
    const settingsMap = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, unknown>);

    return successResponse(settingsMap);
  } catch (error) {
    console.error('Settings API error:', error);
    return errorResponse('Internal error', 'Failed to fetch settings', 500);
  }
}

// PUT /api/admin/settings - Update or create setting
export async function PUT(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const body = await request.json();

    const parseResult = updateSettingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { key, value, description, is_public } = parseResult.data;

    // Validate value type
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean' &&
      value !== null
    ) {
      return errorResponse('Validation Error', 'Value must be string, number, boolean, or null', 400);
    }

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('platform_settings')
        .upsert({
          key,
          value,
          description,
          is_public: is_public ?? false,
        }, {
          onConflict: 'key',
        })
        .select()
        .single();

      if (error) {
        console.error('Setting upsert error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      return successResponse(data, 'Setting updated successfully');
    }

    // Demo mode
    const setting: Setting = {
      key,
      value,
      description,
      is_public: is_public ?? false,
      updated_at: new Date().toISOString(),
    };

    demoSettings.set(key, setting);
    return successResponse(setting, 'Setting updated successfully (demo mode)');
  } catch (error) {
    console.error('Setting update API error:', error);
    return errorResponse('Internal error', 'Failed to update setting', 500);
  }
}

// PATCH /api/admin/settings - Bulk update settings
export async function PATCH(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireAdmin(request);
    if (!authResult.success) return authResult.response;

    const body = await request.json();

    const parseResult = bulkUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { settings } = parseResult.data;
    const updated: Setting[] = [];
    const errors: string[] = [];

    for (const setting of settings) {
      try {
        if (
          typeof setting.value !== 'string' &&
          typeof setting.value !== 'number' &&
          typeof setting.value !== 'boolean' &&
          setting.value !== null
        ) {
          errors.push(`${setting.key}: Invalid value type`);
          continue;
        }

        // Use Supabase if configured
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('platform_settings')
            .upsert({
              key: setting.key,
              value: setting.value,
              description: setting.description,
              is_public: setting.is_public ?? false,
            }, {
              onConflict: 'key',
            })
            .select()
            .single();

          if (error) throw error;
          updated.push(data);
        } else {
          // Demo mode
          const newSetting: Setting = {
            key: setting.key,
            value: setting.value,
            description: setting.description,
            is_public: setting.is_public ?? false,
            updated_at: new Date().toISOString(),
          };
          demoSettings.set(setting.key, newSetting);
          updated.push(newSetting);
        }
      } catch (e) {
        errors.push(`${setting.key}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      updated_count: updated.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Updated ${updated.length} settings`,
    });
  } catch (error) {
    console.error('Bulk settings update error:', error);
    return errorResponse('Internal error', 'Failed to update settings', 500);
  }
}
