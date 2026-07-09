'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChartBar,
  Users,
  ShieldCheck,
  Lightning,
  Globe,
  TrendUp,
  CheckCircle,
  Buildings,
  Broadcast,
  Megaphone,
  Storefront,
  Handshake,
  CurrencyCircleDollar,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

// Brand Colors
const colors = {
  primary: '#FF6B35',
  secondary: '#0066FF',
  success: '#22C55E',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export default function HomePage() {
  const features = [
    {
      icon: <Broadcast size={28} weight="duotone" className="text-[#0066FF]" />,
      title: '100+ Media Partners',
      description: "Access Indonesia's largest media network including national news, finance, lifestyle, and niche verticals.",
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200',
    },
    {
      icon: <Users size={28} weight="duotone" className="text-[#8B5CF6]" />,
      title: 'Multi-Channel Distribution',
      description: 'Distribute your programs to creators, affiliates, sales teams, communities, and mission networks.',
      gradient: 'from-purple-50 to-purple-100/50',
      borderColor: 'border-purple-200',
    },
    {
      icon: <Storefront size={28} weight="duotone" className="text-[#FF6B35]" />,
      title: 'Partner Marketplace',
      description: 'Partners discover and join programs that match their audience and niche.',
      gradient: 'from-orange-50 to-orange-100/50',
      borderColor: 'border-orange-200',
    },
    {
      icon: <ChartBar size={28} weight="duotone" className="text-[#22C55E]" />,
      title: 'Tracking & Attribution',
      description: 'Real-time conversion tracking with detailed analytics for every channel.',
      gradient: 'from-green-50 to-green-100/50',
      borderColor: 'border-green-200',
    },
    {
      icon: <ShieldCheck size={28} weight="duotone" className="text-[#EF4444]" />,
      title: 'Fraud Detection',
      description: 'AI-powered fraud detection to protect your ad spend and ensure quality leads.',
      gradient: 'from-red-50 to-red-100/50',
      borderColor: 'border-red-200',
    },
    {
      icon: <CurrencyCircleDollar size={28} weight="duotone" className="text-[#F59E0B]" />,
      title: 'Transparent Payouts',
      description: 'Partners get paid fairly with clear commission structures and automated payouts.',
      gradient: 'from-yellow-50 to-yellow-100/50',
      borderColor: 'border-yellow-200',
    },
  ];

  const stats = [
    { value: '100+', label: 'Media Partners', icon: <Broadcast size={24} weight="duotone" />, color: colors.secondary },
    { value: '850+', label: 'Active Partners', icon: <Users size={24} weight="duotone" />, color: colors.purple },
    { value: '50+', label: 'Advertisers', icon: <Buildings size={24} weight="duotone" />, color: colors.primary },
    { value: '2M+', label: 'Conversions', icon: <TrendUp size={24} weight="duotone" />, color: colors.success },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-[#FF6B35]">cuan</span>
                <span className="text-[#0066FF]">pintar</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/programs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">For Partners</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Log In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white border-0 shadow-lg shadow-orange-500/25">
                  Start Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-blue-100 border border-orange-200 mb-6">
            <Lightning size={16} weight="fill" className="text-[#FF6B35]" />
            <span className="text-sm font-medium text-gray-700">Customer Acquisition OS untuk Indonesia</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#FF6B35] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              Create Once.
            </span>
            <br />
            <span className="text-gray-900">Distribute Everywhere.</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Build your acquisition program once and distribute it to 100+ media partners, creators, affiliates, sales teams, and trusted communities across Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] hover:opacity-90 text-white border-0 shadow-xl shadow-blue-500/25 px-8 py-6 text-lg font-semibold">
                <Buildings size={20} className="mr-2" weight="duotone" />
                Launch Advertiser Demo
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-200 hover:border-[#FF6B35] hover:bg-orange-50 px-8 py-6 text-lg font-semibold">
                <Handshake size={20} className="mr-2" weight="duotone" />
                Launch Partner Demo
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-200 hover:border-gray-400 px-8 py-6 text-lg font-semibold">
                <ShieldCheck size={20} className="mr-2" weight="duotone" />
                Launch Admin Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur mb-3">
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for <span className="bg-gradient-to-r from-[#FF6B35] to-[#0066FF] bg-clip-text text-transparent">Acquisition</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete operating system for managing your customer acquisition programs across all channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              >
                <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] via-[#EC4899] to-[#8B5CF6]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Scale Your Acquisition?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join 50+ advertisers already growing with CuanPintar
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl px-10 py-6 text-lg font-bold">
                  Get Started Free <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-2xl font-bold">
                <span className="text-[#FF6B35]">cuan</span>
                <span className="text-[#0066FF]">pintar</span>
              </span>
              <p className="text-gray-400 mt-2">Customer Acquisition Operating System</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/programs" className="hover:text-white transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="hover:text-white transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="hover:text-white transition-colors">For Partners</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; 2024 CuanPintar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
