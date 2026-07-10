/**
 * Webhook Service with Retry Queue
 *
 * Handles webhook delivery with:
 * - Exponential backoff retry
 * - Dead letter queue for failed webhooks
 * - Concurrent delivery limits
 * - Event queuing for offline scenarios
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

export interface QueuedWebhook {
  id: string;
  webhookId: string;
  webhookUrl: string;
  webhookSecret: string;
  event: string;
  payload: WebhookPayload;
  attempts: number;
  nextRetryAt: number;
  lastError?: string;
  createdAt: number;
  status: 'pending' | 'processing' | 'failed' | 'delivered';
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

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 5,
  baseDelay: 1000,        // 1 second
  maxDelay: 86400000,     // 24 hours
  backoffMultiplier: 2,
  jitterPercent: 0.1,     // 10% jitter
};

// Concurrency limits
const MAX_CONCURRENT_DELIVERIES = 10;

// Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate HMAC-SHA256 signature
function generateSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

// Calculate next retry time with exponential backoff
function calculateNextRetry(attempts: number): number {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempts),
    RETRY_CONFIG.maxDelay
  );

  // Add jitter
  const jitter = delay * RETRY_CONFIG.jitterPercent * (Math.random() * 2 - 1);
  return Date.now() + delay + jitter;
}

// Retry queue storage (use Redis in production)
class RetryQueue {
  private queue: Map<string, QueuedWebhook> = new Map();
  private processing = false;
  private processingCount = 0;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPolling();
  }

  // Add webhook to queue
  enqueue(webhook: Omit<QueuedWebhook, 'id' | 'attempts' | 'nextRetryAt' | 'createdAt' | 'status'>): string {
    const id = generateId('whq');
    const queued: QueuedWebhook = {
      ...webhook,
      id,
      attempts: 0,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
      status: 'pending',
    };

    this.queue.set(id, queued);

    // Persist to database
    this.persistToDatabase(queued);

    // Try to process immediately
    this.process();

    return id;
  }

  // Get next pending webhook ready for delivery
  getNext(): QueuedWebhook | null {
    const now = Date.now();

    for (const [id, webhook] of this.queue) {
      if (
        (webhook.status === 'pending' || webhook.status === 'processing') &&
        webhook.nextRetryAt <= now &&
        webhook.attempts < RETRY_CONFIG.maxAttempts
      ) {
        webhook.status = 'processing';
        this.processingCount++;
        return webhook;
      }
    }

    return null;
  }

  // Mark webhook as delivered
  markDelivered(id: string): void {
    const webhook = this.queue.get(id);
    if (webhook) {
      webhook.status = 'delivered';
      this.processingCount--;
      this.queue.delete(id);
      this.removeFromDatabase(id);
    }
  }

  // Mark webhook for retry
  markRetry(id: string, error: string): void {
    const webhook = this.queue.get(id);
    if (webhook) {
      webhook.attempts++;
      webhook.lastError = error;

      if (webhook.attempts >= RETRY_CONFIG.maxAttempts) {
        webhook.status = 'failed';
        this.processingCount--;
        this.logFailedDelivery(webhook);
      } else {
        webhook.nextRetryAt = calculateNextRetry(webhook.attempts);
        webhook.status = 'pending';
        this.processingCount--;
        this.updateInDatabase(webhook);
      }
    }
  }

  // Get queue status
  getStatus() {
    const stats = {
      pending: 0,
      processing: 0,
      failed: 0,
      delivered: 0,
      total: this.queue.size,
      processingCount: this.processingCount,
    };

    for (const webhook of this.queue.values()) {
      stats[webhook.status]++;
    }

    return stats;
  }

  // Get failed webhooks (dead letter queue)
  getFailedWebhooks(limit = 100): QueuedWebhook[] {
    return Array.from(this.queue.values())
      .filter(w => w.status === 'failed')
      .slice(0, limit);
  }

  // Retry a failed webhook
  retry(id: string): boolean {
    const webhook = this.queue.get(id);
    if (webhook && webhook.status === 'failed') {
      webhook.status = 'pending';
      webhook.attempts = 0;
      webhook.nextRetryAt = Date.now();
      this.updateInDatabase(webhook);
      this.process();
      return true;
    }
    return false;
  }

  // Clear failed webhooks
  clearFailed(): number {
    let count = 0;
    for (const [id, webhook] of this.queue) {
      if (webhook.status === 'failed') {
        this.queue.delete(id);
        this.removeFromDatabase(id);
        count++;
      }
    }
    return count;
  }

  // Start polling for retries
  private startPolling() {
    this.pollInterval = setInterval(() => {
      this.process();
    }, 1000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Process queue
  private async process() {
    if (this.processing || this.processingCount >= MAX_CONCURRENT_DELIVERIES) {
      return;
    }

    this.processing = true;

    while (this.processingCount < MAX_CONCURRENT_DELIVERIES) {
      const webhook = this.getNext();
      if (!webhook) break;

      this.deliverWebhook(webhook);
    }

    this.processing = false;
  }

  // Deliver webhook
  private async deliverWebhook(webhook: QueuedWebhook) {
    const startTime = Date.now();
    const body = JSON.stringify(webhook.payload);

    try {
      const response = await fetch(webhook.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CuanPintar-Signature': generateSignature(body, webhook.webhookSecret),
          'X-CuanPintar-Event': webhook.event,
          'X-CuanPintar-Webhook-ID': webhook.webhookId,
          'X-CuanPintar-Delivery-ID': webhook.id,
          'X-CuanPintar-Timestamp': webhook.payload.timestamp,
          'X-CuanPintar-Attempt': String(webhook.attempts + 1),
        },
        body,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      const duration = Date.now() - startTime;
      const responseBody = await response.text();

      this.logDelivery(webhook, response.status, responseBody, duration, response.ok);

      if (response.ok) {
        this.markDelivered(webhook.id);
      } else {
        this.markRetry(webhook.id, `HTTP ${response.status}: ${responseBody.substring(0, 100)}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.markRetry(webhook.id, errorMessage);
    }
  }

  // Log delivery to database
  private async logDelivery(
    webhook: QueuedWebhook,
    statusCode: number,
    responseBody: string,
    duration: number,
    success: boolean
  ) {
    if (!isSupabaseConfigured()) {
      console.log('[Webhook]', success ? '✓' : '✗', webhook.event, statusCode, `${duration}ms`, `Attempt ${webhook.attempts + 1}/${RETRY_CONFIG.maxAttempts}`);
      return;
    }

    try {
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.webhookId,
        delivery_id: webhook.id,
        event: webhook.event,
        payload: webhook.payload,
        response_status: statusCode,
        response_body: responseBody.substring(0, 1000),
        response_time: duration,
        attempt: webhook.attempts + 1,
        success,
      });
    } catch (error) {
      console.error('Failed to log webhook delivery:', error);
    }
  }

  // Log failed delivery
  private async logFailedDelivery(webhook: QueuedWebhook) {
    if (!isSupabaseConfigured()) {
      console.error('[Webhook FAILED]', webhook.event, webhook.lastError);
      return;
    }

    try {
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.webhookId,
        delivery_id: webhook.id,
        event: webhook.event,
        payload: webhook.payload,
        response_status: 0,
        response_body: webhook.lastError,
        response_time: 0,
        attempt: webhook.attempts,
        success: false,
        failed: true,
      });
    } catch (error) {
      console.error('Failed to log failed webhook:', error);
    }
  }

  // Persist to database
  private async persistToDatabase(webhook: QueuedWebhook) {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('webhook_queue').insert({
        id: webhook.id,
        webhook_id: webhook.webhookId,
        webhook_url: webhook.webhookUrl,
        webhook_secret: webhook.webhookSecret,
        event: webhook.event,
        payload: webhook.payload,
        attempts: webhook.attempts,
        next_retry_at: new Date(webhook.nextRetryAt).toISOString(),
        last_error: webhook.lastError,
        created_at: new Date(webhook.createdAt).toISOString(),
        status: webhook.status,
      });
    } catch (error) {
      console.error('Failed to persist webhook to database:', error);
    }
  }

  // Update in database
  private async updateInDatabase(webhook: QueuedWebhook) {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('webhook_queue')
        .update({
          attempts: webhook.attempts,
          next_retry_at: new Date(webhook.nextRetryAt).toISOString(),
          last_error: webhook.lastError,
          status: webhook.status,
        })
        .eq('id', webhook.id);
    } catch (error) {
      console.error('Failed to update webhook in database:', error);
    }
  }

  // Remove from database
  private async removeFromDatabase(id: string) {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('webhook_queue').delete().eq('id', id);
    } catch (error) {
      console.error('Failed to remove webhook from database:', error);
    }
  }
}

// Singleton instance
export const retryQueue = new RetryQueue();

// Deliver a single webhook
export async function deliverWebhook(
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

    return {
      success: response.ok,
      statusCode: response.status,
      response: responseBody.substring(0, 500),
      duration,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

// Trigger webhooks for an event
export async function triggerWebhooks(
  event: string,
  data: unknown,
  options?: {
    useRetryQueue?: boolean;
    immediate?: boolean;
  }
): Promise<void> {
  const useRetryQueue = options?.useRetryQueue ?? true;
  const immediate = options?.immediate ?? false;

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
  for (const webhook of webhooks) {
    if (useRetryQueue && !immediate) {
      // Add to retry queue
      retryQueue.enqueue({
        webhookId: webhook.id,
        webhookUrl: webhook.url,
        webhookSecret: webhook.secret,
        event,
        payload,
      });
    } else {
      // Immediate delivery
      await deliverWebhook(webhook.url, payload, webhook.secret, webhook.id, event);
    }
  }
}

// Webhook service class for more control
export class WebhookService {
  private queue: Array<{ event: string; data: unknown; timestamp: Date }> = [];
  private processing = false;

  // Add event to queue
  async enqueue(event: string, data: unknown) {
    this.queue.push({
      event,
      data,
      timestamp: new Date(),
    });

    // Trigger via retry queue
    await triggerWebhooks(event, data);
  }

  // Clear queue
  clear() {
    this.queue = [];
  }

  // Get queue status
  getStatus() {
    return {
      localQueueLength: this.queue.length,
      retryQueue: retryQueue.getStatus(),
    };
  }

  // Get failed webhooks
  getFailedWebhooks(limit?: number) {
    return retryQueue.getFailedWebhooks(limit);
  }

  // Retry failed webhook
  retryFailed(id: string) {
    return retryQueue.retry(id);
  }

  // Clear failed webhooks
  clearFailed() {
    return retryQueue.clearFailed();
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
    : conversion.status === 'rejected'
    ? WEBHOOK_EVENTS.CONVERSION_REJECTED
    : WEBHOOK_EVENTS.CONVERSION_FRAUD;
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
