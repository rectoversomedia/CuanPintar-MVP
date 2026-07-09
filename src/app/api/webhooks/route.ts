/**
 * Webhook API Routes
 *
 * Endpoints:
 * GET    /api/webhooks            - List webhooks
 * POST   /api/webhooks            - Create webhook
 * PUT    /api/webhooks/:id       - Update webhook
 * DELETE /api/webhooks/:id       - Delete webhook
 * POST   /api/webhooks/test      - Test webhook
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory storage
const webhooks = new Map<string, Webhook>();

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered?: string;
  success_rate: number;
  total_deliveries: number;
  failed_deliveries: number;
}

// Available events
export const WEBHOOK_EVENTS = [
  { id: 'conversion.created', name: 'Conversion Created', description: 'When a new conversion is recorded' },
  { id: 'conversion.validated', name: 'Conversion Validated', description: 'When a conversion is approved or rejected' },
  { id: 'conversion.fraud', name: 'Fraud Detected', description: 'When a conversion is flagged as fraud' },
  { id: 'payout.created', name: 'Payout Created', description: 'When a new payout request is submitted' },
  { id: 'payout.processed', name: 'Payout Processed', description: 'When a payout is completed' },
  { id: 'partner.registered', name: 'Partner Registered', description: 'When a new partner signs up' },
  { id: 'partner.approved', name: 'Partner Approved', description: 'When a partner is approved' },
  { id: 'program.created', name: 'Program Created', description: 'When a new program is created' },
  { id: 'program.activated', name: 'Program Activated', description: 'When a program goes live' },
];

function generateId(): string {
  return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// GET /api/webhooks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const active = searchParams.get('active');

  let result = Array.from(webhooks.values());

  if (active === 'true') {
    result = result.filter(w => w.active);
  }

  return NextResponse.json({
    success: true,
    data: result,
    available_events: WEBHOOK_EVENTS,
  });
}

// POST /api/webhooks - Create webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate URL
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook URL',
      }, { status: 400 });
    }

    const webhook: Webhook = {
      id: generateId(),
      name: body.name,
      url: body.url,
      secret: body.secret || generateSecret(),
      events: body.events || [],
      active: true,
      created_at: new Date().toISOString(),
      success_rate: 100,
      total_deliveries: 0,
      failed_deliveries: 0,
    };

    webhooks.set(webhook.id, webhook);

    return NextResponse.json({
      success: true,
      data: webhook,
      message: 'Webhook created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Create webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create webhook',
    }, { status: 400 });
  }
}

// DELETE /api/webhooks
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get('id');

  if (!webhookId) {
    return NextResponse.json({
      success: false,
      error: 'Webhook ID required',
    }, { status: 400 });
  }

  const deleted = webhooks.delete(webhookId);

  return NextResponse.json({
    success: deleted,
    message: deleted ? 'Webhook deleted' : 'Webhook not found',
  });
}

// POST /api/webhooks/test - Test webhook delivery
export async function testWebhook(webhookId: string): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const webhook = webhooks.get(webhookId);
  if (!webhook) {
    return { success: false, error: 'Webhook not found' };
  }

  const payload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook from CuanPintar',
    },
  };

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CuanPintar-Signature': generateSignature(payload, webhook.secret),
        'X-CuanPintar-Event': 'test',
        'X-CuanPintar-Webhook-ID': webhook.id,
      },
      body: JSON.stringify(payload),
    });

    const success = response.ok;

    // Update stats
    webhook.total_deliveries++;
    if (!success) webhook.failed_deliveries++;
    webhook.success_rate = ((webhook.total_deliveries - webhook.failed_deliveries) / webhook.total_deliveries) * 100;
    webhooks.set(webhookId, webhook);

    return {
      success,
      response: await response.text(),
    };
  } catch (error) {
    webhook.total_deliveries++;
    webhook.failed_deliveries++;
    webhook.success_rate = ((webhook.total_deliveries - webhook.failed_deliveries) / webhook.total_deliveries) * 100;
    webhooks.set(webhookId, webhook);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deliver webhook',
    };
  }
}

// Generate HMAC signature for webhook
function generateSignature(payload: unknown, secret: string): string {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}

// Utility function to trigger webhooks (call this from other parts of the app)
export async function triggerWebhooks(event: string, data: unknown): Promise<void> {
  const relevantWebhooks = Array.from(webhooks.values())
    .filter(w => w.active && w.events.includes(event));

  for (const webhook of relevantWebhooks) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CuanPintar-Signature': generateSignature(payload, webhook.secret),
          'X-CuanPintar-Event': event,
          'X-CuanPintar-Webhook-ID': webhook.id,
        },
        body: JSON.stringify(payload),
      });

      webhook.total_deliveries++;
      webhook.last_triggered = new Date().toISOString();
    } catch {
      webhook.total_deliveries++;
      webhook.failed_deliveries++;
    }

    webhook.success_rate = ((webhook.total_deliveries - webhook.failed_deliveries) / webhook.total_deliveries) * 100;
    webhooks.set(webhook.id, webhook);
  }
}
