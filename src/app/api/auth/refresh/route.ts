/**
 * Auth Token Refresh API Route
 *
 * POST /api/auth/refresh - Refresh access token using refresh token
 * POST /api/auth/logout - Logout and invalidate tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshTokens, clearSessionResponse } from '@/lib/auth/tokens';

// POST /api/auth/refresh
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === 'refresh') {
      return handleRefresh(request);
    }

    // Default: refresh
    return handleRefresh(request);
  } catch (error) {
    console.error('Auth refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle token refresh
async function handleRefresh(request: NextRequest) {
  // Get refresh token from cookie or body
  let refreshToken = request.cookies.get('cp_refresh_token')?.value;

  // Also check body for API clients
  if (!refreshToken) {
    const body = await request.json().catch(() => ({}));
    refreshToken = body.refresh_token;
  }

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'Refresh token required' },
      { status: 401 }
    );
  }

  const result = await refreshTokens(refreshToken);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
    },
  });

  // Update refresh token cookie
  if (result.refreshToken) {
    response.cookies.set('cp_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
  }

  return response;
}

// Export GET for logout
export { POST as GET };
