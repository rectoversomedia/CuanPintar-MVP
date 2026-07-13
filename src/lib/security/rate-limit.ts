/**
 * CuanPintar - Rate Limiting
 * Phase 0.3: Redis-based rate limiting with in-memory fallback
 */

import { Redis } from '@upstash/redis';

// Types
interface RateLimitConfig {
  max: number;
  window: number; // seconds
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // seconds (only if denied)
}

type RateLimitTier = 'strict' | 'normal' | 'lenient' | 'track' | 'webhook' | 'auth';

// Rate limit configurations
const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  // Auth endpoints: 5 attempts per 15 minutes (strict)
  // Increase for development
  auth: { max: 100, window: 60, keyPrefix: 'rl:auth' },

  // Normal API: 100 requests per minute
  normal: { max: 500, window: 60, keyPrefix: 'rl:api' },

  // Lenient: 300 requests per minute (for read operations)
  lenient: { max: 1000, window: 60, keyPrefix: 'rl:lenient' },

  // Tracking endpoints: 1000 requests per minute (high volume)
  track: { max: 5000, window: 60, keyPrefix: 'rl:track' },

  // Webhook endpoints: 500 requests per minute
  webhook: { max: 1000, window: 60, keyPrefix: 'rl:webhook' },

  // Strict: 10 requests per minute
  strict: { max: 100, window: 60, keyPrefix: 'rl:strict' },
};

// Initialize Redis only if credentials exist
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

/**
 * In-memory store for development/fallback
 * Note: This does NOT work across multiple serverless instances
 */
const memoryStore = new Map<
  string,
  {
    count: number;
    timestamps: number[];
    resetAt: number;
  }
>();

// Cleanup old memory entries every minute
const MEMORY_CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanupMemoryStore() {
  const now = Date.now();
  if (now - lastCleanup < MEMORY_CLEANUP_INTERVAL) return;

  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt < now) {
      memoryStore.delete(key);
    }
  }
  lastCleanup = now;
}

function inMemoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanupMemoryStore();

  const now = Date.now();
  let record = memoryStore.get(key);

  // Create new record if doesn't exist or expired
  if (!record || record.resetAt < now) {
    record = {
      count: 1,
      timestamps: [now],
      resetAt: now + config.window * 1000,
    };
    memoryStore.set(key, record);

    return {
      allowed: true,
      remaining: config.max - 1,
      reset: record.resetAt,
    };
  }

  // Add current timestamp
  record.timestamps.push(now);
  record.count = record.timestamps.length;

  // Remove timestamps outside the window
  const windowStart = now - config.window * 1000;
  record.timestamps = record.timestamps.filter((t) => t > windowStart);
  record.count = record.timestamps.length;

  const allowed = record.count <= config.max;
  const remaining = Math.max(0, config.max - record.count);

  return {
    allowed,
    remaining,
    reset: record.resetAt,
    retryAfter: allowed ? undefined : Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Check rate limit using Redis
 */
async function redisRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.window;

  // Use Redis sorted set for sliding window rate limiting
  if (!redis) {
    throw new Error('Redis not configured');
  }
  const fullKey = `${config.keyPrefix || 'rl'}:${key}`;

  // Lua script for atomic sliding window rate limit
  const script = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local max = tonumber(ARGV[3])
    local windowStart = now - window

    -- Remove entries outside the window
    redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

    -- Add current request
    redis.call('ZADD', key, now, now .. '-' .. math.random())

    -- Count requests in window
    local count = redis.call('ZCARD', key)

    -- Set expiry
    redis.call('EXPIRE', key, window)

    -- Return count and whether allowed
    if count > max then
      return {0, max - count, now + window}
    else
      return {1, max - count, now + window}
    end
  `;

  const result = (await redis.eval(
    script,
    [fullKey],
    [now.toString(), config.window.toString(), config.max.toString()]
  )) as [number, number, number];

  const [allowed, remaining, reset] = result;

  return {
    allowed: allowed === 1,
    remaining,
    reset,
    retryAfter: allowed === 1 ? undefined : Math.ceil((reset - now) * 1000),
  };
}

/**
 * Check rate limit for a given identifier and tier
 *
 * @param identifier - Unique identifier (IP, user ID, API key, etc.)
 * @param tier - Rate limit tier (auth, normal, track, etc.)
 * @param customMax - Optional custom max requests (overrides tier default)
 * @param customWindow - Optional custom window in seconds (overrides tier default)
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'normal',
  customMax?: number,
  customWindow?: number
): Promise<RateLimitResult> {
  const baseConfig = RATE_LIMITS[tier] || RATE_LIMITS.normal;
  const config: RateLimitConfig = {
    max: customMax ?? baseConfig.max,
    window: customWindow ?? baseConfig.window,
    keyPrefix: baseConfig.keyPrefix,
  };

  // Normalize identifier (remove colons, special chars)
  const normalizedId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (redis) {
    return redisRateLimit(normalizedId, config);
  }

  return inMemoryRateLimit(normalizedId, config);
}

/**
 * Create a rate limit check for a specific key
 */
export async function checkRateLimitByKey(key: string, tier: RateLimitTier = 'normal'): Promise<RateLimitResult> {
  return checkRateLimit(key, tier);
}

/**
 * Create rate limit key from request
 */
export function getRateLimitKey(request: Request, type: 'ip' | 'user' | 'api_key', userId?: string, apiKey?: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  switch (type) {
    case 'user':
      return `user:${userId || ip}`;
    case 'api_key':
      return `apikey:${apiKey || ip}`;
    case 'ip':
    default:
      return `ip:${ip}`;
  }
}

/**
 * Check rate limit from request IP
 */
export async function checkRateLimitFromIP(request: Request, tier: RateLimitTier = 'normal'): Promise<RateLimitResult> {
  const key = getRateLimitKey(request, 'ip');
  return checkRateLimit(key, tier);
}

/**
 * Check rate limit from authenticated user
 */
export async function checkRateLimitFromUser(request: Request, userId: string, tier: RateLimitTier = 'normal'): Promise<RateLimitResult> {
  const key = getRateLimitKey(request, 'user', userId);
  return checkRateLimit(key, tier);
}

/**
 * Check rate limit from API key
 */
export async function checkRateLimitFromAPIKey(request: Request, apiKey: string, tier: RateLimitTier = 'normal'): Promise<RateLimitResult> {
  const key = getRateLimitKey(request, 'api_key', undefined, apiKey);
  return checkRateLimit(key, tier);
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export async function resetRateLimit(key: string, tier: RateLimitTier = 'normal'): Promise<void> {
  const config = RATE_LIMITS[tier] || RATE_LIMITS.normal;
  const fullKey = `${config.keyPrefix || 'rl'}:${key}`;

  if (redis) {
    await redis.del(fullKey);
  } else {
    memoryStore.delete(fullKey);
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(identifier: string, tier: RateLimitTier = 'normal'): Promise<RateLimitResult> {
  const baseConfig = RATE_LIMITS[tier] || RATE_LIMITS.normal;
  const config: RateLimitConfig = {
    max: baseConfig.max,
    window: baseConfig.window,
    keyPrefix: baseConfig.keyPrefix,
  };

  const normalizedId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fullKey = `${config.keyPrefix || 'rl'}:${normalizedId}`;

  if (redis) {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.window;
    const count = await redis.zcount(fullKey, windowStart, '+inf');
    return {
      allowed: count < config.max,
      remaining: Math.max(0, config.max - count),
      reset: now + config.window,
    };
  }

  const record = memoryStore.get(fullKey);
  if (!record) {
    return {
      allowed: true,
      remaining: config.max,
      reset: Date.now() + config.window * 1000,
    };
  }

  const now = Date.now();
  const windowStart = now - config.window * 1000;
  const validTimestamps = record.timestamps.filter((t) => t > windowStart);
  const count = validTimestamps.length;

  return {
    allowed: count < config.max,
    remaining: Math.max(0, config.max - count),
    reset: record.resetAt,
  };
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = Math.ceil(result.retryAfter / 1000).toString();
    headers['X-RateLimit-Retry-After-Seconds'] = Math.ceil(result.retryAfter / 1000).toString();
  }

  return headers;
}

/**
 * Rate limit error response
 */
export function rateLimitErrorResponse(result: RateLimitResult): Response {
  const retryAfter = result.retryAfter ? Math.ceil(result.retryAfter / 1000) : 60;

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: `Terlalu banyak request. Coba lagi dalam ${retryAfter} detik.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        ...createRateLimitHeaders(result),
      },
    }
  );
}

/**
 * Express-style middleware for rate limiting
 * Use in API routes
 */
export async function rateLimitMiddleware(
  request: Request,
  tier: RateLimitTier = 'normal'
): Promise<{ allowed: boolean; result: RateLimitResult }> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const result = await checkRateLimit(ip, tier);

  return {
    allowed: result.allowed,
    result,
  };
}

/**
 * Tier descriptions for documentation
 */
export const RATE_LIMIT_TIERS = {
  auth: {
    description: 'Strict rate limit for authentication endpoints',
    defaultMax: 5,
    defaultWindow: '15 minutes',
    useCases: ['Login', 'Register', 'Password Reset', '2FA'],
  },
  strict: {
    description: 'Very strict rate limit for sensitive operations',
    defaultMax: 10,
    defaultWindow: '1 minute',
    useCases: ['Password change', '2FA disable', 'API key generation'],
  },
  normal: {
    description: 'Standard rate limit for general API operations',
    defaultMax: 100,
    defaultWindow: '1 minute',
    useCases: ['General API', 'Dashboard data'],
  },
  lenient: {
    description: 'Permissive rate limit for read-heavy operations',
    defaultMax: 300,
    defaultWindow: '1 minute',
    useCases: ['List operations', 'Search', 'Reports'],
  },
  track: {
    description: 'High-volume rate limit for tracking pixels',
    defaultMax: 1000,
    defaultWindow: '1 minute',
    useCases: ['Click tracking', 'Conversion tracking', 'Impression tracking'],
  },
  webhook: {
    description: 'Standard rate limit for outbound webhooks',
    defaultMax: 500,
    defaultWindow: '1 minute',
    useCases: ['Webhook delivery', 'Postback URLs'],
  },
} as const;
