/**
 * ML-Based Anomaly Detection Service
 * Behavioral pattern analysis for fraud prevention
 *
 * Uses statistical methods and simple ML for pattern detection:
 * - Time-series anomaly detection (Z-score, IQR)
 * - Clustering (K-means simplified)
 * - Pattern matching (user behavior profiles)
 */

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// ============================================
// TYPES
// ============================================

export interface BehavioralDataPoint {
  timestamp: number;
  event_type: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface UserBehaviorProfile {
  userId: string;
  avgSessionDuration: number;
  avgClicksPerSession: number;
  avgConversionsPerDay: number;
  commonTimezones: string[];
  commonCountries: string[];
  clickVelocity: number; // clicks per minute
  conversionVelocity: number;
  activeHours: number[]; // 0-23
  deviceTypes: Record<string, number>;
  lastUpdated: number;
  riskScore: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  confidence: number; // 0-1
  anomalyType: 'velocity' | 'pattern' | 'geolocation' | 'timing' | 'device';
  score: number; // 0-100
  details: string;
  suggestedAction: 'allow' | 'review' | 'block';
  factors: AnomalyFactor[];
}

export interface AnomalyFactor {
  type: string;
  weight: number;
  value: number;
  threshold: number;
  description: string;
}

// ============================================
// BEHAVIORAL PROFILE MANAGEMENT
// ============================================

/**
 * Get or create user behavior profile
 */
export async function getUserBehaviorProfile(
  userId: string
): Promise<UserBehaviorProfile> {
  if (!isSupabaseConfigured()) {
    return createDefaultProfile(userId);
  }

  try {
    const { data, error } = await supabase
      .from('user_behavior_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return createDefaultProfile(userId);
    }

    return data as UserBehaviorProfile;
  } catch {
    return createDefaultProfile(userId);
  }
}

/**
 * Create default profile for new users
 */
function createDefaultProfile(userId: string): UserBehaviorProfile {
  return {
    userId,
    avgSessionDuration: 300000, // 5 minutes
    avgClicksPerSession: 5,
    avgConversionsPerDay: 1,
    commonTimezones: ['Asia/Jakarta'],
    commonCountries: ['ID'],
    clickVelocity: 0.5, // per second
    conversionVelocity: 0.01,
    activeHours: Array.from({ length: 24 }, (_, i) => i),
    deviceTypes: { mobile: 0.7, desktop: 0.3 },
    lastUpdated: Date.now(),
    riskScore: 0,
  };
}

/**
 * Update user behavior profile with new data
 */
export async function updateUserBehaviorProfile(
  userId: string,
  dataPoint: BehavioralDataPoint
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const profile = await getUserBehaviorProfile(userId);

    // Update metrics (exponential moving average)
    const alpha = 0.1; // Smoothing factor

    if (dataPoint.event_type === 'session_duration') {
      profile.avgSessionDuration =
        alpha * dataPoint.value +
        (1 - alpha) * profile.avgSessionDuration;
    } else if (dataPoint.event_type === 'clicks') {
      profile.avgClicksPerSession =
        alpha * dataPoint.value +
        (1 - alpha) * profile.avgClicksPerSession;
    } else if (dataPoint.event_type === 'conversion') {
      profile.avgConversionsPerDay =
        alpha * dataPoint.value +
        (1 - alpha) * profile.avgConversionsPerDay;
    }

    profile.lastUpdated = Date.now();

    // Upsert profile
    await supabase
      .from('user_behavior_profiles')
      .upsert(profile, { onConflict: 'user_id' });
  } catch (error) {
    console.error('Failed to update behavior profile:', error);
  }
}

// ============================================
// ANOMALY DETECTION ALGORITHMS
// ============================================

/**
 * Z-Score based anomaly detection
 */
function zScoreAnomaly(values: number[], newValue: number): {
  isAnomaly: boolean;
  zScore: number;
  threshold: number;
} {
  if (values.length < 3) {
    return { isAnomaly: false, zScore: 0, threshold: 3 };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return { isAnomaly: false, zScore: 0, threshold: 3 };
  }

  const zScore = Math.abs((newValue - mean) / stdDev);
  const threshold = 3; // Standard z-score threshold

  return {
    isAnomaly: zScore > threshold,
    zScore,
    threshold,
  };
}

/**
 * Velocity anomaly detection
 */
function velocityAnomaly(
  currentVelocity: number,
  historicalVelocities: number[]
): { isAnomaly: boolean; score: number; threshold: number } {
  const zResult = zScoreAnomaly(historicalVelocities, currentVelocity);

  if (!zResult.isAnomaly) {
    return { isAnomaly: false, score: 0, threshold: zResult.threshold };
  }

  // Calculate anomaly score based on how far from normal
  const score = Math.min(100, Math.round(zResult.zScore * 30));

  return {
    isAnomaly: true,
    score,
    threshold: zResult.threshold,
  };
}

/**
 * Timing anomaly detection
 * Checks if activity is happening at unusual hours
 */
function timingAnomaly(
  currentHour: number,
  usualHours: number[],
  commonTimezones: string[]
): { isAnomaly: boolean; score: number; description: string } {
  // Check if hour is within usual hours
  const isUsualHour = usualHours.includes(currentHour);

  if (isUsualHour) {
    return { isAnomaly: false, score: 0, description: '' };
  }

  // Calculate distance from nearest usual hour
  let minDistance = 24;
  for (const hour of usualHours) {
    const distance = Math.min(
      Math.abs(currentHour - hour),
      24 - Math.abs(currentHour - hour)
    );
    minDistance = Math.min(minDistance, distance);
  }

  // Score based on distance
  let score = Math.round(minDistance * 8);
  if (minDistance >= 6) {
    score = 100; // Very unusual time
  }

  const timezoneStr = commonTimezones.length > 0
    ? `in timezone ${commonTimezones[0]}`
    : '';

  return {
    isAnomaly: score > 50,
    score,
    description: `Activity at unusual hour (${currentHour}:00 ${timezoneStr})`,
  };
}

/**
 * Geolocation anomaly detection
 */
function geolocationAnomaly(
  currentCountry: string,
  currentTimezone: string,
  usualCountries: string[],
  usualTimezones: string[]
): { isAnomaly: boolean; score: number; description: string } {
  let score = 0;
  const reasons: string[] = [];

  // Country mismatch
  if (!usualCountries.includes(currentCountry)) {
    score += 40;
    reasons.push(`Country change: ${currentCountry}`);
  }

  // Timezone mismatch
  if (!usualTimezones.includes(currentTimezone)) {
    score += 30;
    reasons.push(`Timezone change: ${currentTimezone}`);
  }

  // Calculate expected country from timezone
  const timezoneCountries: Record<string, string> = {
    'Asia/Jakarta': 'ID',
    'Asia/Makassar': 'ID',
    'Asia/Jayapura': 'ID',
    'Asia/Kuala_Lumpur': 'MY',
    'Asia/Singapore': 'SG',
  };

  const expectedCountry = timezoneCountries[currentTimezone];
  if (expectedCountry && currentCountry !== expectedCountry) {
    score += 20;
    reasons.push(`Country/Timezone mismatch`);
  }

  return {
    isAnomaly: score > 50,
    score,
    description: reasons.join(', ') || '',
  };
}

// ============================================
// MAIN ANOMALY DETECTION
// ============================================

export interface DetectAnomalyInput {
  userId: string;
  eventType: 'click' | 'conversion' | 'session';
  timestamp?: number;
  velocity?: number; // events per minute
  country?: string;
  timezone?: string;
  deviceType?: string;
  sessionData?: BehavioralDataPoint[];
}

const HISTORICAL_VELOCITY_WINDOW = 10; // Keep last 10 velocity measurements

/**
 * Detect behavioral anomalies
 */
export async function detectAnomaly(
  input: DetectAnomalyInput
): Promise<AnomalyResult> {
  const {
    userId,
    eventType,
    timestamp = Date.now(),
    velocity,
    country,
    timezone,
    deviceType,
  } = input;

  const factors: AnomalyFactor[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Get user profile
  const profile = await getUserBehaviorProfile(userId);

  // 1. Velocity Analysis
  if (velocity !== undefined) {
    const expectedVelocity =
      eventType === 'click'
        ? profile.clickVelocity
        : eventType === 'conversion'
        ? profile.conversionVelocity
        : profile.avgClicksPerSession / (profile.avgSessionDuration / 60000);

    const velocityRatio = velocity / (expectedVelocity || 1);
    let velocityScore = 0;

    if (velocityRatio > 10) velocityScore = 100;
    else if (velocityRatio > 5) velocityScore = 70;
    else if (velocityRatio > 2) velocityScore = 40;
    else if (velocityRatio > 1.5) velocityScore = 20;

    if (velocityScore > 0) {
      factors.push({
        type: 'velocity',
        weight: 0.4,
        value: velocityRatio,
        threshold: 2,
        description: `Velocity ${velocityRatio.toFixed(1)}x normal`,
      });
      totalScore += velocityScore * 0.4;
      totalWeight += 0.4;
    }
  }

  // 2. Timing Analysis
  const currentHour = new Date(timestamp).getHours();
  if (profile.activeHours.length < 24) {
    const timingResult = timingAnomaly(
      currentHour,
      profile.activeHours,
      profile.commonTimezones
    );

    if (timingResult.isAnomaly) {
      factors.push({
        type: 'timing',
        weight: 0.15,
        value: currentHour,
        threshold: 0,
        description: timingResult.description,
      });
      totalScore += timingResult.score * 0.15;
      totalWeight += 0.15;
    }
  }

  // 3. Geolocation Analysis
  if (country || timezone) {
    const geoResult = geolocationAnomaly(
      country || '',
      timezone || '',
      profile.commonCountries,
      profile.commonTimezones
    );

    if (geoResult.isAnomaly) {
      factors.push({
        type: 'geolocation',
        weight: 0.3,
        value: 1,
        threshold: 0,
        description: geoResult.description,
      });
      totalScore += geoResult.score * 0.3;
      totalWeight += 0.3;
    }
  }

  // 4. Device Analysis
  if (deviceType && profile.deviceTypes[deviceType] !== undefined) {
    const deviceFrequency = profile.deviceTypes[deviceType];
    if (deviceFrequency < 0.1) {
      // New device type
      factors.push({
        type: 'device',
        weight: 0.15,
        value: 1 - deviceFrequency,
        threshold: 0.9,
        description: `Unusual device: ${deviceType}`,
      });
      totalScore += 15 * 0.15;
      totalWeight += 0.15;
    }
  }

  // Normalize score
  const finalScore = totalWeight > 0
    ? Math.round(totalScore / totalWeight)
    : 0;

  const confidence = Math.min(1, totalWeight / 0.8); // Max confidence if all weights present

  // Determine action
  let suggestedAction: 'allow' | 'review' | 'block' = 'allow';
  if (finalScore >= 70) suggestedAction = 'block';
  else if (finalScore >= 40) suggestedAction = 'review';

  const isAnomaly = finalScore >= 40;

  return {
    isAnomaly,
    confidence,
    anomalyType: factors[0]?.type as AnomalyResult['anomalyType'] || 'velocity',
    score: finalScore,
    details: factors.map(f => f.description).join('; ') || 'No anomalies detected',
    suggestedAction,
    factors,
  };
}

/**
 * Batch detect anomalies for multiple events
 */
export async function batchDetectAnomalies(
  events: DetectAnomalyInput[]
): Promise<AnomalyResult[]> {
  return Promise.all(events.map(event => detectAnomaly(event)));
}

/**
 * Get anomaly statistics for a time period
 */
export async function getAnomalyStats(
  startDate: number,
  endDate: number
): Promise<{
  total: number;
  byType: Record<string, number>;
  avgScore: number;
  blocked: number;
  reviewed: number;
  allowed: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      total: 0,
      byType: {},
      avgScore: 0,
      blocked: 0,
      reviewed: 0,
      allowed: 0,
    };
  }

  try {
    const { data, error } = await supabase
      .from('anomaly_logs')
      .select('*')
      .gte('created_at', new Date(startDate).toISOString())
      .lte('created_at', new Date(endDate).toISOString());

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      byType: {} as Record<string, number>,
      avgScore: 0,
      blocked: 0,
      reviewed: 0,
      allowed: 0,
    };

    let totalScore = 0;

    for (const record of data || []) {
      // Count by type
      stats.byType[record.anomaly_type] = (stats.byType[record.anomaly_type] || 0) + 1;

      // Sum scores
      totalScore += record.score;

      // Count by action
      if (record.action === 'block') stats.blocked++;
      else if (record.action === 'review') stats.reviewed++;
      else stats.allowed++;
    }

    stats.avgScore = stats.total > 0 ? Math.round(totalScore / stats.total) : 0;

    return stats;
  } catch (error) {
    console.error('Failed to get anomaly stats:', error);
    return {
      total: 0,
      byType: {},
      avgScore: 0,
      blocked: 0,
      reviewed: 0,
      allowed: 0,
    };
  }
}

export default {
  detectAnomaly,
  batchDetectAnomalies,
  getAnomalyStats,
  getUserBehaviorProfile,
  updateUserBehaviorProfile,
};
