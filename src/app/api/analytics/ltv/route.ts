/**
 * LTV Analysis API
 * GET - Get LTV data
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateEntityLTV, getPlatformLTVSummary, LTVConfig } from '@/lib/analytics/ltv';
import { z } from 'zod';

const querySchema = z.object({
  entity_type: z.enum(['advertiser', 'partner']),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().default(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  }),
  end_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  model: z.enum(['simple', 'historical', 'projected']).default('projected'),
  summary_only: z.coerce.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryResult = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { entity_id, start_date, end_date, model, summary_only } = queryResult.data;

    if (summary_only) {
      // Return platform-wide summary
      const summary = await getPlatformLTVSummary(start_date, end_date);
      return NextResponse.json({ data: summary });
    }

    // Return specific entity LTV
    const config: LTVConfig = {
      entityType: queryResult.data.entity_type,
      entityId: entity_id,
      startDate: start_date,
      endDate: end_date,
      model,
    };

    const ltvData = await calculateEntityLTV(config);

    if (!ltvData) {
      return NextResponse.json(
        { error: 'Entity not found or no data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: ltvData });
  } catch (error) {
    console.error('LTV analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LTV data' },
      { status: 500 }
    );
  }
}
