'use client';

/**
 * Advertiser Report View Component
 *
 * Shows advertiser their campaign performance:
 * - Total conversions & spend
 * - Partner performance (without revealing payout)
 * - Conversion breakdown
 * - Budget usage
 *
 * IMPORTANT: Partner payout amounts are HIDDEN from advertiser
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Eye,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import type { Program, Conversion, Partner } from '@/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';

interface AdvertiserReportProps {
  programs: Program[];
  conversions: Conversion[];
  partners: Partner[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface ProgramReport {
  program: Program;
  stats: {
    total_conversions: number;
    valid_conversions: number;
    pending_conversions: number;
    rejected_conversions: number;
    fraud_conversions: number;
    conversion_rate: number;
    total_cost: number; // What advertiser paid
    avg_cpa: number;
  };
  partner_breakdown: PartnerBreakdown[];
}

interface PartnerBreakdown {
  partner_id: string;
  partner_name: string;
  channel_type: string;
  conversions: number;
  valid: number;
  pending: number;
  rejected: number;
  fraud: number;
  // NOTE: payout_amount is NOT shown to advertiser
}

export function AdvertiserReportView({
  programs,
  conversions,
  partners,
}: AdvertiserReportProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Calculate overall stats
  const overallStats = calculateOverallStats(programs, conversions);

  // Get program reports
  const programReports = getProgramReports(programs, conversions, partners);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(overallStats.total_conversions)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Valid: {formatNumber(overallStats.valid_conversions)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(overallStats.total_cost)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg. CPA: {formatCurrency(overallStats.avg_cpa)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valid Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Valid Rate</p>
                <p className="text-2xl font-bold">{overallStats.valid_rate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  Fraud: {overallStats.fraud_rate}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Progress value={overallStats.valid_rate} className="h-2 mt-4" />
          </CardContent>
        </Card>

        {/* Budget Used */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Budget Used</p>
                <p className="text-2xl font-bold">
                  {overallStats.budget_used}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(overallStats.total_cost)} / {formatCurrency(overallStats.total_budget)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <Progress value={overallStats.budget_used} className="h-2 mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
        </TabsList>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {programReports.map((report) => (
            <ProgramReportCard
              key={report.program.id}
              report={report}
              isSelected={selectedProgram === 'all' || selectedProgram === report.program.id}
            />
          ))}
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Partner Performance</CardTitle>
              <CardDescription>
                Conversion stats by partner. Partner payout amounts are not shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Valid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Fraud</TableHead>
                    <TableHead className="text-right">Valid Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPartnerStats(programs, conversions, partners).map((stats) => (
                    <TableRow key={stats.partner_id}>
                      <TableCell className="font-medium">{stats.partner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stats.channel_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{stats.conversions}</TableCell>
                      <TableCell className="text-right text-green-600">{stats.valid}</TableCell>
                      <TableCell className="text-right text-yellow-600">{stats.pending}</TableCell>
                      <TableCell className="text-right text-red-600">{stats.fraud}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={stats.valid_rate > 90 ? 'default' : 'secondary'}>
                          {stats.valid_rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
              <CardDescription>Latest conversion activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.slice(0, 20).map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="text-sm">{formatDate(conv.created_at)}</TableCell>
                      <TableCell className="font-medium">{conv.partner_name}</TableCell>
                      <TableCell>{conv.conversion_type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{conv.channel_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={conv.status} />
                      </TableCell>
                      <TableCell className="text-right text-gray-500 text-sm">
                        {conv.id.slice(0, 12)}...
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Tab */}
        <TabsContent value="fraud">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Fraud Analysis
              </CardTitle>
              <CardDescription>
                Conversions flagged for fraud review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions
                    .filter((c) => c.status === 'fraud' || c.status === 'rejected')
                    .slice(0, 10)
                    .map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell className="text-sm">{formatDate(conv.created_at)}</TableCell>
                        <TableCell className="font-medium">{conv.partner_name}</TableCell>
                        <TableCell className="text-red-600">
                          {conv.fraud_signals?.join(', ') || 'Manual review'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{conv.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  {conversions.filter((c) => c.status === 'fraud' || c.status === 'rejected').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No fraud detections in selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Program Report Card
 */
function ProgramReportCard({
  report,
  isSelected,
}: {
  report: ProgramReport;
  isSelected: boolean;
}) {
  if (!isSelected) return null;

  const budgetUsed = report.program.budget > 0
    ? (report.stats.total_cost / report.program.budget) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{report.program.name}</CardTitle>
            <CardDescription>
              {report.program.advertiser_name} • {report.program.status}
            </CardDescription>
          </div>
          <Badge variant={report.program.status === 'active' ? 'default' : 'secondary'}>
            {report.program.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Budget Used</span>
            <span className="font-medium">
              {formatCurrency(report.stats.total_cost)} / {formatCurrency(report.program.budget)}
            </span>
          </div>
          <Progress value={budgetUsed} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold">{report.stats.total_conversions}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{report.stats.valid_conversions}</p>
            <p className="text-sm text-gray-500">Valid</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{report.stats.pending_conversions}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{report.stats.fraud_conversions}</p>
            <p className="text-sm text-gray-500">Fraud</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(report.stats.avg_cpa)}
            </p>
            <p className="text-sm text-gray-500">Avg CPA</p>
          </div>
        </div>

        {/* Top Partners */}
        {report.partner_breakdown.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Top Partners</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Valid</TableHead>
                  <TableHead className="text-right">Valid Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.partner_breakdown.slice(0, 5).map((pb) => (
                  <TableRow key={pb.partner_id}>
                    <TableCell className="font-medium">{pb.partner_name}</TableCell>
                    <TableCell className="text-right">{pb.conversions}</TableCell>
                    <TableCell className="text-right text-green-600">{pb.valid}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={pb.valid / pb.conversions > 0.9 ? 'default' : 'secondary'}>
                        {Math.round((pb.valid / pb.conversions) * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Status Badge
 */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    valid: { color: 'bg-green-100 text-green-800', label: 'Valid' },
    rejected: { color: 'bg-gray-100 text-gray-800', label: 'Rejected' },
    fraud: { color: 'bg-red-100 text-red-800', label: 'Fraud' },
  };

  const { color, label } = config[status] || config.pending;

  return (
    <Badge className={color}>
      {label}
    </Badge>
  );
}

/**
 * Calculate overall stats
 */
function calculateOverallStats(programs: Program[], conversions: Conversion[]) {
  const validConversions = conversions.filter((c) => c.status === 'valid');
  const fraudConversions = conversions.filter((c) => c.status === 'fraud' || c.status === 'rejected');

  const totalCost = validConversions.reduce((sum, c) => sum + (c.advertiser_price || 0), 0);
  const totalBudget = programs.reduce((sum, p) => sum + p.budget, 0);

  return {
    total_conversions: conversions.length,
    valid_conversions: validConversions.length,
    fraud_conversions: fraudConversions.length,
    total_cost: totalCost,
    avg_cpa: validConversions.length > 0 ? totalCost / validConversions.length : 0,
    valid_rate: conversions.length > 0
      ? Math.round((validConversions.length / conversions.length) * 100)
      : 0,
    fraud_rate: conversions.length > 0
      ? Math.round((fraudConversions.length / conversions.length) * 100)
      : 0,
    budget_used: totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0,
    total_budget: totalBudget,
  };
}

/**
 * Get program reports
 */
function getProgramReports(
  programs: Program[],
  conversions: Conversion[],
  partners: Partner[]
): ProgramReport[] {
  return programs.map((program) => {
    const programConversions = conversions.filter((c) => c.program_id === program.id);
    const valid = programConversions.filter((c) => c.status === 'valid');
    const pending = programConversions.filter((c) => c.status === 'pending');
    const rejected = programConversions.filter((c) => c.status === 'rejected' || c.status === 'fraud');

    const totalCost = valid.reduce((sum, c) => sum + (c.advertiser_price || 0), 0);

    const partnerMap = new Map<string, PartnerBreakdown>();

    programConversions.forEach((conv) => {
      const existing = partnerMap.get(conv.partner_id) || {
        partner_id: conv.partner_id,
        partner_name: conv.partner_name,
        channel_type: conv.channel_type,
        conversions: 0,
        valid: 0,
        pending: 0,
        rejected: 0,
        fraud: 0,
      };

      existing.conversions++;
      if (conv.status === 'valid') existing.valid++;
      if (conv.status === 'pending') existing.pending++;
      if (conv.status === 'rejected') existing.rejected++;
      if (conv.status === 'fraud') existing.fraud++;

      partnerMap.set(conv.partner_id, existing);
    });

    return {
      program,
      stats: {
        total_conversions: programConversions.length,
        valid_conversions: valid.length,
        pending_conversions: pending.length,
        rejected_conversions: rejected.length,
        fraud_conversions: rejected.length, // rejected includes fraud in this filter
        conversion_rate: program.target_volume > 0
          ? (programConversions.length / program.target_volume) * 100
          : 0,
        total_cost: totalCost,
        avg_cpa: valid.length > 0 ? totalCost / valid.length : 0,
      },
      partner_breakdown: Array.from(partnerMap.values()).sort((a, b) => b.conversions - a.conversions),
    };
  });
}

/**
 * Get partner stats
 */
function getPartnerStats(
  programs: Program[],
  conversions: Conversion[],
  partners: Partner[]
) {
  const partnerMap = new Map<string, PartnerBreakdown>();

  conversions.forEach((conv) => {
    const existing = partnerMap.get(conv.partner_id) || {
      partner_id: conv.partner_id,
      partner_name: conv.partner_name,
      channel_type: conv.channel_type,
      conversions: 0,
      valid: 0,
      pending: 0,
      rejected: 0,
      fraud: 0,
    };

    existing.conversions++;
    if (conv.status === 'valid') existing.valid++;
    if (conv.status === 'pending') existing.pending++;
    if (conv.status === 'rejected') existing.rejected++;
    if (conv.status === 'fraud') existing.fraud++;

    partnerMap.set(conv.partner_id, existing);
  });

  return Array.from(partnerMap.values())
    .map((p) => ({
      ...p,
      valid_rate: p.conversions > 0 ? Math.round((p.valid / p.conversions) * 100) : 0,
    }))
    .sort((a, b) => b.conversions - a.conversions);
}

export default AdvertiserReportView;
