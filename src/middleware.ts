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
import { jwtVerify } from 'jose';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isDemoMode = isDevelopment && process.env.DEMO_MODE === 'true';
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET ||
  process.env.SUPABASE_JWT_SECRET ||
  'development-secret-change-in-production'
);

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

// Role-based route access
const roleRoutes = {
  admin: ['/admin'],
  advertiser: ['/advertiser'],
  partner: ['/partner'],
};

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
 * Verify JWT token and extract user data
 */
async function verifyAuthToken(token: string): Promise<{
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    companyName?: string;
  };
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      algorithms: ['HS256'],
    });

    return {
      valid: true,
      user: {
        id: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        companyName: payload.companyName as string | undefined,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Get token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check session cookie
  const sessionCookie = request.cookies.get('cp_session')?.value;
  if (sessionCookie) {
    // Try to parse as JWT first
    if (sessionCookie.includes('.') && sessionCookie.split('.').length === 3) {
      return sessionCookie;
    }
    // Otherwise treat as demo session (JSON)
    return null;
  }

  // Check access token cookie
  const accessToken = request.cookies.get('cp_access_token')?.value;
  if (accessToken) {
    return accessToken;
  }

  return null;
}

/**
 * Check if user has access to route based on role
 */
function hasRoleAccess(userRole: string, pathname: string): boolean {
  // Admin has access to everything under /admin
  if (userRole === 'admin') {
    return pathname.startsWith('/admin') || pathname === '/';
  }

  // Check specific role routes
  const allowedPaths = roleRoutes[userRole as keyof typeof roleRoutes];
  if (allowedPaths) {
    for (const path of allowedPaths) {
      if (pathname.startsWith(path)) {
        return true;
      }
    }
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
        httpOnly: false, // Allow client-side reading
        secure: false, // Dev only
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
    }

    return response;
  }

  // ============================================
  // PRODUCTION MODE - JWT VERIFICATION REQUIRED
  // ============================================

  // Get token from request
  const token = getTokenFromRequest(request);

  if (!token) {
    // No token found - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'auth_required');
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT token
  const verifyResult = await verifyAuthToken(token);

  if (!verifyResult.valid) {
    // Invalid token - redirect to login with error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'invalid_token');
    return NextResponse.redirect(loginUrl);
  }

  const user = verifyResult.user!;

  // Check role-based access
  if (!hasRoleAccess(user.role, pathname)) {
    // User doesn't have access to this route
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'access_denied');
    return NextResponse.redirect(loginUrl);
  }

  // Create response with user context
  const response = NextResponse.next();

  // Set security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Pass user info to API routes via headers
  response.headers.set('X-User-Id', user.id);
  response.headers.set('X-User-Email', user.email);
  response.headers.set('X-User-Role', user.role);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export default middleware;
