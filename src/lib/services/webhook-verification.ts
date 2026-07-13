/**
 * Webhook Signature Verification Service
 * Supports Midtrans, Xendit, and custom webhooks
 */

import crypto from 'crypto';

// ============================================
// MIDTRANS
// ============================================

export interface MidtransWebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  gross_amount: string;
  currency: string;
  payment_amounts?: Array<{
    payment_type: string;
    amount: number;
  }>;
  fraud_status?: string;
  eci?: string;
  card_country?: string;
  bank?: string;
  masked_card?: string;
}

export interface MidtransVerificationResult {
  valid: boolean;
  error?: string;
  payload?: MidtransWebhookPayload;
}

/**
 * Get Midtrans Server Key
 */
function getMidtransServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MIDTRANS_SERVER_KEY is not configured');
    }
    console.warn('MIDTRANS_SERVER_KEY not set - using fallback for development');
    return 'SB-Mid-server-demo-key';
  }
  return key;
}

/**
 * Verify Midtrans webhook signature
 * Signature format: sha512(order_id + status_code + gross_amount + serverKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  try {
    const serverKey = getMidtransServerKey();
    const signatureSource = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(signatureSource)
      .digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signatureKey),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Midtrans signature verification error:', error);
    return false;
  }
}

/**
 * Verify complete Midtrans webhook payload
 */
export function verifyMidtransWebhook(
  payload: Record<string, unknown>,
  headers: Headers
): MidtransVerificationResult {
  try {
    // Get signature from header or body
    const signatureKey =
      headers.get('x-midtrans-signature') ||
      (payload.signature_key as string);

    if (!signatureKey) {
      return { valid: false, error: 'Missing signature' };
    }

    const orderId = payload.order_id as string;
    const statusCode = payload.status_code as string;
    const grossAmount = payload.gross_amount as string;

    if (!orderId || !statusCode || !grossAmount) {
      return { valid: false, error: 'Missing required fields' };
    }

    const isValid = verifyMidtransSignature(
      orderId,
      statusCode,
      grossAmount,
      signatureKey
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return {
      valid: true,
      payload: payload as unknown as MidtransWebhookPayload,
    };
  } catch (error) {
    console.error('Midtrans webhook verification error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

// ============================================
// XENDIT
// ============================================

export interface XenditWebhookPayload {
  id: string;
  status: string;
  external_id: string;
  amount: number;
  payer_email: string;
  description?: string;
  payment_method?: string;
  payment_channel?: string;
  paid_at?: string;
  created: string;
  updated: string;
}

export interface XenditVerificationResult {
  valid: boolean;
  error?: string;
  payload?: XenditWebhookPayload;
}

/**
 * Get Xendit API Key
 */
function getXenditAPIKey(): string {
  const key = process.env.XENDIT_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('XENDIT_API_KEY is not configured');
    }
    console.warn('XENDIT_API_KEY not set - using fallback for development');
    return 'demo_xendit_key';
  }
  return key;
}

/**
 * Get Xendit Callback Token
 */
function getXenditCallbackToken(): string {
  const token = process.env.XENDIT_CALLBACK_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('XENDIT_CALLBACK_TOKEN is not configured');
    }
    console.warn('XENDIT_CALLBACK_TOKEN not set - using fallback for development');
    return 'demo_callback_token';
  }
  return token;
}

/**
 * Verify Xendit webhook signature
 * Xendit uses callback token in header for verification
 */
export function verifyXenditWebhook(
  payload: Record<string, unknown>,
  headers: Headers
): XenditVerificationResult {
  try {
    // Xendit sends callback token in header
    const callbackToken = headers.get('x-callback-token');

    if (!callbackToken) {
      return { valid: false, error: 'Missing callback token' };
    }

    const expectedToken = getXenditCallbackToken();

    // Timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(callbackToken),
      Buffer.from(expectedToken)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid callback token' };
    }

    // Verify required fields
    const id = payload.id as string;
    const status = payload.status as string;
    const externalId = payload.external_id as string;

    if (!id || !status || !externalId) {
      return { valid: false, error: 'Missing required fields' };
    }

    return {
      valid: true,
      payload: payload as unknown as XenditWebhookPayload,
    };
  } catch (error) {
    console.error('Xendit webhook verification error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

// ============================================
// CUSTOM WEBHOOKS
// ============================================

export interface CustomWebhookConfig {
  secret: string;
  algorithm?: 'sha256' | 'sha512';
  signatureHeader?: string;
}

export interface CustomWebhookVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(
  payload: string | object,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = crypto
    .createHmac(algorithm, secret)
    .update(data)
    .digest('hex');

  return `sha256=${signature}`;
}

/**
 * Generate webhook signature with timestamp (for replay protection)
 */
export function generateSignedWebhookPayload(
  payload: object,
  secret: string,
  ttlSeconds: number = 300 // 5 minutes
): { payload: string; timestamp: number; signature: string } {
  const timestamp = Date.now();
  const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('hex');

  return {
    payload: JSON.stringify(payload),
    timestamp,
    signature: `t=${timestamp},v1=${signature},ttl=${ttlSeconds}`,
  };
}

/**
 * Verify signed webhook payload (with timestamp)
 */
export function verifySignedWebhookPayload(
  payload: string,
  signature: string,
  secret: string,
  ttlSeconds: number = 300
): CustomWebhookVerificationResult {
  try {
    // Parse signature header
    const parts = signature.split(',');
    let timestamp: number | null = null;
    let signatureValue: string | null = null;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = parseInt(value, 10);
      } else if (key === 'v1') {
        signatureValue = value;
      }
    }

    if (!timestamp || !signatureValue) {
      return { valid: false, error: 'Invalid signature format' };
    }

    // Check timestamp freshness (replay protection)
    const now = Date.now();
    if (now - timestamp > ttlSeconds * 1000) {
      return { valid: false, error: 'Webhook signature expired' };
    }

    // Verify signature
    const dataToSign = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureValue),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Custom webhook verification error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Generic webhook verification
 */
export function verifyWebhook(
  payload: Record<string, unknown>,
  headers: Headers,
  provider: 'midtrans' | 'xendit' | 'custom',
  config?: CustomWebhookConfig
): { valid: boolean; error?: string } {
  switch (provider) {
    case 'midtrans':
      const midtransResult = verifyMidtransWebhook(payload, headers);
      return { valid: midtransResult.valid, error: midtransResult.error };

    case 'xendit':
      const xenditResult = verifyXenditWebhook(payload, headers);
      return { valid: xenditResult.valid, error: xenditResult.error };

    case 'custom':
      if (!config) {
        return { valid: false, error: 'Custom webhook config required' };
      }
      const signature = headers.get(config.signatureHeader || 'x-webhook-signature');
      if (!signature) {
        return { valid: false, error: 'Missing signature' };
      }
      return verifySignedWebhookPayload(
        JSON.stringify(payload),
        signature,
        config.secret
      );

    default:
      return { valid: false, error: 'Unknown provider' };
  }
}

export default {
  // Midtrans
  verifyMidtransSignature,
  verifyMidtransWebhook,
  // Xendit
  verifyXenditWebhook,
  // Custom
  generateWebhookSignature,
  generateSignedWebhookPayload,
  verifySignedWebhookPayload,
  verifyWebhook,
};
