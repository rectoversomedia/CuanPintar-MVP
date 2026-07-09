/**
 * Audit Logs API
 * GET - List audit logs with filtering
 * POST - Create audit log entry (internal use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  actor_id: z.string().uuid().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/admin/audit - List audit logs
export async function GET(request: NextRequest) {
  try {
    supabase;
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query params
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { actor_id, action, entity_type, entity_id, start_date, end_date, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        actor:users!actor_id(id, name, email, role)
      `, { count: 'exact' });

    // Apply filters
    if (actor_id) {
      query = query.eq('actor_id', actor_id);
    }
    if (action) {
      query = query.ilike('action', `%${action}%`);
    }
    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }
    if (entity_id) {
      query = query.eq('entity_id', entity_id);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Audit logs query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
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
    console.error('Audit logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Log schema for creating entries
const createLogSchema = z.object({
  actor_id: z.string().uuid().optional(),
  actor_type: z.enum(['user', 'system', 'api']).default('user'),
  action: z.string().min(1).max(100),
  entity_type: z.string().min(1).max(50),
  entity_id: z.string().uuid().optional(),
  old_data: z.record(z.string(), z.unknown()).optional(),
  new_data: z.record(z.string(), z.unknown()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/admin/audit - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = createLogSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const logData = parseResult.data;
    supabase;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Audit log insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create audit log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Audit log creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
