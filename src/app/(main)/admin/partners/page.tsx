'use client';

import { useState } from 'react';
import {
  Users,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Eye,
  DotsThreeVertical,
  CurrencyDollar,
  MapPin,
  Star,
  Warning,
  TrendUp,
  Plus,
  ShieldCheck,
} from '@phosphor-icons/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockPartners, formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';
import { getPartnerTypeLabel } from '@/lib/utils';

const colors = {
  primary: '#FF6B35',
  secondary: '#0066FF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
};

export default function AdminPartnersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredPartners = mockPartners.filter(partner => {
    const matchesSearch = partner.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;
    const matchesType = typeFilter === 'all' || partner.partner_type === typeFilter;
    const matchesRisk = riskFilter === 'all' || partner.fraud_risk === riskFilter;
    return matchesSearch && matchesStatus && matchesType && matchesRisk;
  });

  const pendingCount = mockPartners.filter(p => p.status === 'pending').length;
  const activeCount = mockPartners.filter(p => p.status === 'active').length;
  const highRiskCount = mockPartners.filter(p => p.fraud_risk === 'high').length;
  const totalEarnings = mockPartners.reduce((acc, p) => acc + p.total_earnings, 0);

  const stats = [
    { label: 'Total Partners', value: mockPartners.length, icon: Users, color: colors.purple },
    { label: 'Active', value: activeCount, icon: CheckCircle, color: colors.success },
    { label: 'High Risk', value: highRiskCount, icon: Warning, color: colors.danger },
    { label: 'Total Earnings', value: formatCurrency(totalEarnings), icon: CurrencyDollar, color: colors.primary },
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
                Partner Management
              </h1>
              <p className="text-sm text-gray-500">Manage partners, quality scores, and fraud risks</p>
            </div>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white shadow-lg">
              <Plus size={18} weight="bold" className="mr-2" />
              Add Partner
            </Button>
          </div>
        </header>

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon size={24} weight="duotone" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg mb-6 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or niche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px] border-gray-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px] border-gray-200">
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#FF6B35]" />
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Partner</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Earnings</TableHead>
                  <TableHead className="font-semibold">Quality</TableHead>
                  <TableHead className="font-semibold">Risk</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.secondary})` }}
                        >
                          {partner.partner_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{partner.partner_name}</p>
                          <p className="text-xs text-gray-500">{partner.niche}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#8B5CF6]/30 text-[#8B5CF6]">
                        {getPartnerTypeLabel(partner.partner_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin size={14} />
                        {partner.location || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(partner.total_earnings)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star size={14} weight="fill" className="text-yellow-500" />
                        <span className="font-semibold text-gray-900">{partner.quality_score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          partner.fraud_risk === 'low'
                            ? 'bg-green-100 text-green-700'
                            : partner.fraud_risk === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {partner.fraud_risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          partner.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : partner.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {partner.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                            <DotsThreeVertical size={20} weight="bold" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ShieldCheck size={16} className="mr-2 text-green-600" />
                            Verify Partner
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <XCircle size={16} className="mr-2 text-red-600" />
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </main>
      </div>
    </div>
  );
}
