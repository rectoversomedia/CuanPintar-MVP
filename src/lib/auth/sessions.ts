/**
 * CuanPintar - Session Management
 * Phase 1: Auth & Identity
 *
 * Multi-device session management with secure token handling
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateSessionToken, hashToken } from './password';
import { logSessionCreated, logSessionRevoked, parseUserAgent } from './audit';
import { NextRequest } from 'next/server';

export interface SessionInfo {
  id: string;
  user_id: string;
  device_info: {
    browser?: string;
    os?: string;
    device_type?: string;
    device_name?: string;
  };
  ip_address?: string;
  user_agent?: string;
  fingerprint?: string;
  last_active: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  request: Request,
  options?: {
    fingerprint?: string;
    deviceName?: string;
    expiresInDays?: number;
  }
): Promise<{ session: SessionInfo; token: string } | null> {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || undefined;

  const deviceInfo = parseUserAgent(userAgent);
  const deviceInfoWithName = {
    ...deviceInfo,
    ...(options?.deviceName ? { device_name: options.deviceName } : {}),
  };

  const expiresInDays = options?.expiresInDays || 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  if (!isSupabaseConfigured()) {
    // Demo mode: return mock session
    return {
      session: {
        id: 'demo-session-id',
        user_id: userId,
        device_info: deviceInfoWithName,
        ip_address: ip,
        user_agent: userAgent,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_current: true,
      },
      token: 'demo-session-token',
    };
  }

  const token = generateSessionToken();
  const tokenHash = hashToken(token);

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_token: tokenHash,
      device_info: deviceInfoWithName,
      ip_address: ip,
      user_agent: userAgent,
      fingerprint: options?.fingerprint,
      expires_at: expiresAt.toISOString(),
      is_current: true,
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create session:', error);
    return null;
  }

  // Deactivate other current sessions for this user
  await supabase
    .from('user_sessions')
    .update({ is_current: false })
    .eq('user_id', userId)
    .eq('is_current', true)
    .neq('id', data.id);

  // Log session creation
  await logSessionCreated(userId, data.id, request);

  return {
    session: {
      id: data.id,
      user_id: data.user_id,
      device_info: data.device_info,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      last_active: data.last_active,
      created_at: data.created_at,
      expires_at: data.expires_at,
      is_current: data.is_current,
    },
    token,
  };
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<SessionInfo | null> {
  if (!isSupabaseConfigured()) {
    // Demo mode: accept any token
    return null;
  }

  const tokenHash = hashToken(token);

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', tokenHash)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  // Check expiration
  if (new Date(data.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', data.id);
    return null;
  }

  // Update last active
  await supabase
    .from('user_sessions')
    .update({ last_active: new Date().toISOString() })
    .eq('id', data.id);

  return {
    id: data.id,
    user_id: data.user_id,
    device_info: data.device_info,
    ip_address: data.ip_address,
    user_agent: data.user_agent,
    fingerprint: data.fingerprint,
    last_active: data.last_active,
    created_at: data.created_at,
    expires_at: data.expires_at,
    is_current: data.is_current,
  };
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionInfo[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_active', { ascending: false });

  if (error || !data) {
    return [];
  }

  // Filter out expired sessions
  const now = new Date();
  const activeSessions = data.filter((s) => new Date(s.expires_at) > now);

  return activeSessions.map((s) => ({
    id: s.id,
    user_id: s.user_id,
    device_info: s.device_info,
    ip_address: s.ip_address,
    user_agent: s.user_agent,
    last_active: s.last_active,
    created_at: s.created_at,
    expires_at: s.expires_at,
    is_current: s.is_current,
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  userId: string,
  sessionId: string,
  request: Request
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, is_current: false })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }

  await logSessionRevoked(userId, sessionId, request, 'user_action');
  return true;
}

/**
 * Revoke all sessions for a user (except current)
 */
export async function revokeAllSessions(
  userId: string,
  request: Request,
  exceptSessionId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  let query = supabase
    .from('user_sessions')
    .update({ is_active: false, is_current: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (exceptSessionId) {
    query = query.neq('id', exceptSessionId);
  }

  const { error } = await query;

  if (error) {
    console.error('Failed to revoke sessions:', error);
    return false;
  }

  // Log bulk revocation
  if (exceptSessionId) {
    await logSessionRevoked(userId, exceptSessionId, request, 'user_action');
  }

  return true;
}

/**
 * Revoke sessions from a specific IP (security measure)
 */
export async function revokeSessionsByIP(
  userId: string,
  ipAddress: string,
  request: Request
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)
    .eq('is_active', true)
    .select('id');

  if (error) {
    console.error('Failed to revoke sessions by IP:', error);
    return 0;
  }

  const count = data?.length || 0;

  if (count > 0) {
    await logSessionRevoked(userId, 'all', request, 'security');
  }

  return count;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true)
    .select('id');

  if (error) {
    console.error('Failed to cleanup sessions:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Get session count for a user
 */
export async function getSessionCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 1;
  }

  const { count, error } = await supabase
    .from('user_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Failed to get session count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Check if user is logged in from multiple devices simultaneously
 */
export async function isMultiDeviceLogin(userId: string): Promise<boolean> {
  const sessionCount = await getSessionCount(userId);
  return sessionCount > 1;
}

export default {
  createSession,
  validateSession,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  revokeSessionsByIP,
  cleanupExpiredSessions,
  getSessionCount,
  isMultiDeviceLogin,
};
