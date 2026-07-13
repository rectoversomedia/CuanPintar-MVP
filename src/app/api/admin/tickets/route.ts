/**
 * Support Tickets API - Protected
 * Admin can access all tickets
 * Users can access their own tickets
 *
 * Endpoints:
 * GET    /api/admin/tickets      - List tickets (admin)
 * POST   /api/admin/tickets      - Create ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  status: z.enum(['open', 'pending', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other']).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Create ticket schema
const createTicketSchema = z.object({
  category: z.enum(['technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  subject: z.string().min(3).max(255),
  message: z.string().min(1).max(5000),
  assigned_to: z.string().uuid().optional(),
});

// In-memory storage for demo mode
const demoTickets = new Map<string, Ticket>();
const demoMessages = new Map<string, Message[]>();

interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  user_email?: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

// Initialize mock data
const mockTickets: Ticket[] = [
  {
    id: 'ticket_001',
    ticket_number: 'TKT-2024-001',
    user_id: 'user_001',
    user_email: 'partner@example.com',
    category: 'billing',
    priority: 'high',
    status: 'open',
    subject: 'Payout tidak masuk ke rekening',
    assigned_to: 'admin_001',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
];

mockTickets.forEach(t => demoTickets.set(t.id, t));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTicketNumber(): string {
  return `TKT-${new Date().getFullYear()}-${String(demoTickets.size + 1).padStart(3, '0')}`;
}

// GET /api/admin/tickets - List support tickets
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query params
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, priority, category, assigned_to, search, page, limit } = queryResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:users!user_id(id, name, email, role),
          assignee:users!assigned_to(id, name, email),
          messages:support_messages(id)
        `, { count: 'exact' });

      // Non-admins can only see their own tickets
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      // Apply filters
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (category) query = query.eq('category', category);
      if (assigned_to) query = query.eq('assigned_to', assigned_to);
      if (search) query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`);

      query = query.order('created_at', { ascending: false });
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Tickets query error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      const ticketsWithCount = (data || []).map(ticket => ({
        ...ticket,
        message_count: ticket.messages?.length || 0,
        messages: undefined,
      }));

      return NextResponse.json({
        success: true,
        data: ticketsWithCount,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Demo mode
    let result = Array.from(demoTickets.values());

    // Non-admins can only see their own tickets
    if (user.role !== 'admin') {
      result = result.filter(t => t.user_id === user.id);
    }

    if (status) result = result.filter(t => t.status === status);
    if (priority) result = result.filter(t => t.priority === priority);
    if (category) result = result.filter(t => t.category === category);
    if (assigned_to) result = result.filter(t => t.assigned_to === assigned_to);
    if (search) result = result.filter(t =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = result.length;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    // Add message counts
    const withCounts = paginated.map(t => ({
      ...t,
      message_count: demoMessages.get(t.id)?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      data: withCounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Tickets API error:', error);
    return errorResponse('Internal error', 'Failed to fetch tickets', 500);
  }
}

// POST /api/admin/tickets - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    const parseResult = createTicketSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, priority, subject, message, assigned_to } = parseResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          category,
          priority,
          subject,
          assigned_to: assigned_to || null,
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket insert error:', ticketError);
        return errorResponse('Database error', ticketError.message, 500);
      }

      // Add first message
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message,
          is_internal: false,
        });

      return successResponse(ticket, 'Ticket created successfully', 201);
    }

    // Demo mode
    const ticket: Ticket = {
      id: generateId('ticket'),
      ticket_number: generateTicketNumber(),
      user_id: user.id,
      user_email: user.email,
      category,
      priority,
      status: 'open',
      subject,
      assigned_to,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoTickets.set(ticket.id, ticket);

    const msg: Message = {
      id: generateId('msg'),
      ticket_id: ticket.id,
      user_id: user.id,
      message,
      is_internal: false,
      created_at: new Date().toISOString(),
    };

    demoMessages.set(ticket.id, [msg]);

    return successResponse(ticket, 'Ticket created successfully', 201);
  } catch (error) {
    console.error('Ticket creation error:', error);
    return errorResponse('Internal error', 'Failed to create ticket', 500);
  }
}
