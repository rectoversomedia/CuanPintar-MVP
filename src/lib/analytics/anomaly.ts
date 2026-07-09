/**
 * Anomaly Detection Module
 * Statistical anomaly detection for conversions and revenue
 */

import { supabase } from '@/lib/supabase';

export interface AnomalyConfig {
  metric: 'conversions' | 'revenue' | 'fraud_rate' | 'ctr';
  entityType?: 'platform' | 'advertiser' | 'partner' | 'program';
  entityId?: string;
  sensitivity: 'low' | 'medium' | 'high';
  lookbackDays: number;
}

export interface AnomalyResult {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  deviationPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  entityId?: string;
  entityType?: string;
}

export interface AnomalySummary {
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  anomaliesByMetric: Record<string, number>;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 };

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Detect anomalies using z-score method
 */
export async function detectAnomalies(config: AnomalyConfig): Promise<AnomalyResult[]> {
  const { metric, entityType, entityId, sensitivity, lookbackDays } = config;

  // Set thresholds based on sensitivity
  const sensitivityMultipliers = {
    low: 2.5,
    medium: 2.0,
    high: 1.5,
  };
  const zThreshold = sensitivityMultipliers[sensitivity];

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lookbackDays);

  // Build query based on entity type
  let query = supabase
    .from('daily_stats')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (entityId && entityType) {
    query = query.eq('entity_type', entityType).eq('entity_id', entityId);
  } else if (entityType) {
    query = query.eq('entity_type', entityType);
  } else {
    query = query.eq('entity_type', 'platform');
  }

  const { data: stats, error } = await query;

  if (error || !stats || stats.length === 0) {
    return [];
  }

  // Extract metric values
  const metricFieldMap: Record<string, string> = {
    conversions: 'conversions',
    revenue: 'revenue',
    fraud_rate: 'fraud_conversions',
    ctr: 'ctr',
  };

  const field = metricFieldMap[metric] || 'conversions';
  const values = stats.map(s => {
    if (metric === 'fraud_rate') {
      const total = s.conversions || 1;
      return (s.fraud_conversions / total) * 100;
    }
    return s[field as keyof typeof s] as number || 0;
  });

  // Calculate statistics
  const { mean, stdDev } = calculateStdDev(values);

  if (stdDev === 0) {
    return []; // No variation
  }

  // Detect anomalies
  const anomalies: AnomalyResult[] = [];

  for (const stat of stats) {
    const value = metric === 'fraud_rate'
      ? ((stat.fraud_conversions || 0) / (stat.conversions || 1)) * 100
      : (stat[field as keyof typeof stat] as number) || 0;

    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore >= zThreshold) {
      const deviation = value - mean;
      const deviationPercent = mean !== 0 ? (deviation / mean) * 100 : 0;

      // Determine severity
      let severity: 'low' | 'medium' | 'high' | 'critical';
      if (zScore >= 4) {
        severity = 'critical';
      } else if (zScore >= 3) {
        severity = 'high';
      } else if (zScore >= 2.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      // Generate description
      const direction = deviation > 0 ? 'increased' : 'decreased';
      const description = `${metric.replace('_', ' ')} ${direction} significantly (${Math.abs(deviationPercent).toFixed(1)}% from average)`;

      anomalies.push({
        id: `anomaly-${stat.id}-${metric}`,
        timestamp: stat.date,
        metric,
        value,
        expectedValue: mean,
        deviation,
        deviationPercent,
        severity,
        description,
        entityId: stat.entity_id || undefined,
        entityType: stat.entity_type || undefined,
      });
    }
  }

  return anomalies.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Get anomaly summary statistics
 */
export function getAnomalySummary(anomalies: AnomalyResult[]): AnomalySummary {
  const summary: AnomalySummary = {
    totalAnomalies: anomalies.length,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    anomaliesByMetric: {},
  };

  for (const anomaly of anomalies) {
    switch (anomaly.severity) {
      case 'critical':
        summary.criticalCount++;
        break;
      case 'high':
        summary.highCount++;
        break;
      case 'medium':
        summary.mediumCount++;
        break;
      case 'low':
        summary.lowCount++;
        break;
    }

    if (!summary.anomaliesByMetric[anomaly.metric]) {
      summary.anomaliesByMetric[anomaly.metric] = 0;
    }
    summary.anomaliesByMetric[anomaly.metric]++;
  }

  return summary;
}
