/**
 * Payment Service
 *
 * Handles payment processing with multiple providers
 * Supports: Midtrans, Xendit (Indonesian payment gateways)
 */

import { isSupabaseConfigured } from '@/lib/supabase';

// Payment types
export type PaymentProvider = 'midtrans' | 'xendit';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'gopay' | 'ovo' | 'dana' | 'linkaja' | 'shopeepay' | 'qrisp';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'cancelled';

export interface PaymentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  redirectUrl?: string;
  qrisUrl?: string;
  qrisImage?: string;
  expiredAt?: string;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  amount?: number;
  paidAt?: string;
  error?: string;
}

// Midtrans configuration
interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

const midtransConfig: MidtransConfig = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};

// Xendit configuration
interface XenditConfig {
  secretKey: string;
  isProduction: boolean;
}

const xenditConfig: XenditConfig = {
  secretKey: process.env.XENDIT_SECRET_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};

// Generate unique order ID
function generateOrderId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

// ============================================
// MIDTRANS SERVICE
// ============================================

const MidtransAPI = {
  baseUrl: () => midtransConfig.isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com',

  headers: () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(midtransConfig.serverKey + ':').toString('base64'),
  }),

  // Create SNAP payment token
  async createSnapTransaction(request: PaymentRequest): Promise<PaymentResponse> {
    if (!midtransConfig.serverKey) {
      console.log('[Midtrans] Demo mode - would create transaction:', request);
      return {
        success: true,
        paymentId: 'DEMO_' + generateOrderId('PAY'),
        redirectUrl: '#demo-mode',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const transactionData = {
        transaction_details: {
          order_id: request.orderId,
          gross_amount: request.amount,
        },
        customer_details: {
          first_name: request.customerName.split(' ')[0],
          last_name: request.customerName.split(' ').slice(1).join(' ') || '',
          email: request.customerEmail,
          phone: request.customerPhone || '',
        },
        item_details: [
          {
            id: request.orderId,
            name: request.description.substring(0, 50),
            price: request.amount,
            quantity: 1,
          },
        ],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback?status=success`,
        },
        metadata: request.metadata,
      };

      const response = await fetch(`${MidtransAPI.baseUrl()}/v2/charge`, {
        method: 'POST',
        headers: MidtransAPI.headers(),
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (result.status_code === '201' || result.status_code === '200') {
        return {
          success: true,
          paymentId: result.transaction_id,
          transactionId: result.transaction_id,
          redirectUrl: result.redirect_url,
          expiredAt: result.expiry_time,
        };
      }

      return {
        success: false,
        error: result.status_message || 'Payment creation failed',
      };
    } catch (error) {
      console.error('Midtrans error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  },

  // Get transaction status
  async getTransactionStatus(orderId: string): Promise<PaymentStatusResponse> {
    if (!midtransConfig.serverKey) {
      return { success: true, status: 'pending' };
    }

    try {
      const response = await fetch(
        `${MidtransAPI.baseUrl()}/v2/${orderId}/status`,
        { headers: MidtransAPI.headers() }
      );

      const result = await response.json();

      const statusMap: Record<string, PaymentStatus> = {
        'capture': 'paid',
        'settlement': 'paid',
        'pending': 'pending',
        'deny': 'failed',
        'expire': 'expired',
        'cancel': 'cancelled',
      };

      return {
        success: true,
        status: statusMap[result.transaction_status] || 'pending',
        transactionId: result.transaction_id,
        amount: result.gross_amount,
        paidAt: result.settlement_time,
      };
    } catch (error) {
      return {
        success: false,
        status: 'pending',
        error: error instanceof Error ? error.message : 'Failed to get status',
      };
    }
  },

  // Handle webhook notification
  parseNotification(notification: Record<string, unknown>) {
    return {
      orderId: notification.order_id as string,
      transactionId: notification.transaction_id as string,
      status: notification.transaction_status as string,
      statusCode: notification.status_code as string,
      grossAmount: notification.gross_amount as string,
      paymentType: notification.payment_type as string,
    };
  },
};

// ============================================
// XENDIT SERVICE
// ============================================

const XenditAPI = {
  baseUrl: () => xenditConfig.isProduction
    ? 'https://api.xendit.co'
    : 'https://api.xendit.co', // Xendit uses same URL for sandbox

  headers: () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(xenditConfig.secretKey + ':').toString('base64'),
  }),

  // Create payout (Disbursement)
  async createPayout(
    amount: number,
    bankCode: string,
    accountNumber: string,
    accountHolder: string,
    description: string
  ): Promise<PaymentResponse> {
    if (!xenditConfig.secretKey) {
      console.log('[Xendit] Demo mode - would create payout:', { amount, bankCode, accountNumber });
      return {
        success: true,
        paymentId: 'DEMO_POUT_' + generateOrderId('POUT'),
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const response = await fetch(`${XenditAPI.baseUrl()}/disbursements`, {
        method: 'POST',
        headers: XenditAPI.headers(),
        body: JSON.stringify({
          external_id: generateOrderId('POUT'),
          bank_code: bankCode,
          account_holder_name: accountHolder,
          account_number: accountNumber,
          amount: amount,
          description,
          currency: 'IDR',
        }),
      });

      const result = await response.json();

      if (result.id) {
        return {
          success: true,
          paymentId: result.id,
          transactionId: result.id,
          expiredAt: result.created,
        };
      }

      return {
        success: false,
        error: result.message || 'Payout creation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payout creation failed',
      };
    }
  },

  // Create QRIS payment
  async createQrisPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!xenditConfig.secretKey) {
      console.log('[Xendit] Demo mode - would create QRIS:', request);
      return {
        success: true,
        paymentId: 'DEMO_QRIS_' + generateOrderId('QRIS'),
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    try {
      const response = await fetch(`${XenditAPI.baseUrl()}/qr_codes`, {
        method: 'POST',
        headers: XenditAPI.headers(),
        body: JSON.stringify({
          external_id: request.orderId,
          type: 'DYNAMIC',
          amount: request.amount,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/xendit-callback`,
          metadata: request.metadata,
        }),
      });

      const result = await response.json();

      if (result.id) {
        return {
          success: true,
          paymentId: result.id,
          qrisUrl: result.qr_string,
          expiredAt: result.created,
        };
      }

      return {
        success: false,
        error: result.message || 'QRIS creation failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QRIS creation failed',
      };
    }
  },

  // Get payout status
  async getPayoutStatus(payoutId: string): Promise<PaymentStatusResponse> {
    if (!xenditConfig.secretKey) {
      return { success: true, status: 'processing' };
    }

    try {
      const response = await fetch(
        `${XenditAPI.baseUrl()}/disbursements/${payoutId}`,
        { headers: XenditAPI.headers() }
      );

      const result = await response.json();

      const statusMap: Record<string, PaymentStatus> = {
        'PENDING': 'pending',
        'ACCEPTED': 'processing',
        'FAILED': 'failed',
      };

      return {
        success: true,
        status: statusMap[result.status] || 'pending',
        transactionId: result.id,
        amount: result.amount,
      };
    } catch (error) {
      return {
        success: false,
        status: 'pending',
        error: error instanceof Error ? error.message : 'Failed to get status',
      };
    }
  },
};

// ============================================
// PAYMENT SERVICE (Main API)
// ============================================

export class PaymentService {
  private provider: PaymentProvider = 'midtrans';

  setProvider(provider: PaymentProvider) {
    this.provider = provider;
  }

  // Create payment for partner payout
  async createPayoutPayment(
    amount: number,
    paymentMethod: string,
    accountDetails: {
      bankCode?: string;
      bankName?: string;
      accountNumber: string;
      accountHolder: string;
      ewalletNumber?: string;
    },
    payoutId: string
  ): Promise<PaymentResponse> {
    if (paymentMethod === 'bank_transfer') {
      return XenditAPI.createPayout(
        amount,
        accountDetails.bankCode || this.getBankCode(accountDetails.bankName || ''),
        accountDetails.accountNumber,
        accountDetails.accountHolder,
        `CuanPintar Payout - ${payoutId}`
      );
    }

    // For demo mode or other methods
    return {
      success: true,
      paymentId: 'DEMO_' + payoutId,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Create payment page (for advertiser top-up)
  async createPaymentPage(request: PaymentRequest): Promise<PaymentResponse> {
    return MidtransAPI.createSnapTransaction(request);
  }

  // Get payment status
  async getStatus(orderId: string): Promise<PaymentStatusResponse> {
    return MidtransAPI.getTransactionStatus(orderId);
  }

  // Get bank code from bank name
  private getBankCode(bankName: string): string {
    const bankCodes: Record<string, string> = {
      'bca': 'BCA',
      'mandiri': 'MANDIRI',
      'bni': 'BNI',
      'bri': 'BRI',
      'cimb': 'CIMB',
      'danamon': 'DMON',
      'permata': 'BTPN',
      'panin': 'PANIN',
      'uob': 'UOB',
      'bsi': 'BSI',
    };
    return bankCodes[bankName.toLowerCase()] || 'BCA';
  }

  // Process webhook notification
  processWebhook(provider: 'midtrans' | 'xendit', payload: Record<string, unknown>) {
    if (provider === 'midtrans') {
      return MidtransAPI.parseNotification(payload);
    }
    // Xendit webhook parsing would go here
    return payload;
  }
}

// Singleton instance
export const paymentService = new PaymentService();

// Helper functions for common operations

// Process partner payout
export async function processPayout(
  payout: {
    id: string;
    amount: number;
    paymentMethod: string;
    bankName?: string;
    accountNumber: string;
    accountHolder: string;
  }
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const result = await paymentService.createPayoutPayment(
    payout.amount,
    payout.paymentMethod,
    {
      bankCode: paymentService.getBankCode(payout.bankName || ''),
      bankName: payout.bankName,
      accountNumber: payout.accountNumber,
      accountHolder: payout.accountHolder,
    },
    payout.id
  );

  return {
    success: result.success,
    transactionId: result.transactionId,
    error: result.error,
  };
}

// Get available payment methods
export function getAvailablePaymentMethods(): Array<{ id: PaymentMethod; name: string; icon: string }> {
  return [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
    { id: 'gopay', name: 'GoPay', icon: '📱' },
    { id: 'ovo', name: 'OVO', icon: '💳' },
    { id: 'dana', name: 'DANA', icon: '📲' },
    { id: 'linkaja', name: 'LinkAja', icon: '🔗' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '🛒' },
    { id: 'qris', name: 'QRIS', icon: '📲' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  ];
}

// Get supported banks
export function getSupportedBanks(): Array<{ code: string; name: string }> {
  return [
    { code: 'BCA', name: 'Bank BCA' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'BNI', name: 'Bank BNI' },
    { code: 'BRI', name: 'Bank BRI' },
    { code: 'CIMB', name: 'CIMB Niaga' },
    { code: 'BTPN', name: 'Bank BTPN / Jenius' },
    { code: 'BSI', name: 'Bank BSI' },
    { code: 'UOB', name: 'UOB Indonesia' },
    { code: 'PANIN', name: 'Bank Panin' },
    { code: 'SAHABAT_SAMPOERNA', name: 'Bank Sahabat Sampoerna' },
  ];
}

// Format currency
export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
