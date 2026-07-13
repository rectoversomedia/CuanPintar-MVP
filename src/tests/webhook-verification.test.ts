/**
 * Webhook Verification Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

describe('Webhook Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Midtrans Signature', () => {
    it('should verify valid signature', async () => {
      const { verifyMidtransSignature } = await import('@/lib/services/webhook-verification');

      // Mock the environment variable
      process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-testkey';

      const orderId = 'ORDER-123';
      const statusCode = '200';
      const grossAmount = '100000.00';
      const serverKey = process.env.MIDTRANS_SERVER_KEY;

      // Generate valid signature
      const signatureSource = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const validSignature = crypto
        .createHash('sha512')
        .update(signatureSource)
        .digest('hex');

      const result = verifyMidtransSignature(orderId, statusCode, grossAmount, validSignature);

      expect(result).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const { verifyMidtransSignature } = await import('@/lib/services/webhook-verification');

      process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-testkey';

      const result = verifyMidtransSignature(
        'ORDER-123',
        '200',
        '100000.00',
        'invalid-signature-here'
      );

      expect(result).toBe(false);
    });
  });

  describe('Xendit Verification', () => {
    it('should verify valid callback token', async () => {
      const { verifyXenditWebhook } = await import('@/lib/services/webhook-verification');

      process.env.XENDIT_CALLBACK_TOKEN = 'test-callback-token-12345';

      const headers = new Headers({
        'x-callback-token': 'test-callback-token-12345',
      });

      const payload = {
        id: 'evt_123',
        status: 'PAID',
        external_id: 'ext_123',
      };

      const result = verifyXenditWebhook(payload, headers);

      expect(result.valid).toBe(true);
    });

    it('should reject missing callback token', async () => {
      const { verifyXenditWebhook } = await import('@/lib/services/webhook-verification');

      process.env.XENDIT_CALLBACK_TOKEN = 'test-callback-token-12345';

      const headers = new Headers({});

      const result = verifyXenditWebhook({}, headers);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing callback token');
    });
  });

  describe('Custom Webhook Signature', () => {
    it('should generate and verify signature', async () => {
      const { generateWebhookSignature, verifySignedWebhookPayload } = await import(
        '@/lib/services/webhook-verification'
      );

      const payload = { event: 'test', data: { id: '123' } };
      const secret = 'my-webhook-secret';

      const signature = generateWebhookSignature(payload, secret);

      expect(signature).toMatch(/^sha256=/);

      // Verify the signed payload
      const verifyResult = verifySignedWebhookPayload(
        JSON.stringify(payload),
        signature,
        secret,
        300
      );

      expect(verifyResult.valid).toBe(true);
    });

    it('should reject expired signature', async () => {
      const { generateWebhookSignature, verifySignedWebhookPayload } = await import(
        '@/lib/services/webhook-verification'
      );

      const payload = { event: 'test' };
      const secret = 'my-secret';
      const signature = generateWebhookSignature(payload, secret);

      // Verify with TTL of 0 (already expired)
      const result = verifySignedWebhookPayload(JSON.stringify(payload), signature, secret, 0);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });
  });

  describe('generateSignedWebhookPayload', () => {
    it('should include timestamp in signature', async () => {
      const { generateSignedWebhookPayload, verifySignedWebhookPayload } = await import(
        '@/lib/services/webhook-verification'
      );

      const payload = { event: 'conversion.created', data: { id: 'conv_123' } };
      const secret = 'secret-key';

      const result = generateSignedWebhookPayload(payload, secret, 300);

      expect(result.timestamp).toBeDefined();
      expect(result.signature).toContain('t=');
      expect(result.signature).toContain('v1=');

      // Verify it works
      const verifyResult = verifySignedWebhookPayload(
        result.payload,
        result.signature,
        secret,
        300
      );

      expect(verifyResult.valid).toBe(true);
    });
  });
});
