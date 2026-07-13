/**
 * Auth Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'access_token') return { value: 'demo_admin@cuanpintar.com' };
      return undefined;
    }),
  })),
}));

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  isSupabaseConfigured: vi.fn(() => false),
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return 401 when no token provided', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test');

      const result = await requireAuth(request);

      expect(result.success).toBe(false);
      expect(result.response).toBeDefined();
    });

    it('should authenticate demo user with valid token', async () => {
      const { requireAuth } = await import('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test', {
        headers: new Headers({
          Authorization: 'Bearer demo_admin@cuanpintar.com',
        }),
      });

      const result = await requireAuth(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.role).toBe('admin');
      }
    });
  });

  describe('requireAdmin', () => {
    it('should return 403 for non-admin users', async () => {
      const { requireAdmin } = await import('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test', {
        headers: new Headers({
          Authorization: 'Bearer demo_partner@jakselnews.com',
        }),
      });

      const result = await requireAdmin(request);

      expect(result.success).toBe(false);
    });
  });

  describe('requirePartner', () => {
    it('should return 403 for non-partner users', async () => {
      const { requirePartner } = await import('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test', {
        headers: new Headers({
          Authorization: 'Bearer demo_admin@cuanpintar.com',
        }),
      });

      const result = await requirePartner(request);

      expect(result.success).toBe(false);
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination values', () => {
      const { getPaginationParams } = require('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test');

      const params = getPaginationParams(request);

      expect(params.page).toBe(1);
      expect(params.limit).toBe(20);
      expect(params.offset).toBe(0);
    });

    it('should parse custom pagination values', () => {
      const { getPaginationParams } = require('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test?page=3&limit=50');

      const params = getPaginationParams(request);

      expect(params.page).toBe(3);
      expect(params.limit).toBe(50);
      expect(params.offset).toBe(100);
    });

    it('should cap limit at 100', () => {
      const { getPaginationParams } = require('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test?limit=500');

      const params = getPaginationParams(request);

      expect(params.limit).toBe(100);
    });

    it('should ensure page is at least 1', () => {
      const { getPaginationParams } = require('@/lib/auth/middleware');

      const request = new NextRequest('http://localhost/api/test?page=-5');

      const params = getPaginationParams(request);

      expect(params.page).toBe(1);
    });
  });

  describe('successResponse', () => {
    it('should create success response', () => {
      const { successResponse } = require('@/lib/auth/middleware');

      const response = successResponse({ id: '123', name: 'Test' });

      expect(response.status).toBe(200);
    });

    it('should create success response with custom status', () => {
      const { successResponse } = require('@/lib/auth/middleware');

      const response = successResponse({ id: '123' }, 'Created', 201);

      expect(response.status).toBe(201);
    });
  });

  describe('errorResponse', () => {
    it('should create error response', () => {
      const { errorResponse } = require('@/lib/auth/middleware');

      const response = errorResponse('Bad Request', 'Invalid input', 400);

      expect(response.status).toBe(400);
    });
  });
});
