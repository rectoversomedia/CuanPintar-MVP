/**
 * CuanPintar - Fraud Detection Engine
 * Phase 3: Tracking & Attribution
 *
 * Real-time fraud detection using configurable rules
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface FraudSignal {
  type: string;
  score: number;
  action: 'block' | 'flag' | 'score';
  details: Record<string, unknown>;
}

export interface FraudCheckResult {
  isBlocked: boolean;
  isFlagged: boolean;
  totalScore: number;
  signals: FraudSignal[];
  shouldReject: boolean;
}

export interface ConversionContext {
  ip_address?: string;
  fingerprint?: string;
  email?: string;
  email_domain?: string;
  phone?: string;
  device_id?: string;
  user_agent?: string;
  conversion_count_24h?: number;
  ip_conversion_count_24h?: number;
  fingerprint_conversion_count_24h?: number;
}

/**
 * Check if IP is in blocklist
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Demo mode: check some known IPs
    return false;
  }

  const { data, error } = await supabase
    .from('fraud_blocklist')
    .select('id')
    .eq('type', 'ip')
    .eq('value', ip)
    .eq('is_active', true)
    .single();

  return !!data && !error;
}

/**
 * Check if email domain is blocklisted
 */
export async function isEmailDomainBlocked(domain: string): Promise<boolean> {
  const disposableDomains = [
    'tempmail.com', 'throwaway.com', 'guerrillamail.com',
    'mailinator.com', '10minutemail.com', 'fakeinbox.com',
    'trash-mail.com', 'getnada.com', 'maildrop.cc',
  ];

  if (disposableDomains.includes(domain.toLowerCase())) {
    return true;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data, error } = await supabase
    .from('fraud_blocklist')
    .select('id')
    .eq('type', 'email_domain')
    .eq('value', domain.toLowerCase())
    .eq('is_active', true)
    .single();

  return !!data && !error;
}

/**
 * Check if device fingerprint is blocklisted
 */
export async function isDeviceBlocked(fingerprint: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data, error } = await supabase
    .from('fraud_blocklist')
    .select('id')
    .eq('type', 'fingerprint')
    .eq('value', fingerprint)
    .eq('is_active', true)
    .single();

  return !!data && !error;
}

/**
 * Get recent conversion count for fingerprint
 */
export async function getFingerprintConversionCount(
  fingerprint: string,
  hours: number = 24
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('conversions')
    .select('*', { count: 'exact', head: true })
    .eq('fingerprint', fingerprint)
    .gte('created_at', since);

  return error ? 0 : (count || 0);
}

/**
 * Get recent conversion count for IP
 */
export async function getIPConversionCount(
  ip: string,
  hours: number = 24
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('conversions')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', since);

  return error ? 0 : (count || 0);
}

/**
 * Main fraud check function
 */
export async function checkFraud(
  context: ConversionContext
): Promise<FraudCheckResult> {
  const signals: FraudSignal[] = [];
  let totalScore = 0;
  let isBlocked = false;
  let isFlagged = false;

  // Check 1: IP Blocklist
  if (context.ip_address) {
    const ipBlocked = await isIPBlocked(context.ip_address);
    if (ipBlocked) {
      signals.push({
        type: 'ip_blocklisted',
        score: 100,
        action: 'block',
        details: { ip: context.ip_address },
      });
      isBlocked = true;
    }
  }

  // Check 2: Email Domain Blocklist
  if (context.email_domain) {
    const domainBlocked = await isEmailDomainBlocked(context.email_domain);
    if (domainBlocked) {
      signals.push({
        type: 'email_domain_blocklisted',
        score: 50,
        action: 'flag',
        details: { domain: context.email_domain },
      });
      totalScore += 50;
      isFlagged = true;
    }
  }

  // Check 3: Disposable email check
  if (context.email) {
    const domain = context.email.split('@')[1]?.toLowerCase();
    if (domain) {
      const isDisposable = await isEmailDomainBlocked(domain);
      if (isDisposable) {
        signals.push({
          type: 'disposable_email',
          score: 30,
          action: 'flag',
          details: { domain },
        });
        totalScore += 30;
        isFlagged = true;
      }
    }
  }

  // Check 4: Device Blocklist
  if (context.fingerprint) {
    const deviceBlocked = await isDeviceBlocked(context.fingerprint);
    if (deviceBlocked) {
      signals.push({
        type: 'device_blocklisted',
        score: 100,
        action: 'block',
        details: { fingerprint: context.fingerprint },
      });
      isBlocked = true;
    }
  }

  // Check 5: High Velocity - Fingerprint
  if (context.fingerprint && context.fingerprint_conversion_count_24h !== undefined) {
    if (context.fingerprint_conversion_count_24h > 10) {
      signals.push({
        type: 'high_velocity_fingerprint',
        score: 40,
        action: 'flag',
        details: { count: context.fingerprint_conversion_count_24h },
      });
      totalScore += 40;
      isFlagged = true;
    }
  }

  // Check 6: High Velocity - IP
  if (context.ip_address && context.ip_conversion_count_24h !== undefined) {
    if (context.ip_conversion_count_24h > 20) {
      signals.push({
        type: 'high_velocity_ip',
        score: 30,
        action: 'flag',
        details: { count: context.ip_conversion_count_24h },
      });
      totalScore += 30;
      isFlagged = true;
    }
  }

  // Check 7: Suspicious User-Agent (headless browsers)
  if (context.user_agent) {
    const headlessPatterns = [
      'HeadlessChrome', 'PhantomJS', 'Selenium', 'Puppeteer',
      'Playwright', 'Automation', 'webdriver',
    ];
    const isHeadless = headlessPatterns.some(p =>
      context.user_agent?.includes(p)
    );
    if (isHeadless) {
      signals.push({
        type: 'headless_browser',
        score: 100,
        action: 'block',
        details: { user_agent: context.user_agent },
      });
      isBlocked = true;
    }
  }

  // Check 8: VPN/Proxy detection (would integrate with MaxMind or similar)
  // This would require external service or database

  // Decision: reject if blocked or score too high
  const shouldReject = isBlocked || totalScore >= 80;

  return {
    isBlocked,
    isFlagged,
    totalScore,
    signals,
    shouldReject,
  };
}

/**
 * Quick fraud score calculation (simplified)
 */
export function quickFraudScore(context: ConversionContext): number {
  let score = 0;

  // Email domain checks
  if (context.email_domain) {
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (!freeDomains.includes(context.email_domain.toLowerCase())) {
      score += 5; // Non-free email = lower risk
    }
  }

  // IP conversion velocity
  if (context.ip_conversion_count_24h) {
    if (context.ip_conversion_count_24h > 5) score += 20;
    if (context.ip_conversion_count_24h > 10) score += 30;
  }

  // Fingerprint velocity
  if (context.fingerprint_conversion_count_24h) {
    if (context.fingerprint_conversion_count_24h > 3) score += 25;
    if (context.fingerprint_conversion_count_24h > 5) score += 25;
  }

  return Math.min(score, 100);
}

/**
 * Add to fraud blocklist
 */
export async function addToBlocklist(
  type: 'ip' | 'email_domain' | 'device_id' | 'fingerprint' | 'email',
  value: string,
  reason: string,
  addedBy?: string,
  expiresAt?: Date
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase.from('fraud_blocklist').insert({
    type,
    value,
    reason,
    added_by: addedBy,
    expires_at: expiresAt?.toISOString(),
    is_active: true,
  });

  return !error;
}

/**
 * Remove from fraud blocklist
 */
export async function removeFromBlocklist(
  type: string,
  value: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase
    .from('fraud_blocklist')
    .update({ is_active: false })
    .eq('type', type)
    .eq('value', value);

  return !error;
}

/**
 * Record fraud score for a conversion
 */
export async function recordFraudScore(
  conversionId: string,
  signals: FraudSignal[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);

  const inserts = signals.map(s => ({
    conversion_id: conversionId,
    rule_name: s.type,
    score: s.score,
    action_taken: s.action,
    details: s.details,
  }));

  await supabase.from('fraud_scores').insert(inserts);
}

export default {
  isIPBlocked,
  isEmailDomainBlocked,
  isDeviceBlocked,
  getFingerprintConversionCount,
  getIPConversionCount,
  checkFraud,
  quickFraudScore,
  addToBlocklist,
  removeFromBlocklist,
  recordFraudScore,
};
