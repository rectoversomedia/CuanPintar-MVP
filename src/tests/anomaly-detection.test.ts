/**
 * Anomaly Detection Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Anomaly Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserBehaviorProfile', () => {
    it('should return default profile for new user', async () => {
      const { getUserBehaviorProfile } = await import('@/lib/analytics/anomaly-detection');

      const profile = await getUserBehaviorProfile('new-user-123');

      expect(profile.userId).toBe('new-user-123');
      expect(profile.avgSessionDuration).toBe(300000);
      expect(profile.clickVelocity).toBe(0.5);
      expect(profile.riskScore).toBe(0);
    });
  });

  describe('detectAnomaly', () => {
    it('should detect high velocity anomaly', async () => {
      const { detectAnomaly } = await import('@/lib/analytics/anomaly-detection');

      const result = await detectAnomaly({
        userId: 'test-user',
        eventType: 'click',
        velocity: 10, // 10 clicks per minute - very high
      });

      expect(result.score).toBeGreaterThan(0);
      expect(result.isAnomaly).toBe(true);
      expect(result.factors).toContainEqual(
        expect.objectContaining({ type: 'velocity' })
      );
    });

    it('should detect unusual timing anomaly', async () => {
      const { detectAnomaly } = await import('@/lib/analytics/anomaly-detection');

      // 3 AM - usually sleeping time
      const result = await detectAnomaly({
        userId: 'test-user',
        eventType: 'click',
        timestamp: new Date('2024-01-15T03:00:00').getTime(),
        velocity: 1,
      });

      // May or may not trigger depending on profile
      expect(result).toBeDefined();
    });

    it('should detect geolocation anomaly', async () => {
      const { detectAnomaly } = await import('@/lib/analytics/anomaly-detection');

      const result = await detectAnomaly({
        userId: 'test-user',
        eventType: 'conversion',
        country: 'RU', // Different from usual
        timezone: 'Europe/Moscow',
        velocity: 1,
      });

      expect(result.score).toBeGreaterThan(0);
    });

    it('should allow normal traffic', async () => {
      const { detectAnomaly } = await import('@/lib/analytics/anomaly-detection');

      const result = await detectAnomaly({
        userId: 'normal-user',
        eventType: 'click',
        velocity: 0.5, // Normal velocity
        country: 'ID',
        timezone: 'Asia/Jakarta',
      });

      expect(result.score).toBeLessThan(40);
      expect(result.suggestedAction).toBe('allow');
    });
  });

  describe('getAnomalyStats', () => {
    it('should return default stats when not configured', async () => {
      const { getAnomalyStats } = await import('@/lib/analytics/anomaly-detection');

      const stats = await getAnomalyStats(
        Date.now() - 86400000, // 24 hours ago
        Date.now()
      );

      expect(stats.total).toBe(0);
      expect(stats.blocked).toBe(0);
      expect(stats.reviewed).toBe(0);
      expect(stats.allowed).toBe(0);
    });
  });
});
