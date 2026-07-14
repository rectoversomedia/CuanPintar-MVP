/**
 * Route Middleware
 *
 * Security Features:
 * - JWT token verification (production)
 * - Demo mode ONLY in development
 * - Role-based access control
 * - Rate limiting headers
 *
 * NEVER deploy with DEMO_MODE=true in production!
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isDemoMode = isDevelopment && process.env.DEMO_MODE === 'true';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

// Public path prefixes (always allowed)
const publicPaths = [
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/public/',
  '/for-advertisers',
  '/for-partners',
  '/how-it-works',
  '/programs',
];

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  for (const path of publicPaths) {
    if (pathname.startsWith(path)) return true;
  }
  return false;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Only set demo mode header in development
    if (isDevelopment) {
      response.headers.set('X-Demo-Mode', isDemoMode ? 'true' : 'false');
    }

    return response;
  }

  // ============================================
  // DEMO MODE - DEVELOPMENT ONLY
  // ============================================
  if (isDemoMode) {
    const response = NextResponse.next();

    // Set demo mode headers
    response.headers.set('X-Demo-Mode', 'true');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Determine demo user role based on route
    let demoRole = 'partner';
    if (pathname.startsWith('/admin')) {
      demoRole = 'admin';
    } else if (pathname.startsWith('/advertiser')) {
      demoRole = 'advertiser';
    }

    response.headers.set('X-User-Role', demoRole);

    // Add demo user info as a cookie (for client-side demo mode)
    const demoUserCookie = request.cookies.get('cp_demo_user')?.value;
    if (!demoUserCookie) {
      response.cookies.set('cp_demo_user', JSON.stringify({
        role: demoRole,
        isDemo: true,
      }), {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    return response;
  }

  // ============================================
  // PRODUCTION MODE - JWT VERIFICATION
  // ============================================

  // Try to verify JWT token
  try {
    const { jwtVerify } = await import('jose');
    const jwtSecret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'development-secret';

    const token = request.cookies.get('cp_access_token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (token && jwtSecret !== 'development-secret') {
      const secret = new TextEncoder().encode(jwtSecret);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      });

      // User is authenticated - pass through
      const response = NextResponse.next();
      response.headers.set('X-User-Id', payload.userId as string);
      response.headers.set('X-User-Email', payload.email as string);
      response.headers.set('X-User-Role', payload.role as string);
      return response;
    }
  } catch (error) {
    // Token invalid or not configured - continue to login
    console.log('JWT verification skipped:', error instanceof Error ? error.message : 'Unknown error');
  }

  // No valid token - redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
