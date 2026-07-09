'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ExternalLink, Copy, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Target, MoreHorizontal } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockPrograms, mockPartnerDashboard, formatCurrency, formatDate } from '@/lib/mock-data';
import { getStatusColor } from '@/lib/utils';

// Mock joined programs data with partner-specific stats
const joinedPrograms = mockPrograms.slice(0, 6).map((program, index) => ({
  ...program,
  conversions: [45, 78, 32, 56, 89, 41][index],
  validConversions: [42, 72, 30, 54, 82, 38][index],
  earnings: [1050000, 1800000, 750000, 1350000, 2050000, 950000][index],
  trackingLink: `https://cuanpintar.com/track/${program.id}/partner_1`,
  joinedAt: ['2024-04-01', '2024-04-15', '2024-05-01', '2024-05-10', '2024-05-15', '2024-06-01'][index],
}));

export default function PartnerProgramsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredPrograms = joinedPrograms.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEarnings = filteredPrograms.reduce((sum, p) => sum + p.earnings, 0);
  const totalConversions = filteredPrograms.reduce((sum, p) => sum + p.conversions, 0);
  const totalValidConversions = filteredPrograms.reduce((sum, p) => sum + p.validConversions, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="My Programs" subtitle="Manage your joined affiliate programs" />

        <main className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPartnerDashboard.active_programs}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalConversions.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valid Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalValidConversions.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-lg">
                          {program.brand_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{program.name}</h3>
                          <p className="text-sm text-gray-500">{program.advertiser_name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Conversions</span>
                        <span className="font-medium text-gray-900">{program.conversions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Valid</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="font-medium text-green-600">{program.validConversions}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Earnings</span>
                        <span className="font-semibold text-green-600">{formatCurrency(program.earnings)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Payout Rate</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(program.payout_amount)} / {program.payout_model}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/partner/programs/${program.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        Get Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Valid</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                      <TableHead>Tracking Link</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{program.name}</p>
                            <p className="text-xs text-gray-500">Since {formatDate(program.joinedAt)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm">
                              {program.brand_name.charAt(0)}
                            </div>
                            <span className="text-sm">{program.advertiser_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(program.status)}>
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{program.conversions}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 font-medium">{program.validConversions}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(program.earnings)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              {program.trackingLink.substring(0, 30)}...
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/partner/programs/${program.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Download Assets</DropdownMenuItem>
                              <DropdownMenuItem>View Conversions</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {filteredPrograms.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline">Browse Marketplace</Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
