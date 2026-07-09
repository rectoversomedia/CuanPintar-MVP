'use client';

import { useState } from 'react';
import { Building2, Users, Megaphone, ShoppingCart, Shield, CreditCard, TrendingUp, AlertTriangle, Activity, DollarSign, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockAdminDashboard, mockAdvertisers, mockPartners, mockPrograms, mockConversions, formatCurrency, formatNumber } from '@/lib/mock-data';
import { getStatusColor } from '@/lib/utils';

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dashboard = mockAdminDashboard;

  const stats = [
    {
      label: 'Active Advertisers',
      value: dashboard.active_advertisers,
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      href: '/admin/advertisers',
    },
    {
      label: 'Active Partners',
      value: dashboard.active_partners,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      href: '/admin/partners',
    },
    {
      label: 'Active Programs',
      value: dashboard.active_programs,
      icon: Megaphone,
      color: 'bg-orange-100 text-orange-600',
      href: '/admin/programs',
    },
    {
      label: 'Fraud Alerts',
      value: dashboard.fraud_alerts,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      href: '/admin/fraud',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Admin Overview" subtitle="Platform-wide monitoring and management" />

        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Conversion Overview */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Conversion Overview</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(dashboard.total_conversions)}</p>
                    <p className="text-sm text-gray-500 mt-1">Total</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <p className="text-3xl font-bold text-green-600">{formatNumber(dashboard.valid_conversions)}</p>
                    <p className="text-sm text-gray-500 mt-1">Valid</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50">
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatNumber(dashboard.total_conversions - dashboard.valid_conversions - dashboard.rejected_conversions)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Pending</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50">
                    <p className="text-3xl font-bold text-red-600">{formatNumber(dashboard.rejected_conversions)}</p>
                    <p className="text-sm text-gray-500 mt-1">Rejected</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Validation Rate</span>
                  <span className="font-medium text-green-600">
                    {Math.round((dashboard.valid_conversions / dashboard.total_conversions) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(dashboard.valid_conversions / dashboard.total_conversions) * 100}
                  className="h-3"
                />
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Total Payouts</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(dashboard.total_payouts)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Platform Revenue</span>
                  </div>
                  <span className="font-bold text-blue-600">{formatCurrency(dashboard.platform_revenue)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg CPA</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(27500)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Advertisers */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Advertisers</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/advertisers">View All</a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAdvertisers.slice(0, 5).map((advertiser) => (
                    <div key={advertiser.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          {advertiser.company_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{advertiser.company_name}</p>
                          <p className="text-sm text-gray-500">{advertiser.industry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(advertiser.status)}>
                          {advertiser.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {advertiser.active_programs} programs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Fraud Alerts */}
            <Card className="border-red-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Recent Fraud Alerts
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/fraud">Review All</a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockConversions.filter(c => c.status === 'fraud' || c.fraud_signals.length > 0).slice(0, 4).map((conversion) => (
                    <div key={conversion.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50/50">
                      <div>
                        <p className="font-medium text-gray-900">{conversion.program_name}</p>
                        <p className="text-sm text-gray-500">
                          {conversion.partner_name} • {conversion.fraud_signals.length} signals
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-100">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
