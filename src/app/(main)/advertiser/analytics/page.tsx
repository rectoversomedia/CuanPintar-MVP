'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Activity, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPrograms, mockConversions, formatCurrency, formatNumber } from '@/lib/mock-data';
import { getChannelLabel, getObjectiveLabel } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#0066FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Mock analytics data
const conversionsOverTime = [
  { date: 'May 1', conversions: 120, cpa: 25000 },
  { date: 'May 5', conversions: 145, cpa: 24500 },
  { date: 'May 10', conversions: 180, cpa: 24000 },
  { date: 'May 15', conversions: 165, cpa: 25500 },
  { date: 'May 20', conversions: 210, cpa: 23000 },
  { date: 'May 25', conversions: 195, cpa: 23500 },
  { date: 'May 30', conversions: 240, cpa: 22000 },
  { date: 'Jun 5', conversions: 280, cpa: 21500 },
  { date: 'Jun 10', conversions: 320, cpa: 21000 },
  { date: 'Jun 15', conversions: 290, cpa: 22000 },
  { date: 'Jun 20', conversions: 350, cpa: 20500 },
  { date: 'Jun 25', conversions: 380, cpa: 20000 },
  { date: 'Jun 30', conversions: 420, cpa: 19500 },
];

const channelPerformance = [
  { channel: 'Media Network', conversions: 1250, spend: 45000000, cpa: 36000 },
  { channel: 'Creator', conversions: 980, spend: 32000000, cpa: 32653 },
  { channel: 'Affiliate', conversions: 720, spend: 18000000, cpa: 25000 },
  { channel: 'Community', conversions: 580, spend: 12000000, cpa: 20690 },
  { channel: 'Sales', conversions: 320, spend: 8000000, cpa: 25000 },
  { channel: 'Mission', conversions: 180, spend: 6000000, cpa: 33333 },
];

const qualityScoreTrends = [
  { date: 'May 1', media: 88, creator: 92, affiliate: 82, community: 85, sales: 75, mission: 62 },
  { date: 'May 15', media: 87, creator: 91, affiliate: 80, community: 84, sales: 76, mission: 60 },
  { date: 'Jun 1', media: 89, creator: 93, affiliate: 83, community: 86, sales: 78, mission: 65 },
  { date: 'Jun 15', media: 90, creator: 94, affiliate: 84, community: 88, sales: 80, mission: 68 },
  { date: 'Jun 30', media: 91, creator: 95, affiliate: 85, community: 90, sales: 82, mission: 70 },
];

const cpaTrends = [
  { date: 'May 1', cpa: 28500 },
  { date: 'May 15', cpa: 27200 },
  { date: 'Jun 1', cpa: 25800 },
  { date: 'Jun 15', cpa: 24500 },
  { date: 'Jun 30', cpa: 23200 },
];

export default function AdvertiserAnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const totalConversions = mockConversions.length;
  const avgCPA = 27500;
  const totalSpend = 125000000;
  const avgQualityScore = 87;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Analytics" subtitle="Performance insights for your campaigns" />

        <main className="p-6">
          {/* Date Range Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Export Report</Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(totalConversions)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+24%</span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Average CPA</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(avgCPA)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">-8%</span>
                  <span className="text-gray-500 ml-1">cost decrease</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Spend</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+15%</span>
                  <span className="text-gray-500 ml-1">budget utilization</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Avg Quality Score</p>
                    <p className="text-3xl font-bold text-gray-900">{avgQualityScore}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+5%</span>
                  <span className="text-gray-500 ml-1">improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Conversions Over Time */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Conversions Over Time</CardTitle>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={conversionsOverTime}>
                    <defs>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stroke="#0066FF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorConversions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* CPA Trends */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">CPA Trends</CardTitle>
                  <TrendingDown className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={cpaTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'CPA']}
                    />
                    <Line
                      type="monotone"
                      dataKey="cpa"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Channel Performance Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Channel Performance Breakdown</CardTitle>
                  <PieChartIcon className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis dataKey="channel" type="category" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => {
                        if (name === 'spend') return [formatCurrency(value as number), 'Spend'];
                        if (name === 'cpa') return [formatCurrency(value as number), 'CPA'];
                        return [formatNumber(value as number), 'Conversions'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="conversions" fill="#0066FF" name="Conversions" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="spend" fill="#8B5CF6" name="Spend" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Spend by Channel</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="spend"
                    >
                      {channelPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quality Score Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Quality Score Trends by Channel</CardTitle>
                <Badge variant="secondary">Last 2 Months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={qualityScoreTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="media" stroke="#0066FF" strokeWidth={2} dot={{ r: 4 }} name="Media" />
                  <Line type="monotone" dataKey="creator" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Creator" />
                  <Line type="monotone" dataKey="affiliate" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Affiliate" />
                  <Line type="monotone" dataKey="community" stroke="#EC4899" strokeWidth={2} dot={{ r: 4 }} name="Community" />
                  <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} name="Sales" />
                  <Line type="monotone" dataKey="mission" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Mission" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
