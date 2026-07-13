'use client';

/**
 * Partner Performance Dashboard Component
 *
 * Shows partner their own performance stats:
 * - Total earnings
 * - Conversion stats
 * - Fraud rate (private to partner)
 * - Active programs
 * - Unique links & QR codes
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Download,
  Share2,
  QrCode,
  Link2,
  ExternalLink,
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import type { Partner, Program, UniqueLink } from '@/types';
import { formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';

interface PartnerPerformanceDashboardProps {
  partner: Partner;
  programs: Program[];
  links: UniqueLink[];
  recentConversions: Conversion[];
}

interface Conversion {
  id: string;
  program_name: string;
  status: 'pending' | 'valid' | 'rejected' | 'fraud';
  payout_amount: number;
  created_at: string;
}

export function PartnerPerformanceDashboard({
  partner,
  programs,
  links,
  recentConversions,
}: PartnerPerformanceDashboardProps) {
  const [selectedLink, setSelectedLink] = useState<UniqueLink | null>(null);

  // Calculate stats
  const totalClicks = links.reduce((sum, l) => sum + l.click_count, 0);
  const avgConversionRate = totalClicks > 0
    ? (links.reduce((sum, l) => sum + l.conversion_count, 0) / totalClicks * 100)
    : 0;

  // Fraud risk color
  const fraudRiskColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(partner.total_earnings)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(partner.pending_payout)} pending
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Paid out</span>
                <span className="font-medium">{formatCurrency(partner.total_paid)}</span>
              </div>
              <Progress value={(partner.total_paid / partner.total_earnings) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Total Conversions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(partner.total_conversions)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(partner.pending_conversions)} pending
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm">{partner.valid_conversions}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm">{partner.rejected_conversions + partner.fraud_conversions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Fraud Rate</p>
                <p className={`text-2xl font-bold ${fraudRiskColors[partner.fraud_risk]}`}>
                  {partner.fraud_rate}%
                </p>
                <Badge variant={partner.fraud_risk === 'low' ? 'default' : partner.fraud_risk === 'medium' ? 'secondary' : 'destructive'}>
                  {partner.fraud_risk.toUpperCase()}
                </Badge>
              </div>
              <div className={`p-3 rounded-full ${fraudRiskColors[partner.fraud_risk]}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Keep below 5% to maintain good standing
            </p>
          </CardContent>
        </Card>

        {/* Active Programs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Programs</p>
                <p className="text-2xl font-bold">{programs.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {programs.filter(p => p.status === 'active').length} active
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Your Quality Score</p>
              <Progress value={partner.quality_score} className="h-2 mt-1" />
              <p className="text-xs text-gray-500 text-right">{partner.quality_score}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tracking Links */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                My Tracking Links
              </CardTitle>
              <CardDescription>
                Unique links for each program. Share to earn!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({links.filter(l => l.is_active).length})</TabsTrigger>
                  <TabsTrigger value="all">All ({links.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  {links.filter(l => l.is_active).map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onViewDetails={() => setSelectedLink(link)}
                    />
                  ))}
                  {links.filter(l => l.is_active).length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No active links. Join a program to get your tracking links!
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {links.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onViewDetails={() => setSelectedLink(link)}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Click Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MousePointerClick className="w-4 h-4" />
                Click Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Clicks</span>
                <span className="font-bold">{formatNumber(totalClicks)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg. Conversion Rate</span>
                <span className="font-bold">{avgConversionRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Best CTR</span>
                <span className="font-bold text-green-600">8.5%</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentConversions.slice(0, 5).map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium truncate max-w-[150px]">{conv.program_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(conv.created_at)}</p>
                    </div>
                    <StatusBadge status={conv.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Link Details Modal */}
      {selectedLink && (
        <LinkDetailsModal
          link={selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}
    </div>
  );
}

/**
 * Link Card Component
 */
function LinkCard({
  link,
  onViewDetails,
}: {
  link: UniqueLink;
  onViewDetails: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate = link.click_count > 0
    ? (link.conversion_count / link.click_count * 100).toFixed(1)
    : '0';

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium">{link.link_code}</p>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">{link.short_url}</p>
        </div>
        <Badge variant={link.is_active ? 'default' : 'secondary'}>
          {link.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-3 text-center">
        <div>
          <p className="text-lg font-bold">{link.click_count}</p>
          <p className="text-xs text-gray-500">Clicks</p>
        </div>
        <div>
          <p className="text-lg font-bold">{link.conversion_count}</p>
          <p className="text-xs text-gray-500">Conversions</p>
        </div>
        <div>
          <p className="text-lg font-bold">{conversionRate}%</p>
          <p className="text-xs text-gray-500">CTR</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">{formatCurrency(link.total_payout || 0)}</p>
          <p className="text-xs text-gray-500">Earnings</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyToClipboard}>
          {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={link.qr_code_data} download={`qr-${link.link_code}.svg`}>
            <Download className="w-4 h-4 mr-1" />
            QR
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Share2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(link.short_url)}`)}>
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`mailto:?body=${encodeURIComponent(link.short_url)}`)}>
              Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(link.short_url)}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="outline" onClick={onViewDetails}>
          <Eye className="w-4 h-4 mr-1" />
          Details
        </Button>
      </div>
    </div>
  );
}

/**
 * Link Details Modal
 */
function LinkDetailsModal({
  link,
  onClose,
}: {
  link: UniqueLink;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link Details - {link.link_code}</DialogTitle>
          <DialogDescription>
            Created {formatDate(link.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <img
                src={link.qr_code_data}
                alt={`QR Code for ${link.link_code}`}
                className="w-48 h-48"
              />
              <p className="text-center text-sm mt-2 font-mono">{link.link_code}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{link.click_count}</p>
              <p className="text-sm text-gray-500">Total Clicks</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{link.conversion_count}</p>
              <p className="text-sm text-gray-500">Conversions</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{link.valid_conversions}</p>
              <p className="text-sm text-gray-500">Valid</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(link.total_payout || 0)}</p>
              <p className="text-sm text-gray-500">Earnings</p>
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Short URL</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={link.short_url}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                />
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(link.short_url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Full URL</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={link.full_url}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" asChild>
              <a href={link.qr_code_data} download={`qr-${link.link_code}.svg`}>
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </a>
            </Button>
            <Button className="flex-1" variant="outline" asChild>
              <a href={link.short_url} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: 'pending' | 'valid' | 'rejected' | 'fraud' }) {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    valid: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    rejected: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    fraud: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  };

  const { color, icon: Icon } = config[status];

  return (
    <Badge className={color}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
}

export default PartnerPerformanceDashboard;
