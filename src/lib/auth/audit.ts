/**
 * CuanPintar - Auth Audit Logging
 * Phase 1: Auth & Identity
 *
 * Immutable audit trail for authentication events
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import crypto from 'crypto';

export type AuthEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verification_sent'
  | 'email_verified'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verification_success'
  | '2fa_verification_failed'
  | '2fa_recovery_used'
  | 'session_created'
  | 'session_revoked'
  | 'session_revoked_all'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'profile_updated'
  | 'email_changed'
  | 'phone_changed';

export interface AuditLogEntry {
  user_id?: string;
  event_type: AuthEventType;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device_type?: string;
    device_name?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || undefined;
}

/**
 * Parse user agent for device info
 */
export function parseUserAgent(
  userAgent: string
): { browser?: string; os?: string; device_type?: string } {
  const browser =
    userAgent.includes('Chrome')
      ? 'Chrome'
      : userAgent.includes('Firefox')
        ? 'Firefox'
        : userAgent.includes('Safari')
          ? 'Safari'
          : userAgent.includes('Edge')
            ? 'Edge'
            : 'Other';

  const os = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Mac')
      ? 'macOS'
      : userAgent.includes('Linux')
        ? 'Linux'
        : userAgent.includes('Android')
          ? 'Android'
          : userAgent.includes('iOS')
            ? 'iOS'
            : 'Other';

  const device_type =
    /mobile|android|iphone|ipad|ipod/i.test(userAgent)
      ? 'mobile'
      : /tablet|ipad/i.test(userAgent)
        ? 'tablet'
        : 'desktop';

  return { browser, os, device_type };
}

/**
 * Generate a fingerprint from request headers
 */
export function generateFingerprint(request: Request): string {
  const ip = getClientIP(request) || '';
  const ua = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';

  const raw = `${ip}|${ua}|${acceptLang}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

/**
 * Log an authentication event to the database
 */
export async function logAuthEvent(entry: AuditLogEntry): Promise<void> {
  if (!isSupabaseConfigured()) {
    // Demo mode: just console log
    console.log('[Auth Audit]', entry.event_type, entry);
    return;
  }

  try {
    const { error } = await supabase.from('auth_audit_logs').insert({
      user_id: entry.user_id || null,
      event_type: entry.event_type,
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || null,
      device_info: entry.device_info || null,
      metadata: entry.metadata || null,
    });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (err) {
    // Never let audit logging failures affect the main flow
    console.error('Audit logging error:', err);
  }
}

/**
 * Log login success
 */
export async function logLoginSuccess(
  userId: string,
  request: Request,
  metadata?: Record<string, unknown>
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: 'login_success',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata,
  });
}

/**
 * Log login failure
 */
export async function logLoginFailed(
  email: string,
  request: Request,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    event_type: 'login_failed',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: {
      email,
      reason,
      ...metadata,
    },
  });
}

/**
 * Log account locked
 */
export async function logAccountLocked(
  userId: string,
  request: Request,
  reason: string
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: 'account_locked',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: { reason },
  });
}

/**
 * Log 2FA verification success
 */
export async function log2FASuccess(
  userId: string,
  request: Request,
  method: 'totp' | 'sms' | 'recovery'
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: '2fa_verification_success',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: { method },
  });
}

/**
 * Log 2FA verification failure
 */
export async function log2FAFailed(
  userId: string,
  request: Request,
  method: 'totp' | 'sms' | 'recovery',
  reason: string
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: '2fa_verification_failed',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: { method, reason },
  });
}

/**
 * Log session created
 */
export async function logSessionCreated(
  userId: string,
  sessionId: string,
  request: Request
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: 'session_created',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: { session_id: sessionId },
  });
}

/**
 * Log session revoked
 */
export async function logSessionRevoked(
  userId: string,
  sessionId: string,
  request: Request,
  reason: 'user_action' | 'admin_action' | 'expired' | 'security'
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: 'session_revoked',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    metadata: { session_id: sessionId, reason },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  request: Request,
  activity: string,
  details: Record<string, unknown>
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || '';

  await logAuthEvent({
    user_id: userId,
    event_type: 'suspicious_activity',
    ip_address: getClientIP(request),
    user_agent: userAgent,
    device_info: parseUserAgent(userAgent),
    metadata: { activity, ...details },
  });
}

/**
 * Get audit logs for a user (admin only)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ logs: unknown[]; total: number }> {
  if (!isSupabaseConfigured()) {
    return { logs: [], total: 0 };
  }

  const { data, error, count } = await supabase
    .from('auth_audit_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to get audit logs:', error);
    return { logs: [], total: 0 };
  }

  return { logs: data || [], total: count || 0 };
}

/**
 * Get recent failed login attempts for IP
 */
export async function getRecentFailedLogins(
  ip: string,
  windowMinutes: number = 15
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('auth_audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'login_failed')
    .eq('ip_address', ip)
    .gte('created_at', since);

  if (error) {
    console.error('Failed to get failed logins:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Check for suspicious login patterns
 */
export async function checkSuspiciousLogin(
  email: string,
  ip: string
): Promise<{ suspicious: boolean; reasons: string[] }> {
  const reasons: string[] = [];

  // Check for multiple failed logins from same IP
  const recentFailures = await getRecentFailedLogins(ip, 15);
  if (recentFailures >= 5) {
    reasons.push('Multiple failed logins from this IP');
  }

  // Check for logins from different locations in short time
  // (This would require more sophisticated geo-IP tracking)

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

export default {
  logAuthEvent,
  logLoginSuccess,
  logLoginFailed,
  logAccountLocked,
  log2FASuccess,
  log2FAFailed,
  logSessionCreated,
  logSessionRevoked,
  logSuspiciousActivity,
  getUserAuditLogs,
  getClientIP,
  parseUserAgent,
  generateFingerprint,
};
