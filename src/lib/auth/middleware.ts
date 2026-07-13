/**
 * Authentication Middleware
 * Centralized auth verification for all protected API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Types
export type UserRole = 'admin' | 'advertiser' | 'partner';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  partnerId?: string;
  advertiserId?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

// Demo mode users (matches useDemoAuth.ts)
const DEMO_USERS: Record<string, AuthUser> = {
  'admin@cuanpintar.com': {
    id: 'demo-admin-001',
    email: 'admin@cuanpintar.com',
    role: 'admin',
  },
  'sarah@tunaiku.com': {
    id: 'demo-advertiser-001',
    email: 'sarah@tunaiku.com',
    role: 'advertiser',
    advertiserId: 'demo-adv-001',
  },
  'budi@jakselnews.com': {
    id: 'demo-partner-001',
    email: 'budi@jakselnews.com',
    role: 'partner',
    partnerId: 'demo-part-001',
  },
};

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies from header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'access_token' || name === 'sb-access-token' || name === 'cp_access_token') {
        return value;
      }
    }
  }

  return null;
}

/**
 * Verify JWT token (for demo mode)
 */
function verifyDemoToken(token: string): AuthUser | null {
  try {
    // In demo mode, token format: demo_{email}
    if (token.startsWith('demo_')) {
      const email = token.slice(5);
      return DEMO_USERS[email] || null;
    }
    // Also support direct email as token for demo
    return DEMO_USERS[token] || null;
  } catch {
    return null;
  }
}

/**
 * Verify JWT with Supabase
 */
async function verifySupabaseToken(token: string): Promise<AuthUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseKey,
      },
    });

    if (!response.ok) return null;

    const { data } = await response.json();

    // Get user role from metadata or join with roles table
    return {
      id: data.id,
      email: data.email,
      role: data.user_metadata?.role || 'partner',
      partnerId: data.user_metadata?.partner_id,
      advertiserId: data.user_metadata?.advertiser_id,
    };
  } catch {
    return null;
  }
}

/**
 * Verify token against database directly (for when Supabase Auth not configured)
 */
async function verifyDatabaseToken(token: string): Promise<AuthUser | null> {
  try {
    const { supabase } = await import('@/lib/supabase');

    // Try to find user by email (token is email for demo)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('email', token)
      .eq('is_active', true)
      .single();

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Main authentication function
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request);

  if (!token) {
    return {
      authenticated: false,
      error: 'No authentication token provided',
    };
  }

  let user: AuthUser | null = null;

  // Try Supabase Auth first
  user = await verifySupabaseToken(token);

  // If Supabase Auth failed, try demo token
  if (!user) {
    user = verifyDemoToken(token);
  }

  // If still no user, try direct database (for demo users in DB)
  if (!user && isSupabaseConfigured()) {
    user = await verifyDatabaseToken(token);
  }

  if (!user) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
    };
  }

  return {
    authenticated: true,
    user,
  };
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  const result = await authenticateRequest(request);

  if (!result.authenticated) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: result.error },
        { status: 401 }
      ),
    };
  }

  return { success: true, user: result.user! };
}

/**
 * Require specific role(s) - returns 403 if role doesn't match
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  const authResult = await requireAuth(request);

  if (!authResult.success) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: `Access denied. Required roles: ${allowedRoles.join(', ')}` },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  return requireRole(request, ['admin']);
}

/**
 * Require partner role
 */
export async function requirePartner(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  return requireRole(request, ['partner']);
}

/**
 * Require advertiser role
 */
export async function requireAdvertiser(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  return requireRole(request, ['advertiser']);
}

/**
 * Require partner or admin
 */
export async function requirePartnerOrAdmin(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  return requireRole(request, ['partner', 'admin']);
}

/**
 * Require advertiser or admin
 */
export async function requireAdvertiserOrAdmin(
  request: NextRequest
): Promise<{ success: true; user: AuthUser } | { success: false; response: NextResponse }> {
  return requireRole(request, ['advertiser', 'admin']);
}

/**
 * Validate request body with Zod schema
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T
): (data: unknown) => { success: true; data: z.infer<T> } | { success: false; error: string } {
  return (data: unknown) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message).join(', ');
      return { success: false, error: errors };
    }
    return { success: true, data: result.data };
  };
}

/**
 * Validate and return parsed body or error response
 */
export async function validateRequestBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const validator = validateBody(schema);
    const result = validator(body);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Validation Error', message: result.error },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Get pagination params from request
 */
export function getPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
  offset: number;
} {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  message?: string,
  status = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(message && { message }),
    },
    { status }
  );
}
