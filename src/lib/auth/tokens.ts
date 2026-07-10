/**
 * JWT Token Service
 *
 * Handles JWT creation, verification, and refresh token management
 * Supports access token rotation and token blacklisting
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from './supabase';

// JWT payload types
export interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: 'advertiser' | 'partner' | 'admin';
  companyName?: string;
  type: 'access' | 'refresh';
  iat: number;           // Issued at
  exp: number;            // Expiration
  jti: string;           // JWT ID (for blacklisting)
}

// Token configuration
const ACCESS_TOKEN_EXPIRY = 15 * 60;        // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days
const ROTATION_ENABLED = true;               // Refresh token rotation

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>();

/**
 * Generate a unique JWT ID
 */
function generateJTI(): string {
  return `jti_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

/**
 * Create a signed JWT token (using jose library for edge runtime)
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): Promise<string> {
  const { SignJWT } = await import('jose');

  const secret = new TextEncoder().encode(getJWTSecret());
  const jti = generateJTI();

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.type === 'access' ? `${ACCESS_TOKEN_EXPIRY}s` : `${REFRESH_TOKEN_EXPIRY}s`)
    .setJti(jti)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { jwtVerify } = await import('jose');

    const secret = new TextEncoder().encode(getJWTSecret());
    const { payload } = await jwtVerify(token, secret);

    // Check if token is blacklisted
    if (tokenBlacklist.has(payload.jti as string)) {
      return null;
    }

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Blacklist a token (for logout)
 */
export function blacklistToken(jti: string): void {
  tokenBlacklist.add(jti);

  // Auto-cleanup after expiry (simplified)
  setTimeout(() => {
    tokenBlacklist.delete(jti);
  }, REFRESH_TOKEN_EXPIRY * 1000);
}

/**
 * Get JWT secret from environment
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fallback for development (NOT for production)
    console.warn('JWT_SECRET not set, using development fallback');
    return 'cuanpintar-dev-secret-change-in-production';
  }
  return secret;
}

/**
 * Extract token from request
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fallback to cookie
  return request.cookies.get('cp_access_token')?.value || null;
}

/**
 * Create a session response with tokens
 */
export async function createSessionResponse(
  user: {
    id: string;
    email: string;
    role: 'advertiser' | 'partner' | 'admin';
    companyName?: string;
  },
  request: NextRequest
): Promise<NextResponse> {
  // Create access token
  const accessToken = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    type: 'access',
  });

  // Create refresh token
  const refreshToken = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    type: 'refresh',
  });

  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY,
        tokenType: 'Bearer',
      },
    },
  });

  // Set cookies
  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie (short-lived)
  response.cookies.set('cp_access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_EXPIRY,
    path: '/',
  });

  // Refresh token cookie (long-lived)
  response.cookies.set('cp_refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY,
    path: '/',
  });

  return response;
}

/**
 * Refresh tokens using refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}> {
  try {
    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return { success: false, error: 'Invalid refresh token' };
    }

    // Create new access token
    const accessToken = await createToken({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      companyName: payload.companyName,
      type: 'access',
    });

    // Optional: Rotate refresh token
    let newRefreshToken = refreshToken;
    if (ROTATION_ENABLED) {
      newRefreshToken = await createToken({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        companyName: payload.companyName,
        type: 'refresh',
      });

      // Blacklist old refresh token
      blacklistToken(payload.jti);
    }

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return { success: false, error: 'Token refresh failed' };
  }
}

/**
 * Clear session cookies (logout)
 */
export function clearSessionResponse(): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('cp_access_token');
  response.cookies.delete('cp_refresh_token');

  return response;
}

/**
 * Auth middleware helper
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  const token = extractToken(request);

  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  if (payload.type !== 'access') {
    return { authenticated: false, error: 'Invalid token type' };
  }

  // Check if token is expired
  if (payload.exp * 1000 < Date.now()) {
    return { authenticated: false, error: 'Token expired' };
  }

  return { authenticated: true, user: payload };
}

/**
 * Role-based authorization helper
 */
export function authorizeRole(user: JWTPayload, allowedRoles: JWTPayload['role'][]): boolean {
  return allowedRoles.includes(user.role);
}
