/**
 * CuanPintar - Attribution Engine
 * Phase 3: Tracking & Attribution
 *
 * Multi-touch attribution models for conversion tracking
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AttributionModel = 'first_click' | 'last_click' | 'linear' | 'time_decay' | 'position_based';

export interface Touchpoint {
  id: string;
  partner_id: string;
  click_id?: string;
  touchpoint_type: 'click' | 'view' | 'interaction';
  created_at: string;
  utms?: Record<string, string>;
}

export interface AttributionResult {
  partner_id: string;
  model: AttributionModel;
  credited_amount?: number; // for CPS/revenue share
  touchpoints_count: number;
  first_touch_date?: string;
  last_touch_date?: string;
}

/**
 * Get all touchpoints for a visitor/program
 */
export async function getTouchpoints(
  visitorId: string,
  programId: string,
  conversionTime: Date
): Promise<Touchpoint[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  // Get attribution window from program
  const { data: program } = await supabase
    .from('programs')
    .select('attribution_window_days')
    .eq('id', programId)
    .single();

  const windowDays = program?.attribution_window_days || 7;
  const windowStart = new Date(conversionTime.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('attribution_touchpoints')
    .select('*')
    .eq('visitor_id', visitorId)
    .eq('program_id', programId)
    .gte('created_at', windowStart.toISOString())
    .lte('created_at', conversionTime.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get touchpoints:', error);
    return [];
  }

  return (data || []) as Touchpoint[];
}

/**
 * Calculate first-click attribution
 */
function firstClickAttribution(touchpoints: Touchpoint[]): AttributionResult | null {
  if (touchpoints.length === 0) return null;

  const first = touchpoints[0];
  return {
    partner_id: first.partner_id,
    model: 'first_click',
    touchpoints_count: touchpoints.length,
    first_touch_date: first.created_at,
    last_touch_date: touchpoints[touchpoints.length - 1].created_at,
  };
}

/**
 * Calculate last-click attribution
 */
function lastClickAttribution(touchpoints: Touchpoint[]): AttributionResult | null {
  if (touchpoints.length === 0) return null;

  const last = touchpoints[touchpoints.length - 1];
  return {
    partner_id: last.partner_id,
    model: 'last_click',
    touchpoints_count: touchpoints.length,
    first_touch_date: touchpoints[0].created_at,
    last_touch_date: last.created_at,
  };
}

/**
 * Calculate linear attribution (equal credit)
 */
function linearAttribution(touchpoints: Touchpoint[]): AttributionResult[] {
  if (touchpoints.length === 0) return [];

  // Group by partner
  const partnerTouchpoints = new Map<string, Touchpoint[]>();
  for (const tp of touchpoints) {
    const existing = partnerTouchpoints.get(tp.partner_id) || [];
    existing.push(tp);
    partnerTouchpoints.set(tp.partner_id, existing);
  }

  const results: AttributionResult[] = [];
  const clickTouchpoints = touchpoints.filter(t => t.touchpoint_type === 'click');
  const creditPerClick = 1 / Math.max(clickTouchpoints.length, 1);

  for (const [partnerId, tps] of partnerTouchpoints) {
    const clickCount = tps.filter(t => t.touchpoint_type === 'click').length;
    results.push({
      partner_id: partnerId,
      model: 'linear',
      credited_amount: creditPerClick * clickCount,
      touchpoints_count: tps.length,
      first_touch_date: tps[0].created_at,
      last_touch_date: tps[tps.length - 1].created_at,
    });
  }

  return results;
}

/**
 * Calculate time-decay attribution (more credit to recent)
 */
function timeDecayAttribution(
  touchpoints: Touchpoint[],
  halfLifeHours: number = 24
): AttributionResult[] {
  if (touchpoints.length === 0) return [];

  const conversionTime = new Date(touchpoints[touchpoints.length - 1].created_at).getTime();
  const halfLifeMs = halfLifeHours * 60 * 60 * 1000;

  // Group by partner
  const partnerTouchpoints = new Map<string, Touchpoint[]>();
  for (const tp of touchpoints) {
    const existing = partnerTouchpoints.get(tp.partner_id) || [];
    existing.push(tp);
    partnerTouchpoints.set(tp.partner_id, existing);
  }

  const results: AttributionResult[] = [];
  const totalWeight = new Map<string, number>();

  // Calculate weights
  for (const tp of touchpoints) {
    const tpTime = new Date(tp.created_at).getTime();
    const age = conversionTime - tpTime;
    const weight = Math.pow(0.5, age / halfLifeMs);

    const current = totalWeight.get(tp.partner_id) || 0;
    totalWeight.set(tp.partner_id, current + weight);
  }

  const totalWeightSum = Array.from(totalWeight.values()).reduce((a, b) => a + b, 0);

  for (const [partnerId, tps] of partnerTouchpoints) {
    const weight = totalWeight.get(partnerId) || 0;
    results.push({
      partner_id: partnerId,
      model: 'time_decay',
      credited_amount: weight / Math.max(totalWeightSum, 1),
      touchpoints_count: tps.length,
      first_touch_date: tps[0].created_at,
      last_touch_date: tps[tps.length - 1].created_at,
    });
  }

  return results;
}

/**
 * Calculate position-based attribution (40% first, 20% last, 40% middle)
 */
function positionBasedAttribution(touchpoints: Touchpoint[]): AttributionResult[] {
  if (touchpoints.length === 0) return [];

  // Group by partner
  const partnerTouchpoints = new Map<string, Touchpoint[]>();
  for (const tp of touchpoints) {
    const existing = partnerTouchpoints.get(tp.partner_id) || [];
    existing.push(tp);
    partnerTouchpoints.set(tp.partner_id, existing);
  }

  const clickTouchpoints = touchpoints.filter(t => t.touchpoint_type === 'click');
  const n = clickTouchpoints.length;

  if (n === 1) {
    // Single touch = 100% to that partner
    return [{
      partner_id: clickTouchpoints[0].partner_id,
      model: 'position_based',
      credited_amount: 1,
      touchpoints_count: 1,
      first_touch_date: clickTouchpoints[0].created_at,
      last_touch_date: clickTouchpoints[0].created_at,
    }];
  }

  const firstPartner = clickTouchpoints[0].partner_id;
  const lastPartner = clickTouchpoints[n - 1].partner_id;

  const results: AttributionResult[] = [];

  for (const [partnerId, tps] of partnerTouchpoints) {
    let credit = 0;
    const clickCount = tps.filter(t => t.touchpoint_type === 'click').length;

    if (partnerId === firstPartner) {
      credit += 0.4 * (clickCount / n);
    }
    if (partnerId === lastPartner) {
      credit += 0.2 * (clickCount / n);
    }
    if (n > 2) {
      credit += 0.4 * (clickCount / n);
    }

    results.push({
      partner_id: partnerId,
      model: 'position_based',
      credited_amount: credit,
      touchpoints_count: tps.length,
      first_touch_date: tps[0].created_at,
      last_touch_date: tps[tps.length - 1].created_at,
    });
  }

  return results;
}

/**
 * Main attribution calculation function
 */
export async function calculateAttribution(
  visitorId: string,
  programId: string,
  conversionTime: Date,
  model: AttributionModel = 'last_click'
): Promise<AttributionResult | AttributionResult[] | null> {
  const touchpoints = await getTouchpoints(visitorId, programId, conversionTime);

  if (touchpoints.length === 0) {
    return null;
  }

  switch (model) {
    case 'first_click':
      return firstClickAttribution(touchpoints);
    case 'last_click':
      return lastClickAttribution(touchpoints);
    case 'linear':
      return linearAttribution(touchpoints);
    case 'time_decay':
      return timeDecayAttribution(touchpoints);
    case 'position_based':
      return positionBasedAttribution(touchpoints);
    default:
      return lastClickAttribution(touchpoints);
  }
}

/**
 * Record attribution for a conversion
 */
export async function recordAttribution(
  conversionId: string,
  attribution: AttributionResult
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase
    .from('conversions')
    .update({
      attributed_partner_id: attribution.partner_id,
      attribution_model: attribution.model,
      attributed_at: new Date().toISOString(),
    })
    .eq('id', conversionId);

  return !error;
}

/**
 * Get attribution summary for a program
 */
export async function getAttributionSummary(
  programId: string,
  dateFrom: string,
  dateTo: string
): Promise<Map<string, { conversions: number; percentage: number }>> {
  if (!isSupabaseConfigured()) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('conversions')
    .select('attributed_partner_id')
    .eq('program_id', programId)
    .eq('status', 'valid')
    .gte('attributed_at', dateFrom)
    .lte('attributed_at', dateTo);

  if (error || !data) {
    return new Map();
  }

  const summary = new Map<string, number>();
  let total = 0;

  for (const conv of data) {
    if (conv.attributed_partner_id) {
      const current = summary.get(conv.attributed_partner_id) || 0;
      summary.set(conv.attributed_partner_id, current + 1);
      total++;
    }
  }

  const result = new Map<string, { conversions: number; percentage: number }>();
  for (const [partnerId, count] of summary) {
    result.set(partnerId, {
      conversions: count,
      percentage: Math.round((count / total) * 100),
    });
  }

  return result;
}

export default {
  getTouchpoints,
  calculateAttribution,
  recordAttribution,
  getAttributionSummary,
};
