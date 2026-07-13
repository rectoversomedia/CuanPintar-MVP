/**
 * CuanPintar - Fraud Detection Engine
 * Phase 3: Tracking & Attribution
 *
 * Real-time fraud detection with:
 * - Multi-signal detection
 * - Partner fraud rate tracking
 * - Configurable thresholds
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type FraudSignalType =
  | 'duplicate_ip'
  | 'duplicate_device'
  | 'suspicious_velocity'
  | 'invalid_phone'
  | 'invalid_email'
  | 'emulator_suspected'
  | 'proxy_vpn'
  | 'low_engagement'
  | 'headless_browser'
  | 'disposable_email'
  | 'same_device_different_time'
  | 'geo_mismatch'
  | 'isp_datacenter'
  | 'no_referrer'
  | 'bot_pattern'
  | 'rapid_fire_clicks'
  | 'missing_fingerprint'
  | 'ip_blocklisted'
  | 'device_blocklisted'
  | 'email_domain_blocklisted'
  | 'high_partner_fraud_rate'
  | 'elevated_partner_fraud_rate';

export interface FraudSignal {
  type: FraudSignalType;
  score: number;
  action: 'block' | 'flag' | 'score';
  details: Record<string, unknown>;
}

export interface FraudCheckResult {
  isBlocked: boolean;
  isFlagged: boolean;
  isRejected: boolean;
  totalScore: number;
  signals: FraudSignal[];
  reasons: string[];
  shouldReject: boolean;
  shouldFlag: boolean;
  recommendation: 'approve' | 'review' | 'reject';
}

export interface ConversionContext {
  // Required
  partner_id: string;
  program_id: string;

  // User data
  ip_address?: string;
  fingerprint?: string;
  email?: string;
  email_domain?: string;
  phone?: string;
  device_id?: string;
  user_agent?: string;
  referrer?: string;

  // Time-based
  timestamp?: Date;

  // Conversion counts
  conversion_count_24h?: number;
  ip_conversion_count_24h?: number;
  fingerprint_conversion_count_24h?: number;
  device_conversion_count_24h?: number;
  partner_conversion_count_24h?: number;

  // Partner stats
  partner_fraud_rate?: number;
  partner_total_conversions?: number;
}

// Fraud thresholds
const FRAUD_THRESHOLDS = {
  // Blocking thresholds
  MAX_IP_CONVERSIONS_1H: 3, // Max 3 conversions per IP per hour
  MAX_DEVICE_CONVERSIONS_1H: 2, // Max 2 per device per hour
  MAX_FINGERPRINT_CONVERSIONS_1H: 5,

  // Flagging thresholds
  MAX_IP_CONVERSIONS_24H: 10,
  MAX_DEVICE_CONVERSIONS_24H: 5,
  MAX_PARTNER_VELOCITY_1H: 20, // Partner sending too fast

  // Score thresholds
  BLOCK_SCORE: 80,
  REJECT_SCORE: 60,
  FLAG_SCORE: 30,

  // Partner fraud rate
  HIGH_FRAUD_RATE: 10, // 10% = suspicious
  CRITICAL_FRAUD_RATE: 20, // 20% = block conversions
};

// Disposable email domains
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.com', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'fakeinbox.com', 'trash-mail.com', 'getnada.com',
  'maildrop.cc', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'spam4.me', 'grr.la', 'mailnesia.com', 'temp-mail.org', 'emailondeck.com',
];

// Headless browser patterns
const HEADLESS_PATTERNS = [
  'HeadlessChrome', 'PhantomJS', 'Selenium', 'Puppeteer',
  'Playwright', 'Automation', 'webdriver', 'Nightmare',
];

// Datacenter ISPs
const DATACENTER_ISPS = [
  'aws', 'google cloud', 'digitalocean', 'linode', 'vultr',
  'azure', 'heroku', 'cloudflare', 'OVH', 'Hetzner',
];

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
 * Main fraud check function - comprehensive detection
 */
export async function checkFraud(
  context: ConversionContext
): Promise<FraudCheckResult> {
  const signals: FraudSignal[] = [];
  const reasons: string[] = [];
  let totalScore = 0;
  let isBlocked = false;
  let isFlagged = false;

  // ========================================
  // 1. BLOCKLIST CHECKS
  // ========================================

  // Check IP blocklist
  if (context.ip_address) {
    const ipBlocked = await isIPBlocked(context.ip_address);
    if (ipBlocked) {
      signals.push({
        type: 'ip_blocklisted',
        score: 100,
        action: 'block',
        details: { ip: context.ip_address },
      });
      reasons.push('IP address is blocklisted');
      isBlocked = true;
    }
  }

  // Check device fingerprint blocklist
  if (context.fingerprint) {
    const deviceBlocked = await isDeviceBlocked(context.fingerprint);
    if (deviceBlocked) {
      signals.push({
        type: 'device_blocklisted',
        score: 100,
        action: 'block',
        details: { fingerprint: context.fingerprint },
      });
      reasons.push('Device fingerprint is blocklisted');
      isBlocked = true;
    }
  }

  // ========================================
  // 2. EMAIL CHECKS
  // ========================================

  // Disposable email
  if (context.email) {
    const domain = context.email.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      signals.push({
        type: 'disposable_email',
        score: 80,
        action: 'block',
        details: { email: context.email, domain },
      });
      reasons.push(`Disposable email domain: ${domain}`);
      isBlocked = true;
    }
  }

  // Email domain blocklist
  if (context.email_domain) {
    const domainBlocked = await isEmailDomainBlocked(context.email_domain);
    if (domainBlocked) {
      signals.push({
        type: 'email_domain_blocklisted',
        score: 50,
        action: 'flag',
        details: { domain: context.email_domain },
      });
      reasons.push(`Email domain blocklisted: ${context.email_domain}`);
      totalScore += 50;
      isFlagged = true;
    }
  }

  // Invalid email format
  if (context.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(context.email)) {
      signals.push({
        type: 'invalid_email',
        score: 30,
        action: 'flag',
        details: { email: context.email },
      });
      reasons.push('Invalid email format');
      totalScore += 30;
      isFlagged = true;
    }
  }

  // ========================================
  // 3. DEVICE/IP VELOCITY CHECKS
  // ========================================

  // Duplicate IP check
  if (context.ip_address && context.ip_conversion_count_24h !== undefined) {
    if (context.ip_conversion_count_24h >= FRAUD_THRESHOLDS.MAX_IP_CONVERSIONS_1H) {
      signals.push({
        type: 'duplicate_ip',
        score: 60,
        action: 'flag',
        details: {
          ip: context.ip_address,
          count: context.ip_conversion_count_24h,
          threshold: FRAUD_THRESHOLDS.MAX_IP_CONVERSIONS_1H,
        },
      });
      reasons.push(`Duplicate IP: ${context.ip_conversion_count_24h} conversions`);
      totalScore += 60;
      isFlagged = true;
    }
  }

  // Duplicate device check
  if (context.device_id && context.device_conversion_count_24h !== undefined) {
    if (context.device_conversion_count_24h >= FRAUD_THRESHOLDS.MAX_DEVICE_CONVERSIONS_1H) {
      signals.push({
        type: 'duplicate_device',
        score: 70,
        action: 'flag',
        details: {
          device_id: context.device_id,
          count: context.device_conversion_count_24h,
          threshold: FRAUD_THRESHOLDS.MAX_DEVICE_CONVERSIONS_1H,
        },
      });
      reasons.push(`Duplicate device: ${context.device_conversion_count_24h} conversions`);
      totalScore += 70;
      isFlagged = true;
    }
  }

  // Fingerprint velocity
  if (context.fingerprint && context.fingerprint_conversion_count_24h !== undefined) {
    if (context.fingerprint_conversion_count_24h > FRAUD_THRESHOLDS.MAX_FINGERPRINT_CONVERSIONS_1H) {
      signals.push({
        type: 'suspicious_velocity',
        score: 50,
        action: 'flag',
        details: {
          fingerprint: context.fingerprint,
          count: context.fingerprint_conversion_count_24h,
        },
      });
      reasons.push(`High fingerprint velocity: ${context.fingerprint_conversion_count_24h}`);
      totalScore += 50;
      isFlagged = true;
    }
  }

  // Partner sending too fast
  if (context.partner_conversion_count_24h !== undefined) {
    if (context.partner_conversion_count_24h > FRAUD_THRESHOLDS.MAX_PARTNER_VELOCITY_1H) {
      signals.push({
        type: 'rapid_fire_clicks',
        score: 40,
        action: 'flag',
        details: {
          partner_id: context.partner_id,
          count: context.partner_conversion_count_24h,
        },
      });
      reasons.push(`Partner high velocity: ${context.partner_conversion_count_24h}/hr`);
      totalScore += 40;
      isFlagged = true;
    }
  }

  // ========================================
  // 4. BROWSER/DEVICE CHECKS
  // ========================================

  // Headless browser detection
  if (context.user_agent) {
    const isHeadless = HEADLESS_PATTERNS.some(p =>
      context.user_agent?.includes(p)
    );
    if (isHeadless) {
      signals.push({
        type: 'headless_browser',
        score: 100,
        action: 'block',
        details: { user_agent: context.user_agent },
      });
      reasons.push('Headless browser detected');
      isBlocked = true;
    }
  }

  // Missing fingerprint
  if (!context.fingerprint || context.fingerprint.length < 10) {
    signals.push({
      type: 'missing_fingerprint',
      score: 25,
      action: 'flag',
      details: {},
    });
    reasons.push('Missing or invalid fingerprint');
    totalScore += 25;
    isFlagged = true;
  }

  // No referrer (suspicious for some channels)
  if (!context.referrer || context.referrer === '') {
    signals.push({
      type: 'no_referrer',
      score: 10,
      action: 'score',
      details: {},
    });
    reasons.push('No referrer detected');
    totalScore += 10;
  }

  // ========================================
  // 5. PARTNER FRAUD RATE CHECK
  // ========================================

  if (context.partner_fraud_rate !== undefined) {
    if (context.partner_fraud_rate >= FRAUD_THRESHOLDS.CRITICAL_FRAUD_RATE) {
      signals.push({
        type: 'high_partner_fraud_rate',
        score: 50,
        action: 'flag',
        details: {
          partner_id: context.partner_id,
          fraud_rate: context.partner_fraud_rate,
        },
      });
      reasons.push(`Partner fraud rate: ${context.partner_fraud_rate}% (critical)`);
      totalScore += 50;
      isFlagged = true;
    } else if (context.partner_fraud_rate >= FRAUD_THRESHOLDS.HIGH_FRAUD_RATE) {
      signals.push({
        type: 'elevated_partner_fraud_rate',
        score: 20,
        action: 'score',
        details: {
          partner_id: context.partner_id,
          fraud_rate: context.partner_fraud_rate,
        },
      });
      reasons.push(`Partner fraud rate: ${context.partner_fraud_rate}%`);
      totalScore += 20;
    }
  }

  // ========================================
  // 6. DECISION
  // ========================================

  // Block overrides everything
  if (isBlocked) {
    return {
      isBlocked: true,
      isFlagged: false,
      isRejected: true,
      totalScore,
      signals,
      reasons,
      shouldReject: true,
      shouldFlag: false,
      recommendation: 'reject',
    };
  }

  // Determine recommendation
  let recommendation: 'approve' | 'review' | 'reject' = 'approve';

  if (totalScore >= FRAUD_THRESHOLDS.REJECT_SCORE) {
    recommendation = 'reject';
  } else if (totalScore >= FRAUD_THRESHOLDS.FLAG_SCORE || isFlagged) {
    recommendation = 'review';
  }

  return {
    isBlocked,
    isFlagged: isFlagged || totalScore >= FRAUD_THRESHOLDS.FLAG_SCORE,
    isRejected: recommendation === 'reject',
    totalScore,
    signals,
    reasons,
    shouldReject: recommendation === 'reject',
    shouldFlag: recommendation === 'review' || recommendation === 'reject',
    recommendation,
  };
}

/**
 * Quick fraud check (for real-time, less comprehensive)
 */
export function quickFraudCheck(context: ConversionContext): FraudCheckResult {
  const signals: FraudSignal[] = [];
  const reasons: string[] = [];
  let totalScore = 0;

  // Disposable email check
  if (context.email) {
    const domain = context.email.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      signals.push({ type: 'disposable_email', score: 80, action: 'block', details: {} });
      reasons.push('Disposable email');
      return { isBlocked: true, isFlagged: true, isRejected: true, totalScore: 80, signals, reasons, shouldReject: true, shouldFlag: true, recommendation: 'reject' };
    }
  }

  // Headless browser
  if (context.user_agent) {
    const isHeadless = HEADLESS_PATTERNS.some(p => context.user_agent?.includes(p));
    if (isHeadless) {
      signals.push({ type: 'headless_browser', score: 100, action: 'block', details: {} });
      reasons.push('Headless browser');
      return { isBlocked: true, isFlagged: true, isRejected: true, totalScore: 100, signals, reasons, shouldReject: true, shouldFlag: true, recommendation: 'reject' };
    }
  }

  // High velocity
  if (context.ip_conversion_count_24h && context.ip_conversion_count_24h > 5) {
    signals.push({ type: 'suspicious_velocity', score: 40, action: 'flag', details: {} });
    reasons.push('High IP velocity');
    totalScore += 40;
  }

  if (context.fingerprint_conversion_count_24h && context.fingerprint_conversion_count_24h > 3) {
    signals.push({ type: 'duplicate_device', score: 50, action: 'flag', details: {} });
    reasons.push('High fingerprint velocity');
    totalScore += 50;
  }

  // Partner fraud rate
  if (context.partner_fraud_rate && context.partner_fraud_rate > 20) {
    signals.push({ type: 'high_partner_fraud_rate', score: 50, action: 'flag', details: {} });
    reasons.push(`Partner fraud rate: ${context.partner_fraud_rate}%`);
    totalScore += 50;
  }

  const recommendation = totalScore >= 60 ? 'reject' : totalScore >= 30 ? 'review' : 'approve';

  return {
    isBlocked: false,
    isFlagged: totalScore >= 30,
    isRejected: recommendation === 'reject',
    totalScore,
    signals,
    reasons,
    shouldReject: recommendation === 'reject',
    shouldFlag: recommendation === 'review' || recommendation === 'reject',
    recommendation,
  };
}

/**
 * Calculate partner fraud rate
 */
export function calculatePartnerFraudRate(
  totalConversions: number,
  fraudConversions: number,
  rejectedConversions: number
): number {
  if (totalConversions === 0) return 0;
  return Math.round(((fraudConversions + rejectedConversions) / totalConversions) * 100 * 10) / 10;
}

/**
 * Get fraud risk level from rate
 */
export function getFraudRiskLevel(
  fraudRate: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (fraudRate < 3) return 'low';
  if (fraudRate < 10) return 'medium';
  if (fraudRate < 20) return 'high';
  return 'critical';
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
