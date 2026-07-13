/**
 * Unit Tests for Fraud Detection Engine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkFraud,
  quickFraudCheck,
  calculatePartnerFraudRate,
  getFraudRiskLevel,
  isIPBlocked,
  isEmailDomainBlocked,
  isDeviceBlocked,
  getFingerprintConversionCount,
  getIPConversionCount,
  ConversionContext,
  FraudCheckResult,
} from '@/lib/tracking/fraud-engine';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Fraud Detection Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isIPBlocked', () => {
    it('should return false for non-blocked IPs in demo mode', async () => {
      const result = await isIPBlocked('192.168.1.1');
      expect(result).toBe(false);
    });
  });

  describe('isEmailDomainBlocked', () => {
    // Note: isEmailDomainBlocked only checks Supabase blocklist in production
    // Disposable domains are checked internally in checkFraud, not here
    it('should return false in demo mode for any domain', async () => {
      const result = await isEmailDomainBlocked('anydomain.com');
      expect(result).toBe(false);
    });
  });

  describe('isDeviceBlocked', () => {
    it('should return false in demo mode', async () => {
      const result = await isDeviceBlocked('device_123');
      expect(result).toBe(false);
    });
  });

  describe('getFingerprintConversionCount', () => {
    it('should return 0 in demo mode', async () => {
      const count = await getFingerprintConversionCount('fp_123');
      expect(count).toBe(0);
    });
  });

  describe('getIPConversionCount', () => {
    it('should return 0 in demo mode', async () => {
      const count = await getIPConversionCount('192.168.1.1');
      expect(count).toBe(0);
    });
  });

  describe('checkFraud', () => {
    it('should approve valid conversion', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_address: '192.168.1.100',
        email: 'user@gmail.com',
        device_id: 'device_abc',
        fingerprint: 'fp_12345678901234567890',
        user_agent: 'Mozilla/5.0 Chrome/120.0',
        referrer: 'https://google.com',
      };

      const result = await checkFraud(context);

      expect(result.isBlocked).toBe(false);
      expect(result.isRejected).toBe(false);
      expect(result.recommendation).toBe('approve');
    });

    it('should block disposable email', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_address: '192.168.1.100',
        email: 'test@mailinator.com',
      };

      const result = await checkFraud(context);

      expect(result.isBlocked).toBe(true);
      expect(result.isRejected).toBe(true);
      expect(result.recommendation).toBe('reject');
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'disposable_email' })
      );
    });

    it('should block headless browser', async () => {
      const headlessAgents = [
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PhantomJS/2.1.1',
      ];

      for (const ua of headlessAgents) {
        const context: ConversionContext = {
          partner_id: 'part_1',
          program_id: 'prog_1',
          user_agent: ua,
        };

        const result = await checkFraud(context);
        expect(result.isBlocked).toBe(true);
        expect(result.signals).toContainEqual(
          expect.objectContaining({ type: 'headless_browser' })
        );
      }
    });

    it('should flag high velocity IP conversions', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_address: '192.168.1.100',
        email: 'user@gmail.com',
        ip_conversion_count_24h: 10, // Exceeds threshold
      };

      const result = await checkFraud(context);

      expect(result.isFlagged).toBe(true);
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'duplicate_ip' })
      );
    });

    it('should flag high velocity device conversions', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        device_id: 'device_123',
        email: 'user@gmail.com',
        device_conversion_count_24h: 5, // Exceeds threshold
      };

      const result = await checkFraud(context);

      expect(result.isFlagged).toBe(true);
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'duplicate_device' })
      );
    });

    it('should flag partner with elevated fraud rate', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        email: 'user@gmail.com',
        partner_fraud_rate: 15, // Elevated (10-20%)
      };

      const result = await checkFraud(context);

      expect(result.isFlagged).toBe(true);
      expect(result.signals.some(s => s.type.includes('partner_fraud_rate'))).toBe(true);
    });

    it('should flag partner with high fraud rate (critical)', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        email: 'user@gmail.com',
        partner_fraud_rate: 25, // Critical (>= 20%)
      };

      const result = await checkFraud(context);

      expect(result.isFlagged).toBe(true);
      expect(result.signals.some(s => s.type === 'high_partner_fraud_rate')).toBe(true);
    });

    it('should flag missing fingerprint', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        email: 'user@gmail.com',
        fingerprint: '', // Empty fingerprint
      };

      const result = await checkFraud(context);

      expect(result.isFlagged).toBe(true);
      expect(result.signals).toContainEqual(
        expect.objectContaining({ type: 'missing_fingerprint' })
      );
    });

    it('should aggregate multiple signals', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_address: '192.168.1.100',
        email: 'test@fake-domain.com',
        device_id: 'device_123',
        fingerprint: 'fp_123',
        user_agent: 'Mozilla/5.0 Chrome/120.0',
        ip_conversion_count_24h: 8,
        device_conversion_count_24h: 4,
      };

      const result = await checkFraud(context);

      expect(result.signals.length).toBeGreaterThanOrEqual(3);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('should return detailed reasons', async () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_address: '192.168.1.100',
        ip_conversion_count_24h: 10,
      };

      const result = await checkFraud(context);

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.signals.some(s => s.type === 'duplicate_ip')).toBe(true);
    });
  });

  describe('quickFraudCheck', () => {
    it('should approve clean conversion', () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        email: 'user@gmail.com',
        user_agent: 'Mozilla/5.0 Chrome/120.0',
      };

      const result = quickFraudCheck(context);

      expect(result.recommendation).toBe('approve');
      expect(result.isBlocked).toBe(false);
    });

    it('should reject disposable email instantly', () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        email: 'test@tempmail.com',
      };

      const result = quickFraudCheck(context);

      expect(result.recommendation).toBe('reject');
      expect(result.isBlocked).toBe(true);
    });

    it('should reject headless browser instantly', () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        user_agent: 'HeadlessChrome/120.0',
      };

      const result = quickFraudCheck(context);

      expect(result.recommendation).toBe('reject');
      expect(result.isBlocked).toBe(true);
    });

    it('should flag high velocity conversions', () => {
      const context: ConversionContext = {
        partner_id: 'part_1',
        program_id: 'prog_1',
        ip_conversion_count_24h: 10,
        fingerprint_conversion_count_24h: 5,
      };

      const result = quickFraudCheck(context);

      expect(result.isFlagged).toBe(true);
      expect(result.totalScore).toBeGreaterThan(0);
    });
  });

  describe('calculatePartnerFraudRate', () => {
    it('should calculate correct fraud rate', () => {
      expect(calculatePartnerFraudRate(100, 5, 5)).toBe(10); // 10%
      expect(calculatePartnerFraudRate(100, 3, 2)).toBe(5); // 5%
      expect(calculatePartnerFraudRate(1000, 10, 10)).toBe(2); // 2%
    });

    it('should return 0 for no conversions', () => {
      expect(calculatePartnerFraudRate(0, 0, 0)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculatePartnerFraudRate(1, 1, 0)).toBe(100); // 100%
      expect(calculatePartnerFraudRate(50, 1, 0)).toBe(2); // 2%
    });
  });

  describe('getFraudRiskLevel', () => {
    it('should return correct risk levels', () => {
      expect(getFraudRiskLevel(0)).toBe('low');
      expect(getFraudRiskLevel(2)).toBe('low');
      expect(getFraudRiskLevel(5)).toBe('medium');
      expect(getFraudRiskLevel(8)).toBe('medium');
      expect(getFraudRiskLevel(12)).toBe('high');
      expect(getFraudRiskLevel(25)).toBe('critical');
    });
  });
});
