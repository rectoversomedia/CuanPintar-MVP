/**
 * Analytics Dashboard API
 * GET - Get dashboard analytics summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const querySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '365d']).default('30d'),
  entity_type: z.enum(['platform', 'advertiser', 'partner', 'program']).default('platform'),
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

    const { period, entity_type, entity_id } = queryResult.data;

    // Calculate date range
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365,
    }[period];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    let query = supabase
      .from('daily_stats')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('entity_type', entity_type);

    if (entity_id) {
      query = query.eq('entity_id', entity_id);
    }

    const { data: stats, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Aggregate data
    const aggregated = {
      totalClicks: 0,
      totalConversions: 0,
      validConversions: 0,
      rejectedConversions: 0,
      fraudConversions: 0,
      totalRevenue: 0,
      totalPayout: 0,
      avgCTR: 0,
      avgCVR: 0,
    };

    for (const stat of stats || []) {
      aggregated.totalClicks += stat.clicks || 0;
      aggregated.totalConversions += stat.conversions || 0;
      aggregated.validConversions += stat.valid_conversions || 0;
      aggregated.rejectedConversions += stat.rejected_conversions || 0;
      aggregated.fraudConversions += stat.fraud_conversions || 0;
      aggregated.totalRevenue += stat.revenue || 0;
      aggregated.totalPayout += stat.payout || 0;
    }

    const totalNonFraud = aggregated.validConversions + aggregated.rejectedConversions;
    aggregated.avgCVR = aggregated.totalClicks > 0
      ? (totalNonFraud / aggregated.totalClicks) * 100
      : 0;
    aggregated.avgCTR = aggregated.totalClicks > 0
      ? (aggregated.totalConversions / aggregated.totalClicks) * 100
      : 0;

    // Get trend data (daily breakdown)
    const dailyTrend = (stats || [])
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(stat => ({
        date: stat.date,
        clicks: stat.clicks,
        conversions: stat.conversions,
        revenue: stat.revenue,
        cvr: stat.clicks > 0 ? (stat.conversions / stat.clicks) * 100 : 0,
      }));

    // Get top performing entities
    let topQuery = supabase
      .from('daily_stats')
      .select('entity_id, entity_type, revenue, conversions')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('entity_type', entity_type === 'platform' ? 'advertiser' : entity_type);

    if (entity_id) {
      topQuery = topQuery.eq('entity_id', entity_id);
    }

    const { data: topStats } = await topQuery;

    // Aggregate by entity
    const entityMap = new Map<string, { revenue: number; conversions: number }>();
    for (const stat of topStats || []) {
      if (!stat.entity_id) continue;
      if (!entityMap.has(stat.entity_id)) {
        entityMap.set(stat.entity_id, { revenue: 0, conversions: 0 });
      }
      const entity = entityMap.get(stat.entity_id)!;
      entity.revenue += stat.revenue || 0;
      entity.conversions += stat.conversions || 0;
    }

    const topPerformers = [...entityMap.entries()]
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      data: {
        summary: aggregated,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days,
        },
        trend: dailyTrend,
        topPerformers,
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
