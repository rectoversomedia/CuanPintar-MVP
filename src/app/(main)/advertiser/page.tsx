'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { formatCurrency, formatNumber } from '@/lib/mock-data';

// Mock data - in real app, this comes from API
const dashboardData = {
  active_programs: 3,
  total_conversions: 4827,
  average_cpa: 22500,
  fraud_risk: 'low',
  quality_score: 87,
  top_partner_type: 'media',
  ai_recommendation: 'Based on your campaign performance, we recommend increasing budget for the Tunaiku Registration program by 20%. Media partners are converting at 4.2% which is 2x industry average.',
};

const recentPrograms = [
  {
    id: 'prog_001',
    name: 'Tunaiku Download + Registration',
    brand_name: 'Tunaiku',
    advertiser_name: 'Sarah Wijaya',
    status: 'active',
    budget: 50000000,
    payout_amount: 25000,
    objectives: ['app_install', 'registration'],
    channels: ['media', 'creator'],
    conversion_rate: 4.2,
    conversions: 1247,
  },
  {
    id: 'prog_002',
    name: 'PRULady Lead Form',
    brand_name: 'Prudential',
    advertiser_name: 'Andi Pratama',
    status: 'active',
    budget: 40000000,
    payout_amount: 50000,
    objectives: ['lead_form'],
    channels: ['creator', 'community'],
    conversion_rate: 3.8,
    conversions: 856,
  },
  {
    id: 'prog_003',
    name: 'XL eSIM Purchase',
    brand_name: 'XL Axiata',
    advertiser_name: 'Rudi Hermawan',
    status: 'active',
    budget: 30000000,
    payout_amount: 15000,
    objectives: ['purchase'],
    channels: ['affiliate'],
    conversion_rate: 5.1,
    conversions: 2134,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdvertiserDashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--primary)] via-[var(--primary-600)] to-[var(--secondary)] border-0 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="dots" width="3" height="3" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>

          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Good morning, Sarah Wijaya
                </h2>
                <p className="text-white/80">
                  Your programs are performing well. Here's your daily overview.
                </p>
              </div>
              <Link href="/advertiser/programs/new">
                <Button className="bg-white text-[var(--primary)] hover:bg-white/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Program
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatsCard
            title="Active Programs"
            value={dashboardData.active_programs}
            icon={Target}
            iconColor="#6366F1"
            change={{ value: 2, label: 'from last month', positive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Total Conversions"
            value={formatNumber(dashboardData.total_conversions)}
            icon={Activity}
            iconColor="#10B981"
            change={{ value: 18, label: 'from last month', positive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Average CPA"
            value={formatCurrency(dashboardData.average_cpa)}
            icon={DollarSign}
            iconColor="#8B5CF6"
            change={{ value: 5, label: 'cost decrease', positive: true }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title="Fraud Risk"
            value={dashboardData.fraud_risk.charAt(0).toUpperCase() + dashboardData.fraud_risk.slice(1)}
            icon={ShieldCheck}
            iconColor="#10B981"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Programs */}
        <div className="lg:col-span-2">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Active Programs</CardTitle>
                <Link href="/advertiser/programs">
                  <Button variant="ghost" size="sm" className="gap-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPrograms.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/advertiser/programs/${program.id}`}
                      className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary-200)] hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-200)] flex items-center justify-center font-bold text-[var(--primary)]">
                            {program.brand_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                              {program.name}
                            </h4>
                            <p className="text-sm text-[var(--foreground-muted)]">{program.advertiser_name}</p>
                          </div>
                        </div>
                        <StatusBadge status={'active' as const} />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-[var(--foreground-subtle)] mb-1">Budget</p>
                          <p className="text-sm font-semibold">{formatCurrency(program.budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--foreground-subtle)] mb-1">CPA</p>
                          <p className="text-sm font-semibold">{formatCurrency(program.payout_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--foreground-subtle)] mb-1">Conv. Rate</p>
                          <p className="text-sm font-semibold text-[var(--success)]">{program.conversion_rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--foreground-subtle)] mb-1">Conversions</p>
                          <p className="text-sm font-semibold">{formatNumber(program.conversions)}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendation */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-[var(--primary-50)] to-[var(--primary-100)]/50 border-[var(--primary-200)]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-base">AI Recommendation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {dashboardData.ai_recommendation}
                </p>
                <Button variant="outline" size="sm" className="mt-4 w-full border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary-50)]">
                  Apply Recommendation
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Partner Type */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Partner Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-600)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--foreground)] capitalize">
                      {dashboardData.top_partner_type}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">Best performing</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">Conversion Rate</span>
                    <span className="font-semibold text-[var(--success)]">4.2%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/advertiser/partners" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11">
                    <Users className="w-5 h-5 text-[var(--primary)]" />
                    Discover Partners
                  </Button>
                </Link>
                <Link href="/advertiser/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11">
                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/advertiser/programs/new" className="block">
                  <Button className="w-full justify-start gap-3 h-11">
                    <Plus className="w-5 h-5" />
                    Create New Program
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
