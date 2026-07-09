'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Radio,
  Star,
  Target,
  Clock,
  Gift,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PartnerLandingPage() {
  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Earn Commission',
      description: 'Get paid for every valid conversion you drive. Transparent pricing with no hidden fees.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Weekly Payouts',
      description: 'Receive your earnings weekly via bank transfer, GoPay, OVO, or Dana.',
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Free Assets',
      description: 'Access ready-to-use banners, copy, and landing pages for every program.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Trusted Brands',
      description: 'Partner with Indonesia\'s leading brands in finance, telco, retail, and more.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Grow Your Audience',
      description: 'Monetize your existing audience without creating new content.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Start',
      description: 'Join programs and get tracking links in under 5 minutes.',
    },
  ];

  const partnerTypes = [
    {
      icon: <Radio className="w-8 h-8" />,
      title: 'Media Networks',
      description: 'News sites, blogs, and content platforms',
      count: '100+ partners',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Creators',
      description: 'YouTubers, TikTokers, and Instagram influencers',
      count: '500+ partners',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Affiliates',
      description: 'Coupon sites, deal platforms, and review sites',
      count: '200+ partners',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sales Teams',
      description: 'Canvassing teams and direct sales organizations',
      count: '50+ partners',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const programs = [
    { brand: 'Tunaiku', objective: 'Registration', payout: 25000, type: 'CPA' },
    { brand: 'Prudential', objective: 'Lead Form', payout: 50000, type: 'CPL' },
    { brand: 'XL Axiata', objective: 'Purchase', payout: 15000, type: 'CPA' },
    { brand: 'Pegadaian', objective: 'App Download', payout: 20000, type: 'CPI' },
    { brand: 'Bank Saqu', objective: 'Registration', payout: 35000, type: 'CPA' },
  ];

  const testimonials = [
    {
      quote: "We earned Rp 15 juta in just 3 months by promoting financial products to our audience. Best affiliate program we've joined.",
      name: "JakselNews Media",
      type: "Media Partner",
      earnings: "Rp 15M+ earned",
    },
    {
      quote: "The creative assets make it so easy. We just share the banners and tracking links - conversions happen automatically.",
      name: "Finance Creator ID",
      type: "Creator Partner",
      earnings: "Rp 8M+ earned",
    },
    {
      quote: "Weekly payouts and transparent tracking. Finally, an affiliate platform that actually pays on time.",
      name: "Parenting Community",
      type: "Community Partner",
      earnings: "Rp 5M+ earned",
    },
  ];

  const faqs = [
    {
      question: 'How do I join as a partner?',
      answer: 'Simply sign up for a free account, browse available programs in the marketplace, and click "Join" on any program you\'re interested in. You\'ll get your unique tracking link immediately.',
    },
    {
      question: 'When do I get paid?',
      answer: 'Payouts are processed weekly for approved conversions. You can choose to receive payment via bank transfer, GoPay, OVO, or Dana.',
    },
    {
      question: 'What\'s the minimum payout threshold?',
      answer: 'The minimum payout threshold is Rp 100,000. Once you reach this amount, you can request a withdrawal.',
    },
    {
      question: 'How are conversions tracked?',
      answer: 'Every user who clicks your unique tracking link is tracked through cookies and attributed to your account. Conversions are validated within 24-48 hours.',
    },
    {
      question: 'What happens if a conversion is flagged as fraud?',
      answer: 'Conversions that don\'t pass our fraud detection are marked as invalid and won\'t be paid. We use AI-powered fraud detection to protect both advertisers and honest partners.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">CuanPintar</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/programs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">For Advertisers</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login?role=partner">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
              <Button size="sm">Join Free</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
                <DollarSign className="w-3 h-3 mr-1" />
                Earn by Promoting Great Products
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Turn Your Audience Into<br />
                <span className="text-green-600">Earnings</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join Indonesia&apos;s fastest-growing partner network. Promote top brands, earn commission for every conversion, get paid weekly.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/login?role=partner">
                  <Button size="lg" className="text-base px-8 bg-green-600 hover:bg-green-700">
                    Start Earning Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-base px-8">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-gray-900">850+</div>
                  <div className="text-sm text-gray-500">Active Partners</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">100+</div>
                  <div className="text-sm text-gray-500">Programs</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-green-600">Rp 15M+</div>
                  <div className="text-sm text-gray-500">Paid to Partners</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-400 rounded-2xl transform rotate-2"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6">
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold">$</div>
                      <div>
                        <div className="font-semibold text-gray-900">Your Earnings</div>
                        <div className="text-sm text-gray-500">This Month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">Rp 3,250,000</div>
                      <div className="text-sm text-green-600">+18% from last month</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">47</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">42</div>
                      <div className="text-xs text-gray-500">Valid</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-lg font-bold text-yellow-600">5</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">T</div>
                      <span className="text-sm font-medium">Tunaiku Registration</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">Rp 1,250,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">P</div>
                      <span className="text-sm font-medium">Prudential Lead</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">Rp 1,000,000</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">X</div>
                      <span className="text-sm font-medium">XL eSIM Purchase</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">Rp 1,000,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who Can Join?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re a media company, content creator, or sales team - there&apos;s a place for you on CuanPintar.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTypes.map((type, index) => (
              <Card key={index} className="text-center p-6 card-hover">
                <CardContent>
                  <div className={`w-16 h-16 rounded-2xl ${type.color} flex items-center justify-center mx-auto mb-4`}>
                    {type.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <Badge variant="secondary">{type.count}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Available Programs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Programs
            </h2>
            <p className="text-lg text-gray-600">
              Join high-converting programs from trusted brands
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div>Brand</div>
              <div>Objective</div>
              <div className="text-right">Payout</div>
              <div className="text-right">Model</div>
            </div>
            {programs.map((program, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {program.brand.charAt(0)}
                  </div>
                  <span className="font-medium">{program.brand}</span>
                </div>
                <div>
                  <Badge variant="secondary">{program.objective}</Badge>
                </div>
                <div className="text-right font-bold text-green-600">
                  Rp {program.payout.toLocaleString()}
                </div>
                <div className="text-right">
                  <Badge variant="outline">{program.type}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/programs">
              <Button variant="outline" size="lg">
                View All Programs
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Partners Love CuanPintar
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Partner Success Stories
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <span className="text-lg font-bold text-green-600">{testimonial.earnings}</span>
                  </div>
                  <p className="text-gray-700 mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.type}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Earning Today
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join 850+ partners who are already earning with CuanPintar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=partner">
              <Button size="lg" className="text-base px-8 bg-white text-green-600 hover:bg-green-50">
                Join as Partner - It&apos;s Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-white">CuanPintar</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/programs" className="hover:text-white transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="hover:text-white transition-colors">For Advertisers</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
            <div className="text-sm">
              &copy; 2024 CuanPintar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
