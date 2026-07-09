/**
 * Conversion API Routes
 *
 * Endpoints:
 * GET    /api/conversions           - List conversions
 * POST   /api/conversions           - Create conversion
 * GET    /api/conversions/:id       - Get conversion
 * PUT    /api/conversions/:id       - Update (approve/reject)
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
const conversions = new Map<string, Conversion>();

interface Conversion {
  id: string;
  program_id: string;
  program_name: string;
  partner_id: string;
  partner_name: string;
  channel_type: string;
  conversion_type: string;
  user_identifier: string;
  ip_address: string;
  device_id: string;
  status: 'pending' | 'valid' | 'rejected' | 'fraud';
  payout_amount: number;
  quality_score: number;
  fraud_signals: string[];
  fingerprint: string;
  utms: Record<string, string>;
  metadata?: Record<string, unknown>;
  created_at: string;
  validated_at?: string;
  validated_by?: string;
}

// Initialize with mock data
const mockConversions: Conversion[] = [
  {
    id: 'conv_001',
    program_id: 'prog_001',
    program_name: 'Tunaiku Download + Registration',
    partner_id: 'part_001',
    partner_name: 'JakselNews Media Network',
    channel_type: 'media',
    conversion_type: 'registration',
    user_identifier: 'user_12345',
    ip_address: '192.168.1.100',
    device_id: 'device_abc123',
    status: 'valid',
    payout_amount: 25000,
    quality_score: 92,
    fraud_signals: [],
    fingerprint: 'fp_12345',
    utms: { utm_source: 'jakselnews', utm_medium: 'banner' },
    created_at: '2024-06-01T10:30:00Z',
  },
  {
    id: 'conv_002',
    program_id: 'prog_001',
    program_name: 'Tunaiku Download + Registration',
    partner_id: 'part_002',
    partner_name: 'Finance Creator Jakarta',
    channel_type: 'creator',
    conversion_type: 'registration',
    user_identifier: 'user_12346',
    ip_address: '192.168.1.101',
    device_id: 'device_def456',
    status: 'valid',
    payout_amount: 25000,
    quality_score: 95,
    fraud_signals: [],
    fingerprint: 'fp_67890',
    utms: { utm_source: 'creator', utm_medium: 'instagram' },
    created_at: '2024-06-01T11:45:00Z',
  },
  {
    id: 'conv_003',
    program_id: 'prog_002',
    program_name: 'PRULady Lead Form',
    partner_id: 'part_003',
    partner_name: 'Parenting Community Indonesia',
    channel_type: 'community',
    conversion_type: 'lead_form',
    user_identifier: 'user_12347',
    ip_address: '192.168.1.102',
    device_id: 'device_ghi789',
    status: 'pending',
    payout_amount: 50000,
    quality_score: 78,
    fraud_signals: ['suspicious_velocity'],
    fingerprint: 'fp_11111',
    utms: { utm_source: 'community', utm_medium: 'post' },
    created_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'conv_004',
    program_id: 'prog_001',
    program_name: 'Tunaiku Download + Registration',
    partner_id: 'part_004',
    partner_name: 'Mission User Network',
    channel_type: 'mission',
    conversion_type: 'registration',
    user_identifier: 'user_12349',
    ip_address: '192.168.1.104',
    device_id: 'device_mno345',
    status: 'fraud',
    payout_amount: 25000,
    quality_score: 35,
    fraud_signals: ['duplicate_ip', 'duplicate_device', 'suspicious_velocity'],
    fingerprint: 'fp_22222',
    utms: { utm_source: 'mission', utm_medium: 'app' },
    created_at: '2024-06-01T15:00:00Z',
  },
];

mockConversions.forEach(c => conversions.set(c.id, c));

function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/conversions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const programId = searchParams.get('program_id');
  const partnerId = searchParams.get('partner_id');
  const channel = searchParams.get('channel');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let result = Array.from(conversions.values());

  // Filters
  if (status) result = result.filter(c => c.status === status);
  if (programId) result = result.filter(c => c.program_id === programId);
  if (partnerId) result = result.filter(c => c.partner_id === partnerId);
  if (channel) result = result.filter(c => c.channel_type === channel);
  if (dateFrom) result = result.filter(c => c.created_at >= dateFrom);
  if (dateTo) result = result.filter(c => c.created_at <= dateTo);

  // Sort by date
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Stats
  const stats = {
    total: result.length,
    valid: result.filter(c => c.status === 'valid').length,
    pending: result.filter(c => c.status === 'pending').length,
    rejected: result.filter(c => c.status === 'rejected').length,
    fraud: result.filter(c => c.status === 'fraud').length,
    totalPayout: result.filter(c => c.status === 'valid').reduce((sum, c) => sum + c.payout_amount, 0),
  };

  // Pagination
  const total = result.length;
  const start = (page - 1) * limit;
  const paginatedResult = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginatedResult,
    stats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/conversions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const conversion: Conversion = {
      id: generateId(),
      program_id: body.program_id,
      program_name: body.program_name || '',
      partner_id: body.partner_id,
      partner_name: body.partner_name || '',
      channel_type: body.channel_type,
      conversion_type: body.conversion_type,
      user_identifier: body.user_identifier,
      ip_address: body.ip_address,
      device_id: body.device_id,
      status: 'pending',
      payout_amount: body.payout_amount,
      quality_score: 100,
      fraud_signals: [],
      fingerprint: body.fingerprint,
      utms: body.utms || {},
      metadata: body.metadata,
      created_at: new Date().toISOString(),
    };

    conversions.set(conversion.id, conversion);

    return NextResponse.json({
      success: true,
      data: conversion,
      message: 'Conversion recorded',
    }, { status: 201 });

  } catch (error) {
    console.error('Create conversion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record conversion',
    }, { status: 400 });
  }
}
