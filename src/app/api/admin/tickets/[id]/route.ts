/**
 * Support Ticket Detail API
 * GET - Get ticket details with messages
 * PATCH - Update ticket status/assignment
 * DELETE - Close/delete ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/tickets/[id] - Get ticket with messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    supabase;

    // Get ticket with related data
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:users!user_id(id, name, email, role),
        assignee:users!assigned_to(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (ticketError) {
      if (ticketError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      console.error('Ticket query error:', ticketError);
      return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('support_messages')
      .select(`
        *,
        user:users!user_id(id, name, email, role)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Messages query error:', messagesError);
    }

    return NextResponse.json({
      data: {
        ...ticket,
        messages: messages || [],
      },
    });
  } catch (error) {
    console.error('Ticket detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update ticket schema
const updateTicketSchema = z.object({
  status: z.enum(['open', 'pending', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  resolution_notes: z.string().max(1000).optional(),
});

// PATCH /api/admin/tickets/[id] - Update ticket
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = updateTicketSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    supabase;
    const { data, error } = await supabase
      .from('support_tickets')
      .update(parseResult.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Ticket update error:', error);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Ticket update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/tickets/[id] - Close/delete ticket
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

    supabase;

    if (hardDelete) {
      // Hard delete - remove ticket and messages
      const { error: messagesError } = await supabase
        .from('support_messages')
        .delete()
        .eq('ticket_id', id);

      if (messagesError) {
        console.error('Messages delete error:', messagesError);
        return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
      }

      const { error: ticketError } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);

      if (ticketError) {
        console.error('Ticket delete error:', ticketError);
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
      }
    } else {
      // Soft delete - just mark as closed
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) {
        console.error('Ticket close error:', error);
        return NextResponse.json({ error: 'Failed to close ticket' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
