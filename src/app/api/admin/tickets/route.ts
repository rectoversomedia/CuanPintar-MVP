/**
 * Support Tickets API
 * GET - List tickets with filtering
 * POST - Create new ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  status: z.enum(['open', 'pending', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other']).optional(),
  assigned_to: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/admin/tickets - List support tickets
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

    const { status, priority, category, assigned_to, user_id, search, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:users!user_id(id, name, email, role),
        assignee:users!assigned_to(id, name, email),
        messages:support_messages(id)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (search) {
      query = query.or(`subject.ilike.%${search}%,ticket_number.ilike.%${search}%`);
    }

    // Order by priority and creation date
    query = query
      .order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Tickets query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    // Add message count to each ticket
    const ticketsWithCount = (data || []).map(ticket => ({
      ...ticket,
      message_count: ticket.messages?.length || 0,
      messages: undefined, // Remove messages array, keep count
    }));

    return NextResponse.json({
      data: ticketsWithCount,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Tickets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create ticket schema
const createTicketSchema = z.object({
  user_id: z.string().uuid().optional(), // Optional for admin-created tickets
  category: z.enum(['technical', 'billing', 'account', 'payout', 'fraud', 'integration', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  subject: z.string().min(3).max(255),
  message: z.string().min(1),
  assigned_to: z.string().uuid().optional(),
});

// POST /api/admin/tickets - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = createTicketSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { user_id, category, priority, subject, message, assigned_to } = parseResult.data;
    supabase;

    // Start transaction - create ticket and first message
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id,
        category,
        priority,
        subject,
        assigned_to,
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Ticket insert error:', ticketError);
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      );
    }

    // Add first message
    const { error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        user_id,
        message,
        is_internal: false,
      });

    if (messageError) {
      console.error('Message insert error:', messageError);
      // Don't fail the request, ticket was created
    }

    return NextResponse.json({ data: ticket }, { status: 201 });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
