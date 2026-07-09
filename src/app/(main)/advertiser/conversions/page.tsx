'use client';

import { useState } from 'react';
import { ShoppingCart, Search, Filter, Download, Eye, CheckCircle2, XCircle, AlertTriangle, Clock, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { mockConversions, formatCurrency, formatDateTime, formatNumber } from '@/lib/mock-data';
import { getChannelLabel, getObjectiveLabel } from '@/lib/utils';

// Extended mock data for more conversions
const extendedConversions = [
  ...mockConversions,
  {
    id: 'conv_11',
    program_id: 'prog_1',
    program_name: 'Tunaiku Download + Registration',
    partner_id: 'part_3',
    partner_name: 'Local Media Bandung',
    channel_type: 'media',
    conversion_type: 'registration',
    user_identifier: 'user_12355',
    ip_address: '192.168.1.110',
    device_id: 'device_xyz111',
    status: 'valid',
    payout_amount: 25000,
    quality_score: 88,
    fraud_signals: [],
    created_at: '2024-06-03T08:00:00Z',
  },
  {
    id: 'conv_12',
    program_id: 'prog_2',
    program_name: 'PRULady Lead Form',
    partner_id: 'part_6',
    partner_name: 'Affiliate Finance Partner',
    channel_type: 'affiliate',
    conversion_type: 'lead_form',
    user_identifier: 'user_12356',
    ip_address: '192.168.1.111',
    device_id: 'device_xyz222',
    status: 'pending',
    payout_amount: 50000,
    quality_score: 72,
    fraud_signals: ['suspicious_velocity'],
    created_at: '2024-06-03T09:30:00Z',
  },
  {
    id: 'conv_13',
    program_id: 'prog_3',
    program_name: 'XL eSIM Purchase',
    partner_id: 'part_8',
    partner_name: 'Automotive Creator',
    channel_type: 'creator',
    conversion_type: 'purchase',
    user_identifier: 'user_12357',
    ip_address: '192.168.1.112',
    device_id: 'device_xyz333',
    status: 'valid',
    payout_amount: 15000,
    quality_score: 91,
    fraud_signals: [],
    created_at: '2024-06-03T10:45:00Z',
  },
  {
    id: 'conv_14',
    program_id: 'prog_4',
    program_name: 'Pegadaian App Download + Registration',
    partner_id: 'part_4',
    partner_name: 'Parenting Community Indonesia',
    channel_type: 'community',
    conversion_type: 'registration',
    user_identifier: 'user_12358',
    ip_address: '192.168.1.113',
    device_id: 'device_xyz444',
    status: 'valid',
    payout_amount: 20000,
    quality_score: 89,
    fraud_signals: [],
    created_at: '2024-06-03T11:00:00Z',
  },
  {
    id: 'conv_15',
    program_id: 'prog_6',
    program_name: 'Bank Saqu Download + Registration',
    partner_id: 'part_5',
    partner_name: 'Campus Sales Team',
    channel_type: 'sales',
    conversion_type: 'registration',
    user_identifier: 'user_12359',
    ip_address: '192.168.1.114',
    device_id: 'device_xyz555',
    status: 'rejected',
    payout_amount: 35000,
    quality_score: 42,
    fraud_signals: ['invalid_email', 'duplicate_device'],
    created_at: '2024-06-03T12:15:00Z',
  },
  {
    id: 'conv_16',
    program_id: 'prog_7',
    program_name: 'TMRW App Registration',
    partner_id: 'part_2',
    partner_name: 'Finance Creator Jakarta',
    channel_type: 'creator',
    conversion_type: 'registration',
    user_identifier: 'user_12360',
    ip_address: '192.168.1.115',
    device_id: 'device_xyz666',
    status: 'fraud',
    payout_amount: 40000,
    quality_score: 25,
    fraud_signals: ['emulator_suspected', 'proxy_vpn', 'duplicate_ip'],
    created_at: '2024-06-03T13:30:00Z',
  },
  {
    id: 'conv_17',
    program_id: 'prog_1',
    program_name: 'Tunaiku Download + Registration',
    partner_id: 'part_1',
    partner_name: 'JakselNews Media Network',
    channel_type: 'media',
    conversion_type: 'app_install',
    user_identifier: 'user_12361',
    ip_address: '192.168.1.116',
    device_id: 'device_xyz777',
    status: 'valid',
    payout_amount: 15000,
    quality_score: 94,
    fraud_signals: [],
    created_at: '2024-06-03T14:00:00Z',
  },
  {
    id: 'conv_18',
    program_id: 'prog_5',
    program_name: 'AstraPay Review & Rating',
    partner_id: 'part_7',
    partner_name: 'Mission User Network',
    channel_type: 'mission',
    conversion_type: 'review_rating',
    user_identifier: 'user_12362',
    ip_address: '192.168.1.117',
    device_id: 'device_xyz888',
    status: 'fraud',
    payout_amount: 10000,
    quality_score: 30,
    fraud_signals: ['duplicate_device', 'suspicious_velocity'],
    created_at: '2024-06-03T15:30:00Z',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'fraud':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" />;
    default:
      return null;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'valid':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'fraud':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdvertiserConversionsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<string>('7d');

  const filteredConversions = extendedConversions.filter((conv) => {
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || conv.channel_type === channelFilter;
    const matchesSearch = searchQuery === '' ||
      conv.user_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.program_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesChannel && matchesSearch;
  });

  const stats = {
    total: extendedConversions.length,
    valid: extendedConversions.filter(c => c.status === 'valid').length,
    pending: extendedConversions.filter(c => c.status === 'pending').length,
    fraud: extendedConversions.filter(c => c.status === 'fraud').length,
    rejected: extendedConversions.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Conversions" subtitle="Track and manage all conversion events" />

        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Valid</p>
                    <p className="text-xl font-bold text-green-600">{stats.valid}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Fraud</p>
                    <p className="text-xl font-bold text-red-600">{stats.fraud}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by user, partner, or program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="fraud">Fraud</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="affiliate">Affiliate</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="mission">Mission</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Conversion Events ({filteredConversions.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConversions.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell>
                          <span className="font-mono text-sm">{conv.user_identifier}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium max-w-[180px] truncate block" title={conv.program_name}>
                            {conv.program_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm max-w-[150px] truncate block" title={conv.partner_name}>
                            {conv.partner_name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getChannelLabel(conv.channel_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getObjectiveLabel(conv.conversion_type)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(conv.status)}
                            <Badge className={getStatusBadgeClass(conv.status)}>
                              {conv.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            conv.quality_score >= 85 ? 'text-green-600' :
                            conv.quality_score >= 70 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {conv.quality_score}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(conv.payout_amount)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">{formatDateTime(conv.created_at)}</span>
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
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View in Program
                              </DropdownMenuItem>
                              {conv.status === 'pending' && (
                                <>
                                  <DropdownMenuItem>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredConversions.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No conversions found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
