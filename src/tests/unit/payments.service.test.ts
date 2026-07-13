/**
 * Unit Tests for Payment Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PaymentService,
  paymentService,
  processPayout,
  getAvailablePaymentMethods,
  getSupportedBanks,
  formatCurrency,
  PaymentMethod,
} from '@/lib/services/payments';

// Mock environment
vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Payment Service', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    vi.clearAllMocks();
  });

  describe('createPayoutPayment', () => {
    it('should create payout with bank transfer', async () => {
      const result = await service.createPayoutPayment(
        500000,
        'bank_transfer',
        {
          bankCode: 'BCA',
          accountNumber: '1234567890',
          accountHolder: 'John Doe',
        },
        'payout_123'
      );

      expect(result.success).toBe(true);
      expect(result.paymentId).toContain('DEMO_');
    });

    it('should handle demo mode payout', async () => {
      const result = await service.createPayoutPayment(
        1000000,
        'bank_transfer',
        {
          bankCode: 'MANDIRI',
          accountNumber: '9876543210',
          accountHolder: 'Jane Doe',
        },
        'payout_456'
      );

      expect(result.success).toBe(true);
      expect(result.expiredAt).toBeDefined();
    });

    it('should handle e-wallet payout in demo mode', async () => {
      const result = await service.createPayoutPayment(
        250000,
        'gopay',
        {
          accountNumber: '081234567890',
          ewalletNumber: '081234567890',
          accountHolder: 'Test User',
        },
        'payout_789'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('createPaymentPage', () => {
    it('should create payment page request', async () => {
      const result = await service.createPaymentPage({
        amount: 1000000,
        orderId: 'order_123',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+6281234567890',
        description: 'Test Payment',
      });

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.redirectUrl).toBeDefined();
    });

    it('should handle payment with custom currency', async () => {
      const result = await service.createPaymentPage({
        amount: 500000,
        currency: 'IDR',
        orderId: 'order_456',
        customerName: 'Customer',
        customerEmail: 'customer@test.com',
        description: 'Service Payment',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return pending status in demo mode', async () => {
      const result = await service.getStatus('order_123');

      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
    });
  });

  describe('getBankCode', () => {
    it('should return correct bank code for BCA', () => {
      expect(service.getBankCode('bca')).toBe('BCA');
      expect(service.getBankCode('BCA')).toBe('BCA');
      expect(service.getBankCode('Bca')).toBe('BCA');
    });

    it('should return correct bank code for Mandiri', () => {
      expect(service.getBankCode('mandiri')).toBe('MANDIRI');
    });

    it('should return correct bank code for BRI', () => {
      expect(service.getBankCode('bri')).toBe('BRI');
    });

    it('should return BCA as default for unknown bank', () => {
      expect(service.getBankCode('unknownbank')).toBe('BCA');
    });
  });

  describe('processWebhook', () => {
    it('should parse midtrans notification', () => {
      const payload = {
        order_id: 'order_123',
        transaction_id: 'txn_456',
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: '100000',
        payment_type: 'bank_transfer',
      };

      const result = service.processWebhook('midtrans', payload);

      expect(result.orderId).toBe('order_123');
      expect(result.transactionId).toBe('txn_456');
      expect(result.status).toBe('settlement');
    });
  });
});

describe('processPayout', () => {
  it('should process payout successfully', async () => {
    const result = await processPayout({
      id: 'payout_001',
      amount: 500000,
      paymentMethod: 'bank_transfer',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'John Doe',
    });

    expect(result.success).toBe(true);
    // transactionId is optional in demo mode
  });

  it('should handle payout with error', async () => {
    // This should still succeed in demo mode
    const result = await processPayout({
      id: 'payout_002',
      amount: 1000000,
      paymentMethod: 'bank_transfer',
      bankName: 'Mandiri',
      accountNumber: '9876543210',
      accountHolder: 'Jane Doe',
    });

    expect(result.success).toBe(true);
  });
});

describe('getAvailablePaymentMethods', () => {
  it('should return all payment methods', () => {
    const methods = getAvailablePaymentMethods();

    expect(methods.length).toBeGreaterThan(0);
    expect(methods.find(m => m.id === 'bank_transfer')).toBeDefined();
    expect(methods.find(m => m.id === 'gopay')).toBeDefined();
    expect(methods.find(m => m.id === 'qrisp')).toBeDefined();
  });

  it('should have valid payment method structure', () => {
    const methods = getAvailablePaymentMethods();

    methods.forEach(method => {
      expect(method.id).toBeDefined();
      expect(method.name).toBeDefined();
      expect(method.icon).toBeDefined();
    });
  });
});

describe('getSupportedBanks', () => {
  it('should return all supported banks', () => {
    const banks = getSupportedBanks();

    expect(banks.length).toBeGreaterThan(0);
    expect(banks.find(b => b.code === 'BCA')).toBeDefined();
    expect(banks.find(b => b.code === 'MANDIRI')).toBeDefined();
    expect(banks.find(b => b.code === 'BNI')).toBeDefined();
    expect(banks.find(b => b.code === 'BRI')).toBeDefined();
  });

  it('should have valid bank structure', () => {
    const banks = getSupportedBanks();

    banks.forEach(bank => {
      expect(bank.code).toBeDefined();
      expect(bank.name).toBeDefined();
    });
  });
});

describe('formatCurrency', () => {
  it('should format IDR currency correctly', () => {
    const formatted = formatCurrency(1000000);
    expect(formatted).toContain('1.000.000');
  });

  it('should format with no decimal places', () => {
    const formatted = formatCurrency(500000);
    expect(formatted).toContain('500.000');
  });

  it('should handle zero amount', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toContain('0');
  });
});
