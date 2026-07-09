/**
 * Email Service
 *
 * Handles email sending with templates
 * Uses Resend for transactional emails (recommended)
 * Falls back to console logging in demo mode
 */

import { isSupabaseConfigured } from '@/lib/supabase';

// Email types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email templates
export const EMAIL_TEMPLATES = {
  // Welcome emails
  WELCOME_ADVERTISER: 'welcome_advertiser',
  WELCOME_PARTNER: 'welcome_partner',

  // Conversion emails
  CONVERSION_VALIDATED: 'conversion_validated',
  CONVERSION_REJECTED: 'conversion_rejected',

  // Payout emails
  PAYOUT_REQUESTED: 'payout_requested',
  PAYOUT_APPROVED: 'payout_approved',
  PAYOUT_PAID: 'payout_paid',
  PAYOUT_FAILED: 'payout_failed',

  // Program emails
  PROGRAM_APPROVED: 'program_approved',
  PROGRAM_REJECTED: 'program_rejected',
  PROGRAM_PAUSED: 'program_paused',

  // Partner emails
  PARTNER_APPROVED: 'partner_approved',
  PARTNER_REJECTED: 'partner_rejected',

  // Auth emails
  VERIFY_EMAIL: 'verify_email',
  RESET_PASSWORD: 'reset_password',
  WELCOME: 'welcome',
} as const;

// Base email template
const BASE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0066FF;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      margin-bottom: 16px;
    }
    .content {
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background-color: #0066FF;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #0052cc;
    }
    .highlight {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin: 16px 0;
    }
    .stat {
      text-align: center;
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #0066FF;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    .social {
      margin: 16px 0;
    }
    .social a {
      margin: 0 8px;
      color: #0066FF;
    }
    @media (max-width: 480px) {
      body {
        padding: 10px;
      }
      .email-container {
        padding: 16px;
      }
      .stats {
        flex-direction: column;
      }
      .stat {
        margin-bottom: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <span class="logo">CuanPintar</span>
    </div>
    {{content}}
    <div class="footer">
      <p>&copy; {{year}} CuanPintar by Recto Vero Media. All rights reserved.</p>
      <p>Jl. Sudirman No. 123, Jakarta 10220, Indonesia</p>
      <div class="social">
        <a href="#">Website</a> |
        <a href="#">Help Center</a> |
        <a href="#">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email template builder
function buildTemplate(template: string, data: Record<string, unknown>): EmailTemplate {
  const year = new Date().getFullYear();
  const content = template
    .replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] || ''));

  const text = template
    .replace(/<[^>]+>/g, '')
    .replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] || ''));

  return {
    subject: String(data.subject || 'CuanPintar Notification'),
    html: BASE_TEMPLATE
      .replace('{{subject}}', String(data.subject || 'CuanPintar Notification'))
      .replace('{{content}}', content)
      .replace('{{year}}', String(year)),
    text,
  };
}

// Send email (demo mode: console log)
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, html } = options;

  // Demo mode
  if (!isSupabaseConfigured() || !process.env.RESEND_API_KEY) {
    console.log('\n📧 Email would be sent:');
    console.log('  To:', Array.isArray(to) ? to.join(', ') : to);
    console.log('  Subject:', subject);
    console.log('  ---');
    console.log(html.substring(0, 200) + '...');
    console.log('---\n');

    return {
      success: true,
      messageId: 'demo_' + Date.now(),
    };
  }

  // Production mode with Resend
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'CuanPintar <noreply@cuanpintar.com>',
      to: Array.isArray(to) ? to : [to],
      replyTo: options.replyTo,
      subject,
      html,
      text: options.text,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Send email from template
export async function sendTemplatedEmail(
  templateType: keyof typeof EMAIL_TEMPLATES,
  to: string | string[],
  data: Record<string, unknown>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getTemplate(templateType, data);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// Get template content
function getTemplate(type: keyof typeof EMAIL_TEMPLATES, data: Record<string, unknown>): EmailTemplate {
  const templates: Record<string, string> = {
    [EMAIL_TEMPLATES.WELCOME]: `
      <h1>Welcome to CuanPintar! 🎉</h1>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>Thank you for joining CuanPintar, Indonesia's leading Customer Acquisition Operating System.</p>
        <p>With CuanPintar, you can:</p>
        <ul>
          <li>Access 100+ verified media partners</li>
          <li>Track conversions in real-time</li>
          <li>Get paid quickly with transparent payouts</li>
          <li>Protect your campaigns with AI-powered fraud detection</li>
        </ul>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.WELCOME_ADVERTISER]: `
      <h1>Welcome, {{companyName}}! 📈</h1>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>Your advertiser account is now active. Start creating acquisition programs and reach thousands of verified partners across Indonesia.</p>
        <div class="highlight">
          <strong>Quick Start:</strong>
          <ol>
            <li>Create your first program</li>
            <li>Set your budget and payout</li>
            <li>Approve partner applications</li>
            <li>Track conversions in real-time</li>
          </ol>
        </div>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}/advertiser/programs/new" class="button">Create First Program</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.WELCOME_PARTNER]: `
      <h1>Welcome, {{partnerName}}! 🤝</h1>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>Your partner account is now active. Browse available programs and start earning commissions!</p>
        <div class="highlight">
          <strong>Your Partner Dashboard:</strong>
          <ul>
            <li>📊 Track your earnings</li>
            <li>🎯 Join programs that match your audience</li>
            <li>💰 Request payouts easily</li>
            <li>📈 View performance analytics</li>
          </ul>
        </div>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}/partner/programs" class="button">Browse Programs</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.CONVERSION_VALIDATED]: `
      <h1>Conversion Approved! ✅</h1>
      <div class="content">
        <p>Great news! A conversion has been validated and approved.</p>
        <div class="highlight">
          <p><strong>Program:</strong> {{programName}}</p>
          <p><strong>Partner:</strong> {{partnerName}}</p>
          <p><strong>Payout:</strong> Rp {{payoutAmount}}</p>
          <p><strong>Status:</strong> Validated</p>
        </div>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{{totalEarnings}}</div>
            <div class="stat-label">Total Earnings</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{validConversions}}</div>
            <div class="stat-label">Valid Conversions</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{pendingPayout}}</div>
            <div class="stat-label">Pending Payout</div>
          </div>
        </div>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}/partner/earnings" class="button">View Earnings</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.PAYOUT_PAID]: `
      <h1>Payout Complete! 💸</h1>
      <div class="content">
        <p>Your payout has been processed successfully.</p>
        <div class="highlight">
          <p><strong>Amount:</strong> Rp {{amount}}</p>
          <p><strong>Method:</strong> {{paymentMethod}}</p>
          <p><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p><strong>Processed At:</strong> {{processedAt}}</p>
        </div>
        <p>The funds should arrive in your account within 1-2 business days depending on your bank.</p>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}/partner/payouts" class="button">View Payout History</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.PROGRAM_APPROVED]: `
      <h1>Program Activated! 🚀</h1>
      <div class="content">
        <p>Good news! Your program has been approved and is now live.</p>
        <div class="highlight">
          <p><strong>Program:</strong> {{programName}}</p>
          <p><strong>Budget:</strong> Rp {{budget}}</p>
          <p><strong>Payout:</strong> Rp {{payoutAmount}} per conversion</p>
          <p><strong>Target Volume:</strong> {{targetVolume}} conversions</p>
        </div>
        <p>Partners can now start promoting your program. Track conversions in real-time from your dashboard.</p>
        <p style="text-align: center;">
          <a href="{{dashboardUrl}}/advertiser/programs/{{programId}}" class="button">View Program</a>
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.VERIFY_EMAIL]: `
      <h1>Verify Your Email 📧</h1>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>Please verify your email address to activate your CuanPintar account.</p>
        <p style="text-align: center;">
          <a href="{{verificationUrl}}" class="button">Verify Email</a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          This link will expire in 24 hours. If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,

    [EMAIL_TEMPLATES.RESET_PASSWORD]: `
      <h1>Reset Your Password 🔐</h1>
      <div class="content">
        <p>Hi {{name}},</p>
        <p>You requested a password reset for your CuanPintar account.</p>
        <p style="text-align: center;">
          <a href="{{resetUrl}}" class="button">Reset Password</a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          This link will expire in 1 hour. If you didn't request a reset, please ignore this email or contact support.
        </p>
      </div>
    `,
  };

  return buildTemplate(templates[type] || '<p>{{message}}</p>', data);
}

// Email service class for more control
export class EmailService {
  private queue: Array<{ options: EmailOptions; retries: number }> = [];
  private processing = false;
  private maxRetries = 3;

  async send(options: EmailOptions): Promise<void> {
    this.queue.push({ options, retries: 0 });
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      const result = await sendEmail(item.options);

      if (result.success) {
        this.queue.shift();
      } else {
        item.retries++;
        if (item.retries >= this.maxRetries) {
          console.error('Failed to send email after retries:', item.options.to);
          this.queue.shift();
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    this.processing = false;
  }

  getQueueLength() {
    return this.queue.length;
  }
}

// Singleton instance
export const emailService = new EmailService();

// Helper functions
export async function sendWelcomeEmail(to: string, name: string, role: 'advertiser' | 'partner', data: Record<string, unknown>) {
  const templateType = role === 'advertiser'
    ? EMAIL_TEMPLATES.WELCOME_ADVERTISER
    : EMAIL_TEMPLATES.WELCOME_PARTNER;

  return sendTemplatedEmail(templateType, to, {
    name,
    ...data,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });
}

export async function sendConversionNotification(
  to: string,
  conversion: { programName: string; partnerName: string; payoutAmount: number },
  partnerStats: { totalEarnings: number; validConversions: number; pendingPayout: number }
) {
  return sendTemplatedEmail(EMAIL_TEMPLATES.CONVERSION_VALIDATED, to, {
    ...conversion,
    ...partnerStats,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });
}

export async function sendPayoutNotification(
  to: string,
  payout: { amount: number; paymentMethod: string; transactionId: string }
) {
  return sendTemplatedEmail(EMAIL_TEMPLATES.PAYOUT_PAID, to, {
    ...payout,
    processedAt: new Date().toLocaleString('id-ID'),
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });
}
