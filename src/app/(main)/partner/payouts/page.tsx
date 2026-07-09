'use client';

import { useState } from 'react';
import { Search, Filter, Download, CreditCard, Clock, CheckCircle, AlertCircle, DollarSign, TrendingUp, Calendar, FileText, ExternalLink, MoreHorizontal } from 'lucide-react';
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
import { mockPayouts, formatCurrency, formatDate } from '@/lib/mock-data';
import { getStatusColor } from '@/lib/utils';

// Extend mock payouts with additional mock data for richer display
const extendedPayouts = [
  ...mockPayouts,
  {
    id: 'payout_6',
    partner_id: 'part_1',
    partner_name: 'JakselNews Media Network',
    amount: 2100000,
    status: 'processing',
    payment_method: 'bank_transfer',
    bank_account: 'BCA 1234567890',
    approved_conversions: 84,
    created_at: '2024-06-10T09:00:00Z',
  },
  {
    id: 'payout_7',
    partner_id: 'part_1',
    partner_name: 'JakselNews Media Network',
    amount: 1850000,
    status: 'paid',
    payment_method: 'bank_transfer',
    bank_account: 'BCA 1234567890',
    approved_conversions: 74,
    paid_at: '2024-05-01T00:00:00Z',
    created_at: '2024-04-25T10:00:00Z',
  },
  {
    id: 'payout_8',
    partner_id: 'part_1',
    partner_name: 'JakselNews Media Network',
    amount: 3200000,
    status: 'paid',
    payment_method: 'gopay',
    approved_conversions: 128,
    paid_at: '2024-04-01T00:00:00Z',
    created_at: '2024-03-25T11:00:00Z',
  },
];

export default function PartnerPayoutsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPayouts = extendedPayouts.filter((payout) => {
    const matchesSearch =
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatCurrency(payout.amount).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = filteredPayouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalProcessing = filteredPayouts
    .filter(p => p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = filteredPayouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalConversions = filteredPayouts.reduce((sum, p) => sum + p.approved_conversions, 0);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'gopay':
        return <span className="text-sm font-bold text-green-600">G</span>;
      case 'ovo':
        return <span className="text-sm font-bold text-purple-600">O</span>;
      case 'dana':
        return <span className="text-sm font-bold text-blue-600">D</span>;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'gopay':
        return 'GoPay';
      case 'ovo':
        return 'OVO';
      case 'dana':
        return 'DANA';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge className={getStatusColor(status)}>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Payout History" subtitle="Track your earnings and payment status" />

        <main className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
                    <p className="text-xs text-green-600 mt-1">{filteredPayouts.filter(p => p.status === 'paid').length} payouts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-200 text-green-600 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Processing</p>
                    <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalProcessing)}</p>
                    <p className="text-xs text-blue-600 mt-1">{filteredPayouts.filter(p => p.status === 'processing').length} payouts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">{formatCurrency(totalPending)}</p>
                    <p className="text-xs text-yellow-600 mt-1">{filteredPayouts.filter(p => p.status === 'pending').length} payouts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-200 text-yellow-600 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
                    <p className="text-xs text-gray-500 mt-1">across all payouts</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
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
                  placeholder="Search payouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Payouts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">{payout.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{formatCurrency(payout.amount)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payout.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            {getPaymentMethodIcon(payout.payment_method)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getPaymentMethodLabel(payout.payment_method)}
                            </p>
                            {payout.bank_account && (
                              <p className="text-xs text-gray-500">{payout.bank_account}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-gray-900">{payout.approved_conversions}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(payout.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payout.paid_at ? (
                          <span className="text-sm text-gray-600">{formatDate(payout.paid_at)}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Invoice
                            </DropdownMenuItem>
                            {payout.status === 'paid' && (
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Transaction
                              </DropdownMenuItem>
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

          {filteredPayouts.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payouts found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button variant="outline">View Earnings</Button>
            </Card>
          )}

          {/* Payment Methods Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Your registered payment methods for receiving payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-sm text-gray-500">BCA 1234567890</p>
                    <p className="text-xs text-green-600">Primary</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-green-600">G</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">GoPay</p>
                    <p className="text-sm text-gray-500">+62 812 **** 3456</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">D</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">DANA</p>
                    <p className="text-sm text-gray-500">+62 812 **** 3456</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Payment Methods
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
