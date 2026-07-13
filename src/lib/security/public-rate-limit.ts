/**
 * Rate Limiting Middleware for Public Endpoints
 * Extends existing rate-limit.ts for /api/track/* and other public APIs
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// In-memory store for public endpoints (use Redis in production)
const publicRateLimits = new Map<string, RateLimitEntry>();

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstRequest: number;
}

// Configuration for public endpoints
const PUBLIC_RATE_LIMITS = {
  // Tracking endpoints - more lenient but still protected
  track: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute per IP
    keyPrefix: 'track',
  },
  // Conversion tracking - stricter
  conversion: {
    windowMs: 60 * 1000,
    maxRequests: 50, // 50 conversions per minute
    keyPrefix: 'conv',
  },
  // Click tracking - very lenient
  click: {
    windowMs: 60 * 1000,
    maxRequests: 200,
    keyPrefix: 'click',
  },
  // Public API endpoints
  public: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: 'pub',
  },
};

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Get rate limit key
 */
function getRateLimitKey(ip: string, type: keyof typeof PUBLIC_RATE_LIMITS): string {
  const config = PUBLIC_RATE_LIMITS[type];
  return `${config.keyPrefix}:${ip}`;
}

/**
 * Check rate limit using Redis (production) or in-memory (dev)
 */
export async function checkPublicRateLimit(
  request: NextRequest,
  type: keyof typeof PUBLIC_RATE_LIMITS = 'public'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}> {
  const ip = getClientIP(request);
  const config = PUBLIC_RATE_LIMITS[type];
  const key = getRateLimitKey(ip, type);
  const now = Date.now();

  // Production: Use Redis
  if (isSupabaseConfigured()) {
    return checkRedisRateLimit(ip, type, config, now);
  }

  // Development: Use in-memory store
  return checkMemoryRateLimit(key, config, now);
}

/**
 * Redis-based rate limiting
 */
async function checkRedisRateLimit(
  ip: string,
  type: keyof typeof PUBLIC_RATE_LIMITS,
  config: typeof PUBLIC_RATE_LIMITS[keyof typeof PUBLIC_RATE_LIMITS],
  now: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}> {
  try {
    const key = `ratelimit:${config.keyPrefix}:${ip}`;

    // Use Supabase Edge Function or RPC for Redis
    // For now, fall back to in-memory
    return checkMemoryRateLimit(key, config, now);
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fail open in case of Redis issues
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
      limit: config.maxRequests,
    };
  }
}

/**
 * In-memory rate limiting
 */
function checkMemoryRateLimit(
  key: string,
  config: typeof PUBLIC_RATE_LIMITS[keyof typeof PUBLIC_RATE_LIMITS],
  now: number
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
} {
  const entry = publicRateLimits.get(key);
  const windowStart = now - config.windowMs;

  // Reset if window expired
  if (!entry || entry.firstRequest < windowStart) {
    publicRateLimits.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
      firstRequest: now,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  // Increment count
  entry.count += 1;
  publicRateLimits.set(key, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanupOldEntries(windowStart);
  }

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    limit: config.maxRequests,
  };
}

/**
 * Cleanup old rate limit entries
 */
function cleanupOldEntries(windowStart: number): void {
  for (const [key, entry] of publicRateLimits.entries()) {
    if (entry.firstRequest < windowStart) {
      publicRateLimits.delete(key);
    }
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(config: {
  limit: number;
  remaining: number;
  resetAt: number;
  type: string;
}): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many ${config.type} requests. Please try again later.`,
      rateLimit: {
        limit: config.limit,
        remaining: 0,
        resetAt: config.resetAt,
        resetInSeconds: Math.ceil((config.resetAt - Date.now()) / 1000),
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((config.resetAt - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': config.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': config.resetAt.toString(),
      },
    }
  );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  config: { limit: number; remaining: number; resetAt: number }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', config.limit.toString());
  response.headers.set('X-RateLimit-Remaining', config.remaining.toString());
  response.headers.set('X-RateLimit-Reset', config.resetAt.toString());
  return response;
}

/**
 * Middleware for tracking endpoints
 */
export async function withTrackRateLimit(
  request: NextRequest,
  type: 'click' | 'conversion' | 'track' = 'click'
) {
  const result = await checkPublicRateLimit(request, type);

  if (!result.allowed) {
    return {
      allowed: false,
      response: createRateLimitResponse({
        limit: result.limit,
        remaining: result.remaining,
        resetAt: result.resetAt,
        type,
      }),
    };
  }

  return {
    allowed: true,
    rateLimit: result,
  };
}

/**
 * Per-endpoint rate limiting configuration
 */
export const ENDPOINT_RATE_LIMITS = {
  // Tracking
  '/api/track/click': { windowMs: 60000, maxRequests: 200 },
  '/api/track/conversion': { windowMs: 60000, maxRequests: 50 },
  '/api/track/pixel': { windowMs: 60000, maxRequests: 500 },
  '/api/track/validate': { windowMs: 60000, maxRequests: 100 },

  // Public
  '/api/programs': { windowMs: 60000, maxRequests: 100 },
  '/api/partners': { windowMs: 60000, maxRequests: 60 },
  '/api/media': { windowMs: 60000, maxRequests: 100 },

  // Auth-related public endpoints
  '/api/auth/verify-email': { windowMs: 300000, maxRequests: 5 }, // 5 per 5 min
  '/api/auth/reset-password': { windowMs: 300000, maxRequests: 3 }, // 3 per 5 min
};

export default {
  checkPublicRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
  withTrackRateLimit,
  ENDPOINT_RATE_LIMITS,
};
