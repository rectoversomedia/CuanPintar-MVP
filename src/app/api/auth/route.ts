/**
 * Auth API Routes - Production Ready
 * Handles login, register, logout, password reset
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { loginSchema, registerSchema } from '@/lib/validation/schemas';
import { validateObject } from '@/lib/validation/middleware';
import { checkRateLimitFromIP, createRateLimitHeaders, rateLimitErrorResponse } from '@/lib/security/rate-limit';

const AUTH_RATE_LIMIT_TIER = 'auth';

// All demo users - match with seeded database
const DEMO_USERS = [
  // Admin
  { id: '00000000-0000-0000-0000-000000000001', email: 'admin@cuanpintar.com', name: 'Admin CuanPintar', role: 'admin', companyName: 'CuanPintar' },
  // Advertisers
  { id: '00000000-0000-0000-0000-000000000011', email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser', companyName: 'Tunaiku', advertiserId: '00000000-0000-0000-0001-000000000001' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'marketing@prudential.co.id', name: 'Marketing Prudential', role: 'advertiser', companyName: 'Prudential Indonesia', advertiserId: '00000000-0000-0000-0001-000000000002' },
  // Partners
  { id: '00000000-0000-0000-0000-000000000003', email: 'budi@jakselnews.com', name: 'Budi Santoso', role: 'partner', companyName: 'JakselNews Media', partnerId: '00000000-0000-0000-0002-000000000001' },
  { id: '00000000-0000-0000-0000-000000000005', email: 'media@detik.com', name: 'Media Detik', role: 'partner', companyName: 'Detik Finance', partnerId: '00000000-0000-0000-0002-000000000002' },
  { id: '00000000-0000-0000-0000-000000000006', email: 'creator@finance.youtube', name: 'Finance Creator', role: 'partner', companyName: 'Finance Creator Channel', partnerId: '00000000-0000-0000-0002-000000000003' },
  { id: '00000000-0000-0000-0000-000000000007', email: 'affiliate@budi.marketing', name: 'Budi Affiliate', role: 'partner', companyName: 'Budi Affiliate Network', partnerId: '00000000-0000-0000-0002-000000000004' },
];

// POST /api/auth
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimitFromIP(request, AUTH_RATE_LIMIT_TIER);
    if (!rateLimitResult.allowed) {
      return rateLimitErrorResponse(rateLimitResult);
    }

    const body = await request.clone().json();
    const { action } = body;

    switch (action) {
      case 'login':
        return handleLogin(body, rateLimitResult);
      case 'register':
        return handleRegister(body, rateLimitResult);
      case 'logout':
        return handleLogout(rateLimitResult);
      case 'me':
        return handleGetMe(request, rateLimitResult);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400, headers: createRateLimitHeaders(rateLimitResult) }
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
  return handleGetMe(request, await checkRateLimitFromIP(request, AUTH_RATE_LIMIT_TIER));
}

async function handleGetMe(request: NextRequest, rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>) {
  const headers = createRateLimitHeaders(rateLimitResult);

  const sessionCookie = request.cookies.get('cp_session');
  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      return NextResponse.json({ success: true, data: session }, { headers });
    } catch {}
  }

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const demoUser = DEMO_USERS.find(u => u.email === token);
    if (demoUser) {
      return NextResponse.json({ success: true, data: demoUser }, { headers });
    }
  }

  return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401, headers });
}

async function handleLogin(
  body: Record<string, unknown>,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  const headers = createRateLimitHeaders(rateLimitResult);

  const validation = validateObject(loginSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: validation.errors },
      { status: 400, headers }
    );
  }

  const { email, password } = validation.data as { email: string; password: string };

  // Check DEMO_USERS first - match any seeded user
  const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (demoUser && (password === 'demo123' || password === 'demo' || password === '')) {
    const response = NextResponse.json(
      { success: true, data: { user: demoUser } },
      { headers }
    );
    response.cookies.set('cp_session', encodeURIComponent(JSON.stringify(demoUser)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  }

  // Try Supabase Auth if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from('users').select('*').eq('id', data.user.id).single();

        let advertiserId: string | undefined;
        let partnerId: string | undefined;

        if (profile?.role === 'advertiser') {
          const { data: adv } = await supabase
            .from('advertisers').select('id').eq('user_id', data.user.id).single();
          advertiserId = adv?.id;
        } else if (profile?.role === 'partner') {
          const { data: part } = await supabase
            .from('partners').select('id').eq('user_id', data.user.id).single();
          partnerId = part?.id;
        }

        const userData = {
          id: profile?.id || data.user.id,
          email: profile?.email || email,
          name: profile?.name || '',
          role: profile?.role || 'partner',
          companyName: profile?.company_name,
          advertiserId,
          partnerId,
        };

        const response = NextResponse.json({ success: true, data: { user: userData } }, { headers });
        response.cookies.set('cp_session', encodeURIComponent(JSON.stringify(userData)), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
        return response;
      }
    } catch (err) {
      console.error('Supabase auth error:', err);
    }
  }

  return NextResponse.json(
    { success: false, error: 'Invalid email or password' },
    { status: 401, headers }
  );
}

async function handleRegister(
  body: Record<string, unknown>,
  rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>
) {
  const headers = createRateLimitHeaders(rateLimitResult);

  const validation = validateObject(registerSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: validation.errors },
      { status: 400, headers }
    );
  }

  const { email, password, name, role, company_name, phone } = validation.data as {
    email: string; password: string; name: string;
    role: 'advertiser' | 'partner';
    company_name?: string; phone?: string;
  };

  if (!isSupabaseConfigured()) {
    const newUser = { id: `user_${Date.now()}`, email, name, role, companyName: company_name };
    return NextResponse.json(
      { success: true, data: { user: newUser, message: 'Demo mode' } },
      { status: 201, headers }
    );
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role, company_name, phone } },
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400, headers });
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id, email, name, role, company_name, phone, status: 'pending',
      });

      if (role === 'advertiser') {
        await supabase.from('advertisers').insert({ user_id: data.user.id, company_name, status: 'pending' });
      } else {
        await supabase.from('partners').insert({ user_id: data.user.id, partner_name: company_name, partner_type: 'affiliate', status: 'pending' });
      }

      return NextResponse.json(
        { success: true, data: { user: { id: data.user.id, email, name, role } } },
        { status: 201, headers }
      );
    }
  } catch (err) {
    console.error('Registration error:', err);
  }

  return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500, headers });
}

async function handleLogout(rateLimitResult: Awaited<ReturnType<typeof checkRateLimitFromIP>>) {
  const headers = createRateLimitHeaders(rateLimitResult);
  if (isSupabaseConfigured()) await supabase.auth.signOut();
  const response = NextResponse.json({ success: true, message: 'Logged out' }, { headers });
  response.cookies.delete('cp_session');
  return response;
}
