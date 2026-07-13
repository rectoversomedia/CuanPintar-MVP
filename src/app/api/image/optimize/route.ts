/**
 * Image Optimization API Route
 * Server-side image resizing using Sharp
 *
 * GET /api/image/optimize?url=...&w=...&h=...&q=...&f=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

// Allowed formats
const ALLOWED_FORMATS = ['webp', 'jpeg', 'jpg', 'png', 'gif'];

// Max dimensions
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

/**
 * Get optimized image
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters
    const imageUrl = searchParams.get('url');
    const width = parseInt(searchParams.get('w') || '0', 10);
    const height = parseInt(searchParams.get('h') || '0', 10);
    const quality = Math.min(100, Math.max(1, parseInt(searchParams.get('q') || '80', 10)));
    const format = searchParams.get('f') || 'webp';

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate format
    if (!ALLOWED_FORMATS.includes(format.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid format. Allowed: ' + ALLOWED_FORMATS.join(', ') },
        { status: 400 }
      );
    }

    // Validate dimensions
    const finalWidth = Math.min(width || MAX_WIDTH, MAX_WIDTH);
    const finalHeight = Math.min(height || MAX_HEIGHT, MAX_HEIGHT);

    // In production, use Sharp for actual optimization
    if (isSupabaseConfigured()) {
      try {
        // Fetch the original image
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'CuanPintar-ImageOptimizer/1.0',
          },
        });

        if (!response.ok) {
          return NextResponse.json(
            { error: 'Failed to fetch image' },
            { status: 502 }
          );
        }

        const buffer = await response.arrayBuffer();

        // Dynamic import Sharp (optional dependency)
        let optimizedBuffer: Buffer;
        let contentType: string;

        try {
          const sharp = (await import('sharp')).default;

          let sharpInstance = sharp(Buffer.from(buffer));

          // Resize if dimensions provided
          if (width || height) {
            sharpInstance = sharpInstance.resize(width || null, height || null, {
              fit: 'inside',
              withoutEnlargement: true,
            });
          }

          // Convert to target format
          switch (format.toLowerCase()) {
            case 'webp':
              sharpInstance = sharpInstance.webp({ quality });
              contentType = 'image/webp';
              break;
            case 'jpeg':
            case 'jpg':
              sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
              contentType = 'image/jpeg';
              break;
            case 'png':
              sharpInstance = sharpInstance.png({ compressionLevel: 9 - Math.floor(quality / 12) });
              contentType = 'image/png';
              break;
            case 'gif':
              sharpInstance = sharpInstance.gif();
              contentType = 'image/gif';
              break;
            default:
              contentType = 'image/webp';
          }

          optimizedBuffer = await sharpInstance.toBuffer();

          // Return optimized image
          return new NextResponse(new Uint8Array(optimizedBuffer), {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'CDN-Cache-Control': 'public, max-age=31536000, immutable',
              'Vary': 'Accept',
            },
          });
        } catch (sharpError) {
          // Sharp not installed, return original
          console.warn('Sharp not available, returning original image');
          return new NextResponse(new Uint8Array(buffer), {
            headers: {
              'Content-Type': response.headers.get('content-type') || 'image/jpeg',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      } catch (error) {
        console.error('Image optimization error:', error);
        return NextResponse.json(
          { error: 'Failed to optimize image' },
          { status: 500 }
        );
      }
    }

    // Demo mode: redirect to original image
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
