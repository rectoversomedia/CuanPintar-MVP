'use client';

import { useState } from 'react';
import {
  Buildings,
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  XCircle,
  Eye,
  DotsThreeVertical,
  CurrencyDollar,
  Users,
  TrendUp,
  Plus,
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
import { mockAdvertisers, formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';

const colors = {
  primary: '#FF6B35',
  secondary: '#0066FF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
};

export default function AdminAdvertisersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const filteredAdvertisers = mockAdvertisers.filter(advertiser => {
    const matchesSearch = advertiser.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advertiser.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || advertiser.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || advertiser.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const industries = [...new Set(mockAdvertisers.map(a => a.industry))];
  const pendingCount = mockAdvertisers.filter(a => a.status === 'pending').length;
  const activeCount = mockAdvertisers.filter(a => a.status === 'active').length;
  const totalSpend = mockAdvertisers.reduce((acc, a) => acc + a.total_spend, 0);

  const stats = [
    { label: 'Total Advertisers', value: mockAdvertisers.length, icon: Buildings, color: colors.secondary },
    { label: 'Active', value: activeCount, icon: CheckCircle, color: colors.success },
    { label: 'Pending Review', value: pendingCount, icon: TrendUp, color: colors.warning },
    { label: 'Total Spend', value: formatCurrency(totalSpend), icon: CurrencyDollar, color: colors.primary },
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
                Advertiser Management
              </h1>
              <p className="text-sm text-gray-500">Manage advertiser accounts and approvals</p>
            </div>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white shadow-lg">
              <Plus size={18} weight="bold" className="mr-2" />
              Add Advertiser
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
                    placeholder="Search by company name or industry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger className="w-[180px] border-gray-200">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#FF6B35] via-[#EC4899] to-[#8B5CF6]" />
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Industry</TableHead>
                  <TableHead className="font-semibold">Programs</TableHead>
                  <TableHead className="font-semibold">Total Spend</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Joined</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvertisers.map((advertiser) => (
                  <TableRow key={advertiser.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                        >
                          {advertiser.company_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{advertiser.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{advertiser.industry}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {advertiser.active_programs} programs
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(advertiser.total_spend)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          advertiser.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : advertiser.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {advertiser.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(advertiser.created_at)}
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
                            <CheckCircle size={16} className="mr-2 text-green-600" />
                            Approve
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
