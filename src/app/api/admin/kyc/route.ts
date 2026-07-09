/**
 * KYC Documents API
 * GET - List KYC documents
 * POST - Upload new document
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected', 'expired']).optional(),
  document_type: z.enum(['ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other']).optional(),
  user_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// GET /api/admin/kyc - List KYC documents
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

    const { status, document_type, user_id, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('kyc_documents')
      .select(`
        *,
        user:users!user_id(id, name, email, role),
        verifier:users!verified_by(id, name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('verification_status', status);
    }
    if (document_type) {
      query = query.eq('document_type', document_type);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Order by pending first, then by creation date
    query = query
      .order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('KYC documents query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch KYC documents' },
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
    console.error('KYC API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create KYC document schema
const createKycSchema = z.object({
  user_id: z.string().uuid(),
  document_type: z.enum(['ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other']),
  document_number: z.string().min(1).max(100),
  file_url: z.string().url(),
  file_name: z.string().optional(),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

// POST /api/admin/kyc - Upload new KYC document (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = createKycSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    supabase;
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert(parseResult.data)
      .select()
      .single();

    if (error) {
      console.error('KYC document insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create KYC document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('KYC creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
