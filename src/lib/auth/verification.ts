/**
 * Email Verification Service
 *
 * Handles email verification token generation, validation, and user activation
 */

import { NextRequest } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Verification token configuration
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours
const VERIFICATION_TOKEN_LENGTH = 32;

// In-memory token store (use Redis in production)
interface VerificationToken {
  token: string;
  userId: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

const tokenStore = new Map<string, VerificationToken>();

/**
 * Generate a secure verification token
 */
function generateVerificationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < VERIFICATION_TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Create email verification token
 */
export async function createVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const token = generateVerificationToken();

  const verificationData: VerificationToken = {
    token,
    userId,
    email,
    type: 'email_verification',
    createdAt: Date.now(),
    expiresAt: Date.now() + VERIFICATION_TOKEN_EXPIRY * 1000,
    used: false,
  };

  tokenStore.set(token, verificationData);

  // In production, also store in database for persistence
  if (isSupabaseConfigured()) {
    await storeTokenInDatabase(verificationData);
  }

  return token;
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(
  userId: string,
  email: string
): Promise<string> {
  const token = generateVerificationToken();

  const resetData: VerificationToken = {
    token,
    userId,
    email,
    type: 'password_reset',
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour for password reset
    used: false,
  };

  tokenStore.set(token, resetData);

  if (isSupabaseConfigured()) {
    await storeTokenInDatabase(resetData);
  }

  return token;
}

/**
 * Validate verification token
 */
export async function validateVerificationToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  type?: 'email_verification' | 'password_reset';
  error?: string;
}> {
  // Check in-memory store
  const stored = tokenStore.get(token);

  if (stored) {
    // Check if expired
    if (stored.expiresAt < Date.now()) {
      tokenStore.delete(token);
      return { valid: false, error: 'Token expired' };
    }

    // Check if already used
    if (stored.used) {
      return { valid: false, error: 'Token already used' };
    }

    return {
      valid: true,
      userId: stored.userId,
      email: stored.email,
      type: stored.type,
    };
  }

  // Check database (production mode)
  if (isSupabaseConfigured()) {
    const tokenData = await getTokenFromDatabase(token);

    if (!tokenData) {
      return { valid: false, error: 'Invalid token' };
    }

    if (tokenData.expires_at < new Date()) {
      return { valid: false, error: 'Token expired' };
    }

    if (tokenData.used) {
      return { valid: false, error: 'Token already used' };
    }

    return {
      valid: true,
      userId: tokenData.user_id,
      email: tokenData.email,
      type: tokenData.type,
    };
  }

  return { valid: false, error: 'Invalid token' };
}

/**
 * Mark token as used
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const stored = tokenStore.get(token);
  if (stored) {
    stored.used = true;
    return;
  }

  if (isSupabaseConfigured()) {
    await markTokenUsedInDatabase(token);
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { sendEmail, EMAIL_TEMPLATES } = await import('@/lib/services/email');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0066FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Verify Your Email</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
        <p style="font-size: 16px; color: #374151;">
          Thank you for registering with CuanPintar. Please verify your email address to activate your account.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background: #0066FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          This link will expire in 24 hours. If you didn't create an account with CuanPintar, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} CuanPintar. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: email,
    subject: 'Verify Your Email - CuanPintar',
    html,
  });

  return result;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { sendEmail } = await import('@/lib/services/email');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0066FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Reset Your Password</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
        <p style="font-size: 16px; color: #374151;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background: #0066FF; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} CuanPintar. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: email,
    subject: 'Reset Your Password - CuanPintar',
    html,
  });

  return result;
}

// Database helpers (for production mode)
async function storeTokenInDatabase(tokenData: VerificationToken): Promise<void> {
  try {
    await supabase.from('verification_tokens').insert({
      token: tokenData.token,
      user_id: tokenData.userId,
      email: tokenData.email,
      type: tokenData.type,
      created_at: new Date(tokenData.createdAt).toISOString(),
      expires_at: new Date(tokenData.expiresAt).toISOString(),
      used: false,
    });
  } catch (error) {
    console.error('Failed to store token in database:', error);
  }
}

async function getTokenFromDatabase(token: string): Promise<{
  user_id: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  expires_at: Date;
  used: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) return null;

    return {
      user_id: data.user_id,
      email: data.email,
      type: data.type,
      expires_at: new Date(data.expires_at),
      used: data.used,
    };
  } catch {
    return null;
  }
}

async function markTokenUsedInDatabase(token: string): Promise<void> {
  try {
    await supabase
      .from('verification_tokens')
      .update({ used: true })
      .eq('token', token);
  } catch (error) {
    console.error('Failed to mark token as used:', error);
  }
}

/**
 * Build verification URL
 */
export function buildVerificationUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/verify-email?token=${token}`;
}

/**
 * Build password reset URL
 */
export function buildPasswordResetUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/reset-password?token=${token}`;
}
