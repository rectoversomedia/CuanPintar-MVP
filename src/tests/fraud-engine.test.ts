/**
 * Fraud Engine Tests
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

describe('Fraud Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('quickFraudCheck', () => {
    it('should block disposable email', async () => {
      const { quickFraudCheck } = await import('@/lib/tracking/fraud-engine');

      const result = quickFraudCheck({
        partner_id: 'part_001',
        program_id: 'prog_001',
        email: 'test@mailinator.com',
      });

      expect(result.isBlocked).toBe(true);
      expect(result.recommendation).toBe('reject');
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'disposable_email' })
      );
    });

    it('should block headless browser', async () => {
      const { quickFraudCheck } = await import('@/lib/tracking/fraud-engine');

      const result = quickFraudCheck({
        partner_id: 'part_001',
        program_id: 'prog_001',
        user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 HeadlessChrome',
      });

      expect(result.isBlocked).toBe(true);
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'headless_browser' })
      );
    });

    it('should flag high velocity', async () => {
      const { quickFraudCheck } = await import('@/lib/tracking/fraud-engine');

      const result = quickFraudCheck({
        partner_id: 'part_001',
        program_id: 'prog_001',
        ip_conversion_count_24h: 10,
      });

      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('should approve normal traffic', async () => {
      const { quickFraudCheck } = await import('@/lib/tracking/fraud-engine');

      const result = quickFraudCheck({
        partner_id: 'part_001',
        program_id: 'prog_001',
        email: 'user@gmail.com',
      });

      expect(result.isBlocked).toBe(false);
      expect(result.recommendation).toBe('approve');
    });
  });

  describe('calculatePartnerFraudRate', () => {
    it('should calculate 0% for no fraud', async () => {
      const { calculatePartnerFraudRate } = await import('@/lib/tracking/fraud-engine');

      const rate = calculatePartnerFraudRate(100, 0, 0);

      expect(rate).toBe(0);
    });

    it('should calculate fraud rate correctly', async () => {
      const { calculatePartnerFraudRate } = await import('@/lib/tracking/fraud-engine');

      const rate = calculatePartnerFraudRate(100, 5, 5);

      expect(rate).toBe(10); // 10% fraud + rejected
    });

    it('should handle zero total conversions', async () => {
      const { calculatePartnerFraudRate } = await import('@/lib/tracking/fraud-engine');

      const rate = calculatePartnerFraudRate(0, 0, 0);

      expect(rate).toBe(0);
    });
  });

  describe('getFraudRiskLevel', () => {
    it('should return low for <3%', async () => {
      const { getFraudRiskLevel } = await import('@/lib/tracking/fraud-engine');

      expect(getFraudRiskLevel(1)).toBe('low');
      expect(getFraudRiskLevel(2.9)).toBe('low');
    });

    it('should return medium for 3-10%', async () => {
      const { getFraudRiskLevel } = await import('@/lib/tracking/fraud-engine');

      expect(getFraudRiskLevel(3)).toBe('medium');
      expect(getFraudRiskLevel(9.9)).toBe('medium');
    });

    it('should return high for 10-20%', async () => {
      const { getFraudRiskLevel } = await import('@/lib/tracking/fraud-engine');

      expect(getFraudRiskLevel(10)).toBe('high');
      expect(getFraudRiskLevel(19.9)).toBe('high');
    });

    it('should return critical for >=20%', async () => {
      const { getFraudRiskLevel } = await import('@/lib/tracking/fraud-engine');

      expect(getFraudRiskLevel(20)).toBe('critical');
      expect(getFraudRiskLevel(50)).toBe('critical');
    });
  });
});
