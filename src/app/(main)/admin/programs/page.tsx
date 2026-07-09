'use client';

import { useState } from 'react';
import {
  Megaphone,
  MagnifyingGlass,
  Pause,
  Play,
  Eye,
  DotsThreeVertical,
  CurrencyDollar,
  Target,
  TrendUp,
  Plus,
  ChartLine,
  Warning,
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
import { mockPrograms, formatCurrency, formatNumber, formatDate } from '@/lib/mock-data';
import { getStatusColor, getObjectiveLabel } from '@/lib/utils';

const colors = {
  primary: '#FF6B35',
  secondary: '#0066FF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
};

export default function AdminProgramsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const filteredPrograms = mockPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || program.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const activeCount = mockPrograms.filter(p => p.status === 'active').length;
  const pendingCount = mockPrograms.filter(p => p.status === 'pending').length;
  const totalBudget = mockPrograms.reduce((acc, p) => acc + p.budget, 0);
  const industries = [...new Set(mockPrograms.map(p => p.industry))];

  const stats = [
    { label: 'Total Programs', value: mockPrograms.length, icon: Megaphone, color: colors.primary },
    { label: 'Active', value: activeCount, icon: ChartLine, color: colors.success },
    { label: 'Pending Review', value: pendingCount, icon: Warning, color: colors.warning },
    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: CurrencyDollar, color: colors.secondary },
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
                Program Management
              </h1>
              <p className="text-sm text-gray-500">Manage acquisition programs across all advertisers</p>
            </div>
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#EC4899] hover:opacity-90 text-white shadow-lg">
              <Plus size={18} weight="bold" className="mr-2" />
              Create Program
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
                    placeholder="Search by program or advertiser name..."
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
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
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
            <div className="h-2 bg-gradient-to-r from-[#FF6B35] via-[#F59E0B] to-[#0066FF]" />
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Program</TableHead>
                  <TableHead className="font-semibold">Advertiser</TableHead>
                  <TableHead className="font-semibold">Model</TableHead>
                  <TableHead className="font-semibold">Budget</TableHead>
                  <TableHead className="font-semibold">Spent</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.map((program) => (
                  <TableRow key={program.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${colors.primary}15` }}
                        >
                          <Megaphone size={20} weight="duotone" style={{ color: colors.primary }} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{program.name}</p>
                          <p className="text-xs text-gray-500">{getObjectiveLabel(program.objectives[0])}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{program.advertiser_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#0066FF]/30 text-[#0066FF]">
                        {program.payout_model}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {formatCurrency(program.budget)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(program.payout_amount / program.budget) * 100}%`,
                              backgroundColor: colors.success,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{program.payout_model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          program.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : program.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : program.status === 'paused'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {program.status}
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
                            <TrendUp size={16} className="mr-2 text-green-600" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Pause size={16} className="mr-2 text-yellow-600" />
                            {program.status === 'active' ? 'Pause' : 'Activate'}
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
