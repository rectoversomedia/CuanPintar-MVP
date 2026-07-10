/**
 * Password Reset API Routes
 *
 * POST /api/auth/password-reset/reset   - Reset password with token
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  validateVerificationToken,
  markTokenAsUsed,
  buildPasswordResetUrl,
  sendPasswordResetEmail,
  createPasswordResetToken,
} from '@/lib/auth/verification';
import { resetPasswordConfirmSchema } from '@/lib/validation/schemas';

// POST /api/auth/password-reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'request':
        return handleResetRequest(request, body);
      case 'reset':
        return handleResetPassword(request, body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle password reset request (send email)
async function handleResetRequest(request: NextRequest, body: Record<string, unknown>) {
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Email required' },
      { status: 400 }
    );
  }

  // Find user
  let userName = email.split('@')[0];
  let userId: string | null = null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (error || !data) {
      // Don't reveal if email exists - always return success
      console.log('Password reset requested for non-existent email:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    userId = data.id;
    userName = data.name || userName;
  }

  // Create reset token
  const token = await createPasswordResetToken(userId || email, email);

  // Build reset URL
  const resetUrl = buildPasswordResetUrl(token);

  // Send email
  await sendPasswordResetEmail(email, userName, resetUrl);

  return NextResponse.json({
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link',
  });
}

// Handle password reset (change password)
async function handleResetPassword(request: NextRequest, body: Record<string, unknown>) {
  // Validate input
  const validation = resetPasswordConfirmSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { token, password } = validation.data;

  // Validate token
  const result = await validateVerificationToken(token);

  if (!result.valid) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  // Check token type
  if (result.type !== 'password_reset') {
    return NextResponse.json(
      { success: false, error: 'Invalid token type' },
      { status: 400 }
    );
  }

  // Update password
  if (isSupabaseConfigured() && result.userId) {
    // Update Supabase Auth password
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      result.userId,
      { password }
    );

    if (authError) {
      console.error('Failed to update password:', authError);
      return NextResponse.json(
        { success: false, error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        password_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', result.userId);

    if (userError) {
      console.error('Failed to update user record:', userError);
    }

    // Invalidate all sessions for this user (security measure)
    await invalidateAllSessions(result.userId);
  }

  // Mark token as used
  await markTokenAsUsed(token);

  return NextResponse.json({
    success: true,
    message: 'Password has been reset successfully. Please login with your new password.',
  });
}

// Invalidate all sessions for a user
async function invalidateAllSessions(userId: string): Promise<void> {
  try {
    // Delete all sessions from database
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId);

    // Clear refresh tokens
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    console.log('All sessions invalidated for user:', userId);
  } catch (error) {
    console.error('Failed to invalidate sessions:', error);
  }
}
