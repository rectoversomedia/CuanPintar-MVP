'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Shield, Eye, EyeOff, Smartphone, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Role = 'advertiser' | 'partner' | 'admin';
type LoginStep = 'role' | 'credentials' | '2fa';

interface LoginState {
  step: LoginStep;
  email: string;
  password: string;
  role: Role | null;
  tempToken?: string;
  requires2FA?: boolean;
  error?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as Role | null;

  const [state, setState] = useState<LoginState>({
    step: initialRole ? 'credentials' : 'role',
    email: '',
    password: '',
    role: initialRole,
    error: undefined,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'advertiser' as Role,
      title: 'Advertiser',
      description: 'Launch campaigns and manage partners',
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      id: 'partner' as Role,
      title: 'Partner',
      description: 'Discover programs and earn commissions',
      icon: <Users className="w-6 h-6" />,
    },
    {
      id: 'admin' as Role,
      title: 'Admin',
      description: 'Manage platform operations',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  const handleRoleSelect = (role: Role) => {
    setState((prev) => ({ ...prev, role, step: 'credentials', error: undefined }));
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setState((prev) => ({ ...prev, error: undefined }));

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: state.email,
          password: state.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setState((prev) => ({ ...prev, error: data.error || 'Login failed', isLoading: false }));
        setIsLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.data?.requires2FA) {
        setState((prev) => ({
          ...prev,
          tempToken: data.data.tempToken,
          requires2FA: true,
          step: '2fa',
          isLoading: false,
        }));
        setShow2FAInput(true);
        setIsLoading(false);
        return;
      }

      // Login successful
      if (state.role) {
        router.push(`/${state.role}`);
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Connection error. Please try again.' }));
    }

    setIsLoading(false);
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setState((prev) => ({ ...prev, error: undefined }));

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: twoFACode,
          temp_token: state.tempToken,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setState((prev) => ({ ...prev, error: data.error || '2FA verification failed' }));
        setIsLoading(false);
        return;
      }

      // 2FA successful, complete login
      if (state.role) {
        router.push(`/${state.role}`);
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Connection error. Please try again.' }));
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (state.step === 'credentials') {
      setState({ step: 'role', email: '', password: '', role: null, error: undefined });
    } else if (state.step === '2fa') {
      setState((prev) => ({ ...prev, step: 'credentials', requires2FA: false, error: undefined }));
      setShow2FAInput(false);
      setTwoFACode('');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xl font-bold text-white">C</span>
        </div>
        <span className="text-2xl font-semibold text-gray-900">CuanPintar</span>
      </div>

      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {state.step === 'role' && 'Welcome back'}
          {state.step === 'credentials' && `Sign in as ${state.role}`}
          {state.step === '2fa' && 'Two-Factor Authentication'}
        </h1>
        <p className="mt-2 text-gray-600">
          {state.step === 'role' && 'Select your role to access the demo'}
          {state.step === 'credentials' && 'Enter your credentials to continue'}
          {state.step === '2fa' && 'Enter the 6-digit code from your authenticator app'}
        </p>
      </div>

      {/* Error Alert */}
      {state.error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {/* Step 1: Role Selection */}
      {state.step === 'role' && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center"
              >
                <div className="mx-auto w-12 h-12 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mb-3">
                  {role.icon}
                </div>
                <div className="text-sm font-medium text-gray-900">{role.title}</div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </div>
        </>
      )}

      {/* Step 2: Credentials */}
      {state.step === 'credentials' && (
        <>
          <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700 mb-6">
            ← Back to role selection
          </button>

          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={state.email}
                onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-2"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={state.password}
                  onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Notice */}
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-sm text-amber-800">
              <strong>Demo:</strong> Use any demo account like sarah@tunaiku.com (advertiser), budi@jakselnews.com (partner), or admin@cuanpintar.com (admin). Password: demo123
            </p>
          </div>
        </>
      )}

      {/* Step 3: 2FA Verification */}
      {state.step === '2fa' && (
        <>
          <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-700 mb-6">
            ← Back to login
          </button>

          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div>
              <Label htmlFor="twofa-code">Verification Code</Label>
              <Input
                id="twofa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                className="mt-2 text-center text-2xl tracking-widest"
                required
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={twoFACode.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>

            <div className="text-center">
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                Use a recovery code instead
              </button>
            </div>
          </form>
        </>
      )}

      {/* Demo Mode Notice (always visible) */}
      <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Security:</strong> This demo uses simplified auth. Production includes 2FA (TOTP/SMS), session management, and brute-force protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1628] to-[#1a2d4a] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <span className="text-3xl font-semibold text-white">CuanPintar</span>
          </div>
          <p className="mt-6 text-xl text-blue-200 leading-relaxed">
            Customer Acquisition OS for Indonesia.<br />
            Create once. Distribute everywhere.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Why CuanPintar?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                100+ verified media partners across Indonesia
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Multi-channel distribution to creators, affiliates & sales
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Real-time tracking and fraud detection
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                Transparent payouts for all partners
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10">
            <p className="text-gray-300 italic">
              &quot;CuanPintar transformed how we manage acquisition across multiple channels. One program, everywhere.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                TW
              </div>
              <div>
                <div className="text-white font-medium">Thomas Wijaya</div>
                <div className="text-sm text-gray-400">Marketing Director, Tunaiku</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Suspense fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
