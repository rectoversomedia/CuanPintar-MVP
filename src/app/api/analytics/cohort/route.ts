/**
 * Cohort Analysis API
 * GET - Get cohort analysis data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCohortData, CohortConfig } from '@/lib/analytics/cohort';
import { z } from 'zod';

const querySchema = z.object({
  start_date: z.string().default(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  }),
  end_date: z.string().default(() => new Date().toISOString().split('T')[0]),
  cohort_type: z.enum(['weekly', 'monthly']).default('monthly'),
  metric: z.enum(['revenue', 'conversions', 'retention']).default('revenue'),
  entity_type: z.enum(['advertiser', 'partner', 'program']).optional(),
  entity_id: z.string().uuid().optional(),
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

    const config: CohortConfig = {
      startDate: queryResult.data.start_date,
      endDate: queryResult.data.end_date,
      cohortType: queryResult.data.cohort_type,
      metric: queryResult.data.metric,
      entityType: queryResult.data.entity_type,
      entityId: queryResult.data.entity_id,
    };

    const cohortData = await getCohortData(config);

    return NextResponse.json({ data: cohortData });
  } catch (error) {
    console.error('Cohort analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort data' },
      { status: 500 }
    );
  }
}
