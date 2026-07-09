/**
 * CuanPintar - CSRF Protection
 * Phase 0.2: CSRF token generation and validation
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'development-secret-change-in-production';
const CSRF_COOKIE_NAME = 'cp_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Sign a CSRF token with HMAC-SHA256
 */
export function signCSRFToken(token: string): string {
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  return hmac.digest('hex');
}

/**
 * Create a signed CSRF token (token.signature)
 */
export function createSignedToken(): string {
  const token = generateCSRFToken();
  const signature = signCSRFToken(token);
  return `${token}.${signature}`;
}

/**
 * Verify a signed CSRF token
 * Returns true if valid, false otherwise
 */
export function verifyCSRFToken(signedToken: string): boolean {
  try {
    const [token, signature] = signedToken.split('.');
    if (!token || !signature) return false;

    const expectedSignature = signCSRFToken(token);

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) return false;

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Parse the signed token and return the raw token
 */
export function parseSignedToken(signedToken: string): string | null {
  try {
    const [token] = signedToken.split('.');
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Get CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Check header first (preferred method)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Fallback to cookie
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === CSRF_COOKIE_NAME) return value;
  }

  return null;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(request: Request): boolean {
  const token = getCSRFTokenFromRequest(request);
  if (!token) return false;
  return verifyCSRFToken(token);
}

/**
 * Generate CSRF cookie options for Set-Cookie header
 */
export function getCSRFCookieOptions(): string {
  const signedToken = createSignedToken();
  return `${CSRF_COOKIE_NAME}=${signedToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${CSRF_COOKIE_MAX_AGE}`;
}

/**
 * Generate the value for the CSRF cookie (signed token)
 * Call this and set the cookie manually for more control
 */
export async function setCSRFCookie(): Promise<string> {
  const signedToken = createSignedToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return signedToken;
}

/**
 * Clear CSRF cookie (on logout)
 */
export async function clearCSRFCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}

/**
 * Get CSRF token for client-side (from cookie)
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CSRF_COOKIE_NAME);
  if (!cookie?.value) return null;
  return parseSignedToken(cookie.value);
}

/**
 * CSRF validation middleware for mutating requests
 * Returns an error response if invalid, null if valid
 */
export function csrfValidationError(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'CSRF validation failed',
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Check if request method requires CSRF validation
 * Only POST, PUT, PATCH, DELETE need CSRF protection
 */
export function requiresCSRFValidation(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/**
 * Generate a CSRF token pair (token + signature)
 * Token goes to client, signature is stored server-side in cookie
 */
export function generateCSRFTokenPair(): { token: string; signed: string } {
  const token = generateCSRFToken();
  const signed = `${token}.${signCSRFToken(token)}`;
  return { token, signed };
}

/**
 * CSRF error messages for i18n support
 */
export const CSRF_ERROR_MESSAGES = {
  missing: 'CSRF token is missing. Please refresh the page.',
  invalid: 'Invalid CSRF token. Please refresh the page.',
  expired: 'CSRF token has expired. Please refresh the page.',
  origin: 'Request origin does not match.',
  method: 'This HTTP method requires CSRF validation.',
};
