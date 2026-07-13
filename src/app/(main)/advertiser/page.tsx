'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/ui/stats-card';
import { formatCurrency, formatNumber } from '@/lib/mock-data';

interface Program {
  id: string;
  name: string;
  brand_name: string;
  industry: string;
  status: string;
  budget: number;
  payout_model: string;
  partner_payout: number;
  target_volume: number;
  total_conversions: number;
}

export default function AdvertiserDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_programs: 0,
    total_conversions: 0,
    average_cpa: 0,
    fraud_risk: 'low' as 'low' | 'medium' | 'high',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get user session
      const sessionStr = localStorage.getItem('cp_session');
      const email = sessionStr ? JSON.parse(sessionStr).email : '';

      const res = await fetch('/api/programs', {
        headers: {
          'Authorization': `Bearer ${email}`,
        },
      });
      const data = await res.json();

      if (data.success && data.data) {
        setPrograms(data.data);

        const active = data.data.filter((p: Program) => p.status === 'active').length;
        const totalConv = data.data.reduce((sum: number, p: Program) => sum + (p.total_conversions || 0), 0);
        const totalBudget = data.data.reduce((sum: number, p: Program) => sum + (p.budget || 0), 0);
        const avgCPA = totalConv > 0 ? totalBudget / totalConv : 0;

        setStats({
          active_programs: active,
          total_conversions: totalConv,
          average_cpa: Math.round(avgCPA),
          fraud_risk: 'low',
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Good morning, Advertiser
                </h2>
                <p className="text-white/80">
                  Your programs are performing well. Here&apos;s your daily overview.
                </p>
              </div>
              <Link href="/advertiser/programs/new">
                <Button className="bg-white text-blue-600 hover:bg-white/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Program
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Active Programs"
            value={loading ? '...' : stats.active_programs}
            icon={Target}
            iconColor="#6366F1"
            change={{ value: 2, label: 'from last month', positive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Conversions"
            value={loading ? '...' : formatNumber(stats.total_conversions)}
            icon={Activity}
            iconColor="#10B981"
            change={{ value: 18, label: 'from last month', positive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Average CPA"
            value={loading ? '...' : formatCurrency(stats.average_cpa)}
            icon={DollarSign}
            iconColor="#8B5CF6"
            change={{ value: 5, label: 'cost decrease', positive: true }}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Fraud Risk"
            value={loading ? '...' : stats.fraud_risk.charAt(0).toUpperCase() + stats.fraud_risk.slice(1)}
            icon={ShieldCheck}
            iconColor="#10B981"
          />
        </motion.div>
      </div>

      {/* Programs Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Programs</CardTitle>
            <Link href="/advertiser/programs">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : programs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No programs yet. Create your first program!</p>
                <Link href="/advertiser/programs/new">
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Program
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((program) => (
                  <Link
                    key={program.id}
                    href={`/advertiser/programs/${program.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {program.brand_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-500">{program.brand_name} • {program.industry}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Budget</p>
                        <p className="text-sm font-semibold">{formatCurrency(program.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">CPA</p>
                        <p className="text-sm font-semibold">{formatCurrency(program.partner_payout)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Conversions</p>
                        <p className="text-sm font-semibold">{formatNumber(program.total_conversions || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Target</p>
                        <p className="text-sm font-semibold">{program.target_volume ? `${Math.round((program.total_conversions / program.target_volume) * 100)}%` : '-'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/advertiser/partners">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <Users className="w-5 h-5 text-blue-600" />
                Discover Partners
              </Button>
            </Link>
            <Link href="/advertiser/analytics">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                View Analytics
              </Button>
            </Link>
            <Link href="/advertiser/programs/new">
              <Button className="w-full justify-start gap-3 h-12">
                <Plus className="w-5 h-5" />
                Create New Program
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
