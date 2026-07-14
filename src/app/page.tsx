'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle,
  Building2,
  Radio,
  HandshakeIcon,
  CircleDollarSign,
  Star,
  Users,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

export default function HomePage() {
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Radio,
      title: '100+ Media Partners',
      description: 'Access Indonesia\'s largest media network including national news, finance, lifestyle, and niche verticals.',
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.08)',
    },
    {
      icon: Users,
      title: 'Multi-Channel Distribution',
      description: 'Distribute programs to creators, affiliates, sales teams, communities, and mission networks.',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
    },
    {
      icon: HandshakeIcon,
      title: 'Partner Marketplace',
      description: 'Partners discover and join programs that match their audience and niche.',
      color: '#F43F5E',
      bgColor: 'rgba(244, 63, 94, 0.08)',
    },
    {
      icon: BarChart3,
      title: 'Tracking & Attribution',
      description: 'Real-time conversion tracking with detailed analytics for every channel.',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      icon: ShieldCheck,
      title: 'Fraud Detection',
      description: 'Rule-based heuristics to protect your ad spend and ensure quality leads.',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.08)',
    },
    {
      icon: CircleDollarSign,
      title: 'Transparent Payouts',
      description: 'Partners get paid fairly with clear commission structures and automated payouts.',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  const stats = [
    { value: '100+', label: 'Media Partners', icon: Radio },
    { value: '850+', label: 'Active Partners', icon: Users },
    { value: '50+', label: 'Advertisers', icon: Building2 },
    { value: '2M+', label: 'Conversions', icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: 'Sarah Wijaya',
      role: 'Marketing Director',
      company: 'Tunaiku',
      avatar: 'SW',
      content: 'CuanPintar transformed how we manage acquisition across multiple channels. One program, everywhere.',
      rating: 5,
    },
    {
      name: 'Budi Santoso',
      role: 'Publisher',
      company: 'JakselNews Media',
      avatar: 'BS',
      content: 'The partner dashboard is incredibly intuitive. I can track all my conversions and earnings in real-time.',
      rating: 5,
    },
    {
      name: 'Andi Pratama',
      role: 'Growth Lead',
      company: 'Prudential Indonesia',
      avatar: 'AP',
      content: 'The fraud detection is top-notch. We\'ve seen a 40% improvement in lead quality since switching.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="CuanPintar"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">CuanPintar</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/programs" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">For Partners</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                  Log In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90">
                  Start Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-[var(--secondary)]/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-50)] border border-[var(--primary-200)] text-[var(--primary-700)] text-sm font-medium">
                <Zap className="w-4 h-4" />
                Customer Acquisition OS untuk Indonesia
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="text-[var(--foreground)]">Create Once.</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
                Distribute Everywhere.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-10">
              Build your acquisition program once and distribute it to 100+ media partners, creators, affiliates, sales teams, and communities across Indonesia.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2 text-base px-8 h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90">
                  <Building2 className="w-5 h-5" />
                  Launch Advertiser Demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12 border-2">
                  <HandshakeIcon className="w-5 h-5" />
                  Launch Partner Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--foreground-subtle)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
                SOC 2 Compliant
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[var(--primary)]" />
                Made in Indonesia
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--secondary)]" />
                50+ Companies Trust Us
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-[var(--primary)]/10">
              {/* Window Controls */}
              <div className="bg-[var(--sidebar-bg)] p-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              {/* Dashboard Preview */}
              <div className="bg-gradient-to-br from-[var(--sidebar-bg)] to-[#1E293B] p-8">
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/10 backdrop-blur rounded-xl p-4"
                  >
                    <p className="text-white/60 text-xs mb-1">Total Conversions</p>
                    <p className="text-white text-2xl font-bold">2.4M</p>
                    <p className="text-green-400 text-xs mt-1">+23% from last month</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/10 backdrop-blur rounded-xl p-4"
                  >
                    <p className="text-white/60 text-xs mb-1">Active Partners</p>
                    <p className="text-white text-2xl font-bold">850+</p>
                    <p className="text-blue-400 text-xs mt-1">+45 new this week</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/10 backdrop-blur rounded-xl p-4"
                  >
                    <p className="text-white/60 text-xs mb-1">Revenue Generated</p>
                    <p className="text-white text-2xl font-bold">Rp 12.8B</p>
                    <p className="text-purple-400 text-xs mt-1">+18% from last month</p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -left-4 top-1/4 hidden lg:block"
            >
              <div className="bg-white rounded-xl shadow-xl border border-[var(--border)] p-4 w-48">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--foreground-muted)]">Conversion</p>
                    <p className="text-sm font-semibold text-[var(--success)]">+Rp 125,000</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -right-4 top-1/3 hidden lg:block"
            >
              <div className="bg-white rounded-xl shadow-xl border border-[var(--border)] p-4 w-48">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)]">Conversion Rate</p>
                </div>
                <p className="text-xl font-bold text-[var(--success)]">12.4%</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-[var(--sidebar-bg)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--secondary)]/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
                  <stat.icon className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[var(--primary)] font-semibold text-sm tracking-wide uppercase">
              Features
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mt-3 mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                Acquisition
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto">
              A complete operating system for managing your customer acquisition programs across all channels.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-xl hover:border-[var(--primary-200)] transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-[var(--background-secondary)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.span variants={fadeInUp} className="text-[var(--primary)] font-semibold text-sm tracking-wide uppercase">
              Testimonials
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mt-3">
              Loved by Teams
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[var(--warning)] text-[var(--warning)]" />
                  ))}
                </div>
                <p className="text-[var(--foreground)] mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="ctaGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ctaGrid)" />
              </svg>
            </div>

            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Scale Your Acquisition?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join 50+ advertisers already growing with CuanPintar
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-white text-[var(--primary)] hover:bg-white/90 gap-2 h-12 px-8 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 gap-2 h-12 px-8"
                >
                  <Star className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--sidebar-bg)] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="CuanPintar"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold">CuanPintar</span>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <Link href="/programs" className="hover:text-white transition-colors">Marketplace</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/for-advertisers" className="hover:text-white transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="hover:text-white transition-colors">For Partners</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
            © 2024 CuanPintar. All rights reserved by Recto Vero Media.
          </div>
        </div>
      </footer>
    </div>
  );
}
