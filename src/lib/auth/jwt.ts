/**
 * JWT Verification Utility
 * Secure token verification using jose library
 */

import { jwtVerify, SignJWT, JWTPayload } from 'jose';

// Environment-based secret (should be at least 32 chars in production)
const getSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'development-secret-change-in-production';
  return new TextEncoder().encode(secret);
};

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Verify a JWT token
 */
export async function verifyToken<T extends JWTPayload = JWTPayload>(
  token: string
): Promise<{ valid: true; payload: T } | { valid: false; error: string }> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return { valid: true, payload: payload as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return { valid: false, error: message };
  }
}

/**
 * Create an access token
 */
export async function createAccessToken(
  payload: Record<string, unknown>
): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
  return token;
}

/**
 * Create a refresh token
 */
export async function createRefreshToken(
  payload: Record<string, unknown>
): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret);
  return token;
}

/**
 * Decode token without verification (for debugging only)
 */
export function decodeToken<T extends JWTPayload = JWTPayload>(
  token: string
): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(payload: JWTPayload): Date | null {
  if (!payload.exp) return null;
  return new Date(payload.exp * 1000);
}

// Extended JWT Payload for CuanPintar
export interface CuanPintarJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'advertiser' | 'partner';
  companyName?: string;
  advertiserId?: string;
  partnerId?: string;
  type?: 'access' | 'refresh';
}

/**
 * Verify access token with CuanPintar claims
 */
export async function verifyAccessToken(
  token: string
): Promise<{ valid: true; payload: CuanPintarJWTPayload } | { valid: false; error: string }> {
  const result = await verifyToken<CuanPintarJWTPayload>(token);

  if (!result.valid) {
    return { valid: false, error: result.error };
  }

  // Verify it's an access token
  if (result.payload.type && result.payload.type !== 'access') {
    return { valid: false, error: 'Invalid token type' };
  }

  return { valid: true, payload: result.payload };
}

/**
 * Create demo token for testing (ONLY in development)
 */
export async function createDemoToken(
  role: 'admin' | 'advertiser' | 'partner',
  email: string,
  userId: string,
  companyName?: string
): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo tokens cannot be created in production');
  }

  const payload: CuanPintarJWTPayload = {
    userId,
    email,
    role,
    companyName,
    type: 'access',
  };

  return createAccessToken(payload);
}
