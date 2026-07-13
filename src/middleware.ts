/**
 * Route Middleware
 *
 * Demo Mode: Allow all access without auth
 * Production: Requires authentication
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// DEMO_MODE=true means skip all auth checks
const isDemoMode = process.env.DEMO_MODE === 'true';

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
  const { pathname } = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    if (isDemoMode) {
      response.headers.set('X-Demo-Mode', 'true');
    }
    return response;
  }

  // In DEMO_MODE, allow all access
  if (isDemoMode) {
    const response = NextResponse.next();
    response.headers.set('X-Demo-Mode', 'true');

    // Set demo user context based on route
    const demoRole = pathname.startsWith('/admin') ? 'admin' :
                     pathname.startsWith('/advertiser') ? 'advertiser' : 'partner';
    response.headers.set('X-User-Role', demoRole);

    return response;
  }

  // Production mode - require auth
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export default middleware;
