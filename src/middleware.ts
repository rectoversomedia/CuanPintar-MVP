/**
 * Route Middleware
 *
 * For demo mode - allows all routes
 * In production, add proper authentication checks
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
];

// Public path prefixes
const publicPaths = [
  '/api/',
  '/_next/',
  '/for-advertisers',
  '/for-partners',
  '/how-it-works',
  '/programs',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes in demo mode
  // In production, add proper authentication here
  const response = NextResponse.next();

  // Add demo mode header
  response.headers.set('x-demo-mode', 'true');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
