'use client';

import { useState } from 'react';
import {
  Buildings,
  Users,
  ChartLine,
  ShieldCheck,
  CurrencyCircleDollar,
  ShoppingCart,
  TrendUp,
  ArrowRight,
  Bell,
  Gear,
  SignOut,
  List,
} from '@phosphor-icons/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockAdminDashboard, mockAdvertisers, mockPartners, mockPrograms, mockConversions, formatCurrency, formatNumber } from '@/lib/mock-data';

// Brand Colors (CuanPintar)
const colors = {
  primary: '#FF6B35', // Orange (cuan)
  secondary: '#0066FF', // Blue (pintar)
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dashboard = mockAdminDashboard;

  const stats = [
    {
      label: 'Active Advertisers',
      value: dashboard.active_advertisers,
      icon: Buildings,
      color: colors.secondary,
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-200',
      href: '/admin/advertisers',
    },
    {
      label: 'Active Partners',
      value: dashboard.active_partners,
      icon: Users,
      color: colors.purple,
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-200',
      href: '/admin/partners',
    },
    {
      label: 'Active Programs',
      value: dashboard.active_programs,
      icon: ChartLine,
      color: colors.primary,
      bgGradient: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-200',
      href: '/admin/programs',
    },
    {
      label: 'Fraud Alerts',
      value: dashboard.fraud_alerts,
      icon: ShieldCheck,
      color: colors.danger,
      bgGradient: 'from-red-500/10 to-red-600/5',
      borderColor: 'border-red-200',
      href: '/admin/fraud',
    },
  ];

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(dashboard.platform_revenue), color: colors.success },
    { label: 'Total Payouts', value: formatCurrency(dashboard.total_payouts), color: colors.secondary },
    { label: 'Avg CPA', value: formatCurrency(27500), color: colors.purple },
    { label: 'Conversion Rate', value: '3.2%', color: colors.primary },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0066FF] bg-clip-text text-transparent">
                Admin Overview
              </h1>
              <p className="text-sm text-gray-500">Platform-wide monitoring and management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={22} weight="duotone" className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B35] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src="/api/placeholder/36/36" />
                <AvatarFallback className="bg-gradient-to-br from-[#FF6B35] to-[#0066FF] text-white font-semibold text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border ${stat.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
              >
                <CardContent className="p-6">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon size={28} weight="duotone" style={{ color: stat.color }} />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full justify-end text-gray-500 hover:text-gray-900 p-0 h-auto font-medium text-xs"
                    asChild
                  >
                    <a href={stat.href}>
                      View Details <ArrowRight size={14} className="ml-1" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Conversion Overview */}
            <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#FF6B35] via-[#0066FF] to-[#8B5CF6]" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900">Conversion Overview</CardTitle>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <TrendUp size={12} className="mr-1" />
                    +12.5%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboard.total_conversions)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100">
                    <p className="text-2xl font-bold text-green-600">{formatNumber(dashboard.valid_conversions)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Valid</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-100">
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatNumber(dashboard.total_conversions - dashboard.valid_conversions - dashboard.rejected_conversions)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Pending</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100">
                    <p className="text-2xl font-bold text-red-600">{formatNumber(dashboard.rejected_conversions)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Rejected</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Validation Rate</span>
                    <span className="font-bold text-green-600">
                      {Math.round((dashboard.valid_conversions / dashboard.total_conversions) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(dashboard.valid_conversions / dashboard.total_conversions) * 100}
                    className="h-3 rounded-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#0066FF] to-[#8B5CF6]" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${metric.color}15` }}
                      >
                        <CurrencyCircleDollar size={20} weight="duotone" style={{ color: metric.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: metric.color }}>{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Advertisers */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#FF6B35] to-[#EC4899]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">Recent Advertisers</CardTitle>
                <Button variant="ghost" size="sm" className="text-[#0066FF] hover:text-[#0066FF] hover:bg-blue-50" asChild>
                  <a href="/admin/advertisers">
                    View All <ArrowRight size={14} className="ml-1" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAdvertisers.slice(0, 4).map((advertiser, index) => (
                  <div
                    key={advertiser.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-[#0066FF]/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md"
                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                      >
                        {advertiser.company_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{advertiser.company_name}</p>
                        <p className="text-sm text-gray-500">{advertiser.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={advertiser.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      >
                        {advertiser.status}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{advertiser.active_programs} programs</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Fraud Alerts */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#EF4444] to-[#F59E0B]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">Fraud Alerts</CardTitle>
                <Button variant="ghost" size="sm" className="text-[#EF4444] hover:text-[#EF4444] hover:bg-red-50" asChild>
                  <a href="/admin/fraud">
                    Review All <ArrowRight size={14} className="ml-1" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockConversions.filter(c => c.status === 'fraud' || c.fraud_signals.length > 0).slice(0, 4).map((conversion, index) => (
                  <div
                    key={conversion.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-red-50/50 to-white border border-red-100 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{conversion.program_name}</p>
                      <p className="text-sm text-gray-500">
                        {conversion.partner_name} • {conversion.fraud_signals.length} signals
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
