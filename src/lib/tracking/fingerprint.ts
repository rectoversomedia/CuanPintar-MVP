/**
 * CuanPintar - Device Fingerprinting
 * Phase 3: Tracking & Attribution
 *
 * Client-side and server-side fingerprinting for device identification
 */

import crypto from 'crypto';

export interface Fingerprint {
  hash: string;
  components: {
    userAgent: string;
    language: string;
    platform: string;
    screen: string;
    timezone: string;
    canvas?: string;
    webgl?: string;
    fonts?: string;
  };
  confidence: number;
}

/**
 * Generate a fingerprint hash from components
 */
export function generateFingerprintHash(
  userAgent: string,
  language: string,
  platform: string,
  screen: string,
  timezone: string
): string {
  const raw = `${userAgent}|${language}|${platform}|${screen}|${timezone}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

/**
 * Simple fingerprint from server-side headers
 */
export function fingerprintFromHeaders(
  userAgent: string,
  acceptLanguage: string
): { hash: string; confidence: number } {
  const hash = generateFingerprintHash(
    userAgent,
    acceptLanguage,
    detectPlatform(userAgent),
    'unknown',
    'unknown'
  );

  return {
    hash,
    confidence: 60, // Low confidence from server-side
  };
}

/**
 * Detect platform from User-Agent
 */
export function detectPlatform(userAgent: string): string {
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Unknown';
}

/**
 * Detect device type
 */
export function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  if (/iPad|Tablet|Android/.test(userAgent)) return 'tablet';
  if (/Mobile|iPhone|Android/.test(userAgent)) return 'mobile';
  return 'desktop';
}

/**
 * Detect browser
 */
export function detectBrowser(userAgent: string): string {
  if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) return 'Chrome';
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
  if (/Firefox/.test(userAgent)) return 'Firefox';
  if (/Edg/.test(userAgent)) return 'Edge';
  if (/Opera|OPR/.test(userAgent)) return 'Opera';
  return 'Other';
}

/**
 * Detect OS
 */
export function detectOS(userAgent: string): string {
  if (/Windows NT 10/.test(userAgent)) return 'Windows 10';
  if (/Windows NT 6/.test(userAgent)) return 'Windows 8';
  if (/Mac OS X/.test(userAgent)) return 'macOS';
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Other';
}

/**
 * Parse device info from user agent
 */
export function parseDeviceInfo(userAgent: string) {
  return {
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    platform: detectPlatform(userAgent),
    deviceType: detectDeviceType(userAgent),
  };
}

/**
 * Generate visitor ID from fingerprint
 */
export function generateVisitorId(
  fingerprint: string,
  ipAddress: string
): string {
  const raw = `${fingerprint}:${ipAddress}:${Date.now()}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

/**
 * Hash email for matching
 */
export function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

/**
 * Hash phone for matching
 */
export function hashPhone(phone: string): string {
  const normalized = phone.replace(/[^0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export default {
  generateFingerprintHash,
  fingerprintFromHeaders,
  detectPlatform,
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseDeviceInfo,
  generateVisitorId,
  hashEmail,
  hashPhone,
};
