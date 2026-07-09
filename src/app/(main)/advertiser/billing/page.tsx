'use client';

import { useState } from 'react';
import { Receipt, DollarSign, CreditCard, Download, Plus, ExternalLink, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate } from '@/lib/mock-data';

// Mock billing data
const spendSummary = {
  totalSpend: 125000000,
  thisMonth: 35000000,
  lastMonth: 32000000,
  budget: 150000000,
  pendingInvoices: 12500000,
};

const invoices = [
  { id: 'INV-2024-006', amount: 12500000, status: 'pending', dueDate: '2024-07-15', items: 3, paidAt: null },
  { id: 'INV-2024-005', amount: 12000000, status: 'paid', dueDate: '2024-06-15', items: 3, paidAt: '2024-06-12' },
  { id: 'INV-2024-004', amount: 11500000, status: 'paid', dueDate: '2024-05-15', items: 3, paidAt: '2024-05-10' },
  { id: 'INV-2024-003', amount: 10800000, status: 'paid', dueDate: '2024-04-15', items: 3, paidAt: '2024-04-12' },
  { id: 'INV-2024-002', amount: 9500000, status: 'paid', dueDate: '2024-03-15', items: 3, paidAt: '2024-03-10' },
  { id: 'INV-2024-001', amount: 8200000, status: 'paid', dueDate: '2024-02-15', items: 3, paidAt: '2024-02-12' },
];

const paymentHistory = [
  { id: 'PAY-2024-005', date: '2024-06-12', amount: 12000000, method: 'Bank Transfer', invoiceId: 'INV-2024-005', status: 'completed' },
  { id: 'PAY-2024-004', date: '2024-05-10', amount: 11500000, method: 'Bank Transfer', invoiceId: 'INV-2024-004', status: 'completed' },
  { id: 'PAY-2024-003', date: '2024-04-12', amount: 10800000, method: 'Bank Transfer', invoiceId: 'INV-2024-003', status: 'completed' },
  { id: 'PAY-2024-002', date: '2024-03-10', amount: 9500000, method: 'Bank Transfer', invoiceId: 'INV-2024-002', status: 'completed' },
  { id: 'PAY-2024-001', date: '2024-02-12', amount: 8200000, method: 'Bank Transfer', invoiceId: 'INV-2024-001', status: 'completed' },
];

const paymentMethods = [
  { id: 'pm_1', type: 'Bank Transfer', last4: '7890', bank: 'BCA', isDefault: true },
  { id: 'pm_2', type: 'Bank Transfer', last4: '4567', bank: 'Mandiri', isDefault: false },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-500" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdvertiserBillingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const budgetUtilization = (spendSummary.totalSpend / spendSummary.budget) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Billing" subtitle="Manage your spending and invoices" />

        <main className="p-6">
          {/* Budget Overview */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="text-blue-100 mb-1">Total Spend</p>
                  <p className="text-4xl font-bold text-white mb-2">{formatCurrency(spendSummary.totalSpend)}</p>
                  <p className="text-blue-200 text-sm">
                    Budget: {formatCurrency(spendSummary.budget)} ({budgetUtilization.toFixed(1)}% used)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">This Month</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(spendSummary.thisMonth)}</p>
                  </div>
                  <div className="w-px h-10 bg-blue-400/30" />
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Last Month</p>
                    <p className="text-xl font-semibold text-white">{formatCurrency(spendSummary.lastMonth)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-100">Budget Utilization</span>
                  <span className="text-white font-medium">{budgetUtilization.toFixed(1)}%</span>
                </div>
                <Progress value={budgetUtilization} className="h-3 bg-blue-500/30 [&>div]:bg-white" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending Invoices</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(spendSummary.pendingInvoices)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Methods</p>
                    <p className="text-2xl font-bold text-gray-900">{paymentMethods.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoices */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Invoices</CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{invoice.id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <Badge className={getStatusBadgeClass(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">{formatDate(invoice.dueDate)}</span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Payment Methods</CardTitle>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{method.bank}</p>
                          <p className="text-xs text-gray-500">**** {method.last4}</p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Payments</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spending by Program */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Spending by Program</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Tunaiku Download + Registration</span>
                      <span className="font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">PRULady Lead Form</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">XL eSIM Purchase</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Others</span>
                      <span className="font-medium">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
