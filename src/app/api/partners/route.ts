/**
 * Partner API Routes
 *
 * Endpoints:
 * GET    /api/partners          - List partners
 * POST   /api/partners          - Create partner
 * GET    /api/partners/:id      - Get partner
 * PUT    /api/partners/:id      - Update partner
 * DELETE /api/partners/:id      - Delete partner
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (replace with Supabase)
const partners = new Map<string, Partner>();

interface Partner {
  id: string;
  partner_name: string;
  partner_type: string;
  niche: string;
  location: string;
  audience_size: number;
  quality_score: number;
  fraud_risk: string;
  status: string;
  total_earnings: number;
  email: string;
  phone?: string;
  website?: string;
  created_at: string;
}

// Initialize with mock data
const mockPartners = [
  {
    id: 'part_001',
    partner_name: 'JakselNews Media Network',
    partner_type: 'media',
    niche: 'Lifestyle & Urban',
    location: 'Jakarta Selatan',
    audience_size: 2500000,
    quality_score: 92,
    fraud_risk: 'low',
    status: 'active',
    total_earnings: 18500000,
    email: 'budi@jakselnews.com',
    website: 'https://jakselnews.com',
    created_at: '2024-02-20T10:00:00Z',
  },
  {
    id: 'part_002',
    partner_name: 'Finance Creator Jakarta',
    partner_type: 'creator',
    niche: 'Personal Finance',
    location: 'Jakarta',
    audience_size: 450000,
    quality_score: 88,
    fraud_risk: 'low',
    status: 'active',
    total_earnings: 12300000,
    email: 'creator@finance.id',
    website: 'https://financecreator.id',
    created_at: '2024-02-25T11:00:00Z',
  },
];

mockPartners.forEach(p => partners.set(p.id, p));

function generateId(): string {
  return `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/partners
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let result = Array.from(partners.values());

  // Filter by status
  if (status) {
    result = result.filter(p => p.status === status);
  }

  // Filter by type
  if (type) {
    result = result.filter(p => p.partner_type === type);
  }

  // Search by name
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(p =>
      p.partner_name.toLowerCase().includes(searchLower) ||
      p.niche.toLowerCase().includes(searchLower) ||
      p.location.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = result.length;
  const start = (page - 1) * limit;
  const paginatedResult = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginatedResult,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/partners
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const partner: Partner = {
      id: generateId(),
      partner_name: body.partner_name,
      partner_type: body.partner_type,
      niche: body.niche || '',
      location: body.location || '',
      audience_size: body.audience_size || 0,
      quality_score: 50, // Default score for new partners
      fraud_risk: 'low',
      status: 'pending', // New partners start as pending
      total_earnings: 0,
      email: body.email,
      phone: body.phone,
      website: body.website,
      created_at: new Date().toISOString(),
    };

    partners.set(partner.id, partner);

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create partner',
    }, { status: 400 });
  }
}
