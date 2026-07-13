/**
 * Validation Schemas Tests
 */

import { describe, it, expect } from 'vitest';

describe('Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate correct login data', async () => {
      const { loginSchema } = await import('@/lib/validation/schemas');

      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', async () => {
      const { loginSchema } = await import('@/lib/validation/schemas');

      const invalidData = {
        email: 'not-an-email',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject short password', async () => {
      const { loginSchema } = await import('@/lib/validation/schemas');

      const invalidData = {
        email: 'test@example.com',
        password: '12345',
      };

      const result = loginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('Register Schema', () => {
    it('should validate correct registration data', async () => {
      const { registerSchema } = await import('@/lib/validation/schemas');

      const validData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        role: 'partner',
        company_name: 'My Company',
        phone: '+6281234567890',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate Indonesian phone number', async () => {
      const { registerSchema } = await import('@/lib/validation/schemas');

      const validPhones = [
        '+6281234567890',
        '6281234567890',
        '081234567890',
      ];

      for (const phone of validPhones) {
        const result = registerSchema.safeParse({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          phone,
        });

        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid roles', async () => {
      const { registerSchema } = await import('@/lib/validation/schemas');

      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
        role: 'superadmin', // Invalid role
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Create Program Schema', () => {
    it('should validate complete program data', async () => {
      const { createProgramSchema } = await import('@/lib/validation/schemas');

      const validData = {
        name: 'New Program',
        brand_name: 'Brand XYZ',
        industry: 'Finance',
        description: 'This is a test program description that is long enough.',
        budget: 10000000,
        payout_model: 'cpa',
        partner_payout: 50000,
      };

      const result = createProgramSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject negative budget', async () => {
      const { createProgramSchema } = await import('@/lib/validation/schemas');

      const invalidData = {
        name: 'Test',
        brand_name: 'Brand',
        industry: 'Tech',
        description: 'Test description that is long enough',
        budget: -1000,
        payout_model: 'cpa',
        partner_payout: 500,
      };

      const result = createProgramSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject invalid payout model', async () => {
      const { createProgramSchema } = await import('@/lib/validation/schemas');

      const result = createProgramSchema.safeParse({
        name: 'Test',
        brand_name: 'Brand',
        industry: 'Tech',
        description: 'Test description that is long enough',
        budget: 1000,
        payout_model: 'invalid_model',
        partner_payout: 500,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Create Conversion Schema', () => {
    it('should validate conversion data', async () => {
      const { createConversionSchema } = await import('@/lib/validation/schemas');

      const validData = {
        program_id: 'prog_123',
        partner_id: 'part_456',
        channel_type: 'social_media',
        conversion_type: 'signup',
        user_identifier: 'user@example.com',
      };

      const result = createConversionSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate UTMs', async () => {
      const { createConversionSchema } = await import('@/lib/validation/schemas');

      const validData = {
        program_id: 'prog_123',
        partner_id: 'part_456',
        utms: {
          source: 'google',
          medium: 'cpc',
          campaign: 'summer_sale',
          term: 'loans',
          content: 'banner_1',
        },
      };

      const result = createConversionSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Tracking Schemas', () => {
    it('should validate click tracking data', async () => {
      const { trackClickSchema } = await import('@/lib/validation/schemas');

      const validData = {
        program_id: 'prog_123',
        partner_id: 'part_456',
        fingerprint: 'abc123def456',
        utm_source: 'facebook',
      };

      const result = trackClickSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should validate conversion tracking data', async () => {
      const { trackConversionSchema } = await import('@/lib/validation/schemas');

      const validData = {
        program_id: 'prog_123',
        partner_id: 'part_456',
        event_id: 'evt_789',
        conversion_type: 'purchase',
        amount: 150000,
      };

      const result = trackConversionSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const { trackConversionSchema } = await import('@/lib/validation/schemas');

      const result = trackConversionSchema.safeParse({
        program_id: 'prog_123',
        // missing partner_id
      });

      expect(result.success).toBe(false);
    });
  });
});
