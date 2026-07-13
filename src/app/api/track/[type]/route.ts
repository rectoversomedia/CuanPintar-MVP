/**
 * Dynamic Track API Routes
 *
 * Handles dynamic tracking endpoints based on type parameter
 * Supports: click, conversion, pixel, validate
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { quickFraudCheck, type ConversionContext } from '@/lib/tracking/fraud-engine';

// In-memory storage (for demo mode)
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

  if (type === 'stats') {
    // Return tracking stats
    return NextResponse.json({
      clicks: clickStore.size,
      conversions: conversionStore.size,
    });
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

      // Record to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('tracking_clicks').insert({
            id,
            partner_id: body.partner_id,
            program_id: body.program_id,
            fingerprint: body.fingerprint,
            ip_address: ip,
            user_agent: request.headers.get('user-agent') || undefined,
            referrer: body.referrer,
            utm_source: body.utm_source,
            utm_medium: body.utm_medium,
            utm_campaign: body.utm_campaign,
          });
        } catch (err) {
          console.error('Failed to record click to Supabase:', err);
        }
      }

      return NextResponse.json({ success: true, clickId: id });
    }

    if (type === 'conversion') {
      const id = generateId();

      // Perform quick fraud check
      const fraudContext: ConversionContext = {
        partner_id: body.partner_id,
        program_id: body.program_id,
        ip_address: ip,
        fingerprint: body.fingerprint,
        email: body.email,
        device_id: body.device_id,
        user_agent: request.headers.get('user-agent') || undefined,
        referrer: body.referrer,
        partner_fraud_rate: body.partner_fraud_rate,
      };

      const fraudResult = quickFraudCheck(fraudContext);

      const conversion = {
        id,
        ...body,
        ip,
        timestamp: new Date().toISOString(),
        status: fraudResult.recommendation === 'reject' ? 'rejected' : 'pending',
        fraud_score: fraudResult.totalScore,
        fraud_signals: fraudResult.signals.map(s => s.type),
      };

      conversionStore.set(id, conversion);

      // Record to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('conversions').insert({
            id,
            program_id: body.program_id,
            partner_id: body.partner_id,
            channel_type: body.channel_type,
            conversion_type: body.conversion_type,
            user_identifier: body.user_identifier,
            ip_address: ip,
            device_id: body.device_id,
            fingerprint: body.fingerprint,
            utms: body.utms || {},
            status: fraudResult.recommendation === 'reject' ? 'fraud' : 'pending',
            fraud_score: fraudResult.totalScore,
            fraud_signals: fraudResult.signals.map(s => s.type),
          });
        } catch (err) {
          console.error('Failed to record conversion to Supabase:', err);
        }
      }

      return NextResponse.json({
        success: true,
        conversionId: id,
        fraudCheck: {
          score: fraudResult.totalScore,
          recommendation: fraudResult.recommendation,
          blocked: fraudResult.isBlocked,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
