/**
 * KYC Document Detail API
 * GET - Get document details
 * PATCH - Verify/reject document
 * DELETE - Remove document
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/kyc/[id] - Get document details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    supabase;

    const { data, error } = await supabase
      .from('kyc_documents')
      .select(`
        *,
        user:users!user_id(id, name, email, role),
        verifier:users!verified_by(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      console.error('KYC document query error:', error);
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('KYC detail API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update/verify KYC schema
const updateKycSchema = z.object({
  verification_status: z.enum(['pending', 'verified', 'rejected', 'expired']),
  rejection_reason: z.string().max(500).optional(),
  verified_by: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
});

// PATCH /api/admin/kyc/[id] - Verify or reject document
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = updateKycSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    supabase;
    const updateData: Record<string, unknown> = {
      verification_status: parseResult.data.verification_status,
    };

    // Set verified_by and verified_at if verifying
    if (parseResult.data.verification_status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }

    if (parseResult.data.rejection_reason) {
      updateData.rejection_reason = parseResult.data.rejection_reason;
    }

    if (parseResult.data.expires_at) {
      updateData.expires_at = parseResult.data.expires_at;
    }

    const { data, error } = await supabase
      .from('kyc_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('KYC update error:', error);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('KYC update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/kyc/[id] - Remove document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    supabase;

    const { error } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('KYC delete error:', error);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KYC delete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
