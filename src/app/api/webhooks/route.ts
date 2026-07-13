/**
 * Webhook API Routes - Production Ready
 *
 * Handles incoming webhooks from payment providers (Midtrans, Xendit)
 * and manages outgoing webhooks for platform events
 *
 * Endpoints:
 * GET    /api/webhooks            - List webhooks
 * POST   /api/webhooks            - Receive webhook (from providers)
 * POST   /api/webhooks/deliver    - Trigger webhook (outgoing)
 * DELETE /api/webhooks            - Delete webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  verifyMidtransWebhook,
  verifyXenditWebhook,
  verifySignedWebhookPayload,
  generateWebhookSignature,
} from '@/lib/services/webhook-verification';

// In-memory storage for webhooks
const webhookStore = new Map<string, Webhook>();
const webhookLogs = new Map<string, WebhookLog>();

interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered?: string;
  last_success?: string;
  last_failure?: string;
  success_rate: number;
  total_deliveries: number;
  failed_deliveries: number;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_status?: number;
  response_body?: string;
  success: boolean;
  error?: string;
  delivered_at: string;
}

// Available events
export const WEBHOOK_EVENTS = [
  { id: 'conversion.created', name: 'Conversion Created', description: 'When a new conversion is recorded' },
  { id: 'conversion.validated', name: 'Conversion Validated', description: 'When a conversion is approved or rejected' },
  { id: 'conversion.fraud', name: 'Fraud Detected', description: 'When a conversion is flagged as fraud' },
  { id: 'payout.created', name: 'Payout Created', description: 'When a new payout request is submitted' },
  { id: 'payout.processed', name: 'Payout Processed', description: 'When a payout is completed' },
  { id: 'payout.failed', name: 'Payout Failed', description: 'When a payout fails' },
  { id: 'partner.registered', name: 'Partner Registered', description: 'When a new partner signs up' },
  { id: 'partner.approved', name: 'Partner Approved', description: 'When a partner is approved' },
  { id: 'program.created', name: 'Program Created', description: 'When a new program is created' },
  { id: 'program.activated', name: 'Program Activated', description: 'When a program goes live' },
  { id: 'payment.success', name: 'Payment Success', description: 'Payment completed successfully' },
  { id: 'payment.failed', name: 'Payment Failed', description: 'Payment failed' },
];

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// ============================================
// INCOMING WEBHOOKS (from payment providers)
// ============================================

interface IncomingWebhookResult {
  success: boolean;
  webhookId?: string;
  error?: string;
  provider?: string;
  event?: string;
}

async function processIncomingWebhook(
  provider: string,
  payload: Record<string, unknown>,
  headers: Headers
): Promise<IncomingWebhookResult> {
  const webhookId = generateId('iw');

  // Verify signature based on provider
  let isValid = false;
  let verificationError: string | undefined;

  switch (provider) {
    case 'midtrans':
      const midtransResult = verifyMidtransWebhook(payload, headers);
      isValid = midtransResult.valid;
      verificationError = midtransResult.error;
      break;

    case 'xendit':
      const xenditResult = verifyXenditWebhook(payload, headers);
      isValid = xenditResult.valid;
      verificationError = xenditResult.error;
      break;

    case 'custom':
      const signature = headers.get('x-webhook-signature');
      if (signature) {
        const secret = process.env.WEBHOOK_SECRET || 'demo-webhook-secret';
        const result = verifySignedWebhookPayload(JSON.stringify(payload), signature, secret);
        isValid = result.valid;
        verificationError = result.error;
      } else {
        // Allow in development
        isValid = process.env.NODE_ENV !== 'production';
      }
      break;

    default:
      verificationError = 'Unknown webhook provider';
  }

  // Log the incoming webhook
  const log: WebhookLog = {
    id: webhookId,
    webhook_id: 'incoming',
    event: provider,
    payload,
    success: isValid,
    error: verificationError,
    delivered_at: new Date().toISOString(),
  };

  webhookLogs.set(webhookId, log);

  // Store to database if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('webhook_logs').insert({
        id: webhookId,
        provider,
        payload,
        is_valid: isValid,
        error: verificationError,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to store webhook log:', err);
    }
  }

  if (!isValid) {
    return {
      success: false,
      webhookId,
      error: verificationError || 'Invalid webhook signature',
      provider,
    };
  }

  // Process based on provider
  try {
    switch (provider) {
      case 'midtrans':
        await processMidtransWebhook(payload);
        break;
      case 'xendit':
        await processXenditWebhook(payload);
        break;
      default:
        console.log(`Processing custom webhook:`, payload);
    }
  } catch (error) {
    console.error(`Error processing ${provider} webhook:`, error);
    return {
      success: false,
      webhookId,
      error: 'Processing failed',
      provider,
    };
  }

  return {
    success: true,
    webhookId,
    provider,
    event: (payload.transaction_status || payload.status || 'unknown') as string,
  };
}

async function processMidtransWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  const orderId = payload.order_id as string;
  const status = payload.transaction_status as string;

  console.log(`Processing Midtrans webhook: ${orderId}, status: ${status}`);

  if (!isSupabaseConfigured()) return;

  // Find related record (payout, payment, etc.)
  const { data: records } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('external_id', orderId)
    .limit(1);

  if (records && records.length > 0) {
    const record = records[0];
    let newStatus: string;

    switch (status) {
      case 'settlement':
        newStatus = 'paid';
        break;
      case 'pending':
        newStatus = 'processing';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        newStatus = 'failed';
        break;
      default:
        newStatus = record.status;
    }

    await supabase
      .from('payout_requests')
      .update({
        status: newStatus,
        paid_at: status === 'settlement' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);
  }
}

async function processXenditWebhook(
  payload: Record<string, unknown>
): Promise<void> {
  const externalId = payload.external_id as string;
  const status = payload.status as string;

  console.log(`Processing Xendit webhook: ${externalId}, status: ${status}`);

  if (!isSupabaseConfigured()) return;

  const { data: records } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('external_id', externalId)
    .limit(1);

  if (records && records.length > 0) {
    const record = records[0];
    let newStatus: string;

    switch (status) {
      case 'PAID':
        newStatus = 'paid';
        break;
      case 'PENDING':
        newStatus = 'processing';
        break;
      case 'FAILED':
      case 'EXPIRED':
        newStatus = 'failed';
        break;
      default:
        newStatus = record.status;
    }

    await supabase
      .from('payout_requests')
      .update({
        status: newStatus,
        paid_at: status === 'PAID' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id);
  }
}

// ============================================
// OUTGOING WEBHOOKS (platform events)
// ============================================

async function deliverWebhook(
  webhook: Webhook,
  event: string,
  data: unknown
): Promise<WebhookLog> {
  const logId = generateId('wl');
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const signature = generateWebhookSignature(payload, webhook.secret);

  const log: WebhookLog = {
    id: logId,
    webhook_id: webhook.id,
    event,
    payload: payload as Record<string, unknown>,
    success: false,
    delivered_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CuanPintar-Signature': signature,
        'X-CuanPintar-Event': event,
        'X-CuanPintar-Webhook-ID': webhook.id,
        'User-Agent': 'CuanPintar-Webhook/1.0',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    log.response_status = response.status;
    log.response_body = await response.text().catch(() => undefined);
    log.success = response.ok;

    // Update webhook stats
    webhook.total_deliveries++;
    if (response.ok) {
      webhook.last_success = new Date().toISOString();
    } else {
      webhook.failed_deliveries++;
      webhook.last_failure = new Date().toISOString();
    }
    webhook.last_triggered = new Date().toISOString();
  } catch (error) {
    log.success = false;
    log.error = error instanceof Error ? error.message : 'Delivery failed';
    webhook.total_deliveries++;
    webhook.failed_deliveries++;
    webhook.last_failure = new Date().toISOString();
    webhook.last_triggered = new Date().toISOString();
  }

  webhook.success_rate = webhook.total_deliveries > 0
    ? ((webhook.total_deliveries - webhook.failed_deliveries) / webhook.total_deliveries) * 100
    : 100;

  webhookStore.set(webhook.id, webhook);
  webhookLogs.set(logId, log);

  return log;
}

// ============================================
// API ROUTES
// ============================================

// POST /api/webhooks - Receive incoming webhook OR create outgoing webhook
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Check if this is an incoming webhook (from payment provider)
  const xMidtransSig = request.headers.get('x-midtrans-signature');
  const xCallbackToken = request.headers.get('x-callback-token');

  if (xMidtransSig || xCallbackToken || action === 'receive') {
    // This is an incoming webhook from a payment provider
    const provider = xMidtransSig ? 'midtrans' : 'xendit';

    try {
      const body = await request.json();
      const result = await processIncomingWebhook(provider, body, request.headers);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          webhookId: result.webhookId,
          error: result.error,
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        webhookId: result.webhookId,
        message: 'Webhook processed',
      });
    } catch (error) {
      console.error('Incoming webhook error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to process webhook',
      }, { status: 500 });
    }
  }

  // Create outgoing webhook
  try {
    const body = await request.json();
    const { name, url, events } = body;

    if (!name || !url || !events?.length) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, url, events',
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook URL',
      }, { status: 400 });
    }

    const webhook: Webhook = {
      id: generateId('wh'),
      user_id: body.user_id || 'system',
      name,
      url,
      secret: body.secret || generateSecret(),
      events,
      active: true,
      created_at: new Date().toISOString(),
      success_rate: 100,
      total_deliveries: 0,
      failed_deliveries: 0,
    };

    webhookStore.set(webhook.id, webhook);

    return NextResponse.json({
      success: true,
      data: webhook,
      message: 'Webhook created',
    }, { status: 201 });
  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create webhook',
    }, { status: 500 });
  }
}

// GET /api/webhooks - List webhooks or get logs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get('id');
  const logId = searchParams.get('log_id');
  const type = searchParams.get('type'); // 'outgoing' or 'incoming'

  // Get specific webhook
  if (webhookId) {
    const webhook = webhookStore.get(webhookId);
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }
    return NextResponse.json({ data: webhook });
  }

  // Get specific log
  if (logId) {
    const log = webhookLogs.get(logId);
    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }
    return NextResponse.json({ data: log });
  }

  // List webhooks or logs
  if (type === 'incoming') {
    const logs = Array.from(webhookLogs.values())
      .filter(l => l.webhook_id === 'incoming')
      .sort((a, b) => new Date(b.delivered_at).getTime() - new Date(a.delivered_at).getTime())
      .slice(0, 100);

    return NextResponse.json({
      data: logs,
      count: logs.length,
      available_events: WEBHOOK_EVENTS,
    });
  }

  const webhooks = Array.from(webhookStore.values());
  return NextResponse.json({
    data: webhooks,
    count: webhooks.length,
    available_events: WEBHOOK_EVENTS,
  });
}

// DELETE /api/webhooks - Delete webhook
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get('id');

  if (!webhookId) {
    return NextResponse.json({
      success: false,
      error: 'Webhook ID required',
    }, { status: 400 });
  }

  const deleted = webhookStore.delete(webhookId);

  return NextResponse.json({
    success: deleted,
    message: deleted ? 'Webhook deleted' : 'Webhook not found',
  });
}

// Export for triggering webhooks from other parts of the app
export async function triggerWebhook(event: string, data: unknown): Promise<void> {
  const relevantWebhooks = Array.from(webhookStore.values())
    .filter(w => w.active && w.events.includes(event));

  await Promise.allSettled(
    relevantWebhooks.map(webhook => deliverWebhook(webhook, event, data))
  );
}
