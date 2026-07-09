'use client';

import { useState } from 'react';
import { Share2, TrendingUp, TrendingDown, Users, DollarSign, Target, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { mockPrograms, formatCurrency, formatNumber } from '@/lib/mock-data';
import { getChannelLabel, getStatusColor, getRiskColor, getQualityColor } from '@/lib/utils';

// Mock distribution data
const channelAllocation = [
  { channel: 'media', allocated: 45000000, spent: 42000000, conversions: 1250, cpa: 33600, qualityScore: 91 },
  { channel: 'creator', allocated: 32000000, spent: 31000000, conversions: 980, cpa: 31633, qualityScore: 95 },
  { channel: 'affiliate', allocated: 18000000, spent: 16000000, conversions: 720, cpa: 22222, qualityScore: 85 },
  { channel: 'community', allocated: 12000000, spent: 10500000, conversions: 580, cpa: 18103, qualityScore: 88 },
  { channel: 'sales', allocated: 8000000, spent: 7200000, conversions: 320, cpa: 22500, qualityScore: 78 },
  { channel: 'mission', allocated: 6000000, spent: 5800000, conversions: 180, cpa: 32222, qualityScore: 62 },
];

const channelPartners = {
  media: [
    { name: 'Kompas', conversions: 450, qualityScore: 92, status: 'active' },
    { name: 'Detik News', conversions: 380, qualityScore: 88, status: 'active' },
    { name: 'Katadata', conversions: 280, qualityScore: 95, status: 'active' },
    { name: 'CNN Indonesia', conversions: 140, qualityScore: 90, status: 'active' },
  ],
  creator: [
    { name: 'Finance Creator Jakarta', conversions: 320, qualityScore: 94, status: 'active' },
    { name: 'Automotive Creator', conversions: 280, qualityScore: 92, status: 'active' },
    { name: 'Lifestyle Creator', conversions: 380, qualityScore: 96, status: 'active' },
  ],
  affiliate: [
    { name: 'Affiliate Finance Partner', conversions: 420, qualityScore: 85, status: 'active' },
    { name: 'Tech Affiliate Network', conversions: 300, qualityScore: 82, status: 'active' },
  ],
  community: [
    { name: 'Parenting Community Indonesia', conversions: 320, qualityScore: 90, status: 'active' },
    { name: 'Muslim Family Media', conversions: 260, qualityScore: 88, status: 'active' },
  ],
  sales: [
    { name: 'Campus Sales Team', conversions: 180, qualityScore: 78, status: 'active' },
    { name: 'Corporate Sales Team', conversions: 140, qualityScore: 80, status: 'active' },
  ],
  mission: [
    { name: 'Mission User Network', conversions: 180, qualityScore: 62, status: 'active' },
  ],
};

export default function AdvertiserDistributionPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  const activePrograms = mockPrograms.filter(p => p.status === 'active');

  const totalBudget = channelAllocation.reduce((sum, ch) => sum + ch.allocated, 0);
  const totalSpent = channelAllocation.reduce((sum, ch) => sum + ch.spent, 0);
  const totalConversions = channelAllocation.reduce((sum, ch) => sum + ch.conversions, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Distribution" subtitle="Channel allocation and performance management" />

        <main className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {activePrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Utilization</span>
                    <span className="font-medium">{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(totalSpent / totalBudget) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Remaining: {formatCurrency(totalBudget - totalSpent)}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalConversions)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Avg CPA: {formatCurrency(totalSpent / totalConversions)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Allocation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {channelAllocation.map((channel) => {
              const utilization = (channel.spent / channel.allocated) * 100;
              return (
                <Card key={channel.channel} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          channel.channel === 'media' ? 'bg-blue-100 text-blue-600' :
                          channel.channel === 'creator' ? 'bg-green-100 text-green-600' :
                          channel.channel === 'affiliate' ? 'bg-amber-100 text-amber-600' :
                          channel.channel === 'community' ? 'bg-pink-100 text-pink-600' :
                          channel.channel === 'sales' ? 'bg-purple-100 text-purple-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{getChannelLabel(channel.channel)}</h3>
                          <p className="text-sm text-gray-500">{formatNumber(channel.conversions)} conversions</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Budget</span>
                        <span className="font-medium">{formatCurrency(channel.allocated)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Spent</span>
                        <span className="font-medium">{formatCurrency(channel.spent)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">CPA</span>
                        <span className="font-medium">{formatCurrency(channel.cpa)}</span>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Utilization</span>
                          <span className={`font-medium ${utilization > 90 ? 'text-green-600' : utilization > 75 ? 'text-amber-600' : 'text-gray-600'}`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={utilization} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Quality</span>
                          {channel.qualityScore >= 85 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : channel.qualityScore >= 70 ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <span className={`font-semibold ${getQualityColor(channel.qualityScore)}`}>
                          {channel.qualityScore}%
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Partners by Channel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Partners by Channel</CardTitle>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {channelAllocation.map((ch) => (
                      <SelectItem key={ch.channel} value={ch.channel}>
                        {getChannelLabel(ch.channel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {channelAllocation
                  .filter((ch) => selectedChannel === 'all' || ch.channel === selectedChannel)
                  .map((channel) => (
                    <div key={channel.channel}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900">{getChannelLabel(channel.channel)}</h3>
                        <Badge variant="secondary">{channelPartners[channel.channel as keyof typeof channelPartners].length} partners</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {channelPartners[channel.channel as keyof typeof channelPartners].map((partner, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  channel.channel === 'media' ? 'bg-blue-100 text-blue-600' :
                                  channel.channel === 'creator' ? 'bg-green-100 text-green-600' :
                                  channel.channel === 'affiliate' ? 'bg-amber-100 text-amber-600' :
                                  channel.channel === 'community' ? 'bg-pink-100 text-pink-600' :
                                  channel.channel === 'sales' ? 'bg-purple-100 text-purple-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {partner.name.charAt(0)}
                                </div>
                                <span className="font-medium text-sm">{partner.name}</span>
                              </div>
                              <Badge className={getStatusColor(partner.status)}>
                                {partner.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Conversions</span>
                              <span className="font-medium">{formatNumber(partner.conversions)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-gray-500">Quality</span>
                              <span className={`font-medium ${getQualityColor(partner.qualityScore)}`}>
                                {partner.qualityScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
