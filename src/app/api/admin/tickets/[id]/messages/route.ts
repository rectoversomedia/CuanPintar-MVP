/**
 * Ticket Messages API
 * POST - Add message to ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Create message schema
const createMessageSchema = z.object({
  user_id: z.string().uuid().optional(), // Optional, will be set from session if not provided
  message: z.string().min(1).max(5000),
  is_internal: z.boolean().default(false),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
  })).optional(),
});

// POST /api/admin/tickets/[id]/messages - Add message to ticket
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = createMessageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { user_id, message, is_internal, attachments } = parseResult.data;
    supabase;

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('id, status')
      .eq('id', id)
      .single();

    if (ticketError) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Don't allow messages on closed tickets
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot add message to closed ticket' },
        { status: 400 }
      );
    }

    // Insert message
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: id,
        user_id,
        message,
        is_internal,
        attachments: attachments || null,
      })
      .select(`
        *,
        user:users!user_id(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Message insert error:', error);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Update ticket status if it was 'open' or 'pending'
    if (ticket.status === 'open' || ticket.status === 'pending') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
