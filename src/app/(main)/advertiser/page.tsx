'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Shield, ArrowRight, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Target, Activity } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockAdvertiserDashboard, mockPrograms, formatCurrency, formatNumber } from '@/lib/mock-data';
import { getStatusColor, getChannelLabel, getObjectiveLabel } from '@/lib/utils';

export default function AdvertiserDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dashboard = mockAdvertiserDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Dashboard" subtitle="Welcome back, Sarah" />

        <main className="p-6">
          {/* Welcome Banner */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    Good morning, Sarah Wijaya
                  </h2>
                  <p className="text-blue-100">
                    Your programs are performing well. Here&apos;s your daily overview.
                  </p>
                </div>
                <Link href="/advertiser/programs/new">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    <Target className="w-4 h-4 mr-2" />
                    Create Program
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Programs</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboard.active_programs}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+2</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(dashboard.total_conversions)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+18%</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average CPA</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(dashboard.average_cpa)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 rotate-180" />
                  <span className="text-green-600 font-medium">-5%</span>
                  <span className="text-gray-500 ml-1">cost decrease</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Fraud Risk</p>
                    <p className="text-3xl font-bold text-gray-900 capitalize">{dashboard.fraud_risk}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    dashboard.fraud_risk === 'low' ? 'bg-green-100 text-green-600' :
                    dashboard.fraud_risk === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {dashboard.fraud_risk === 'low' ? <CheckCircle2 className="w-6 h-6" /> :
                     dashboard.fraud_risk === 'medium' ? <AlertTriangle className="w-6 h-6" /> :
                     <AlertTriangle className="w-6 h-6" />}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Quality Score</span>
                    <span className="font-medium text-gray-900">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Programs */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Active Programs</CardTitle>
                  <Link href="/advertiser/programs">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboard.recent_programs.map((program) => (
                      <Link
                        key={program.id}
                        href={`/advertiser/programs/${program.id}`}
                        className="block p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                              {program.brand_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{program.name}</h4>
                              <p className="text-sm text-gray-500">{program.advertiser_name}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(program.status)}>
                            {program.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500">Budget</p>
                            <p className="font-medium text-gray-900">{formatCurrency(program.budget)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">CPA</p>
                            <p className="font-medium text-gray-900">{formatCurrency(program.payout_amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Objective</p>
                            <p className="font-medium text-gray-900">
                              {program.objectives.map(o => getObjectiveLabel(o)).join(', ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Channels</p>
                            <p className="font-medium text-gray-900">
                              {program.channels.length} channels
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendation */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base">AI Recommendation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {dashboard.ai_recommendation}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Apply Recommendation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Partner Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {getChannelLabel(dashboard.top_partner_type)}
                      </p>
                      <p className="text-sm text-gray-500">Best performing channel</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Conversion Rate</span>
                      <span className="font-medium">4.2%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/advertiser/partners">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Discover Partners
                    </Button>
                  </Link>
                  <Link href="/advertiser/analytics">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                  <Link href="/advertiser/programs/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      Create New Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
