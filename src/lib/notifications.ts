/**
 * Email & Notification Templates
 *
 * This module defines email and notification templates
 * for the CuanPintar platform.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  icon: string;
}

// Notification types
export const NOTIFICATION_TYPES = {
  // Conversion notifications
  CONVERSION_PENDING: {
    id: 'conversion.pending',
    title: 'Conversion Pending Review',
    description: 'A new conversion is awaiting validation',
  },
  CONVERSION_APPROVED: {
    id: 'conversion.approved',
    title: 'Conversion Approved',
    description: 'Your conversion has been approved',
  },
  CONVERSION_REJECTED: {
    id: 'conversion.rejected',
    title: 'Conversion Rejected',
    description: 'Your conversion has been rejected',
  },
  CONVERSION_FRAUD: {
    id: 'conversion.fraud',
    title: 'Fraud Detected',
    description: 'A conversion was flagged as fraudulent',
  },

  // Payout notifications
  PAYOUT_PENDING: {
    id: 'payout.pending',
    title: 'Payout Requested',
    description: 'Your payout request is being processed',
  },
  PAYOUT_PROCESSING: {
    id: 'payout.processing',
    title: 'Payout Processing',
    description: 'Your payout is being transferred',
  },
  PAYOUT_COMPLETED: {
    id: 'payout.completed',
    title: 'Payout Completed',
    description: 'Your payout has been completed',
  },

  // Partner notifications
  PARTNER_APPROVED: {
    id: 'partner.approved',
    title: 'Partner Approved',
    description: 'Your partner application has been approved',
  },
  PARTNER_REJECTED: {
    id: 'partner.rejected',
    title: 'Partner Rejected',
    description: 'Your partner application was rejected',
  },

  // Program notifications
  PROGRAM_ACTIVE: {
    id: 'program.active',
    title: 'Program Live',
    description: 'Your program is now active',
  },
  PROGRAM_PAUSED: {
    id: 'program.paused',
    title: 'Program Paused',
    description: 'Your program has been paused',
  },
  PROGRAM_COMPLETED: {
    id: 'program.completed',
    title: 'Program Completed',
    description: 'Your program has ended',
  },
};

// Email templates
export const EMAIL_TEMPLATES = {
  // Partner emails
  welcomePartner: (data: { name: string; email: string }) => ({
    subject: 'Welcome to CuanPintar Partner Network!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066FF; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CuanPintar</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Welcome, ${data.name}!</h2>
          <p>Thank you for joining CuanPintar Partner Network. You're now part of Indonesia's largest customer acquisition platform.</p>
          <h3>What's Next?</h3>
          <ol>
            <li>Browse available programs in the <a href="https://cuanpintar.com/programs">Marketplace</a></li>
            <li>Join programs that match your audience</li>
            <li>Get your unique tracking link</li>
            <li>Start promoting and earning!</li>
          </ol>
          <a href="https://cuanpintar.com/partner" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
            Get Started
          </a>
        </div>
        <div style="padding: 20px; background: #f5f5f5; text-align: center; color: #666; font-size: 12px;">
          &copy; 2024 CuanPintar. All rights reserved.
        </div>
      </div>
    `,
    text: `
      Welcome to CuanPintar Partner Network!

      Thank you for joining, ${data.name}!

      What's Next?
      1. Browse available programs at https://cuanpintar.com/programs
      2. Join programs that match your audience
      3. Get your unique tracking link
      4. Start promoting and earning!

      Visit https://cuanpintar.com/partner to get started.
    `,
  }),

  payoutCompleted: (data: { partnerName: string; amount: number; paymentMethod: string; transactionId: string }) => ({
    subject: `Payout Completed - Rp ${data.amount.toLocaleString('id-ID')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payout Completed!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi ${data.partnerName},</p>
          <p>Great news! Your payout has been processed.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Amount:</strong> Rp ${data.amount.toLocaleString('id-ID')}</p>
            <p style="margin: 5px 0;"><strong>Method:</strong> ${data.paymentMethod}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
          </div>
          <p>The funds should arrive in your account within 1-2 business days.</p>
          <p>Thank you for your partnership!</p>
        </div>
        <div style="padding: 20px; background: #f5f5f5; text-align: center; color: #666; font-size: 12px;">
          &copy; 2024 CuanPintar. All rights reserved.
        </div>
      </div>
    `,
    text: `
      Payout Completed!

      Hi ${data.partnerName},

      Great news! Your payout has been processed.

      Amount: Rp ${data.amount.toLocaleString('id-ID')}
      Method: ${data.paymentMethod}
      Transaction ID: ${data.transactionId}

      The funds should arrive in your account within 1-2 business days.

      Thank you for your partnership!
    `,
  }),

  conversionApproved: (data: { partnerName: string; programName: string; conversionId: string; payout: number }) => ({
    subject: `Conversion Approved - ${data.programName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Conversion Approved!</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi ${data.partnerName},</p>
          <p>Your conversion has been approved and credited to your account.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Program:</strong> ${data.programName}</p>
            <p style="margin: 5px 0;"><strong>Conversion ID:</strong> ${data.conversionId}</p>
            <p style="margin: 5px 0;"><strong>Earnings:</strong> Rp ${data.payout.toLocaleString('id-ID')}</p>
          </div>
          <a href="https://cuanpintar.com/partner/earnings" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View Earnings
          </a>
        </div>
      </div>
    `,
    text: `
      Conversion Approved!

      Hi ${data.partnerName},

      Your conversion has been approved and credited to your account.

      Program: ${data.programName}
      Conversion ID: ${data.conversionId}
      Earnings: Rp ${data.payout.toLocaleString('id-ID')}

      Visit https://cuanpintar.com/partner/earnings to view your earnings.
    `,
  }),

  // Advertiser emails
  newConversion: (data: { advertiserName: string; programName: string; conversionId: string; channel: string }) => ({
    subject: `New Conversion - ${data.programName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 30px;">
          <h2>New Conversion</h2>
          <p>Hi ${data.advertiserName},</p>
          <p>A new conversion has been recorded for your program.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Program:</strong> ${data.programName}</p>
            <p style="margin: 5px 0;"><strong>Channel:</strong> ${data.channel}</p>
            <p style="margin: 5px 0;"><strong>Conversion ID:</strong> ${data.conversionId}</p>
          </div>
          <a href="https://cuanpintar.com/advertiser/conversions" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View Conversions
          </a>
        </div>
      </div>
    `,
    text: `
      New Conversion

      Hi ${data.advertiserName},

      A new conversion has been recorded for your program.

      Program: ${data.programName}
      Channel: ${data.channel}
      Conversion ID: ${data.conversionId}

      Visit https://cuanpintar.com/advertiser/conversions to view.
    `,
  }),

  fraudAlert: (data: { advertiserName: string; programName: string; conversionId: string; fraudSignals: string[] }) => ({
    subject: `Fraud Alert - ${data.programName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Fraud Alert</h1>
        </div>
        <div style="padding: 30px;">
          <p>Hi ${data.advertiserName},</p>
          <p>Our fraud detection system has flagged a conversion for review.</p>
          <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Program:</strong> ${data.programName}</p>
            <p style="margin: 5px 0;"><strong>Conversion ID:</strong> ${data.conversionId}</p>
            <p style="margin: 5px 0;"><strong>Fraud Signals:</strong></p>
            <ul>
              ${data.fraudSignals.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <p>This conversion will not be counted towards your payout until reviewed.</p>
          <a href="https://cuanpintar.com/advertiser/fraud" style="display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Review Fraud
          </a>
        </div>
      </div>
    `,
    text: `
      Fraud Alert

      Hi ${data.advertiserName},

      Our fraud detection system has flagged a conversion for review.

      Program: ${data.programName}
      Conversion ID: ${data.conversionId}
      Fraud Signals: ${data.fraudSignals.join(', ')}

      This conversion will not be counted towards your payout until reviewed.

      Visit https://cuanpintar.com/advertiser/fraud to review.
    `,
  }),
};

// Slack notification templates
export const SLACK_TEMPLATES = {
  conversionCreated: (data: { conversionId: string; programName: string; partnerName: string; channel: string; payout: number }) => ({
    text: 'New Conversion Recorded',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🎯 New Conversion' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Program:*\n${data.programName}` },
          { type: 'mrkdwn', text: `*Partner:*\n${data.partnerName}` },
          { type: 'mrkdwn', text: `*Channel:*\n${data.channel}` },
          { type: 'mrkdwn', text: `*Payout:*\nRp ${data.payout.toLocaleString('id-ID')}` },
        ],
      },
    ],
  }),

  fraudDetected: (data: { conversionId: string; programName: string; partnerName: string; fraudSignals: string[] }) => ({
    text: 'Fraud Alert',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '⚠️ Fraud Detected' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Program:*\n${data.programName}` },
          { type: 'mrkdwn', text: `*Partner:*\n${data.partnerName}` },
          { type: 'mrkdwn', text: `*Fraud Signals:*\n${data.fraudSignals.join(', ')}` },
        ],
      },
      {
        type: 'actions',
        elements: [
          { type: 'button', text: { type: 'plain_text', text: 'Review' }, url: `https://cuanpintar.com/admin/fraud` },
        ],
      },
    ],
  }),

  payoutCompleted: (data: { partnerName: string; amount: number; paymentMethod: string; conversions: number }) => ({
    text: 'Payout Completed',
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '💰 Payout Completed' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Partner:*\n${data.partnerName}` },
          { type: 'mrkdwn', text: `*Amount:*\nRp ${data.amount.toLocaleString('id-ID')}` },
          { type: 'mrkdwn', text: `*Method:*\n${data.paymentMethod}` },
          { type: 'mrkdwn', text: `*Conversions:*\n${data.conversions}` },
        ],
      },
    ],
  }),
};

// Notification service (simulated)
export class NotificationService {
  private emailQueue: Array<{ to: string; template: EmailTemplate }> = [];
  private slackQueue: Array<{ webhook: string; payload: unknown }> = [];

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    // In production, this would use SendGrid, AWS SES, etc.
    console.log(`[Email] Sending to ${to}: ${template.subject}`);
    this.emailQueue.push({ to, template });
    return true;
  }

  async sendSlackNotification(webhook: string, payload: unknown): Promise<boolean> {
    // In production, this would POST to Slack webhook
    console.log(`[Slack] Sending to ${webhook}`);
    this.slackQueue.push({ webhook, payload });
    return true;
  }

  async notify(event: string, data: Record<string, unknown>): Promise<void> {
    // Route notifications based on event type
    switch (event) {
      case 'payout.completed':
        // Send email to partner
        // Send Slack to admin
        break;
      case 'fraud.detected':
        // Send email to advertiser
        // Send Slack alert
        break;
      // ... other events
    }
  }
}

export const notificationService = new NotificationService();
