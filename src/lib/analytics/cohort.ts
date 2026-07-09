/**
 * Cohort Analysis Module
 * Calculate retention and performance by cohort
 */

import { supabase } from '@/lib/supabase';

export interface CohortData {
  cohort: string; // e.g., "2024-01"
  size: number;
  periods: number[];
  retention: number[];
  revenue: number[];
  conversions: number[];
}

export interface CohortConfig {
  startDate: string;
  endDate: string;
  cohortType: 'weekly' | 'monthly';
  metric: 'revenue' | 'conversions' | 'retention';
  entityType?: 'advertiser' | 'partner' | 'program';
  entityId?: string;
}

/**
 * Generate cohort data for a given period
 */
export async function getCohortData(config: CohortConfig): Promise<CohortData[]> {
  const { startDate, endDate, cohortType, entityType, entityId } = config;

  // Build base query
  let query = supabase
    .from('conversions')
    .select('created_at, payout_amount, status, partner_id, advertiser_id, program_id');

  if (entityId && entityType) {
    if (entityType === 'partner') {
      query = query.eq('partner_id', entityId);
    } else if (entityType === 'advertiser') {
      query = query.eq('advertiser_id', entityId);
    } else if (entityType === 'program') {
      query = query.eq('program_id', entityId);
    }
  }

  const { data: conversions, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch conversions: ${error.message}`);
  }

  if (!conversions || conversions.length === 0) {
    return [];
  }

  // Group by cohort
  const cohorts = new Map<string, {
    users: Set<string>;
    revenue: number;
    conversions: number;
    periodData: Map<number, { revenue: number; conversions: number; users: Set<string> }>;
  }>();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const cohortMap = cohortType === 'monthly'
    ? (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    : (date: Date) => {
        const week = Math.ceil((date.getDate()) / 7);
        return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      };

  // Initialize cohorts
  const current = new Date(start);
  while (current <= end) {
    const cohortKey = cohortMap(current);
    if (!cohorts.has(cohortKey)) {
      cohorts.set(cohortKey, {
        users: new Set(),
        revenue: 0,
        conversions: 0,
        periodData: new Map(),
      });
    }
    current.setDate(current.getDate() + (cohortType === 'monthly' ? 1 : 1));
  }

  // Process conversions
  for (const conv of conversions) {
    const convDate = new Date(conv.created_at);
    const cohortKey = cohortMap(convDate);

    if (!cohorts.has(cohortKey)) continue;

    const cohort = cohorts.get(cohortKey)!;
    const period = cohortType === 'monthly'
      ? Math.floor((convDate.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000))
      : Math.floor((convDate.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (!cohort.periodData.has(period)) {
      cohort.periodData.set(period, {
        revenue: 0,
        conversions: 0,
        users: new Set(),
      });
    }

    const periodData = cohort.periodData.get(period)!;
    periodData.revenue += conv.payout_amount || 0;
    periodData.conversions += 1;
    if (conv.partner_id) {
      periodData.users.add(conv.partner_id);
    }
    cohort.users.add(conv.partner_id || conv.advertiser_id || 'anonymous');
  }

  // Calculate retention
  const result: CohortData[] = [];
  const maxPeriods = cohortType === 'monthly' ? 12 : 52;

  for (const [cohortKey, cohort] of cohorts) {
    const size = cohort.users.size || 1;
    const periods: number[] = [];
    const retention: number[] = [];
    const revenue: number[] = [];
    const conversionData: number[] = [];

    for (let i = 0; i < maxPeriods; i++) {
      const periodData = cohort.periodData.get(i);
      periods.push(i);
      retention.push(periodData ? (periodData.users.size / size) * 100 : 0);
      revenue.push(periodData?.revenue || 0);
      conversionData.push(periodData?.conversions || 0);
    }

    result.push({
      cohort: cohortKey,
      size,
      periods,
      retention,
      revenue,
      conversions: conversionData,
    });
  }

  return result.sort((a, b) => a.cohort.localeCompare(b.cohort));
}

/**
 * Calculate average retention rate
 */
export function calculateAverageRetention(cohortData: CohortData[]): number {
  if (cohortData.length === 0) return 0;

  let totalRetention = 0;
  let count = 0;

  for (const cohort of cohortData) {
    // Skip period 0 (acquisition period)
    for (let i = 1; i < cohort.retention.length; i++) {
      totalRetention += cohort.retention[i];
      count++;
    }
  }

  return count > 0 ? totalRetention / count : 0;
}
