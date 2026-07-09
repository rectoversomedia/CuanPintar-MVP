'use client';

import { useState } from 'react';
import { ArrowLeftRight, Search, Check, X, Eye, AlertTriangle, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { mockConversions, formatCurrency, formatDateTime } from '@/lib/mock-data';
import { getChannelLabel } from '@/lib/utils';

export default function AdminConversionsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedConversion, setSelectedConversion] = useState<typeof mockConversions[0] | null>(null);

  const filteredConversions = mockConversions.filter(conv => {
    const matchesSearch = conv.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || conv.channel_type === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const pendingCount = mockConversions.filter(c => c.status === 'pending').length;
  const validCount = mockConversions.filter(c => c.status === 'valid').length;
  const fraudCount = mockConversions.filter(c => c.status === 'fraud' || c.fraud_signals.length > 0).length;
  const rejectedCount = mockConversions.filter(c => c.status === 'rejected').length;

  const handleApprove = (id: string) => {
    console.log('Approve conversion:', id);
  };

  const handleReject = (id: string) => {
    console.log('Reject conversion:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Conversion Validation" subtitle="Review and validate conversion submissions" />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
                    <p className="text-3xl font-bold text-gray-900">{mockConversions.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ArrowLeftRight className="w-6 h-6" />
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
                    <p className="text-sm text-gray-500 mb-1">Valid</p>
                    <p className="text-3xl font-bold text-green-600">{validCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Flagged</p>
                    <p className="text-3xl font-bold text-red-600">{fraudCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
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
                  placeholder="Search by ID, program, partner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
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
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="mission">Mission</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversions ({filteredConversions.length})</CardTitle>
                  <CardDescription>
                    Validate conversions and review fraud signals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conversion ID</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fraud Signals</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversions.map((conv) => (
                    <TableRow key={conv.id} className={conv.fraud_signals.length > 0 ? 'bg-red-50/50' : ''}>
                      <TableCell>
                        <span className="font-mono text-sm">{conv.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{conv.program_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{conv.partner_name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getChannelLabel(conv.channel_type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">{conv.user_identifier}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDateTime(conv.created_at)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(conv.payout_amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          conv.status === 'valid' ? 'bg-green-100 text-green-800' :
                          conv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          conv.status === 'rejected' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {conv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conv.fraud_signals.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">{conv.fraud_signals.length} signals</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversion(conv)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          {conv.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(conv.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(conv.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Conversion Details Dialog */}
          <Dialog open={!!selectedConversion} onOpenChange={() => setSelectedConversion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Conversion Details</DialogTitle>
              </DialogHeader>
              {selectedConversion && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Conversion ID</p>
                      <p className="font-mono">{selectedConversion.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge className={
                        selectedConversion.status === 'valid' ? 'bg-green-100 text-green-800' :
                        selectedConversion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedConversion.status === 'rejected' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedConversion.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Program</p>
                      <p className="font-medium">{selectedConversion.program_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Partner</p>
                      <p>{selectedConversion.partner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Channel</p>
                      <p>{getChannelLabel(selectedConversion.channel_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conversion Type</p>
                      <p>{selectedConversion.conversion_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User Identifier</p>
                      <p className="font-mono text-sm">{selectedConversion.user_identifier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IP Address</p>
                      <p className="font-mono text-sm">{selectedConversion.ip_address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Device ID</p>
                      <p className="font-mono text-sm">{selectedConversion.device_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payout</p>
                      <p className="font-bold text-blue-600">{formatCurrency(selectedConversion.payout_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quality Score</p>
                      <p className={selectedConversion.quality_score >= 80 ? 'text-green-600' :
                        selectedConversion.quality_score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                        {selectedConversion.quality_score}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Timestamp</p>
                      <p>{formatDateTime(selectedConversion.created_at)}</p>
                    </div>
                  </div>

                  {selectedConversion.fraud_signals.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Fraud Signals</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedConversion.fraud_signals.map((signal) => (
                          <Badge key={signal} variant="destructive" className="text-sm">
                            {signal.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedConversion.status === 'pending' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          handleApprove(selectedConversion.id);
                          setSelectedConversion(null);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Conversion
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          handleReject(selectedConversion.id);
                          setSelectedConversion(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject Conversion
                      </Button>
                    </div>
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
