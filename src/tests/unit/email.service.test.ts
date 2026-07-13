/**
 * Unit Tests for Email Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendEmail,
  sendTemplatedEmail,
  sendWelcomeEmail,
  sendConversionNotification,
  sendPayoutNotification,
  EMAIL_TEMPLATES,
} from '@/lib/services/email';

// Mock environment
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email in demo mode (console log)', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toContain('demo_');
    });

    it('should accept array of recipients', async () => {
      const result = await sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test',
        html: '<p>Content</p>',
      });

      expect(result.success).toBe(true);
    });

    it('should handle email with attachments', async () => {
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test with attachment',
        html: '<p>Content</p>',
        attachments: [
          {
            filename: 'invoice.pdf',
            content: Buffer.from('PDF content'),
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendTemplatedEmail', () => {
    it('should send welcome email template', async () => {
      const result = await sendTemplatedEmail(EMAIL_TEMPLATES.WELCOME, 'test@example.com', {
        name: 'John Doe',
        dashboardUrl: 'http://localhost:3000',
      });

      expect(result.success).toBe(true);
    });

    it('should send advertiser welcome email', async () => {
      const result = await sendTemplatedEmail(
        EMAIL_TEMPLATES.WELCOME_ADVERTISER,
        'advertiser@company.com',
        {
          name: 'Sarah',
          companyName: 'Tunaiku',
          dashboardUrl: 'http://localhost:3000',
        }
      );

      expect(result.success).toBe(true);
    });

    it('should send partner welcome email', async () => {
      const result = await sendTemplatedEmail(
        EMAIL_TEMPLATES.WELCOME_PARTNER,
        'partner@media.com',
        {
          name: 'Budi',
          partnerName: 'JakselNews Media',
          dashboardUrl: 'http://localhost:3000',
        }
      );

      expect(result.success).toBe(true);
    });

    it('should send password reset email', async () => {
      const result = await sendTemplatedEmail(EMAIL_TEMPLATES.RESET_PASSWORD, 'user@example.com', {
        name: 'User',
        resetUrl: 'http://localhost:3000/reset-password?token=abc123',
      });

      expect(result.success).toBe(true);
    });

    it('should send email verification', async () => {
      const result = await sendTemplatedEmail(EMAIL_TEMPLATES.VERIFY_EMAIL, 'user@example.com', {
        name: 'User',
        verificationUrl: 'http://localhost:3000/verify?token=xyz789',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email for advertiser', async () => {
      const result = await sendWelcomeEmail(
        'advertiser@test.com',
        'Sarah',
        'advertiser',
        { companyName: 'Tunaiku' }
      );

      expect(result.success).toBe(true);
    });

    it('should send welcome email for partner', async () => {
      const result = await sendWelcomeEmail(
        'partner@test.com',
        'Budi',
        'partner',
        { partnerName: 'JakselNews' }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendConversionNotification', () => {
    it('should send conversion validated notification', async () => {
      const result = await sendConversionNotification('partner@example.com', {
        programName: 'Tunaiku Program',
        partnerName: 'JakselNews Media',
        payoutAmount: 25000,
      }, {
        totalEarnings: 500000,
        validConversions: 20,
        pendingPayout: 100000,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('sendPayoutNotification', () => {
    it('should send payout completed notification', async () => {
      const result = await sendPayoutNotification('partner@example.com', {
        amount: 500000,
        paymentMethod: 'Bank Transfer BCA',
        transactionId: 'TXN123456',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('EMAIL_TEMPLATES', () => {
    it('should have all required template keys', () => {
      expect(EMAIL_TEMPLATES.WELCOME).toBe('welcome');
      expect(EMAIL_TEMPLATES.WELCOME_ADVERTISER).toBe('welcome_advertiser');
      expect(EMAIL_TEMPLATES.WELCOME_PARTNER).toBe('welcome_partner');
      expect(EMAIL_TEMPLATES.VERIFY_EMAIL).toBe('verify_email');
      expect(EMAIL_TEMPLATES.RESET_PASSWORD).toBe('reset_password');
      expect(EMAIL_TEMPLATES.CONVERSION_VALIDATED).toBe('conversion_validated');
      expect(EMAIL_TEMPLATES.PAYOUT_PAID).toBe('payout_paid');
    });
  });
});
