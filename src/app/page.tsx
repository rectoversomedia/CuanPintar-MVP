'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Users, Shield, Zap, Globe, TrendingUp, CheckCircle2, Building2, Radio, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const features = [
    {
      icon: <Radio className="w-6 h-6" />,
      title: '100+ Media Partners',
      description: 'Access Indonesia\'s largest media network including national news, finance, lifestyle, and niche verticals.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-Channel Distribution',
      description: 'Distribute your programs to creators, affiliates, sales teams, communities, and mission networks.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Partner Marketplace',
      description: 'Partners discover and join programs that match their audience and niche.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Tracking & Attribution',
      description: 'Real-time conversion tracking with detailed analytics for every channel.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Fraud Detection',
      description: 'AI-powered fraud detection to protect your ad spend and ensure quality leads.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Transparent Payouts',
      description: 'Partners get paid fairly with clear commission structures and automated payouts.',
    },
  ];

  const advertisers = [
    { name: 'Tunaiku', logo: 'T' },
    { name: 'Prudential', logo: 'P' },
    { name: 'XL Axiata', logo: 'XL' },
    { name: 'Pegadaian', logo: 'P' },
    { name: 'AstraPay', logo: 'A' },
    { name: 'Bank Saqu', logo: 'B' },
  ];

  const partnerTypes = [
    { type: 'Media Networks', count: '100+', icon: <Radio className="w-5 h-5" /> },
    { type: 'Creators', count: '500+', icon: <Users className="w-5 h-5" /> },
    { type: 'Affiliates', count: '200+', icon: <CheckCircle2 className="w-5 h-5" /> },
    { type: 'Sales Teams', count: '50+', icon: <Building2 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">CuanPintar</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/programs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">For Partners</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Start Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Customer Acquisition OS for Indonesia
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Create Once.<br />
              <span className="text-blue-600">Distribute Everywhere.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Build one acquisition program and distribute it across 100+ verified media partners, creators, affiliates, sales teams, and communities across Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?role=advertiser">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Launch Advertiser Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login?role=partner">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Launch Partner Demo
                </Button>
              </Link>
              <Link href="/login?role=admin">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8">
                  Launch Admin Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">100+</div>
              <div className="text-sm text-gray-600 mt-1">Media Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">850+</div>
              <div className="text-sm text-gray-600 mt-1">Active Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600 mt-1">Advertisers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">2M+</div>
              <div className="text-sm text-gray-600 mt-1">Conversions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Acquisition
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete operating system for managing your customer acquisition programs across all channels.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section id="partners" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Access Indonesia&apos;s Largest Partner Network
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you&apos;re looking for media reach, creator influence, affiliate networks, or direct sales teams — we have verified partners across every channel.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {partnerTypes.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-600">{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl transform rotate-1"></div>
              <div className="relative bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Partner Ecosystem</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Radio className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Media Networks</span>
                    </div>
                    <span className="text-sm text-gray-600">100+ partners</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Creators</span>
                    </div>
                    <span className="text-sm text-gray-600">500+ partners</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Affiliates</span>
                      </div>
                      <span className="text-sm text-gray-600">200+ partners</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Sales Teams</span>
                    </div>
                    <span className="text-sm text-gray-600">50+ partners</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-teal-600" />
                      <span className="font-medium text-gray-900">Communities</span>
                    </div>
                    <span className="text-sm text-gray-600">150+ partners</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How CuanPintar Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple three-step process to launch and manage your acquisition programs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">1</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Program</h3>
                <p className="text-gray-600">
                  Define your objectives, target audience, budget, and payout model. Set up validation rules and fraud protection.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">2</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Distribute Everywhere</h3>
                <p className="text-gray-600">
                  Your program is automatically available to verified partners. Approve or invite specific partners to join.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">3</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Optimize</h3>
                <p className="text-gray-600">
                  Monitor conversions in real-time, analyze channel performance, and optimize your acquisition strategy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advertisers Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Leading Brands
            </h2>
            <p className="text-lg text-gray-400">
              Advertisers across industries use CuanPintar to scale their acquisition programs.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {advertisers.map((brand, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-4 rounded-lg bg-gray-800 text-white"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                  {brand.logo}
                </div>
                <span className="font-medium">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Scale Your Acquisition?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Start your free demo today and discover how CuanPintar can transform your customer acquisition strategy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=advertiser">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8">
                Launch Advertiser Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login?role=partner">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 border-white text-white hover:bg-white/10">
                Launch Partner Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-white">CuanPintar</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-500">
              &copy; 2024 CuanPintar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
