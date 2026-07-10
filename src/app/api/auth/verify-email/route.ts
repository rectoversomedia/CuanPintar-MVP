/**
 * Email Verification API Routes
 *
 * POST /api/auth/verify-email     - Verify email with token
 * POST /api/auth/send-verification - Resend verification email
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  validateVerificationToken,
  markTokenAsUsed,
  buildVerificationUrl,
  sendVerificationEmail,
} from '@/lib/auth/verification';
import { verifyEmailSchema } from '@/lib/validation/schemas';

// POST /api/auth/verify-email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'verify':
        return handleVerify(request, body);
      case 'send':
        return handleSendVerification(request, body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify email with token
async function handleVerify(request: NextRequest, body: Record<string, unknown>) {
  // Validate input
  const validation = verifyEmailSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid token', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { token } = validation.data;

  // Validate token
  const result = await validateVerificationToken(token);

  if (!result.valid) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  // Check token type
  if (result.type !== 'email_verification') {
    return NextResponse.json(
      { success: false, error: 'Invalid token type' },
      { status: 400 }
    );
  }

  // Update user status
  if (isSupabaseConfigured() && result.userId) {
    const { error } = await supabase
      .from('users')
      .update({ email_verified: true, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', result.userId);

    if (error) {
      console.error('Failed to update user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      );
    }
  }

  // Mark token as used
  await markTokenAsUsed(token);

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully',
  });
}

// Resend verification email
async function handleSendVerification(request: NextRequest, body: Record<string, unknown>) {
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Email required' },
      { status: 400 }
    );
  }

  // Find user
  let userId: string | null = null;
  let userName = email.split('@')[0];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email_verified')
      .eq('email', email)
      .single();

    if (error || !data) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a verification email has been sent',
      });
    }

    if (data.email_verified) {
      return NextResponse.json({
        success: false,
        error: 'Email already verified',
      });
    }

    userId = data.id;
    userName = data.name || userName;
  }

  // Create verification token
  const { createVerificationToken } = await import('@/lib/auth/verification');
  const token = await createVerificationToken(userId || email, email);

  // Build verification URL
  const verificationUrl = buildVerificationUrl(token);

  // Send email
  await sendVerificationEmail(email, userName, verificationUrl);

  return NextResponse.json({
    success: true,
    message: 'Verification email sent',
  });
}
