'use client';

import { useState, useEffect } from 'react';
import {
  Building,
  Users,
  ChartBar,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/mock-data';

interface Stats {
  advertisers: number;
  partners: number;
  programs: number;
  conversions: number;
  revenue: number;
  payouts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    advertisers: 0,
    partners: 0,
    programs: 0,
    conversions: 0,
    revenue: 0,
    payouts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Fetch stats - auth handled by middleware/cookies
      const [advRes, partRes, progRes] = await Promise.all([
        fetch('/api/advertisers'),
        fetch('/api/partners'),
        fetch('/api/programs'),
      ]);

      const [advData, partData, progData] = await Promise.all([
        advRes.json(),
        partRes.json(),
        progRes.json(),
      ]);

      setStats({
        advertisers: advData.pagination?.total || advData.data?.length || 0,
        partners: partData.pagination?.total || partData.data?.length || 0,
        programs: progData.pagination?.total || progData.data?.length || 0,
        conversions: 0,
        revenue: progData.data?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) || 0,
        payouts: 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Active Advertisers',
      value: stats.advertisers,
      icon: Building,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      href: '/admin/advertisers',
    },
    {
      label: 'Active Partners',
      value: stats.partners,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      href: '/admin/partners',
    },
    {
      label: 'Active Programs',
      value: stats.programs,
      icon: ChartBar,
      color: 'text-green-600',
      bg: 'bg-green-100',
      href: '/admin/programs',
    },
    {
      label: 'Fraud Alerts',
      value: 0,
      icon: ShieldCheck,
      color: 'text-red-600',
      bg: 'bg-red-100',
      href: '/admin/fraud',
    },
  ];

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), color: 'text-green-600' },
    { label: 'Total Payouts', value: formatCurrency(stats.payouts), color: 'text-purple-600' },
    { label: 'Avg CPA', value: formatCurrency(25000), color: 'text-blue-600' },
    { label: 'Conversion Rate', value: '3.2%', color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Platform-wide monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-between" asChild>
                <a href={stat.href}>
                  View Details <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
              <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/admin/advertisers">Manage Advertisers</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/admin/partners">Manage Partners</a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/admin/programs">Manage Programs</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">System Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">API Response</span>
                <span className="text-sm font-medium text-green-600">45ms avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Database</span>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="text-sm">New advertiser registered</p>
                  <p className="text-xs text-gray-400">2 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm">Program approved</p>
                  <p className="text-xs text-gray-400">15 min ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                <div>
                  <p className="text-sm">Payout pending</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
