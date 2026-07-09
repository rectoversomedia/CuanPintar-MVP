'use client';

import { useState } from 'react';
import { Banknote, Search, Check, Eye, DollarSign, Users, CreditCard, Filter, Clock, CheckCircle2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mockPayouts, formatCurrency, formatDate } from '@/lib/mock-data';
import { getStatusColor } from '@/lib/utils';

export default function AdminPayoutsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedPayout, setSelectedPayout] = useState<typeof mockPayouts[0] | null>(null);

  const filteredPayouts = mockPayouts.filter(payout => {
    const matchesSearch = payout.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || payout.payment_method === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pendingCount = mockPayouts.filter(p => p.status === 'pending').length;
  const processingCount = mockPayouts.filter(p => p.status === 'processing').length;
  const paidCount = mockPayouts.filter(p => p.status === 'paid').length;
  const totalPending = mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = mockPayouts.filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleMarkPaid = (id: string) => {
    console.log('Mark payout as paid:', id);
  };

  const handleProcessPayout = (payout: typeof mockPayouts[0]) => {
    console.log('Process payout:', payout);
    setSelectedPayout(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Payout Management" subtitle="Process and track partner commission payments" />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Payouts</p>
                    <p className="text-3xl font-bold text-gray-900">{mockPayouts.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Banknote className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Processing</p>
                    <p className="text-3xl font-bold text-blue-600">{processingCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-800">{formatCurrency(totalPending)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Paid This Month</p>
                    <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Paid Conversions</p>
                    <p className="text-2xl font-bold text-blue-800">{paidCount} payouts</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
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
                  placeholder="Search by partner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="gopay">GoPay</SelectItem>
                  <SelectItem value="ovo">OVO</SelectItem>
                  <SelectItem value="dana">DANA</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              Process All Pending
            </Button>
          </div>

          {/* Payouts Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payouts ({filteredPayouts.length})</CardTitle>
                  <CardDescription>
                    Manage partner commission payments and tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Approved Conversions</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{payout.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                            {payout.partner_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{payout.partner_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{payout.approved_conversions}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">{formatCurrency(payout.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {payout.payment_method.replace(/_/g, ' ')}
                        </Badge>
                        {payout.bank_account && (
                          <p className="text-xs text-gray-500 mt-1">{payout.bank_account}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(payout.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        {payout.paid_at ? (
                          <span className="text-sm text-gray-600">{formatDate(payout.paid_at)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          {payout.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleMarkPaid(payout.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          {payout.status === 'processing' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => setSelectedPayout(payout)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payout Details Dialog */}
          <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Payout Details</DialogTitle>
              </DialogHeader>
              {selectedPayout && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payout ID</p>
                      <p className="font-mono">{selectedPayout.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={getStatusColor(selectedPayout.status)}>
                        {selectedPayout.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Partner</p>
                      <p className="font-medium">{selectedPayout.partner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Partner ID</p>
                      <p className="font-mono text-sm">{selectedPayout.partner_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Approved Conversions</p>
                      <p className="font-medium">{selectedPayout.approved_conversions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-bold text-2xl text-blue-600">{formatCurrency(selectedPayout.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="capitalize">{selectedPayout.payment_method.replace(/_/g, ' ')}</p>
                    </div>
                    {selectedPayout.bank_account && (
                      <div>
                        <p className="text-sm text-gray-500">Bank Account</p>
                        <p className="font-mono">{selectedPayout.bank_account}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p>{formatDate(selectedPayout.created_at)}</p>
                    </div>
                    {selectedPayout.paid_at && (
                      <div>
                        <p className="text-sm text-gray-500">Paid Date</p>
                        <p>{formatDate(selectedPayout.paid_at)}</p>
                      </div>
                    )}
                  </div>

                  {selectedPayout.status === 'pending' && (
                    <DialogFooter className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedPayout(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleProcessPayout(selectedPayout)}
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Process Payment
                      </Button>
                    </DialogFooter>
                  )}

                  {selectedPayout.status === 'processing' && (
                    <DialogFooter className="pt-4">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleMarkPaid(selectedPayout.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Paid
                      </Button>
                    </DialogFooter>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
