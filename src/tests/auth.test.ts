/**
 * Auth Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'production');
vi.stubEnv('JWT_SECRET', 'test-secret-key-for-testing-only');

// Import after mocking
import {
  createToken,
  verifyToken,
  blacklistToken,
  extractToken,
  createSessionResponse,
  refreshTokens,
  clearSessionResponse,
  authenticateRequest,
  authorizeRole,
  JWTPayload,
} from '@/lib/auth/tokens';

describe('JWT Token Service', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    role: 'advertiser' as const,
    companyName: 'Test Company',
  };

  describe('createToken', () => {
    it('should create an access token', async () => {
      const token = await createToken({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        companyName: mockUser.companyName,
        type: 'access',
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should create a refresh token', async () => {
      const token = await createToken({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh',
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = await createToken({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
      });

      const payload = await verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
      expect(payload?.type).toBe('access');
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for blacklisted token', async () => {
      const token = await createToken({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh',
      });

      // Blacklist the token
      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      const jti = verified!.jti;

      blacklistToken(jti);

      // Try to verify again
      const payload = await verifyToken(token);
      expect(payload).toBeNull();
    });
  });

  describe('authorizeRole', () => {
    it('should return true for allowed role', () => {
      const user: JWTPayload = {
        sub: '123',
        email: 'test@example.com',
        role: 'advertiser',
        type: 'access',
        iat: Date.now(),
        exp: Date.now() + 3600,
        jti: 'test-jti',
      };

      expect(authorizeRole(user, ['advertiser', 'partner'])).toBe(true);
    });

    it('should return false for disallowed role', () => {
      const user: JWTPayload = {
        sub: '123',
        email: 'test@example.com',
        role: 'partner',
        type: 'access',
        iat: Date.now(),
        exp: Date.now() + 3600,
        jti: 'test-jti',
      };

      expect(authorizeRole(user, ['advertiser'])).toBe(false);
    });
  });
});

describe('Password Validation', () => {
  const passwordValidation = {
    minLength: (password: string) => password.length >= 8,
    hasUppercase: (password: string) => /[A-Z]/.test(password),
    hasLowercase: (password: string) => /[a-z]/.test(password),
    hasNumber: (password: string) => /[0-9]/.test(password),
    hasSpecial: (password: string) => /[^A-Za-z0-9]/.test(password),
  };

  it('should require minimum 8 characters', () => {
    expect(passwordValidation.minLength('1234567')).toBe(false);
    expect(passwordValidation.minLength('12345678')).toBe(true);
  });

  it('should require uppercase letter', () => {
    expect(passwordValidation.hasUppercase('password')).toBe(false);
    expect(passwordValidation.hasUppercase('Password')).toBe(true);
  });

  it('should require lowercase letter', () => {
    expect(passwordValidation.hasLowercase('PASSWORD')).toBe(false);
    expect(passwordValidation.hasLowercase('Password')).toBe(true);
  });

  it('should require number', () => {
    expect(passwordValidation.hasNumber('Password!')).toBe(false);
    expect(passwordValidation.hasNumber('Password1!')).toBe(true);
  });

  it('should require special character', () => {
    expect(passwordValidation.hasSpecial('Password1')).toBe(false);
    expect(passwordValidation.hasSpecial('Password1!')).toBe(true);
  });

  it('should accept valid password', () => {
    const validPassword = 'SecurePass123!';
    expect(passwordValidation.minLength(validPassword)).toBe(true);
    expect(passwordValidation.hasUppercase(validPassword)).toBe(true);
    expect(passwordValidation.hasLowercase(validPassword)).toBe(true);
    expect(passwordValidation.hasNumber(validPassword)).toBe(true);
    expect(passwordValidation.hasSpecial(validPassword)).toBe(true);
  });
});

describe('Email Validation', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  it('should accept valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.id')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Phone Validation', () => {
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    return phoneRegex.test(phone);
  };

  it('should accept valid Indonesian phone numbers', () => {
    expect(isValidPhone('081234567890')).toBe(true);
    expect(isValidPhone('6281234567890')).toBe(true);
    expect(isValidPhone('+6281234567890')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123456789')).toBe(false);
    expect(isValidPhone('+1234567890')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
  });
});

describe('ID Generation', () => {
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  it('should generate unique IDs', () => {
    const id1 = generateId('user');
    const id2 = generateId('user');

    expect(id1).not.toBe(id2);
    expect(id1.startsWith('user_')).toBe(true);
  });

  it('should have correct prefix', () => {
    expect(generateId('prog').startsWith('prog_')).toBe(true);
    expect(generateId('conv').startsWith('conv_')).toBe(true);
    expect(generateId('part').startsWith('part_')).toBe(true);
  });
});
