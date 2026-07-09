/**
 * Program API Routes
 *
 * Endpoints:
 * GET    /api/programs           - List programs
 * POST   /api/programs           - Create program
 * GET    /api/programs/:id       - Get program
 * PUT    /api/programs/:id       - Update program
 * DELETE /api/programs/:id       - Delete program
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
const programs = new Map<string, Program>();

interface Program {
  id: string;
  advertiser_id: string;
  advertiser_name: string;
  name: string;
  brand_name: string;
  industry: string;
  description: string;
  objectives: string[];
  target_audience: { [key: string]: string };
  budget: number;
  payout_model: string;
  payout_amount: number;
  target_volume: number;
  status: string;
  channels: Channel[];
  start_date: string;
  end_date: string;
  created_at: string;
  tracking_pixel?: string;
}

interface Channel {
  channel_type: string;
  allocated_budget: number;
  estimated_volume: number;
  quality_score: number;
  fraud_risk: string;
}

// Initialize with mock data
const mockPrograms = [
  {
    id: 'prog_001',
    advertiser_id: 'adv_001',
    advertiser_name: 'Tunaiku',
    name: 'Tunaiku Download + Registration',
    brand_name: 'Tunaiku',
    industry: 'Financial Services',
    description: 'Acquire new Tunaiku app users through registration program.',
    objectives: ['app_install', 'registration'],
    target_audience: { age: '21-35', location: 'Jakarta, Surabaya' },
    budget: 50000000,
    payout_model: 'CPA',
    payout_amount: 25000,
    target_volume: 2000,
    status: 'active',
    channels: [
      { channel_type: 'media', allocated_budget: 20000000, estimated_volume: 800, quality_score: 88, fraud_risk: 'low' },
      { channel_type: 'creator', allocated_budget: 15000000, estimated_volume: 600, quality_score: 92, fraud_risk: 'low' },
    ],
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    created_at: '2024-03-25T10:00:00Z',
    tracking_pixel: '<script src="https://cdn.cuanpintar.com/pixel.min.js"></script>',
  },
  {
    id: 'prog_002',
    advertiser_id: 'adv_002',
    advertiser_name: 'Prudential',
    name: 'PRULady Lead Form',
    brand_name: 'Prudential',
    industry: 'Insurance',
    description: 'Generate qualified insurance leads from female professionals.',
    objectives: ['lead_form'],
    target_audience: { age: '25-45', gender: 'female' },
    budget: 40000000,
    payout_model: 'CPL',
    payout_amount: 50000,
    target_volume: 800,
    status: 'active',
    channels: [
      { channel_type: 'media', allocated_budget: 18000000, estimated_volume: 360, quality_score: 90, fraud_risk: 'low' },
    ],
    start_date: '2024-04-15',
    end_date: '2024-07-15',
    created_at: '2024-04-10T11:00:00Z',
  },
];

mockPrograms.forEach(p => programs.set(p.id, p));

function generateId(): string {
  return `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/programs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const industry = searchParams.get('industry');
  const advertiserId = searchParams.get('advertiser_id');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let result = Array.from(programs.values());

  // Filters
  if (status) {
    result = result.filter(p => p.status === status);
  }
  if (industry) {
    result = result.filter(p => p.industry === industry);
  }
  if (advertiserId) {
    result = result.filter(p => p.advertiser_id === advertiserId);
  }

  // Sort by created date
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination
  const total = result.length;
  const start = (page - 1) * limit;
  const paginatedResult = result.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginatedResult,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/programs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const program: Program = {
      id: generateId(),
      advertiser_id: body.advertiser_id,
      advertiser_name: body.advertiser_name,
      name: body.name,
      brand_name: body.brand_name,
      industry: body.industry,
      description: body.description,
      objectives: body.objectives || [],
      target_audience: body.target_audience || {},
      budget: body.budget,
      payout_model: body.payout_model,
      payout_amount: body.payout_amount,
      target_volume: body.target_volume,
      status: 'pending', // Start as pending
      channels: body.channels || [],
      start_date: body.start_date,
      end_date: body.end_date,
      created_at: new Date().toISOString(),
    };

    programs.set(program.id, program);

    return NextResponse.json({
      success: true,
      data: program,
      message: 'Program created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create program error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create program',
    }, { status: 400 });
  }
}
