/**
 * Auth API Routes
 *
 * Endpoints:
 * POST /api/auth/login - Login with email/password
 * POST /api/auth/register - Register new user
 * POST /api/auth/logout - Logout
 * GET  /api/auth/me - Get current user
 * POST /api/auth/refresh - Refresh session
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Demo mode fallback
    if (!isSupabaseConfigured()) {
      return handleDemoAuth(action, body);
    }

    switch (action) {
      case 'login':
        return handleLogin(body);
      case 'register':
        return handleRegister(body);
      case 'logout':
        return handleLogout();
      case 'refresh':
        return handleRefresh();
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

    const { data: { user }, error } = await supabase.auth.getUser();

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

// Handler: Login
async function handleLogin(body: { email: string; password: string }) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  // Create session response
  const response = NextResponse.json({
    success: true,
    data: {
      user: profile,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    },
  });

  // Set session cookie
  response.cookies.set('cp_session', encodeURIComponent(JSON.stringify({
    userId: data.user.id,
    email: profile?.email,
    name: profile?.name,
    role: profile?.role,
    companyName: profile?.company_name,
  })), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

// Handler: Register
async function handleRegister(body: {
  email: string;
  password: string;
  name: string;
  role: 'advertiser' | 'partner';
  companyName?: string;
  phone?: string;
}) {
  const { email, password, name, role, companyName, phone } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        company_name: companyName,
        phone,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  if (data.user) {
    // Create user profile
    await supabase.from('users').insert({
      id: data.user.id,
      email,
      name,
      role,
      company_name: companyName,
      phone,
      status: 'pending',
    });

    // Create role-specific profile
    if (role === 'advertiser') {
      await supabase.from('advertisers').insert({
        user_id: data.user.id,
        company_name: companyName,
        status: 'pending',
      });
    } else {
      await supabase.from('partners').insert({
        user_id: data.user.id,
        partner_name: companyName,
        partner_type: 'affiliate',
        status: 'pending',
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      user: data.user,
      message: 'Registration successful. Please check your email for verification.',
    },
  }, { status: 201 });
}

// Handler: Logout
async function handleLogout() {
  await supabase.auth.signOut();

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

// Demo mode handler
function handleDemoAuth(action: string, body: Record<string, unknown>) {
  const DEMO_USERS = [
    { id: 'adv_001', email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser', companyName: 'Tunaiku' },
    { id: 'part_001', email: 'budi@jakselnews.com', name: 'Budi Santoso', role: 'partner', companyName: 'JakselNews Media' },
    { id: 'admin_001', email: 'admin@cuanpintar.com', name: 'Admin User', role: 'admin' },
  ];

  switch (action) {
    case 'login': {
      const { email } = body;
      const user = DEMO_USERS.find(u => u.email === email) || DEMO_USERS[0];

      const response = NextResponse.json({
        success: true,
        data: { user },
      });

      response.cookies.set('cp_session', encodeURIComponent(JSON.stringify(user)), {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }
    case 'register':
      return NextResponse.json({
        success: true,
        data: { user: body, message: 'Demo mode: User created' },
      }, { status: 201 });
    case 'logout':
      return NextResponse.json({ success: true, message: 'Demo logout' });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
