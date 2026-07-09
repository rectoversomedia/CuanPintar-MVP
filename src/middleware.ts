/**
 * Route Middleware
 *
 * Protects routes based on authentication and role
 * Redirects unauthenticated users to login
 * Redirects unauthorized users to their dashboard
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/how-it-works',
  '/for-advertisers',
  '/for-partners',
  '/programs',
  '/api/track',
  '/api/webhooks',
];

// Role-based route access
const roleRoutes: Record<string, string[]> = {
  '/advertiser': ['advertiser', 'admin'],
  '/partner': ['partner', 'admin'],
  '/admin': ['admin'],
};

// Demo mode: Check localStorage for auth
function isAuthenticated(request: NextRequest): { auth: boolean; role?: string; userId?: string } {
  // Check for session cookie
  const sessionCookie = request.cookies.get('cp_session');
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      return { auth: true, role: session.role, userId: session.userId };
    } catch {
      // Invalid session cookie
    }
  }

  return { auth: false };
}

// Get user role from cookie
function getUserRole(request: NextRequest): string | undefined {
  const sessionCookie = request.cookies.get('cp_session');
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      return session.role;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/track'))) {
    return NextResponse.next();
  }

  // Check authentication
  const { auth } = isAuthenticated(request);

  // Redirect to login if not authenticated
  if (!auth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const userRole = getUserRole(request);

  for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(routePrefix)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to user's appropriate dashboard
        const dashboardUrl = new URL(
          userRole === 'partner' ? '/partner' :
          userRole === 'advertiser' ? '/advertiser' : '/',
          request.url
        );
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
