/**
 * QR Code Generation API Route
 *
 * Endpoint:
 * GET /api/links/[id]/qr - Generate QR code PNG
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import QRCode from 'qrcode';

// GET /api/links/[id]/qr - Generate QR code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { id: linkId } = await params;

    // QR code customization options
    const format = searchParams.get('format') || 'base64'; // base64, png
    const size = parseInt(searchParams.get('size') || '300'); // 128-1024
    const margin = parseInt(searchParams.get('margin') || '4'); // 0-10
    const foreground = searchParams.get('fg') || '#000000';
    const background = searchParams.get('bg') || '#FFFFFF';

    // Validate size
    const validSize = Math.min(Math.max(size, 128), 1024);

    // Get link data
    let trackingUrl: string;

    // Demo mode
    if (!isSupabaseConfigured()) {
      // Use a demo URL
      trackingUrl = `https://cuanpintar.com/r/demo-${linkId}`;
    } else {
      // Production mode - fetch link
      const { data: link, error } = await supabase
        .from('tracking_links')
        .select('short_url, tracking_url')
        .eq('id', linkId)
        .single();

      if (error || !link) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }

      // Prefer short URL for QR
      trackingUrl = link.short_url || link.tracking_url;
    }

    // QR code options
    const options = {
      width: validSize,
      margin: Math.min(Math.max(margin, 0), 10),
      color: {
        dark: foreground,
        light: background,
      },
    };

    // Generate QR code as base64
    const dataUrl = await QRCode.toDataURL(trackingUrl, options);

    return NextResponse.json({
      success: true,
      data: dataUrl,
      url: trackingUrl,
      format: 'base64',
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

// POST /api/links/[id]/qr - Generate QR code with custom content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json().catch(() => ({}));

    // QR code customization options
    const content = body.content;
    const format = body.format || 'base64';
    const size = body.size || 300;
    const foreground = body.foreground || '#000000';
    const background = body.background || '#FFFFFF';

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // QR code options
    const options = {
      width: size,
      margin: 4,
      color: {
        dark: foreground,
        light: background,
      },
    };

    const dataUrl = await QRCode.toDataURL(content, options);

    return NextResponse.json({
      success: true,
      data: dataUrl,
      format: 'base64',
      content,
      options: {
        size,
        foreground,
        background,
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
