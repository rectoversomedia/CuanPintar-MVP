/**
 * Audit Logs API - Protected
 * Admin only for viewing logs
 * System logs are created automatically
 *
 * Endpoints:
 * GET    /api/admin/audit        - List audit logs (admin)
 * POST   /api/admin/audit       - Create log entry (internal/system)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  actor_id: z.string().uuid().optional(),
  action: z.string().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Log schema for creating entries
const createLogSchema = z.object({
  action: z.string().min(1).max(100),
  entity_type: z.string().min(1).max(50),
  entity_id: z.string().uuid().optional(),
  old_data: z.record(z.string(), z.unknown()).optional(),
  new_data: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// In-memory storage for demo mode
const demoAuditLogs = new Map<string, AuditLog>();

interface AuditLog {
  id: string;
  actor_id: string;
  actor_type: 'user' | 'system' | 'api';
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Initialize mock data
const mockLogs: AuditLog[] = [
  {
    id: 'log_001',
    actor_id: 'demo-admin-001',
    actor_type: 'user',
    action: 'payout.approved',
    entity_type: 'payout',
    entity_id: 'payout_001',
    new_data: { status: 'paid' },
    ip_address: '192.168.1.1',
    created_at: '2024-06-01T10:00:00Z',
  },
];

mockLogs.forEach(l => demoAuditLogs.set(l.id, l));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/admin/audit - List audit logs (admin only)
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

    const { actor_id, action, entity_type, entity_id, start_date, end_date, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          actor:users!actor_id(id, name, email, role)
        `, { count: 'exact' });

      if (actor_id) query = query.eq('actor_id', actor_id);
      if (action) query = query.ilike('action', `%${action}%`);
      if (entity_type) query = query.eq('entity_type', entity_type);
      if (entity_id) query = query.eq('entity_id', entity_id);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      query = query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Audit logs query error:', error);
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
    let result = Array.from(demoAuditLogs.values());

    if (actor_id) result = result.filter(l => l.actor_id === actor_id);
    if (action) result = result.filter(l => l.action.includes(action));
    if (entity_type) result = result.filter(l => l.entity_type === entity_type);
    if (entity_id) result = result.filter(l => l.entity_id === entity_id);
    if (start_date) result = result.filter(l => l.created_at >= start_date);
    if (end_date) result = result.filter(l => l.created_at <= end_date);

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
    console.error('Audit logs API error:', error);
    return errorResponse('Internal error', 'Failed to fetch audit logs', 500);
  }
}

// POST /api/admin/audit - Create audit log entry (internal use)
export async function POST(request: NextRequest) {
  try {
    // Require authentication for user actions
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    const parseResult = createLogSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: log, error } = await supabase
        .from('audit_logs')
        .insert({
          actor_id: user.id,
          actor_type: 'user',
          action: data.action,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          old_data: data.old_data,
          new_data: data.new_data,
          ip_address: ip,
          user_agent: userAgent,
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Audit log insert error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      return successResponse(log, 'Audit log created', 201);
    }

    // Demo mode
    const log: AuditLog = {
      id: generateId('log'),
      actor_id: user.id,
      actor_type: 'user',
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      old_data: data.old_data,
      new_data: data.new_data,
      ip_address: ip,
      user_agent: userAgent,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
    };

    demoAuditLogs.set(log.id, log);
    return successResponse(log, 'Audit log created', 201);
  } catch (error) {
    console.error('Audit log creation error:', error);
    return errorResponse('Internal error', 'Failed to create audit log', 500);
  }
}
