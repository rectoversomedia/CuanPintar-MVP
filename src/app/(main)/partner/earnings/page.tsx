'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, Wallet, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight, Copy, ExternalLink, FileText, Download } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockPartnerDashboard, mockPrograms, mockPayouts, formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';
import { getStatusColor } from '@/lib/utils';

export default function PartnerEarningsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dashboard = mockPartnerDashboard;

  const stats = [
    {
      label: 'Total Earnings',
      value: formatCurrency(dashboard.total_earnings),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Pending Payout',
      value: formatCurrency(dashboard.pending_payout),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Valid Conversions',
      value: formatNumber(dashboard.valid_conversions),
      icon: CheckCircle2,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Reach',
      value: formatNumber(dashboard.total_reach),
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Earnings" subtitle="Track your earnings and conversions" />

        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Earnings Breakdown */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { program: 'Tunaiku Download + Registration', conversions: 320, earnings: 8000000, rate: 92 },
                      { program: 'XL eSIM Purchase', conversions: 180, earnings: 2700000, rate: 88 },
                      { program: 'Bank Saqu Download + Registration', conversions: 150, earnings: 5250000, rate: 95 },
                      { program: 'PRULady Lead Form', conversions: 90, earnings: 4500000, rate: 85 },
                    ].map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.program}</h4>
                            <p className="text-sm text-gray-500">{item.conversions} valid conversions</p>
                          </div>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(item.earnings)}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Quality Score</span>
                          <span className="font-medium">{item.rate}%</span>
                        </div>
                        <Progress value={item.rate} className="mt-2 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                    <span className="text-sm text-gray-600">Paid</span>
                    <span className="font-bold text-green-600">{formatCurrency(8750000)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50">
                    <span className="text-sm text-gray-600">Processing</span>
                    <span className="font-bold text-yellow-600">{formatCurrency(2800000)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-bold text-gray-600">{formatCurrency(4200000)}</span>
                  </div>
                  <Link href="/partner/payouts">
                    <Button variant="outline" className="w-full">
                      View Payout History
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Earnings Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Tax Documents
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
