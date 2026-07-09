'use client';

import { useState } from 'react';
import { Megaphone, Search, Star, Pause, Play, Eye, MoreHorizontal, Filter, DollarSign, Target } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const featuredCount = mockPrograms.filter(p => p.status === 'active').slice(0, 3).length;

  const handleFeature = (id: string) => {
    console.log('Feature program:', id);
  };

  const handlePause = (id: string) => {
    console.log('Pause program:', id);
  };

  const handleResume = (id: string) => {
    console.log('Resume program:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Program Management" subtitle="Monitor and control all affiliate programs" />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Programs</p>
                    <p className="text-3xl font-bold text-gray-900">{mockPrograms.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Megaphone className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-600">{activeCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Play className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {[...new Set(mockPrograms.map(p => p.industry))].map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>
              Create Program
            </Button>
          </div>

          {/* Programs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Programs ({filteredPrograms.length})</CardTitle>
                  <CardDescription>
                    Control program status, budgets, and featured placements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Objectives</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Target Volume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">
                            {program.brand_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{program.name}</span>
                            <p className="text-sm text-gray-500">{program.industry}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{program.advertiser_name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {program.objectives.slice(0, 2).map((obj) => (
                            <Badge key={obj} variant="secondary" className="text-xs">
                              {getObjectiveLabel(obj)}
                            </Badge>
                          ))}
                          {program.objectives.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{program.objectives.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(program.payout_amount)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/ {program.payout_model}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(program.budget)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatNumber(program.target_volume)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Conversions</DropdownMenuItem>
                            <DropdownMenuItem>Edit Program</DropdownMenuItem>
                            {program.status === 'active' ? (
                              <>
                                <DropdownMenuItem onClick={() => handlePause(program.id)}>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause Program
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleFeature(program.id)}>
                                  <Star className="w-4 h-4 mr-2" />
                                  Feature Program
                                </DropdownMenuItem>
                              </>
                            ) : program.status === 'paused' ? (
                              <DropdownMenuItem onClick={() => handleResume(program.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Resume Program
                              </DropdownMenuItem>
                            ) : null}
                            {program.status === 'pending' && (
                              <DropdownMenuItem>Approve Program</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
