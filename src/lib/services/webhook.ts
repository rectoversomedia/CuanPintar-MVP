/**
 * Webhook Service
 *
 * Handles webhook delivery with retries, queuing, and logging
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface WebhookEvent {
  id: string;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: unknown;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  duration?: number;
}

// Available webhook events
export const WEBHOOK_EVENTS = {
  // Conversion events
  CONVERSION_CREATED: 'conversion.created',
  CONVERSION_VALIDATED: 'conversion.validated',
  CONVERSION_REJECTED: 'conversion.rejected',
  CONVERSION_FRAUD: 'conversion.fraud',

  // Payout events
  PAYOUT_CREATED: 'payout.created',
  PAYOUT_APPROVED: 'payout.approved',
  PAYOUT_PROCESSING: 'payout.processing',
  PAYOUT_PAID: 'payout.paid',
  PAYOUT_FAILED: 'payout.failed',
  PAYOUT_REJECTED: 'payout.rejected',

  // Partner events
  PARTNER_REGISTERED: 'partner.registered',
  PARTNER_APPROVED: 'partner.approved',
  PARTNER_SUSPENDED: 'partner.suspended',

  // Program events
  PROGRAM_CREATED: 'program.created',
  PROGRAM_ACTIVATED: 'program.activated',
  PROGRAM_PAUSED: 'program.paused',
  PROGRAM_COMPLETED: 'program.completed',
  PROGRAM_REJECTED: 'program.rejected',

  // Auth events
  USER_SIGNED_UP: 'user.signed_up',
  USER_LOGGED_IN: 'user.logged_in',
} as const;

// Generate HMAC-SHA256 signature
function generateSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Deliver a single webhook
async function deliverWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string,
  webhookId: string,
  event: string
): Promise<WebhookDeliveryResult> {
  const startTime = Date.now();
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CuanPintar-Signature': generateSignature(body, secret),
        'X-CuanPintar-Event': event,
        'X-CuanPintar-Webhook-ID': webhookId,
        'X-CuanPintar-Timestamp': payload.timestamp,
      },
      body,
    });

    const duration = Date.now() - startTime;
    const responseBody = await response.text();

    // Log delivery
    await logDelivery(webhookId, event, payload, response.status, responseBody, duration, true);

    return {
      success: response.ok,
      statusCode: response.status,
      response: responseBody.substring(0, 500), // Limit response size
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failed delivery
    await logDelivery(webhookId, event, payload, 0, errorMessage, duration, false);

    return {
      success: false,
      error: errorMessage,
      duration,
    };
  }
}

// Log webhook delivery
async function logDelivery(
  webhookId: string,
  event: string,
  payload: WebhookPayload,
  statusCode: number,
  responseBody: string,
  duration: number,
  success: boolean
) {
  if (!isSupabaseConfigured()) {
    console.log('[Webhook]', success ? '✓' : '✗', event, statusCode, `${duration}ms`);
    return;
  }

  try {
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhookId,
      event,
      payload,
      response_status: statusCode,
      response_body: responseBody.substring(0, 1000),
      response_time: duration,
      success,
    });

    // Update webhook stats
    await supabase.rpc('increment_webhook_delivery', {
      p_webhook_id: webhookId,
      p_success: success,
    });
  } catch (error) {
    console.error('Failed to log webhook delivery:', error);
  }
}

// Trigger webhooks for an event
export async function triggerWebhooks(
  event: string,
  data: unknown,
  options?: {
    skipQueue?: boolean;
    immediate?: boolean;
  }
): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.log('[Webhook Trigger]', event, data);
    return;
  }

  // Get active webhooks subscribed to this event
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('active', true)
    .contains('events', [event]);

  if (error || !webhooks) {
    console.error('Failed to fetch webhooks:', error);
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // Deliver to all subscribed webhooks
  const promises = webhooks.map(webhook =>
    deliverWebhook(webhook.url, payload, webhook.secret, webhook.id, event)
  );

  await Promise.allSettled(promises);
}

// Webhook service class for more control
export class WebhookService {
  private queue: Array<{ event: string; data: unknown; timestamp: Date }> = [];
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  // Add event to queue
  async enqueue(event: string, data: unknown) {
    this.queue.push({
      event,
      data,
      timestamp: new Date(),
    });

    // Trigger immediately if not already processing
    if (!this.processing) {
      this.process();
    }
  }

  // Process queue
  private async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await triggerWebhooks(item.event, item.data);
        this.queue.shift();
      } catch (error) {
        console.error('Webhook delivery failed:', error);
        // Retry logic
        const retryCount = (item as { retries?: number }).retries || 0;
        if (retryCount < this.maxRetries) {
          (item as { retries?: number }).retries = retryCount + 1;
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          console.error('Max retries reached, dropping webhook:', item);
          this.queue.shift();
        }
      }
    }

    this.processing = false;
  }

  // Clear queue
  clear() {
    this.queue = [];
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
    };
  }
}

// Singleton instance
export const webhookService = new WebhookService();

// Helper functions for common events
export async function notifyConversionCreated(conversion: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.CONVERSION_CREATED, conversion);
}

export async function notifyConversionValidated(conversion: Record<string, unknown>) {
  const event = conversion.status === 'valid'
    ? WEBHOOK_EVENTS.CONVERSION_VALIDATED
    : WEBHOOK_EVENTS.CONVERSION_REJECTED;
  await triggerWebhooks(event, conversion);
}

export async function notifyPayoutCreated(payout: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.PAYOUT_CREATED, payout);
}

export async function notifyPayoutPaid(payout: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.PAYOUT_PAID, payout);
}

export async function notifyPartnerRegistered(partner: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.PARTNER_REGISTERED, partner);
}

export async function notifyPartnerApproved(partner: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.PARTNER_APPROVED, partner);
}

export async function notifyProgramActivated(program: Record<string, unknown>) {
  await triggerWebhooks(WEBHOOK_EVENTS.PROGRAM_ACTIVATED, program);
}
