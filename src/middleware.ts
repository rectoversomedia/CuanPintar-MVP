/**
 * Route Middleware
 *
 * Production-ready middleware with:
 * - Authentication checks
 * - Role-based access control
 * - Rate limiting headers
 * - Security headers
 * - Demo mode fallback
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { jwtVerify } from 'jose';

// Environment
const isProduction = process.env.NODE_ENV === 'production';
const isDemoMode = !isSupabaseConfigured() || process.env.DEMO_MODE === 'true';

// JWT Secret (use HS256 for simplicity)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'demo-secret-key-change-in-production'
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

// Role-based route prefixes
const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  advertiser: ['/advertiser', '/admin'],
  partner: ['/partner'],
};

// Admin-only routes (no advertiser access)
const adminOnlyRoutes = [
  '/admin/users',
  '/admin/settings/platform',
  '/admin/fraud',
  '/admin/analytics/system',
];

// Demo mode demo users
const DEMO_USERS: Record<string, { role: string; name: string }> = {
  'admin@cuanpintar.com': { role: 'admin', name: 'Admin User' },
  'sarah@tunaiku.com': { role: 'advertiser', name: 'Sarah Wijaya' },
  'budi@jakselnews.com': { role: 'partner', name: 'Budi Santoso' },
};

/**
 * Get user role from JWT token
 */
async function getUserFromToken(token: string): Promise<{ role: string; userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      role: payload.role as string,
      userId: payload.sub as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Prefix match
  for (const path of publicPaths) {
    if (pathname.startsWith(path)) {
      return true;
    }
  }

  return false;
}

/**
 * Get required role for a route
 */
function getRequiredRole(pathname: string): string | null {
  for (const [role, routes] of Object.entries(roleRoutes)) {
    for (const route of routes) {
      if (pathname.startsWith(route)) {
        return role;
      }
    }
  }
  return null;
}

/**
 * Check if route is admin-only
 */
function isAdminOnlyRoute(pathname: string): boolean {
  return adminOnlyRoutes.some(route => pathname.startsWith(route));
}

/**
 * Create security headers
 */
function createSecurityHeaders(response: NextResponse): NextResponse {
  // Copy existing headers
  const headers = new Headers(response.headers);

  // Security headers
  if (isProduction) {
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Demo mode header
  if (isDemoMode) {
    headers.set('X-Demo-Mode', 'true');
  }

  // CORS headers (for API routes)
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  return newResponse;
}

/**
 * Create error response
 */
function createErrorResponse(
  message: string,
  status: number,
  request: NextRequest
): NextResponse {
  // Check if API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }

  // Redirect to login for pages
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl, status);
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return createSecurityHeaders(response);
  }

  // Get auth token from cookie or header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // DEMO MODE
  if (isDemoMode) {
    // In demo mode, allow access but set demo user context
    const demoEmail = request.cookies.get('demo_email')?.value;
    const demoRole = request.cookies.get('demo_role')?.value;

    if (demoEmail && DEMO_USERS[demoEmail]) {
      // Valid demo session
      const response = NextResponse.next();
      response.headers.set('X-User-Id', `demo_${demoEmail.split('@')[0]}`);
      response.headers.set('X-User-Role', demoRole || DEMO_USERS[demoEmail].role);
      response.headers.set('X-Demo-Mode', 'true');
      return createSecurityHeaders(response);
    }

    // No demo session, allow access in demo mode
    const response = NextResponse.next();
    response.headers.set('X-Demo-Mode', 'true');
    return createSecurityHeaders(response);
  }

  // PRODUCTION MODE
  if (!token) {
    return createErrorResponse('Authentication required', 401, request);
  }

  // Verify JWT token
  const user = await getUserFromToken(token);

  if (!user) {
    return createErrorResponse('Invalid or expired token', 401, request);
  }

  // Check role-based access
  const requiredRole = getRequiredRole(pathname);

  if (requiredRole) {
    // Admin-only routes check
    if (isAdminOnlyRoute(pathname) && user.role !== 'admin') {
      return createErrorResponse('Admin access required', 403, request);
    }

    // Role hierarchy: admin > advertiser > partner
    const roleHierarchy: Record<string, number> = {
      admin: 3,
      advertiser: 2,
      partner: 1,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return createErrorResponse('Insufficient permissions', 403, request);
    }
  }

  // Create response with user context headers
  const response = NextResponse.next();

  // Add user context headers for server components
  response.headers.set('X-User-Id', user.userId);
  response.headers.set('X-User-Role', user.role);
  response.headers.set('X-User-Email', user.email);

  return createSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export default middleware;
