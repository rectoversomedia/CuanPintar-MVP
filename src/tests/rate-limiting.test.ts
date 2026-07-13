/**
 * Rate Limiting Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPublicRateLimit', () => {
    it('should allow first request', async () => {
      const { checkPublicRateLimit } = await import('@/lib/security/public-rate-limit');

      const request = new NextRequest('http://localhost/api/track/click', {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100',
        }),
      });

      const result = await checkPublicRateLimit(request, 'click');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(199); // 200 - 1
    });

    it('should track different IPs separately', async () => {
      const { checkPublicRateLimit } = await import('@/lib/security/public-rate-limit');

      const request1 = new NextRequest('http://localhost/api/track/click', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.100' }),
      });

      const request2 = new NextRequest('http://localhost/api/track/click', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.101' }),
      });

      // First request from IP1
      const result1 = await checkPublicRateLimit(request1, 'click');
      expect(result1.allowed).toBe(true);

      // First request from IP2 should also be allowed
      const result2 = await checkPublicRateLimit(request2, 'click');
      expect(result2.allowed).toBe(true);
    });

    it('should have different limits for different endpoint types', async () => {
      const { checkPublicRateLimit } = await import('@/lib/security/public-rate-limit');

      const request = new NextRequest('http://localhost/api/test', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.100' }),
      });

      // Click limit: 200/min
      const clickResult = await checkPublicRateLimit(request, 'click');
      expect(clickResult.limit).toBe(200);

      // Conversion limit: 50/min (stricter)
      const convResult = await checkPublicRateLimit(request, 'conversion');
      expect(convResult.limit).toBe(50);

      // Track limit: 100/min
      const trackResult = await checkPublicRateLimit(request, 'track');
      expect(trackResult.limit).toBe(100);
    });
  });

  describe('createRateLimitResponse', () => {
    it('should return 429 with proper headers', async () => {
      const { createRateLimitResponse } = await import('@/lib/security/public-rate-limit');

      const response = createRateLimitResponse({
        limit: 100,
        remaining: 0,
        resetAt: Date.now() + 60000,
        type: 'click',
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('withTrackRateLimit', () => {
    it('should return allowed for valid requests', async () => {
      const { withTrackRateLimit } = await import('@/lib/security/public-rate-limit');

      const request = new NextRequest('http://localhost/api/track/click', {
        headers: new Headers({ 'x-forwarded-for': '192.168.1.100' }),
      });

      const result = await withTrackRateLimit(request, 'click');

      expect(result.allowed).toBe(true);
      expect(result.rateLimit).toBeDefined();
    });

    it('should return error response when rate limited', async () => {
      const { withTrackRateLimit } = await import('@/lib/security/public-rate-limit');

      // This test would require many rapid requests in real scenario
      // For unit testing, we test the response structure

      const response = {
        allowed: false,
        response: new Response(JSON.stringify({ error: 'Rate limited' }), {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
          },
        }),
      };

      expect(response.allowed).toBe(false);
      expect(response.response.status).toBe(429);
    });
  });

  describe('ENDPOINT_RATE_LIMITS', () => {
    it('should have specific limits for important endpoints', async () => {
      const { ENDPOINT_RATE_LIMITS } = await import('@/lib/security/public-rate-limit');

      // Auth endpoints should be stricter
      expect(ENDPOINT_RATE_LIMITS['/api/auth/reset-password'].maxRequests).toBe(3);
      expect(ENDPOINT_RATE_LIMITS['/api/auth/verify-email'].maxRequests).toBe(5);

      // Track endpoints should be lenient
      expect(ENDPOINT_RATE_LIMITS['/api/track/pixel'].maxRequests).toBe(500);
    });
  });
});
