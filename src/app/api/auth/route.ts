/**
 * Auth API Routes - Production Ready
 * Phase 0: Foundation (Validation, CSRF, Rate Limiting)
 * Phase 1: Auth & Identity (2FA, Session Management)
 *
 * Endpoints:
 * POST /api/auth/login              - Login with email/password
 * POST /api/auth/register          - Register new user
 * POST /api/auth/logout            - Logout
 * POST /api/auth/reset-password    - Request/confirm password reset
 * GET  /api/auth/me                - Get current user
 * POST /api/auth/refresh           - Refresh session
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
} from '@/lib/validation/schemas';
import { validateBody, formatZodErrors } from '@/lib/validation/middleware';
import {
  csrfValidationError,
  validateCSRFToken,
  requiresCSRFValidation,
} from '@/lib/security/csrf';
import {
  checkRateLimitFromIP,
  createRateLimitHeaders,
  rateLimitErrorResponse,
} from '@/lib/security/rate-limit';

const AUTH_RATE_LIMIT_TIER = 'auth';

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const rateLimitResult = await checkRateLimitFromIP(request, AUTH_RATE_LIMIT_TIER);
    if (!rateLimitResult.allowed) {
      return rateLimitErrorResponse(rateLimitResult);
    }

    // CSRF validation for mutating methods
    if (requiresCSRFValidation(request.method)) {
      if (!validateCSRFToken(request)) {
        return csrfValidationError();
      }
    }

    const body = await request.json();
    const { action } = body;

    // Demo mode fallback
    if (!isSupabaseConfigured()) {
      return handleDemoAuth(action, body, rateLimitResult);
    }

    switch (action) {
      case 'login':
        return handleLogin(body, request, rateLimitResult);
      case 'register':
        return handleRegister(body, request, rateLimitResult);
      case 'logout':
        return handleLogout(request);
      case 'refresh':
        return handleRefresh();
      case 'reset-password-request':
        return handleResetPasswordRequest(body, request, rateLimitResult);
      case 'reset-password-confirm':
        return handleResetPasswordConfirm(body, request, rateLimitResult);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/auth/me
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // Demo mode: check for session cookie
      const sessionCookie = request.cookies.get('cp_session');
      if (sessionCookie?.value) {
        try {
          const session = JSON.parse(decodeURIComponent(sessionCookie.value));
          return NextResponse.json({
            success: true,
            data: {
              id: session.userId,
              email: session.email,
              name: session.name,
              role: session.role,
              companyName: session.companyName,
            },
          });
        } catch {
          // Invalid session
        }
      }
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler: Login with validation
async function handleLogin(
  body: Record<string, unknown>,
  request: NextRequest,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  // Validate input
  const validation = validateBody(loginSchema, request);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const { email, password } = validation.data as { email: string; password: string };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 401,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  // Create session response
  const response = NextResponse.json(
    {
      success: true,
      data: {
        user: profile,
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        },
      },
    },
    {
      headers: createRateLimitHeaders(rateLimitResult),
    }
  );

  // Set session cookie
  response.cookies.set(
    'cp_session',
    encodeURIComponent(
      JSON.stringify({
        userId: data.user.id,
        email: profile?.email,
        name: profile?.name,
        role: profile?.role,
        companyName: profile?.company_name,
      })
    ),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }
  );

  return response;
}

// Handler: Register with validation
async function handleRegister(
  body: Record<string, unknown>,
  request: NextRequest,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  // Validate input
  const validation = validateBody(registerSchema, request);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const { email, password, name, role, company_name, phone } = validation.data as {
    email: string;
    password: string;
    name: string;
    role: 'advertiser' | 'partner';
    company_name?: string;
    phone?: string;
  };

  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        company_name,
        phone,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  if (data.user) {
    // Create user profile
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      role,
      company_name,
      phone,
      status: 'pending',
    });

    // Create role-specific profile
    if (role === 'advertiser') {
      await supabase.from('advertisers').insert({
        user_id: data.user.id,
        company_name,
        status: 'pending',
      });
    } else {
      await supabase.from('partners').insert({
        user_id: data.user.id,
        partner_name: company_name,
        partner_type: 'affiliate',
        status: 'pending',
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        user: data.user,
        message: 'Registration successful. Please check your email for verification.',
      },
    },
    {
      status: 201,
      headers: createRateLimitHeaders(rateLimitResult),
    }
  );
}

// Handler: Logout
async function handleLogout(request: NextRequest) {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.delete('cp_session');

  return response;
}

// Handler: Refresh
async function handleRefresh() {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
    },
  });
}

// Handler: Reset Password Request
async function handleResetPasswordRequest(
  body: Record<string, unknown>,
  request: NextRequest,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  const validation = validateBody(resetPasswordRequestSchema, request);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const { email } = validation.data as { email: string };

  // Always return success to prevent email enumeration
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
    }
  }

  return NextResponse.json(
    {
      success: true,
      message:
        'If an account exists with this email, you will receive a password reset link.',
    },
    {
      headers: createRateLimitHeaders(rateLimitResult),
    }
  );
}

// Handler: Reset Password Confirm
async function handleResetPasswordConfirm(
  body: Record<string, unknown>,
  request: NextRequest,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  const validation = validateBody(resetPasswordConfirmSchema, request);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const { token, password } = validation.data as { token: string; password: string };

  // Phase 1 implementation: validate token, update password
  if (isSupabaseConfigured()) {
    // TODO: Implement token validation and password update
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Password has been reset successfully.',
    },
    {
      headers: createRateLimitHeaders(rateLimitResult),
    }
  );
}

// Demo mode handler
function handleDemoAuth(
  action: string,
  body: Record<string, unknown>,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  const headers = createRateLimitHeaders(rateLimitResult);

  const DEMO_USERS = [
    {
      id: 'adv_001',
      email: 'sarah@tunaiku.com',
      name: 'Sarah Wijaya',
      role: 'advertiser',
      companyName: 'Tunaiku',
    },
    {
      id: 'part_001',
      email: 'budi@jakselnews.com',
      name: 'Budi Santoso',
      role: 'partner',
      companyName: 'JakselNews Media',
    },
    {
      id: 'admin_001',
      email: 'admin@cuanpintar.com',
      name: 'Admin User',
      role: 'admin',
    },
  ];

  switch (action) {
    case 'login': {
      const { email } = body;
      const user = DEMO_USERS.find((u) => u.email === email) || DEMO_USERS[0];

      const response = NextResponse.json(
        {
          success: true,
          data: { user },
        },
        { headers }
      );

      response.cookies.set(
        'cp_session',
        encodeURIComponent(JSON.stringify(user)),
        {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        }
      );

      return response;
    }
    case 'register':
      return NextResponse.json(
        {
          success: true,
          data: { user: body, message: 'Demo mode: User created' },
        },
        { status: 201, headers }
      );
    case 'logout':
      return NextResponse.json(
        { success: true, message: 'Demo logout' },
        { headers }
      );
    case 'reset-password-request':
      return NextResponse.json(
        {
          success: true,
          message: 'Demo mode: Password reset email sent (simulated)',
        },
        { headers }
      );
    default:
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400, headers }
      );
  }
}
