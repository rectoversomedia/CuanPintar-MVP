'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Target,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Radio,
  BarChart3,
  Clock,
  DollarSign,
  Globe,
  Star,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdvertiserLandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: <Radio className="w-6 h-6" />,
      title: '100+ Media Partners',
      description: 'Instant access to Indonesia\'s largest media network including national news, finance, and lifestyle publications.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-Channel Distribution',
      description: 'Reach audiences through creators, affiliates, sales teams, and communities - all in one platform.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Precision Targeting',
      description: 'Define your ideal customer with detailed audience parameters and channel preferences.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-Time Analytics',
      description: 'Track conversions, quality scores, and channel performance with live dashboards.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Fraud Protection',
      description: 'AI-powered fraud detection ensures you only pay for genuine, high-quality conversions.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Quick Launch',
      description: 'Create and publish your first program in under 10 minutes with our guided setup wizard.',
    },
  ];

  const advertisers = [
    { name: 'Tunaiku', industry: 'Financial Services', programs: 3 },
    { name: 'Prudential', industry: 'Insurance', programs: 2 },
    { name: 'XL Axiata', industry: 'Telecommunications', programs: 1 },
    { name: 'Pegadaian', industry: 'Financial Services', programs: 2 },
    { name: 'Bank Saqu', industry: 'Banking', programs: 2 },
    { name: 'IKEA', industry: 'Retail', programs: 1 },
  ];

  const testimonials = [
    {
      quote: "CuanPintar transformed how we manage acquisition across multiple channels. One program, everywhere.",
      name: "Thomas Wijaya",
      role: "Marketing Director",
      company: "Tunaiku",
    },
    {
      quote: "The fraud detection alone saved us millions in invalid conversions. Best platform we've used.",
      name: "Sarah Chen",
      role: "Head of Growth",
      company: "Prudential",
    },
    {
      quote: "Finally, a platform that gives us transparency and control over our partner network.",
      name: "Budi Santoso",
      role: "Digital Marketing Manager",
      company: "XL Axiata",
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Contact Us',
      description: 'For brands starting their acquisition journey',
      features: [
        'Up to 5 active programs',
        '100+ media partners access',
        'Basic analytics dashboard',
        'Email support',
        'Standard payout model',
      ],
    },
    {
      name: 'Growth',
      price: 'Contact Us',
      description: 'For scaling brands with multiple campaigns',
      features: [
        'Unlimited active programs',
        'Priority media partner access',
        'Advanced analytics & reports',
        'Dedicated account manager',
        'Custom payout models',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Growth',
        'White-label solutions',
        'Custom integrations',
        'SLA guarantees',
        '24/7 priority support',
        'Onboarding & training',
      ],
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
              <Link href="/for-partners" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Partners</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login?role=advertiser">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                <Zap className="w-3 h-3 mr-1" />
                Customer Acquisition OS
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Launch Your Acquisition Program<br />
                <span className="text-blue-600">In Minutes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create one program and distribute it across 100+ verified media partners, creators, affiliates, sales teams, and communities across Indonesia.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/login?role=advertiser">
                  <Button size="lg" className="text-base px-8">
                    Start Free Demo
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
                  <div className="text-3xl font-bold text-gray-900">100+</div>
                  <div className="text-sm text-gray-500">Media Partners</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">850+</div>
                  <div className="text-sm text-gray-500">Active Partners</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">2M+</div>
                  <div className="text-sm text-gray-500">Conversions</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl transform rotate-3"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">T</div>
                    <div>
                      <div className="font-semibold text-gray-900">Tunaiku Registration Q3</div>
                      <div className="text-sm text-gray-500">Active</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">1,234</div>
                      <div className="text-xs text-gray-500">Conversions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">Rp 24K</div>
                      <div className="text-xs text-gray-500">Avg CPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">87%</div>
                      <div className="text-xs text-gray-500">Quality</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Radio className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Media Network</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Best</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Creators</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium">Affiliates</span>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by leading brands in Indonesia</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {advertisers.map((brand) => (
              <div key={brand.name} className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white border border-gray-200">
                <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{brand.name}</div>
                  <div className="text-xs text-gray-500">{brand.industry}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
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

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Launch your first program in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">1</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 bg-white h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Program</h3>
                <p className="text-gray-600 mb-4">
                  Define your objectives, target audience, budget, and payout model using our guided wizard.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Multiple objective types
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Detailed targeting
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Flexible budget options
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">2</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 bg-white h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Distribute Everywhere</h3>
                <p className="text-gray-600 mb-4">
                  Your program automatically reaches our verified partner network across all channels.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    100+ media partners
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    500+ creators
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Quality-assured partners
                  </li>
                </ul>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">3</div>
              <div className="pt-8 p-6 rounded-xl border border-gray-200 bg-white h-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Track & Optimize</h3>
                <p className="text-gray-600 mb-4">
                  Monitor performance in real-time and optimize your acquisition strategy.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Real-time dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Channel analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Fraud protection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Advertisers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pay only for results. No hidden fees, no minimum commitments.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={plan.popular ? 'border-blue-500 shadow-lg ring-2 ring-blue-500' : ''}>
                <CardContent className="p-6">
                  {plan.popular && (
                    <Badge className="mb-4 bg-blue-600">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{plan.price}</p>
                  <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Scale Your Acquisition?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading brands who are already growing with CuanPintar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=advertiser">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Start Free Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 border-white text-white hover:bg-white/10">
              Talk to Sales
            </Button>
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
              <Link href="/for-partners" className="hover:text-white transition-colors">Partners</Link>
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
