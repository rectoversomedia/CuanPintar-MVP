/**
 * File Upload API Routes
 *
 * POST /api/upload         - Upload single/multiple files
 * DELETE /api/upload/:id   - Delete uploaded file
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, deleteFile } from '@/lib/services/upload';
import { authenticateRequest } from '@/lib/auth/tokens';

// POST /api/upload
export async function POST(request: NextRequest) {
  try {
    // Check authentication for protected uploads
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return handleUpload(request);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// GET /api/upload - List user uploads
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // For demo mode, return empty
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  } catch (error) {
    console.error('List uploads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list uploads' },
      { status: 500 }
    );
  }
}
