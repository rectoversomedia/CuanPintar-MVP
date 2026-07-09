'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, ArrowRight, MoreHorizontal, Eye, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { mockPrograms, formatCurrency, formatDate } from '@/lib/mock-data';
import { getStatusColor, getObjectiveLabel } from '@/lib/utils';

export default function AdvertiserProgramsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPrograms = statusFilter === 'all'
    ? mockPrograms
    : mockPrograms.filter(p => p.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Programs" subtitle="Manage your acquisition programs" />

        <main className="p-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search programs..."
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href="/advertiser/programs/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </Link>
          </div>

          {/* Programs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Programs ({filteredPrograms.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Objectives</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>CPA</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <Link
                          href={`/advertiser/programs/${program.id}`}
                          className="flex items-center gap-3 hover:text-blue-600"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            {program.brand_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{program.name}</p>
                            <p className="text-sm text-gray-500">{program.advertiser_name}</p>
                          </div>
                        </Link>
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
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(program.budget)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatCurrency(program.payout_amount)}</p>
                        <p className="text-xs text-gray-500">{program.payout_model}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {program.channels.slice(0, 3).map((ch) => (
                            <div
                              key={ch.channel_type}
                              className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs"
                              title={ch.channel_type}
                            >
                              {ch.channel_type.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {program.channels.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">
                              +{program.channels.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{formatDate(program.end_date)}</p>
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
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Program
                            </DropdownMenuItem>
                            {program.status === 'active' ? (
                              <DropdownMenuItem>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
