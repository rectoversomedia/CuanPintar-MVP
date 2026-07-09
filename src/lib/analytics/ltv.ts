/**
 * LTV (Lifetime Value) Calculation Module
 * Calculate customer lifetime value for advertisers and partners
 */

import { supabase } from '@/lib/supabase';

export interface LTVConfig {
  entityType: 'advertiser' | 'partner';
  entityId?: string;
  startDate: string;
  endDate: string;
  model: 'simple' | 'historical' | 'projected';
}

export interface LTVData {
  entityId: string;
  entityName: string;
  totalRevenue: number;
  totalConversions: number;
  totalPayout: number;
  avgOrderValue: number;
  lifetime: number; // in days
  retentionRate: number;
  predictedLTV: number;
  ltvByMonth: { month: string; revenue: number; cumulative: number }[];
}

export interface PlatformLTVSummary {
  avgPartnerLTV: number;
  avgAdvertiserLTV: number;
  totalPartnerLTV: number;
  totalAdvertiserLTV: number;
  topPartners: { id: string; name: string; ltv: number }[];
  topAdvertisers: { id: string; name: string; ltv: number }[];
}

/**
 * Calculate LTV for a specific entity
 */
export async function calculateEntityLTV(config: LTVConfig): Promise<LTVData | null> {
  const { entityType, entityId, startDate, endDate, model } = config;

  // Get entity info
  const tableName = entityType === 'partner' ? 'partners' : 'advertisers';
  const userTableName = entityType === 'partner' ? 'users' : 'users';
  const revenueField = entityType === 'partner' ? 'total_earnings' : 'total_spend';

  let query = supabase
    .from(tableName)
    .select(`
      id,
      ${entityType === 'partner' ? 'partner_name' : 'company_name'},
      ${revenueField},
      total_conversions,
      created_at,
      user:users!${userTableName}(name)
    `);

  if (entityId) {
    query = query.eq('id', entityId);
  }

  const { data: entities, error } = await query;

  if (error || !entities || entities.length === 0) {
    return null;
  }

  const entity = entities[0];
  let entityName = entityType === 'partner'
    ? String((entity as Record<string, unknown>).partner_name || '')
    : String((entity as Record<string, unknown>).company_name || '');
  if (!entityName) entityName = 'Unknown';

  // Get conversions data
  const conversionField = entityType === 'partner' ? 'partner_id' : 'advertiser_id';
  const payoutField = entityType === 'partner' ? 'payout_amount' : 'payout_amount';

  const { data: conversions } = await supabase
    .from('conversions')
    .select('created_at, payout_amount, status')
    .eq(conversionField, entity.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .eq('status', 'valid');

  if (!conversions) {
    return null;
  }

  // Calculate metrics
  const totalConversions = conversions.length;
  const totalRevenue = conversions.reduce((sum, c) => sum + (c.payout_amount || 0), 0);
  const avgOrderValue = totalConversions > 0 ? totalRevenue / totalConversions : 0;

  // Calculate lifetime
  const createdAt = new Date(entity.created_at);
  const end = new Date(endDate);
  const lifetime = Math.max(1, Math.floor((end.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)));

  // Calculate retention rate (monthly)
  const monthlyData = new Map<string, { conversions: number; revenue: number }>();
  for (const conv of conversions) {
    const month = conv.created_at.substring(0, 7); // YYYY-MM
    if (!monthlyData.has(month)) {
      monthlyData.set(month, { conversions: 0, revenue: 0 });
    }
    const data = monthlyData.get(month)!;
    data.conversions++;
    data.revenue += conv.payout_amount || 0;
  }

  const activeMonths = monthlyData.size;
  const retentionRate = lifetime > 0 ? (activeMonths / (lifetime / 30)) * 100 : 0;

  // Calculate LTV based on model
  let predictedLTV = 0;

  if (model === 'simple') {
    predictedLTV = totalRevenue;
  } else if (model === 'historical') {
    predictedLTV = avgOrderValue * (activeMonths > 0 ? totalConversions / activeMonths : 0) * 12;
  } else {
    // Projected: avg monthly revenue * projected months
    const avgMonthlyRevenue = totalRevenue / Math.max(1, lifetime / 30);
    const monthlyChurnRate = 1 - (retentionRate / 100);
    const expectedLifetime = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : 12;
    predictedLTV = avgMonthlyRevenue * Math.min(expectedLifetime, 24);
  }

  // Build monthly breakdown
  const ltvByMonth: { month: string; revenue: number; cumulative: number }[] = [];
  let cumulative = 0;
  for (const [month, data] of [...monthlyData.entries()].sort()) {
    cumulative += data.revenue;
    ltvByMonth.push({ month, revenue: data.revenue, cumulative });
  }

  return {
    entityId: entity.id,
    entityName,
    totalRevenue,
    totalConversions,
    totalPayout: totalRevenue,
    avgOrderValue,
    lifetime,
    retentionRate: Math.min(100, retentionRate),
    predictedLTV,
    ltvByMonth,
  };
}

/**
 * Get platform-wide LTV summary
 */
export async function getPlatformLTVSummary(startDate: string, endDate: string): Promise<PlatformLTVSummary> {
  // Get all partners with LTV
  const { data: partners } = await supabase
    .from('partners')
    .select('id, partner_name, total_earnings, total_conversions')
    .eq('status', 'active');

  // Get all advertisers with LTV
  const { data: advertisers } = await supabase
    .from('advertisers')
    .select('id, company_name, total_spend, active_programs')
    .eq('status', 'active');

  const partnerLTVs = (partners || []).map(p => ({
    id: p.id,
    name: p.partner_name,
    ltv: p.total_earnings || 0,
  }));

  const advertiserLTVs = (advertisers || []).map(a => ({
    id: a.id,
    name: a.company_name,
    ltv: a.total_spend || 0,
  }));

  const avgPartnerLTV = partnerLTVs.length > 0
    ? partnerLTVs.reduce((sum, p) => sum + p.ltv, 0) / partnerLTVs.length
    : 0;

  const avgAdvertiserLTV = advertiserLTVs.length > 0
    ? advertiserLTVs.reduce((sum, a) => sum + a.ltv, 0) / advertiserLTVs.length
    : 0;

  return {
    avgPartnerLTV,
    avgAdvertiserLTV,
    totalPartnerLTV: partnerLTVs.reduce((sum, p) => sum + p.ltv, 0),
    totalAdvertiserLTV: advertiserLTVs.reduce((sum, a) => sum + a.ltv, 0),
    topPartners: partnerLTVs.sort((a, b) => b.ltv - a.ltv).slice(0, 10),
    topAdvertisers: advertiserLTVs.sort((a, b) => b.ltv - a.ltv).slice(0, 10),
  };
}
