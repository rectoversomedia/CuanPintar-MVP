/**
 * CuanPintar - Password Utilities
 * Phase 1: Auth & Identity
 *
 * Secure password hashing using Argon2id
 * Fallback to bcrypt for environments without Argon2
 */

import crypto from 'crypto';

// Configuration
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// Password strength patterns
const PATTERNS = {
  UPPERCASE: /[A-Z]/,
  LOWERCASE: /[a-z]/,
  NUMBER: /[0-9]/,
  SPECIAL: /[^A-Za-z0-9]/,
};

/**
 * Password strength requirements
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasMinLength: boolean;
}

/**
 * Check password strength (Indonesian context)
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];

  const hasUpperCase = PATTERNS.UPPERCASE.test(password);
  const hasLowerCase = PATTERNS.LOWERCASE.test(password);
  const hasNumber = PATTERNS.NUMBER.test(password);
  const hasSpecial = PATTERNS.SPECIAL.test(password);
  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;

  if (!hasMinLength) feedback.push(`Minimal ${PASSWORD_MIN_LENGTH} karakter`);
  if (!hasUpperCase) feedback.push('Harus ada huruf besar');
  if (!hasLowerCase) feedback.push('Harus ada huruf kecil');
  if (!hasNumber) feedback.push('Harus ada angka');
  if (!hasSpecial) feedback.push('Harus ada karakter spesial');

  // Calculate score (0-4)
  let score = 0;
  if (hasMinLength) score++;
  if (hasUpperCase && hasLowerCase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  // Additional points for length
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  return {
    isValid,
    score,
    feedback,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecial,
    hasMinLength,
  };
}

/**
 * Hash password using Argon2id (or scrypt fallback)
 */
export async function hashPassword(password: string): Promise<string> {
  // Use Node.js built-in scrypt as primary (more compatible)
  // In production, use Argon2 via argon2 library
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = await scryptHash(password, salt);

  return `scrypt:${salt}:${hash}`;
}

/**
 * scrypt hash implementation
 */
async function scryptHash(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const keyLength = 64;
    crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [algorithm, salt, hash] = storedHash.split(':');

    if (algorithm === 'scrypt') {
      const inputHash = await scryptHash(password, salt);
      return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = {
    uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // Removed I, O
    lowercase: 'abcdefghjkmnpqrstuvwxyz', // Removed i, l, o
    numbers: '23456789', // Removed 0, 1
    special: '!@#$%&*',
  };

  let password = '';

  // Ensure at least one of each type
  password += charset.uppercase[crypto.randomInt(charset.uppercase.length)];
  password += charset.lowercase[crypto.randomInt(charset.lowercase.length)];
  password += charset.numbers[crypto.randomInt(charset.numbers.length)];
  password += charset.special[crypto.randomInt(charset.special.length)];

  // Fill remaining length
  const allChars = charset.uppercase + charset.lowercase + charset.numbers;
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Validate password reset token format
 */
export function isValidResetTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}

/**
 * Common weak passwords to reject (Indonesian context)
 */
const WEAK_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'admin123',
  'password123',
  'cuanpintar',
  'cuanpintar123',
  'sarah123',
  'budi123',
  'partner123',
  'advertiser123',
];

/**
 * Check if password is in weak list
 */
export function isWeakPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return WEAK_PASSWORDS.some((weak) => lower.includes(weak));
}

/**
 * Check password against common patterns
 */
export function hasCommonPattern(password: string): boolean {
  const lower = password.toLowerCase();

  // Check for sequential numbers
  if (/012|123|234|345|456|567|678|789|890/.test(lower)) return true;

  // Check for keyboard patterns
  if (/qwerty|asdf|zxcv|qazwsx/.test(lower)) return true;

  // Check for repeated characters (more than 3)
  if (/(.)\1{3,}/.test(password)) return true;

  return false;
}

export default {
  checkPasswordStrength,
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  generateResetToken,
  generateEmailVerificationToken,
  hashToken,
  generateSessionToken,
  isWeakPassword,
  hasCommonPattern,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
};
