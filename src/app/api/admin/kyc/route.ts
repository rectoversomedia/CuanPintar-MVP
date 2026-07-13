/**
 * KYC Documents API - Protected
 * Admin only for listing and verification
 * Users can submit their own KYC
 *
 * Endpoints:
 * GET    /api/admin/kyc           - List KYC documents (admin)
 * POST   /api/admin/kyc           - Submit/upload KYC document
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Query schema for filtering
const querySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected', 'expired']).optional(),
  document_type: z.enum(['ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other']).optional(),
  user_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Create KYC document schema
const createKycSchema = z.object({
  document_type: z.enum(['ktp', 'npwp', 'siup', 'tdp', 'akta', 'passport', 'other']),
  document_number: z.string().min(1).max(100),
  file_url: z.string().url(),
  file_name: z.string().optional(),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

// Verify KYC schema
const verifyKycSchema = z.object({
  document_id: z.string().uuid(),
  status: z.enum(['verified', 'rejected']),
  rejection_reason: z.string().optional(),
  notes: z.string().optional(),
});

// In-memory storage for demo mode
const demoKycDocuments = new Map<string, KycDocument>();

interface KycDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Initialize mock data
const mockKycDocs: KycDocument[] = [
  {
    id: 'kyc_001',
    user_id: 'user_001',
    document_type: 'ktp',
    document_number: '3175012345678901',
    file_url: 'https://storage.example.com/kyc/ktp_001.jpg',
    file_name: 'ktp_001.jpg',
    verification_status: 'verified',
    verified_by: 'admin_001',
    verified_at: '2024-05-15T10:00:00Z',
    created_at: '2024-05-14T10:00:00Z',
    updated_at: '2024-05-15T10:00:00Z',
  },
];

mockKycDocs.forEach(d => demoKycDocuments.set(d.id, d));

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/admin/kyc - List KYC documents (admin only)
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

    const { status, document_type, user_id, page, limit } = queryResult.data;
    const offset = (page - 1) * limit;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('kyc_documents')
        .select(`
          *,
          user:users!user_id(id, name, email, role),
          verifier:users!verified_by(id, name, email)
        `, { count: 'exact' });

      if (status) query = query.eq('verification_status', status);
      if (document_type) query = query.eq('document_type', document_type);
      if (user_id) query = query.eq('user_id', user_id);

      query = query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('KYC documents query error:', error);
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
    let result = Array.from(demoKycDocuments.values());

    if (status) result = result.filter(d => d.verification_status === status);
    if (document_type) result = result.filter(d => d.document_type === document_type);
    if (user_id) result = result.filter(d => d.user_id === user_id);

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
    console.error('KYC API error:', error);
    return errorResponse('Internal error', 'Failed to fetch KYC documents', 500);
  }
}

// POST /api/admin/kyc - Submit KYC document
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    const parseResult = createKycSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: document, error } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          document_type: data.document_type,
          document_number: data.document_number,
          file_url: data.file_url,
          file_name: data.file_name,
          file_size: data.file_size,
          mime_type: data.mime_type,
          expires_at: data.expires_at,
          verification_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('KYC document insert error:', error);
        return errorResponse('Database error', error.message, 500);
      }

      return successResponse(document, 'KYC document submitted', 201);
    }

    // Demo mode
    const document: KycDocument = {
      id: generateId('kyc'),
      user_id: user.id,
      document_type: data.document_type,
      document_number: data.document_number,
      file_url: data.file_url,
      file_name: data.file_name,
      file_size: data.file_size,
      mime_type: data.mime_type,
      verification_status: 'pending',
      expires_at: data.expires_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    demoKycDocuments.set(document.id, document);
    return successResponse(document, 'KYC document submitted (demo mode)', 201);
  } catch (error) {
    console.error('KYC creation error:', error);
    return errorResponse('Internal error', 'Failed to submit KYC document', 500);
  }
}
