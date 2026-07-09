'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, TrendingUp, DollarSign, Activity, Shield, Target, Calendar, Edit, Pause, Play } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPrograms, mockConversions, formatCurrency, formatDate, formatDateTime } from '@/lib/mock-data';
import { getStatusColor, getChannelLabel, getObjectiveLabel, getRiskColor } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ProgramDetailPage() {
  const params = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const program = mockPrograms.find(p => p.id === params.id) || mockPrograms[0];
  const conversions = mockConversions.filter(c => c.program_id === program.id);

  // Calculate stats
  const totalConversions = conversions.length;
  const validConversions = conversions.filter(c => c.status === 'valid').length;
  const pendingConversions = conversions.filter(c => c.status === 'pending').length;
  const rejectedConversions = conversions.filter(c => c.status === 'rejected' || c.status === 'fraud').length;
  const totalSpend = totalConversions * program.payout_amount;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : program.payout_amount;
  const qualityScore = Math.round((validConversions / totalConversions) * 100) || 85;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title={program.name} subtitle={`${program.advertiser_name} - ${program.industry}`} />

        <main className="p-6">
          {/* Back Button & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/advertiser/programs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Programs
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
              {program.status === 'active' ? (
                <Button variant="outline" size="sm">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Program
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
              <Button size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Program
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Conversions</p>
                    <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valid Conversions</p>
                    <p className="text-3xl font-bold text-green-600">{validConversions}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {totalConversions > 0 ? Math.round((validConversions / totalConversions) * 100) : 0}% valid rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Spend</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpend)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  of {formatCurrency(program.budget)} budget
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average CPA</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(avgCpa)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Target: {formatCurrency(program.payout_amount)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Validation</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingConversions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected / Fraud</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedConversions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Quality Score</p>
                    <p className="text-2xl font-bold text-gray-900">{qualityScore}%</p>
                  </div>
                </div>
                <Progress value={qualityScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Brand Name</p>
                        <p className="font-medium">{program.brand_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">{program.industry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payout Model</p>
                        <p className="font-medium">{program.payout_model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payout Amount</p>
                        <p className="font-medium">{formatCurrency(program.payout_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{formatDate(program.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="font-medium">{formatDate(program.end_date)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700">{program.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Objectives</p>
                      <div className="flex flex-wrap gap-2">
                        {program.objectives.map((obj) => (
                          <Badge key={obj} variant="secondary">
                            {getObjectiveLabel(obj)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Target Audience */}
                <Card>
                  <CardHeader>
                    <CardTitle>Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="font-medium">{program.target_audience.age || 'All'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{program.target_audience.gender || 'All'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{program.target_audience.location || 'Nasional'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Interest</p>
                        <p className="font-medium">{program.target_audience.interest || 'General'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Device</p>
                        <p className="font-medium">{program.target_audience.device || 'Mobile & Desktop'}</p>
                      </div>
                      {program.target_audience.notes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="font-medium">{program.target_audience.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Distribution</CardTitle>
                  <CardDescription>
                    Budget allocation and performance by acquisition channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead>Allocated Budget</TableHead>
                        <TableHead>Est. Volume</TableHead>
                        <TableHead>Quality Score</TableHead>
                        <TableHead>Fraud Risk</TableHead>
                        <TableHead>Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {program.channels.map((channel) => (
                        <TableRow key={channel.channel_type}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                {channel.channel_type.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {getChannelLabel(channel.channel_type)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(channel.allocated_budget)}</TableCell>
                          <TableCell>{channel.estimated_volume}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{channel.quality_score}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(channel.fraud_risk).includes('green') ? 'bg-green-100 text-green-800' :
                              channel.fraud_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}>
                              {channel.fraud_risk}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Progress value={channel.quality_score} className="h-2 w-20" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversions.slice(0, 10).map((conv) => (
                        <TableRow key={conv.id}>
                          <TableCell className="font-mono text-sm">{conv.id}</TableCell>
                          <TableCell>{conv.partner_name}</TableCell>
                          <TableCell>{getChannelLabel(conv.channel_type)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(conv.status)}>
                              {conv.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{conv.quality_score}%</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDateTime(conv.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Program Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Settings panel coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
