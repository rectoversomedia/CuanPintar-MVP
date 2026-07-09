/**
 * CuanPintar - TOTP (Time-based One-Time Password)
 * Phase 1: Auth & Identity
 *
 * Implementation of RFC 6238 TOTP with manual crypto
 */

import crypto from 'crypto';

/**
 * Base32 encoding
 */
function base32Encode(data: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const byte of data) {
    bits += byte.toString(2).padStart(8, '0');
  }
  let result = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const index = parseInt(bits.slice(i, i + 5), 2);
    result += alphabet[index];
  }
  return result;
}

/**
 * Generate a new TOTP secret (160-bit)
 */
export function generateTOTPSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

/**
 * Generate a TOTP URI for QR code generation
 * @param secret - The TOTP secret
 * @param email - User's email
 * @param issuer - Application name (e.g., 'CuanPintar')
 */
export function generateTOTPURI(secret: string, email: string, issuer: string = 'CuanPintar'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate TOTP code using HMAC-SHA1 (RFC 6238)
 */
function generateTOTPCode(secret: string, counter: number): string {
  // Convert counter to 8 bytes (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  // Decode base32 secret
  const secretBuffer = base32Decode(secret);

  // Generate HMAC-SHA1
  const hmac = crypto.createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const hash = hmac.digest();

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  // Generate 6-digit code
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTP(token: string, secret: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 1000 / 30);

  // Check current and adjacent windows
  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTPCode(secret, now + i);
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
      return true;
    }
  }

  return false;
}

/**
 * Base32 decode
 */
function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanedBase32 = base32.toUpperCase().replace(/=+$/, '');

  let bits = '';
  for (const char of cleanedBase32) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

/**
 * Generate a random 6-digit code for SMS OTP
 */
export function generateSMSOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate recovery codes (10 one-time codes)
 */
export function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate 10-character alphanumeric code
    const code = crypto.randomBytes(5).toString('hex').slice(0, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a recovery code for storage
 */
export function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.toLowerCase().replace(/\s/g, '')).digest('hex');
}

/**
 * Verify a recovery code against stored hash
 */
export function verifyRecoveryCode(code: string, storedHash: string): boolean {
  const inputHash = hashRecoveryCode(code);
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
}

/**
 * Encode TOTP secret for safe storage (Base64)
 */
export function encodeTOTPSecret(secret: string): string {
  return Buffer.from(secret).toString('base64');
}

/**
 * Decode TOTP secret from storage
 */
export function decodeTOTPSecret(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString();
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Validate recovery code format (8-10 alphanumeric)
 */
export function isValidRecoveryCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{8,10}$/.test(code);
}

export default {
  generateTOTPSecret,
  generateTOTPURI,
  verifyTOTP,
  generateRecoveryCodes,
  hashRecoveryCode,
  verifyRecoveryCode,
  generateSMSOTP,
  encodeTOTPSecret,
  decodeTOTPSecret,
  isValidOTPFormat,
  isValidRecoveryCodeFormat,
};
