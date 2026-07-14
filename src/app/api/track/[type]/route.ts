/**
 * Dynamic Track API Routes - Secured
 *
 * Handles dynamic tracking endpoints based on type parameter
 * Supports: click, conversion, pixel, validate, stats
 *
 * Security:
 * - Rate limiting on all endpoints
 * - Fraud detection
 * - S2S webhook signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { quickFraudCheck, type ConversionContext } from '@/lib/tracking/fraud-engine';
import { checkPublicRateLimit, createRateLimitResponse } from '@/lib/security/public-rate-limit';
import { verifySignedWebhookPayload } from '@/lib/services/webhook-verification';
import { z } from 'zod';

// In-memory storage (for demo mode)
const clickStore = new Map<string, Record<string, unknown>>();
const conversionStore = new Map<string, Record<string, unknown>>();

// S2S conversion schema for validation
const s2sConversionSchema = z.object({
  program_id: z.string().min(1),
  partner_id: z.string().min(1),
  event_id: z.string().optional(),
  event_name: z.string().optional(),
  channel_type: z.enum(['social_media', 'content', 'email', 'sms', 'affiliate', 'influencer', 'display', 'search', 'organic']).default('organic'),
  conversion_type: z.enum(['signup', 'purchase', 'lead', 'download', 'install', 'view', 'engagement']).default('signup'),
  user_identifier: z.string().optional(),
  device_id: z.string().optional(),
  fingerprint: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().default('IDR'),
  utms: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // S2S specific
  api_key: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  signature: z.string().optional(),
});

// Click tracking schema for validation
const clickSchema = z.object({
  partner_id: z.string().min(1, 'Partner ID is required'),
  program_id: z.string().min(1, 'Program ID is required'),
  fingerprint: z.string().optional(),
  referrer: z.string().url().optional().or(z.string().max(2000)),
  utm_source: z.string().max(255).optional(),
  utm_medium: z.string().max(255).optional(),
  utm_campaign: z.string().max(255).optional(),
  utm_term: z.string().max(255).optional(),
  utm_content: z.string().max(255).optional(),
});

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

  // Check rate limit for all GET requests
  const rateLimit = await checkPublicRateLimit(request, 'track');
  if (!rateLimit.allowed) {
    return createRateLimitResponse({
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
      type: 'tracking',
    });
  }

  if (type === 'pixel') {
    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, private',
        'Pragma': 'no-cache',
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  }

  if (type === 'validate') {
    const fingerprint = searchParams.get('fingerprint');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

    return NextResponse.json({
      fingerprint,
      valid: true,
      timestamp: new Date().toISOString(),
    });
  }

  if (type === 'stats') {
    // Return tracking stats (admin only in production)
    return NextResponse.json({
      clicks: clickStore.size,
      conversions: conversionStore.size,
      status: 'operational',
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
    // Check rate limit
    const rateLimitType = type === 'conversion' ? 'conversion' : 'click';
    const rateLimit = await checkPublicRateLimit(request, rateLimitType);
    if (!rateLimit.allowed) {
      return createRateLimitResponse({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
        type: rateLimitType,
      });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = request.headers.get('user-agent') || '';

    if (type === 'click') {
      const body = await request.json();

      // Validate click data
      const validationResult = clickSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const validatedData = validationResult.data;
      const id = generateId();

      const click = {
        id,
        partner_id: validatedData.partner_id,
        program_id: validatedData.program_id,
        fingerprint: validatedData.fingerprint,
        ip,
        user_agent: userAgent,
        referrer: validatedData.referrer,
        utm_source: validatedData.utm_source,
        utm_medium: validatedData.utm_medium,
        utm_campaign: validatedData.utm_campaign,
        utm_term: validatedData.utm_term,
        utm_content: validatedData.utm_content,
        timestamp: new Date().toISOString(),
      };

      clickStore.set(id, click);

      // Record to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('tracking_clicks').insert({
            id,
            partner_id: validatedData.partner_id,
            program_id: validatedData.program_id,
            fingerprint: validatedData.fingerprint,
            ip_address: ip,
            user_agent: userAgent,
            referrer: validatedData.referrer,
            utm_source: validatedData.utm_source,
            utm_medium: validatedData.utm_medium,
            utm_campaign: validatedData.utm_campaign,
          });
        } catch (err) {
          console.error('Failed to record click to Supabase:', err);
        }
      }

      return NextResponse.json(
        { success: true, clickId: id },
        {
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    if (type === 'conversion') {
      const body = await request.json();

      // Validate request body
      const validationResult = s2sConversionSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const data = validationResult.data;

      // Verify S2S signature if provided
      if (data.signature && data.api_key) {
        const webhookSecret = process.env.S2S_WEBHOOK_SECRET || 'demo-s2s-secret';
        const payloadStr = JSON.stringify({
          program_id: data.program_id,
          partner_id: data.partner_id,
          event_id: data.event_id,
          event_name: data.event_name,
          conversion_type: data.conversion_type,
          timestamp: data.timestamp,
        });

        const signatureResult = verifySignedWebhookPayload(
          payloadStr,
          data.signature,
          webhookSecret
        );

        if (!signatureResult.valid) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid signature',
              message: 'S2S webhook signature verification failed',
            },
            { status: 401 }
          );
        }
      }

      // Perform quick fraud check
      const fraudContext: ConversionContext = {
        partner_id: data.partner_id,
        program_id: data.program_id,
        ip_address: ip,
        fingerprint: data.fingerprint,
        email: data.email,
        device_id: data.device_id,
        user_agent: userAgent,
        partner_fraud_rate: body.partner_fraud_rate,
      };

      const fraudResult = quickFraudCheck(fraudContext);

      const id = generateId();
      const conversion = {
        id,
        ...data,
        ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
        status: fraudResult.recommendation === 'reject' ? 'rejected' : 'pending',
        fraud_score: fraudResult.totalScore,
        fraud_signals: fraudResult.signals.map((s) => s.type),
        fraud_reasons: fraudResult.reasons,
      };

      conversionStore.set(id, conversion);

      // Record to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('conversions').insert({
            id,
            program_id: data.program_id,
            partner_id: data.partner_id,
            channel_type: data.channel_type,
            conversion_type: data.conversion_type,
            user_identifier: data.user_identifier,
            ip_address: ip,
            device_id: data.device_id,
            fingerprint: data.fingerprint,
            utms: data.utms,
            status: fraudResult.recommendation === 'reject' ? 'fraud' : 'pending',
            fraud_score: fraudResult.totalScore,
            fraud_signals: fraudResult.signals.map((s) => s.type),
            event_id: data.event_id,
            event_data: data.metadata,
          });
        } catch (err) {
          console.error('Failed to record conversion to Supabase:', err);
        }
      }

      return NextResponse.json(
        {
          success: true,
          conversionId: id,
          status: conversion.status,
          fraudCheck: {
            score: fraudResult.totalScore,
            recommendation: fraudResult.recommendation,
            blocked: fraudResult.isBlocked,
            signals: fraudResult.signals.map((s) => ({
              type: s.type,
              score: s.score,
            })),
          },
        },
        {
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': (rateLimit.remaining - 1).toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
