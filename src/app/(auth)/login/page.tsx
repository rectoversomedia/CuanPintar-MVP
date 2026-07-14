'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  ShieldCheck,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Role = 'advertiser' | 'partner' | 'admin';

const DEMO_USERS = [
  { id: '00000000-0000-0000-0000-000000000011', email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser' as Role, companyName: 'Tunaiku' },
  { id: '00000000-0000-0000-0000-000000000021', email: 'media@kompas.com', name: 'Media Partner Jakarta', role: 'partner' as Role, companyName: 'Kompas Media' },
  { id: '00000000-0000-0000-0000-000000000001', email: 'admin@cuanpintar.com', name: 'Admin CuanPintar', role: 'admin' as Role, companyName: 'CuanPintar' },
];

const roles = [
  { id: 'advertiser' as Role, title: 'Advertiser', description: 'Launch campaigns and manage partners', icon: Building2, gradient: 'from-indigo-500 to-indigo-600' },
  { id: 'partner' as Role, title: 'Partner', description: 'Discover programs and earn commissions', icon: Users, gradient: 'from-purple-500 to-purple-600' },
  { id: 'admin' as Role, title: 'Admin', description: 'Manage platform operations', icon: ShieldCheck, gradient: 'from-rose-500 to-rose-600' },
];

const benefits = [
  '100+ verified media partners',
  'Multi-channel distribution',
  'Real-time tracking & fraud detection',
  'Transparent payouts',
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('credentials');
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (demoUser) {
      setEmail(demoUser.email);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data?.user || { email, role: selectedRole };
        localStorage.setItem('cp_user', JSON.stringify(userData));
        localStorage.setItem('cp_session', JSON.stringify({ authenticated: true }));
        router.push(`/${selectedRole}`);
      } else {
        handleDemoLogin();
      }
    } catch {
      handleDemoLogin();
    }
  };

  const handleDemoLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setError(null);

    try {
      const user = DEMO_USERS.find((u) => u.role === selectedRole);
      if (user) {
        localStorage.setItem('cp_user', JSON.stringify(user));
        localStorage.setItem('cp_session', JSON.stringify({ authenticated: true, isDemo: true }));
        router.push(`/${selectedRole}`);
      } else {
        setError('Demo user not found');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('role');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--sidebar-bg)] via-[#0F172A] to-[#1E293B] p-12 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--secondary)]/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-40 h-12"
            >
              <Image
                src="/logo.png"
                alt="CuanPintar"
                fill
                className="object-contain object-left"
                unoptimized
              />
            </motion.div>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Customer Acquisition OS
                <br />
                <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
                  for Indonesia.
                </span>
              </h1>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  </div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Footer */}
          <div className="text-white/40 text-sm">
            © 2024 CuanPintar. All rights reserved.
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="relative w-36 h-10">
              <Image
                src="/logo.png"
                alt="CuanPintar"
                fill
                className="object-contain object-left"
                unoptimized
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-[var(--foreground)]">Welcome Back</h2>
                  <p className="text-[var(--foreground-muted)] mt-2">Select your role to continue</p>
                </div>

                {/* Role Cards */}
                <div className="space-y-4">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleRoleSelect(role.id)}
                        className="w-full p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:shadow-lg transition-all duration-300 group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                            <role.icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                              {role.title}
                            </h3>
                            <p className="text-sm text-[var(--foreground-muted)]">{role.description}</p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Demo Notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 rounded-xl bg-[var(--primary-50)] border border-[var(--primary-100)]"
                >
                  <p className="text-sm font-medium text-[var(--primary-700)] mb-1">Demo Mode Available</p>
                  <p className="text-xs text-[var(--primary-600)]">Select a role and click "Continue as Demo" to explore</p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to role selection</span>
                </button>

                {/* Header */}
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedRole === 'advertiser' ? 'from-indigo-500 to-indigo-600' : selectedRole === 'partner' ? 'from-purple-500 to-purple-600' : 'from-rose-500 to-rose-600'} flex items-center justify-center shadow-lg mx-auto mb-4`}>
                    {selectedRole === 'advertiser' && <Building2 className="w-8 h-8 text-white" />}
                    {selectedRole === 'partner' && <Users className="w-8 h-8 text-white" />}
                    {selectedRole === 'admin' && <ShieldCheck className="w-8 h-8 text-white" />}
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Sign in as {selectedRole}</h2>
                  <p className="text-[var(--foreground-muted)] mt-1">Enter your credentials</p>
                </div>

                {/* Form */}
                <Card className="border-[var(--border)]">
                  <CardContent className="p-6 space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)]">Password</label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="mt-1.5"
                        />
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-[var(--danger)]"
                        >
                          {error}
                        </motion.p>
                      )}

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-[var(--border)]" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[var(--card)] px-2 text-[var(--foreground-muted)]">or</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                    >
                      Continue as {selectedRole} (Demo)
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
