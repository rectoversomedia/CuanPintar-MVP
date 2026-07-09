'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Users,
  Radio,
  Target,
  DollarSign,
  Shield,
  BarChart3,
  Clock,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HowItWorksPage() {
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
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">Log In</Button>
              </Link>
              <Link href="/login?role=advertiser">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4">How It Works</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple. Transparent. Effective.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            CuanPintar connects advertisers with acquisition partners through a simple, transparent platform.
            Here&apos;s how it works for everyone.
          </p>
        </div>
      </section>

      {/* Tabs for Advertiser vs Partner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Advertiser Flow */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-blue-600 text-white pb-16 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl text-white">For Advertisers</CardTitle>
                </div>
                <p className="text-blue-100">
                  Launch your acquisition program and reach thousands of partners in minutes.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 -mt-8">
                  {[
                    {
                      step: 1,
                      title: 'Create Your Program',
                      description: 'Use our guided wizard to define your campaign: objectives, target audience, budget, and payout model.',
                      icon: Target,
                    },
                    {
                      step: 2,
                      title: 'Set Your Payout',
                      description: 'Choose your payout model (CPA, CPL, CPI, CPS) and set your commission amount per conversion.',
                      icon: DollarSign,
                    },
                    {
                      step: 3,
                      title: 'Select Channels',
                      description: 'Choose which partner types you want to work with: Media, Creators, Affiliates, Sales, or Community.',
                      icon: Users,
                    },
                    {
                      step: 4,
                      title: 'Partners Join',
                      description: 'Our verified partner network sees your program and applies to promote it. You can auto-approve or review each partner.',
                      icon: Radio,
                    },
                    {
                      step: 5,
                      title: 'Track & Optimize',
                      description: 'Monitor real-time conversions, channel performance, and quality scores from your dashboard.',
                      icon: BarChart3,
                    },
                    {
                      step: 6,
                      title: 'Pay for Results',
                      description: 'Only pay when a valid conversion occurs. We handle fraud detection and partner payouts.',
                      icon: CreditCard,
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                  <Link href="/login?role=advertiser">
                    <Button className="w-full">
                      Start as Advertiser
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Partner Flow */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-600 text-white pb-16 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl text-white">For Partners</CardTitle>
                </div>
                <p className="text-green-100">
                  Discover programs, promote to your audience, and earn commission for every conversion.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 -mt-8">
                  {[
                    {
                      step: 1,
                      title: 'Browse Programs',
                      description: 'Explore the marketplace to find programs that match your audience and niche.',
                      icon: Target,
                    },
                    {
                      step: 2,
                      title: 'Apply & Get Link',
                      description: 'Join programs with one click and get your unique tracking link instantly.',
                      icon: Link,
                    },
                    {
                      step: 3,
                      title: 'Promote',
                      description: 'Use the creative assets provided and share your tracking link with your audience.',
                      icon: Users,
                    },
                    {
                      step: 4,
                      title: 'Track Conversions',
                      description: 'Monitor clicks, conversions, and pending approvals from your dashboard.',
                      icon: BarChart3,
                    },
                    {
                      step: 5,
                      title: 'Get Validated',
                      description: 'Conversions are validated by the advertiser (usually 24-48 hours).',
                      icon: Shield,
                    },
                    {
                      step: 6,
                      title: 'Receive Payout',
                      description: 'Weekly payouts via bank transfer, GoPay, OVO, or Dana. No minimums after Rp 100K.',
                      icon: CreditCard,
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                  <Link href="/login?role=partner">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Start as Partner
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Capabilities
            </h2>
            <p className="text-gray-600">
              Everything you need to run successful acquisition campaigns
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Fraud Protection',
                description: 'AI-powered fraud detection ensures you only pay for genuine conversions.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Track performance across all channels with live dashboards.',
              },
              {
                icon: Users,
                title: '100+ Media Partners',
                description: 'Access Indonesia\'s largest verified media network.',
              },
              {
                icon: Target,
                title: 'Precision Targeting',
                description: 'Define your ideal customer with detailed parameters.',
              },
              {
                icon: Clock,
                title: 'Quick Setup',
                description: 'Launch your first program in under 10 minutes.',
              },
              {
                icon: DollarSign,
                title: 'Transparent Pricing',
                description: 'Pay only for results. No hidden fees or minimums.',
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a &quot;Program&quot;?</AccordionTrigger>
              <AccordionContent>
                A Program is your acquisition campaign. It defines what you want to achieve (app install, registration, purchase, etc.),
                who you want to reach, and how much you&apos;re willing to pay per conversion. Think of it as your complete
                campaign package that can be distributed to multiple partner channels.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What are the payout models?</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>CPL (Cost Per Lead):</strong> Pay for each qualified lead form submission</li>
                  <li><strong>CPA (Cost Per Acquisition):</strong> Pay for each completed conversion (registration, purchase)</li>
                  <li><strong>CPI (Cost Per Install):</strong> Pay for each app download and install</li>
                  <li><strong>CPS (Cost Per Sale):</strong> Pay for each completed purchase</li>
                  <li><strong>Hybrid:</strong> Combination of models for different conversion types</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What partner types are available?</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Media Networks:</strong> News sites, blogs, content platforms (100+ partners)</li>
                  <li><strong>Creators:</strong> YouTubers, TikTokers, Instagram influencers</li>
                  <li><strong>Affiliates:</strong> Coupon sites, deal platforms, review sites</li>
                  <li><strong>Sales Canvassing:</strong> Direct sales teams and canvassing organizations</li>
                  <li><strong>Community:</strong> Online communities, forums, and groups</li>
                  <li><strong>Mission:</strong> Task-based user acquisition networks</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How does fraud detection work?</AccordionTrigger>
              <AccordionContent>
                Our AI-powered fraud detection system analyzes every conversion for suspicious patterns including duplicate IPs,
                device fingerprinting, velocity anomalies, invalid contact information, emulator usage, and VPN/proxy connections.
                Fraudulent conversions are flagged and won&apos;t be counted towards your payouts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>When do partners get paid?</AccordionTrigger>
              <AccordionContent>
                Partners receive payouts on a weekly basis for all approved conversions. The minimum payout threshold is Rp 100,000.
                Partners can choose to receive payments via bank transfer, GoPay, OVO, or Dana. Payout requests are processed
                every Monday for the previous week&apos;s approved conversions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>How do I track performance?</AccordionTrigger>
              <AccordionContent>
                Your dashboard provides real-time analytics including total conversions, valid conversions, pending validations,
                rejection rates, CPA trends, channel performance breakdown, and quality scores. Data is updated in real-time
                so you can make informed optimization decisions quickly.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of advertisers and partners already growing with CuanPintar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?role=advertiser">
              <Button size="lg" className="text-base px-8 bg-white text-blue-600 hover:bg-gray-100">
                Start as Advertiser
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login?role=partner">
              <Button size="lg" variant="outline" className="text-base px-8 border-white text-white hover:bg-white/10">
                Start as Partner
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
              <Link href="/for-advertisers" className="hover:text-white transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="hover:text-white transition-colors">For Partners</Link>
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
