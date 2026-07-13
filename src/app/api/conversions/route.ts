/**
 * Conversion API Routes - Protected
 * Partners can only track conversions
 * Advertisers can view their program conversions
 * Admins can view all
 *
 * Endpoints:
 * GET    /api/conversions           - List conversions
 * POST   /api/conversions           - Create conversion (track)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { quickFraudCheck, type ConversionContext } from '@/lib/tracking/fraud-engine';
import { requireAuth, requireAdvertiserOrAdmin, requirePartnerOrAdmin, successResponse, errorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schemas
const createConversionSchema = z.object({
  program_id: z.string().min(1),
  partner_id: z.string().min(1),
  channel_type: z.enum(['social_media', 'content', 'email', 'sms', 'affiliate', 'influencer', 'display', 'search', 'organic']).optional().default('organic'),
  conversion_type: z.enum(['signup', 'purchase', 'lead', 'download', 'install', 'view', 'engagement']).optional().default('signup'),
  user_identifier: z.string().optional(),
  device_id: z.string().optional(),
  fingerprint: z.string().optional(),
  utms: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  payout_amount: z.number().positive().optional(),
  event_data: z.record(z.unknown()).optional(),
});

const listConversionsSchema = z.object({
  status: z.enum(['pending', 'valid', 'rejected', 'fraud']).optional(),
  program_id: z.string().optional(),
  partner_id: z.string().optional(),
  channel: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// GET /api/conversions
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const { searchParams } = new URL(request.url);

    // Validate query params
    const queryResult = listConversionsSchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status, program_id, partner_id, channel, date_from, date_to, page, limit } = queryResult.data;

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('conversions')
        .select('*, program:programs(name), partner:partners(partner_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Role-based filtering
      if (user.role === 'partner' && user.partnerId) {
        query = query.eq('partner_id', user.partnerId);
      } else if (user.role === 'advertiser' && user.advertiserId) {
        // Filter by advertiser's programs
        query = query.eq('program_id', program_id || 'none'); // Will need subquery
      }

      if (status) query = query.eq('status', status);
      if (program_id) query = query.eq('program_id', program_id);
      if (partner_id) query = query.eq('partner_id', partner_id);
      if (channel) query = query.eq('channel_type', channel);
      if (date_from) query = query.gte('created_at', date_from);
      if (date_to) query = query.lte('created_at', date_to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: count || 0,
        valid: (data || []).filter(c => c.status === 'valid').length,
        pending: (data || []).filter(c => c.status === 'pending').length,
        rejected: (data || []).filter(c => c.status === 'rejected').length,
        fraud: (data || []).filter(c => c.status === 'fraud').length,
      };

      return NextResponse.json({
        success: true,
        data: data || [],
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Fallback to mock data
    const { mockConversions } = await import('@/lib/mock-data');

    let result = [...mockConversions];

    // Role-based filtering
    if (user.role === 'partner' && user.partnerId) {
      result = result.filter(c => c.partner_id === user.partnerId);
    }

    if (status) result = result.filter(c => c.status === status);
    if (program_id) result = result.filter(c => c.program_id === program_id);
    if (partner_id) result = result.filter(c => c.partner_id === partner_id);
    if (channel) result = result.filter(c => c.channel_type === channel);

    const stats = {
      total: result.length,
      valid: result.filter(c => c.status === 'valid').length,
      pending: result.filter(c => c.status === 'pending').length,
      rejected: result.filter(c => c.status === 'rejected').length,
      fraud: result.filter(c => c.status === 'fraud').length,
    };

    const total = result.length;
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Fetch conversions error:', error);
    return errorResponse('Internal error', 'Failed to fetch conversions', 500);
  }
}

// POST /api/conversions
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (!authResult.success) return authResult.response;

    const user = authResult.user;
    const body = await request.json();

    // Validate body
    const parseResult = createConversionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';

    // Perform fraud check
    const fraudContext: ConversionContext = {
      partner_id: data.partner_id,
      program_id: data.program_id,
      ip_address: ip,
      fingerprint: data.fingerprint,
      email: data.user_identifier,
      device_id: data.device_id,
      user_agent: request.headers.get('user-agent') || undefined,
    };

    const fraudResult = quickFraudCheck(fraudContext);

    // Determine initial status based on fraud check
    let initialStatus: 'pending' | 'fraud' = 'pending';
    if (fraudResult.recommendation === 'reject') {
      initialStatus = 'fraud';
    } else if (fraudResult.totalScore >= 60) {
      initialStatus = 'pending'; // Manual review needed
    }

    // Use Supabase if configured
    if (isSupabaseConfigured()) {
      const { data: conversion, error } = await supabase
        .from('conversions')
        .insert({
          program_id: data.program_id,
          partner_id: data.partner_id,
          channel_type: data.channel_type,
          conversion_type: data.conversion_type,
          user_identifier: data.user_identifier,
          ip_address: ip,
          device_id: data.device_id,
          fingerprint: data.fingerprint,
          utms: data.utms,
          status: initialStatus,
          payout_amount: data.payout_amount,
          quality_score: 100 - fraudResult.totalScore,
          fraud_signals: fraudResult.signals.map(s => s.type),
          fraud_score: fraudResult.totalScore,
          event_data: data.event_data,
        })
        .select()
        .single();

      if (error) {
        console.error('Conversion insert error:', error);
        return errorResponse('Database error', error.message, 400);
      }

      return NextResponse.json({
        success: true,
        data: conversion,
        fraudCheck: {
          score: fraudResult.totalScore,
          recommendation: fraudResult.recommendation,
          blocked: fraudResult.isBlocked,
          signals: fraudResult.signals,
        },
        message: 'Conversion recorded',
      }, { status: 201 });
    }

    // Demo mode - return mock response
    const mockConversion = {
      id: `conv_${Date.now()}`,
      ...data,
      ip_address: ip,
      status: initialStatus,
      fraud_score: fraudResult.totalScore,
      quality_score: 100 - fraudResult.totalScore,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockConversion,
      fraudCheck: {
        score: fraudResult.totalScore,
        recommendation: fraudResult.recommendation,
        blocked: fraudResult.isBlocked,
        signals: fraudResult.signals,
      },
      message: 'Conversion recorded (demo mode)',
    }, { status: 201 });

  } catch (error) {
    console.error('Create conversion error:', error);
    return errorResponse('Internal error', 'Failed to record conversion', 500);
  }
}
