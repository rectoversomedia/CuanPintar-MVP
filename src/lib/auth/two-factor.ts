/**
 * CuanPintar - 2FA Service
 * Phase 1: Auth & Identity
 *
 * 2FA management: setup, verify, disable
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  generateTOTPSecret,
  generateTOTPURI,
  verifyTOTP,
  generateRecoveryCodes,
  hashRecoveryCode,
  encodeTOTPSecret,
  decodeTOTPSecret,
  isValidOTPFormat,
  isValidRecoveryCodeFormat,
} from './totp';
import { log2FASuccess, log2FAFailed } from './audit';

export interface TwoFactorMethod {
  id: string;
  type: 'totp' | 'sms';
  identifier: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface TwoFactorSetupResult {
  success: boolean;
  secret?: string;
  qrCodeUrl?: string;
  recoveryCodes?: string[];
  error?: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  error?: string;
  requires2FA?: boolean;
}

/**
 * Check if user has 2FA enabled
 */
export async function has2FAEnabled(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data, error } = await supabase
    .from('user_2fa_methods')
    .select('id')
    .eq('user_id', userId)
    .eq('is_verified', true)
    .limit(1);

  if (error || !data || data.length === 0) {
    return false;
  }

  return true;
}

/**
 * Get user's 2FA methods
 */
export async function get2FAMethods(userId: string): Promise<TwoFactorMethod[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_2fa_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });

  if (error) {
    console.error('Failed to get 2FA methods:', error);
    return [];
  }

  return (data || []).map((m) => ({
    id: m.id,
    type: m.type,
    identifier: m.identifier,
    is_primary: m.is_primary,
    is_verified: m.is_verified,
    created_at: m.created_at,
  }));
}

/**
 * Setup TOTP 2FA for a user
 */
export async function setupTOTP(
  userId: string,
  email: string,
  request: Request
): Promise<TwoFactorSetupResult> {
  if (!isSupabaseConfigured()) {
    // Demo mode
    return {
      success: true,
      secret: 'DEMO_SECRET_32CHARACTERS_LONG123',
      qrCodeUrl: 'otpauth://totp/CuanPintar:demo@example.com?secret=DEMO_SECRET_32CHARACTERS_LONG123&issuer=CuanPintar',
      recoveryCodes: ['ABCD1234', 'EFGH5678', 'IJKL9012', 'MNOP3456'],
    };
  }

  try {
    // Generate secret
    const secret = generateTOTPSecret();
    const encodedSecret = encodeTOTPSecret(secret);

    // Generate QR code URL
    const issuer = process.env.NEXT_PUBLIC_APP_NAME || 'CuanPintar';
    const qrCodeUrl = generateTOTPURI(secret, email, issuer);

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes();

    // Store 2FA method (not verified yet)
    const { error: insertError } = await supabase
      .from('user_2fa_methods')
      .insert({
        user_id: userId,
        type: 'totp',
        identifier: email,
        secret_encrypted: Buffer.from(encodedSecret),
        is_primary: true,
        is_verified: false,
      });

    if (insertError) {
      console.error('Failed to insert 2FA method:', insertError);
      return { success: false, error: 'Failed to setup 2FA' };
    }

    // Store recovery codes (hashed)
    const recoveryInserts = recoveryCodes.map((code, index) => ({
      user_id: userId,
      code_hash: hashRecoveryCode(code),
      code_index: index + 1,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }));

    const { error: recoveryError } = await supabase
      .from('user_2fa_recovery_codes')
      .insert(recoveryInserts);

    if (recoveryError) {
      console.error('Failed to insert recovery codes:', recoveryError);
    }

    return {
      success: true,
      secret,
      qrCodeUrl,
      recoveryCodes, // Only returned ONCE - must be stored securely by user
    };
  } catch (err) {
    console.error('2FA setup error:', err);
    return { success: false, error: 'Failed to setup 2FA' };
  }
}

/**
 * Verify and enable 2FA (verify first TOTP code)
 */
export async function verifyAndEnableTOTP(
  userId: string,
  code: string,
  request: Request
): Promise<TwoFactorVerificationResult> {
  if (!isValidOTPFormat(code)) {
    return { success: false, error: 'Invalid code format' };
  }

  if (!isSupabaseConfigured()) {
    // Demo mode - accept any 6-digit code
    await log2FASuccess(userId, request, 'totp');
    return { success: true };
  }

  try {
    // Get user's TOTP secret
    const { data: method, error } = await supabase
      .from('user_2fa_methods')
      .select('secret_encrypted')
      .eq('user_id', userId)
      .eq('type', 'totp')
      .eq('is_verified', false)
      .single();

    if (error || !method) {
      return { success: false, error: 'No pending 2FA setup found' };
    }

    // Decode secret
    const secret = decodeTOTPSecret(method.secret_encrypted.toString());

    // Verify TOTP code
    const isValid = verifyTOTP(code, secret);

    if (!isValid) {
      await log2FAFailed(userId, request, 'totp', 'Invalid TOTP code');
      return { success: false, error: 'Invalid verification code' };
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('user_2fa_methods')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('type', 'totp');

    if (updateError) {
      console.error('Failed to verify 2FA:', updateError);
      return { success: false, error: 'Failed to verify 2FA' };
    }

    await log2FASuccess(userId, request, 'totp');
    return { success: true };
  } catch (err) {
    console.error('2FA verification error:', err);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Verify 2FA code during login
 */
export async function verify2FAForLogin(
  userId: string,
  code: string,
  request: Request
): Promise<TwoFactorVerificationResult> {
  if (!isValidOTPFormat(code)) {
    // Check if it's a recovery code
    return verifyRecoveryCode(userId, code, request);
  }

  if (!isSupabaseConfigured()) {
    // Demo mode - accept any 6-digit code
    await log2FASuccess(userId, request, 'totp');
    return { success: true };
  }

  try {
    // Get user's TOTP secret
    const { data: method, error } = await supabase
      .from('user_2fa_methods')
      .select('secret_encrypted')
      .eq('user_id', userId)
      .eq('type', 'totp')
      .eq('is_verified', true)
      .single();

    if (error || !method) {
      return { success: false, error: '2FA not configured' };
    }

    // Decode secret
    const secret = decodeTOTPSecret(method.secret_encrypted.toString());

    // Verify TOTP code
    const isValid = verifyTOTP(code, secret);

    if (!isValid) {
      await log2FAFailed(userId, request, 'totp', 'Invalid TOTP code');
      return { success: false, error: 'Invalid verification code' };
    }

    await log2FASuccess(userId, request, 'totp');
    return { success: true };
  } catch (err) {
    console.error('2FA verification error:', err);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Verify a recovery code
 */
export async function verifyRecoveryCode(
  userId: string,
  code: string,
  request: Request
): Promise<TwoFactorVerificationResult> {
  if (!isValidRecoveryCodeFormat(code)) {
    return { success: false, error: 'Invalid recovery code format' };
  }

  if (!isSupabaseConfigured()) {
    // Demo mode
    await log2FASuccess(userId, request, 'recovery');
    return { success: true };
  }

  try {
    const codeHash = hashRecoveryCode(code);

    // Find the recovery code
    const { data: recoveryCode, error } = await supabase
      .from('user_2fa_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code_hash', codeHash)
      .eq('is_used', false)
      .single();

    if (error || !recoveryCode) {
      await log2FAFailed(userId, request, 'recovery', 'Invalid or used recovery code');
      return { success: false, error: 'Invalid recovery code' };
    }

    // Check expiration
    if (recoveryCode.expires_at && new Date(recoveryCode.expires_at) < new Date()) {
      return { success: false, error: 'Recovery code expired' };
    }

    // Mark as used
    await supabase
      .from('user_2fa_recovery_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', recoveryCode.id);

    await log2FASuccess(userId, request, 'recovery');
    return { success: true };
  } catch (err) {
    console.error('Recovery code verification error:', err);
    return { success: false, error: 'Verification failed' };
  }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(
  userId: string,
  password: string,
  code: string,
  request: Request
): Promise<TwoFactorVerificationResult> {
  if (!isSupabaseConfigured()) {
    // Demo mode - accept any code
    return { success: true };
  }

  try {
    // Verify password first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Verify 2FA code
    const verifyResult = await verify2FAForLogin(userId, code, request);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // Delete all 2FA methods
    await supabase
      .from('user_2fa_methods')
      .delete()
      .eq('user_id', userId);

    // Delete recovery codes
    await supabase
      .from('user_2fa_recovery_codes')
      .delete()
      .eq('user_id', userId);

    return { success: true };
  } catch (err) {
    console.error('2FA disable error:', err);
    return { success: false, error: 'Failed to disable 2FA' };
  }
}

/**
 * Get remaining recovery codes count
 */
export async function getRecoveryCodesCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 10;
  }

  const { count, error } = await supabase
    .from('user_2fa_recovery_codes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Failed to get recovery codes count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Regenerate recovery codes (requires 2FA verification)
 */
export async function regenerateRecoveryCodes(
  userId: string,
  code: string,
  request: Request
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  // Verify 2FA first
  const verifyResult = await verify2FAForLogin(userId, code, request);
  if (!verifyResult.success) {
    return { success: false, error: verifyResult.error };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      codes: ['ABCD1234', 'EFGH5678', 'IJKL9012', 'MNOP3456'],
    };
  }

  try {
    // Delete old recovery codes
    await supabase
      .from('user_2fa_recovery_codes')
      .delete()
      .eq('user_id', userId);

    // Generate new codes
    const recoveryCodes = generateRecoveryCodes();

    const recoveryInserts = recoveryCodes.map((code, index) => ({
      user_id: userId,
      code_hash: hashRecoveryCode(code),
      code_index: index + 1,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    await supabase.from('user_2fa_recovery_codes').insert(recoveryInserts);

    return { success: true, codes: recoveryCodes };
  } catch (err) {
    console.error('Recovery codes regeneration error:', err);
    return { success: false, error: 'Failed to regenerate recovery codes' };
  }
}

export default {
  has2FAEnabled,
  get2FAMethods,
  setupTOTP,
  verifyAndEnableTOTP,
  verify2FAForLogin,
  verifyRecoveryCode,
  disable2FA,
  getRecoveryCodesCount,
  regenerateRecoveryCodes,
};
