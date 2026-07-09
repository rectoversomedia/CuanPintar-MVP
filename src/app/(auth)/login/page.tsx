'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Role = 'advertiser' | 'partner' | 'admin';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as Role | null;

  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (selectedRole) {
      router.push(`/${selectedRole}`);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-gray-600">
          Select your role to access the demo
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              selectedRole === role.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
              selectedRole === role.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {role.icon}
            </div>
            <div className="text-sm font-medium text-gray-900">{role.title}</div>
          </button>
        ))}
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
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
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>

      {/* Demo Notice */}
      <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Demo Mode:</strong> This is a demo environment. Select any role and click Sign In to explore the platform.
        </p>
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
