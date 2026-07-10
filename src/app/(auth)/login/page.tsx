'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Buildings,
  Users,
  ShieldCheck,
  Envelope,
  Lock,
  ArrowLeft,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Role = 'advertiser' | 'partner' | 'admin';

const colors = {
  primary: '#FF6B35',
  secondary: '#0066FF',
};

const DEMO_USERS = [
  {
    id: 'adv_001',
    email: 'sarah@tunaiku.com',
    name: 'Sarah Wijaya',
    role: 'advertiser' as Role,
    companyName: 'Tunaiku',
  },
  {
    id: 'part_001',
    email: 'budi@jakselnews.com',
    name: 'Budi Santoso',
    role: 'partner' as Role,
    companyName: 'JakselNews Media',
  },
  {
    id: 'admin_001',
    email: 'admin@cuanpintar.com',
    name: 'Admin User',
    role: 'admin' as Role,
    companyName: 'CuanPintar',
  },
];

function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 'advertiser' as Role,
      title: 'Advertiser',
      description: 'Launch campaigns and manage partners',
      icon: <Buildings size={32} weight="duotone" />,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'partner' as Role,
      title: 'Partner',
      description: 'Discover programs and earn commissions',
      icon: <Users size={32} weight="duotone" />,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      id: 'admin' as Role,
      title: 'Admin',
      description: 'Manage platform operations',
      icon: <ShieldCheck size={32} weight="duotone" />,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const handleDemoLogin = async (role: Role) => {
    setIsLoading(true);
    const user = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];

    // Store in localStorage for demo
    localStorage.setItem('cp_user', JSON.stringify(user));
    localStorage.setItem('cp_session', JSON.stringify({ demo: true }));

    // Redirect after short delay
    setTimeout(() => {
      router.push(`/${role}`);
    }, 300);
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1628] via-[#1a2a4a] to-[#0a1628] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="text-3xl font-bold">
              <span className="text-[#FF6B35]">cuan</span>
              <span className="text-[#0066FF]">pintar</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Customer Acquisition OS for Indonesia.
            <br />
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] bg-clip-text text-transparent">
              Create once. Distribute everywhere.
            </span>
          </h1>

          <div className="space-y-4 mt-12">
            <h3 className="text-lg font-semibold text-white">Why CuanPintar?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0066FF]" />
                100+ verified media partners across Indonesia
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                Multi-channel distribution to creators, affiliates & sales
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                Real-time tracking and fraud detection
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                Transparent payouts for all partners
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <blockquote className="text-gray-400 italic">
            "CuanPintar transformed how we manage acquisition across multiple channels.
            One program, everywhere."
          </blockquote>
          <p className="text-white mt-2 font-medium">Thomas Wijaya</p>
          <p className="text-gray-500 text-sm">Marketing Director, Tunaiku</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-2xl font-bold">
              <span className="text-[#FF6B35]">cuan</span>
              <span className="text-[#0066FF]">pintar</span>
            </span>
          </div>

          {!selectedRole ? (
            <>
              {/* Role Selection */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Select your role to continue</p>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#0066FF] hover:shadow-xl transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}
                      >
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                        <p className="text-gray-500 text-sm">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Demo Notice */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> This is a demo environment. No real authentication required.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Login Form */}
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to role selection
              </button>

              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br ${
                    selectedRole === 'advertiser'
                      ? 'from-blue-500 to-blue-600'
                      : selectedRole === 'partner'
                      ? 'from-purple-500 to-purple-600'
                      : 'from-orange-500 to-red-500'
                  } flex items-center justify-center text-white shadow-lg`}
                >
                  {selectedRole === 'advertiser' ? (
                    <Buildings size={32} weight="duotone" />
                  ) : selectedRole === 'partner' ? (
                    <Users size={32} weight="duotone" />
                  ) : (
                    <ShieldCheck size={32} weight="duotone" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign in as {selectedRole}
                </h2>
                <p className="text-gray-500">Enter your credentials to continue</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Envelope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      defaultValue={
                        selectedRole === 'advertiser'
                          ? 'sarah@tunaiku.com'
                          : selectedRole === 'partner'
                          ? 'budi@jakselnews.com'
                          : 'admin@cuanpintar.com'
                      }
                      className="pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      defaultValue="demo123"
                      className="pl-10 h-12 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-[#0066FF] hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="button"
                  onClick={() => handleDemoLogin(selectedRole)}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white font-semibold shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 0h12a8 8 0 010 16z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-sm text-yellow-700">
                  <p>
                    <strong>Advertiser:</strong> sarah@tunaiku.com
                  </p>
                  <p>
                    <strong>Partner:</strong> budi@jakselnews.com
                  </p>
                  <p>
                    <strong>Admin:</strong> admin@cuanpintar.com
                  </p>
                  <p className="mt-2">
                    <strong>Password:</strong> demo123
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-500">Loading...</span></div>}>
      <LoginPage />
    </Suspense>
  );
}
