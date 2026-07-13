'use client';

import { useState } from 'react';
import {
  Building,
  Users,
  ChartBar,
  ShieldCheck,
  CurrencyDollar,
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
import { cn } from '@/lib/utils';

// Using CSS variables from globals.css for consistent theming
// Primary: #6366F1 (Indigo), Secondary: #8B5CF6 (Purple)
// Note: Orange (#FF6B35) and Blue (#0066FF) from older design removed for consistency

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dashboard = mockAdminDashboard;

  const stats = [
    {
      label: 'Active Advertisers',
      value: dashboard.active_advertisers,
      icon: Building,
      color: 'var(--primary)',
      bgGradient: 'from-primary-500/10 to-primary-600/5',
      borderColor: 'border-primary-200',
      href: '/admin/advertisers',
    },
    {
      label: 'Active Partners',
      value: dashboard.active_partners,
      icon: Users,
      color: 'var(--secondary)',
      bgGradient: 'from-secondary-500/10 to-secondary-600/5',
      borderColor: 'border-secondary-200',
      href: '/admin/partners',
    },
    {
      label: 'Active Programs',
      value: dashboard.active_programs,
      icon: ChartBar,
      color: 'var(--primary)',
      bgGradient: 'from-primary-500/10 to-primary-600/5',
      borderColor: 'border-primary-200',
      href: '/admin/programs',
    },
    {
      label: 'Fraud Alerts',
      value: dashboard.fraud_alerts,
      icon: ShieldCheck,
      color: 'var(--danger)',
      bgGradient: 'from-red-500/10 to-red-600/5',
      borderColor: 'border-red-200',
      href: '/admin/fraud',
    },
  ];

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(dashboard.platform_revenue), color: 'var(--success)' },
    { label: 'Total Payouts', value: formatCurrency(dashboard.total_payouts), color: 'var(--secondary)' },
    { label: 'Avg CPA', value: formatCurrency(27500), color: 'var(--primary)' },
    { label: 'Conversion Rate', value: '3.2%', color: 'var(--success)' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-[68px]' : 'ml-[220px]')}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--card)]/80 backdrop-blur-md border-b border-[var(--border)] px-5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)]">Admin Overview</h1>
              <p className="text-xs text-[var(--foreground-muted)]">Platform-wide monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} className="text-[var(--foreground-muted)]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full text-[8px] font-bold text-white flex items-center justify-center">3</span>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white font-semibold text-xs">AU</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden border hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--foreground-muted)]">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon size={22} weight="duotone" style={{ color: stat.color }} />
                    </div>
                  </div>
                  <a href={stat.href} className="text-xs text-[var(--primary)] hover:underline mt-2 inline-block">View Details →</a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Conversion Overview */}
            <Card className="lg:col-span-2 border shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#F43F5E]" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Conversion Overview</CardTitle>
                  <Badge className="bg-green-100 text-green-700 text-xs"><TrendUp size={10} className="mr-1" />+12.5%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 border">
                    <p className="text-xl font-bold">{formatNumber(dashboard.total_conversions)}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Total</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-xl font-bold text-green-600">{formatNumber(dashboard.valid_conversions)}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Valid</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <p className="text-xl font-bold text-yellow-600">{formatNumber(dashboard.total_conversions - dashboard.valid_conversions - dashboard.rejected_conversions)}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Pending</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xl font-bold text-red-600">{formatNumber(dashboard.rejected_conversions)}</p>
                    <p className="text-[10px] text-gray-500 font-medium">Rejected</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Validation Rate</span>
                    <span className="font-bold text-green-600">{Math.round((dashboard.valid_conversions / dashboard.total_conversions) * 100)}%</span>
                  </div>
                  <Progress value={(dashboard.valid_conversions / dashboard.total_conversions) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card className="border shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1]" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Financial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}15` }}>
                        <CurrencyDollar size={16} weight="duotone" style={{ color: metric.color }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{metric.label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: metric.color }}>{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Advertisers */}
            <Card className="border shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Recent Advertisers</CardTitle>
                <a href="/admin/advertisers" className="text-xs text-[var(--primary)] hover:underline">View All →</a>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockAdvertisers.slice(0, 4).map((advertiser) => (
                  <div key={advertiser.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--card)] border hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">{advertiser.company_name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-sm">{advertiser.company_name}</p>
                        <p className="text-xs text-gray-500">{advertiser.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={advertiser.status === 'active' ? 'bg-green-100 text-green-700 text-xs' : 'bg-yellow-100 text-yellow-700 text-xs'}>{advertiser.status}</Badge>
                      <p className="text-[10px] text-gray-400 mt-0.5">{advertiser.active_programs} programs</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fraud Alerts */}
            <Card className="border shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-red-500 to-yellow-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Fraud Alerts</CardTitle>
                <a href="/admin/fraud" className="text-xs text-red-500 hover:underline">Review All →</a>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockConversions.filter(c => c.status === 'fraud' || c.fraud_signals.length > 0).slice(0, 4).map((conversion) => (
                  <div key={conversion.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
                    <div>
                      <p className="font-medium text-sm">{conversion.program_name}</p>
                      <p className="text-xs text-gray-500">{conversion.partner_name} • {conversion.fraud_signals.length} signals</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 text-xs">Review</Button>
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
