/**
 * Dynamic Track API Routes
 *
 * Handles dynamic tracking endpoints based on type parameter
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
const clickStore = new Map<string, Record<string, unknown>>();
const conversionStore = new Map<string, Record<string, unknown>>();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/track/[type]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const { searchParams } = new URL(request.url);

  if (type === 'pixel') {
    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  }

  if (type === 'validate') {
    const fingerprint = searchParams.get('fingerprint');
    return NextResponse.json({ fingerprint, valid: true });
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
}

// POST /api/track/[type]
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (type === 'click') {
      const id = generateId();
      const click = {
        id,
        ...body,
        ip,
        timestamp: new Date().toISOString(),
      };
      clickStore.set(id, click);
      return NextResponse.json({ success: true, clickId: id });
    }

    if (type === 'conversion') {
      const id = generateId();
      const conversion = {
        id,
        ...body,
        ip,
        timestamp: new Date().toISOString(),
        status: 'pending',
        fraudSignals: [],
      };
      conversionStore.set(id, conversion);
      return NextResponse.json({ success: true, conversionId: id });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
