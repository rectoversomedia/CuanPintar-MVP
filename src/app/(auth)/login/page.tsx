'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Role = 'advertiser' | 'partner' | 'admin';

const DEMO_USERS = [
  { id: 'adv_001', email: 'sarah@tunaiku.com', name: 'Sarah Wijaya', role: 'advertiser' as Role, companyName: 'Tunaiku' },
  { id: 'part_001', email: 'budi@jakselnews.com', name: 'Budi Santoso', role: 'partner' as Role, companyName: 'JakselNews Media' },
  { id: 'admin_001', email: 'admin@cuanpintar.com', name: 'Admin User', role: 'admin' as Role, companyName: 'CuanPintar' },
];

const roles = [
  { id: 'advertiser' as Role, title: 'Advertiser', description: 'Launch campaigns and manage partners', icon: Building2, gradient: 'from-[#6366F1] to-[#4F46E5]' },
  { id: 'partner' as Role, title: 'Partner', description: 'Discover programs and earn commissions', icon: Users, gradient: 'from-[#8B5CF6] to-[#7C3AED]' },
  { id: 'admin' as Role, title: 'Admin', description: 'Manage platform operations', icon: ShieldCheck, gradient: 'from-[#F43F5E] to-[#E11D48]' },
];

const features = [
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

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('credentials');
  };

  const handleDemoLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);

    const user = DEMO_USERS.find((u) => u.role === selectedRole);
    localStorage.setItem('cp_user', JSON.stringify(user));
    localStorage.setItem('cp_session', JSON.stringify({ demo: true, role: selectedRole, userId: user?.id }));

    // Set cookie for middleware auth check
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `cp_access_token=${user?.email}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    document.cookie = `cp_user_role=${selectedRole}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Left Panel - Branding - Dark */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>CuanPintar</span>
          </Link>

          {/* Hero Text */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Customer Acquisition OS<br />
              <span className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#F43F5E] bg-clip-text text-transparent">
                for Indonesia.
              </span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-md">
              Create once. Distribute everywhere. Manage your entire partner ecosystem from one platform.
            </p>

            {/* Features */}
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/80"
                >
                  <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  </div>
                  {feature}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10 border-t border-white/10 pt-6">
          <blockquote className="text-white/60 italic">
            &ldquo;CuanPintar transformed how we manage acquisition across multiple channels. One program, everywhere.&rdquo;
          </blockquote>
          <p className="text-white mt-3 font-medium">Sarah Wijaya</p>
          <p className="text-white/40 text-sm">Marketing Director, Tunaiku</p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form - Light */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--background)]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>CuanPintar</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div key="role-selection" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Welcome Back</h2>
                  <p className="text-[var(--foreground-muted)]">Select your role to continue</p>
                </div>

                {/* Role Cards */}
                <div className="space-y-4">
                  {roles.map((role, i) => (
                    <motion.div key={role.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <button
                        onClick={() => handleRoleSelect(role.id)}
                        className="w-full p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[#6366F1] hover:shadow-lg hover:shadow-[#6366F1]/10 transition-all duration-300 text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                            <role.icon size={28} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">{role.title}</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">{role.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[#6366F1] group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Demo Notice */}
                <div className="mt-6 p-4 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#6366F1]" />
                    <p className="text-sm font-medium text-[#6366F1]">Demo Mode Active</p>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">No authentication required. Click any role to explore.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Back Button */}
                <button onClick={() => setStep('role')} className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to role selection
                </button>

                {/* Role Badge */}
                <div className="flex items-center gap-3 mb-6">
                  {selectedRole && (
                    <>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.gradient} flex items-center justify-center text-white shadow-lg`}>
                        {(() => { const RoleIcon = roles.find(r => r.id === selectedRole)?.icon; return RoleIcon ? <RoleIcon size={24} /> : null; })()}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[var(--foreground)] capitalize">{selectedRole} Portal</h2>
                        <p className="text-sm text-[var(--foreground-muted)]">Enter your credentials to continue</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Login Form */}
                <Card className="p-6">
                  <CardContent className="space-y-4 p-0">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        defaultValue={selectedRole === 'advertiser' ? 'sarah@tunaiku.com' : selectedRole === 'partner' ? 'budi@jakselnews.com' : 'admin@cuanpintar.com'}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Password</label>
                      <Input type="password" placeholder="Enter password" defaultValue="demo123" className="h-12" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] bg-[var(--card)]" />
                        <span className="text-[var(--foreground-muted)]">Remember me</span>
                      </label>
                      <a href="#" className="text-[#6366F1] hover:underline">Forgot password?</a>
                    </div>

                    <Button onClick={handleDemoLogin} disabled={isLoading} className="w-full h-12 text-base font-semibold">
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 0h12a8 8 0 010 16z" /></svg>
                          Signing in...
                        </span>
                      ) : 'Sign In'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3 text-center">Demo Credentials</p>
                  <div className="grid grid-cols-3 gap-4 text-sm text-center">
                    <div>
                      <p className="text-[var(--foreground-muted)]">Advertiser</p>
                      <p className="text-[var(--foreground)] font-mono text-xs">sarah@tunaiku.com</p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground-muted)]">Partner</p>
                      <p className="text-[var(--foreground)] font-mono text-xs">budi@jakselnews.com</p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground-muted)]">Admin</p>
                      <p className="text-[var(--foreground)] font-mono text-xs">admin@cuanpintar.com</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
