'use client';

import { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, Eye, Check, X, Filter, Shield, Monitor, Wifi } from 'lucide-react';
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
import { mockConversions, mockPartners, formatCurrency, formatDateTime } from '@/lib/mock-data';
import { getChannelLabel } from '@/lib/utils';

const fraudSignalDescriptions: Record<string, string> = {
  'duplicate_ip': 'Multiple conversions from the same IP address',
  'duplicate_device': 'Same device ID used for multiple conversions',
  'suspicious_velocity': 'Unusually high conversion rate in short time period',
  'invalid_phone': 'Phone number format is invalid or non-existent',
  'invalid_email': 'Email address is malformed or non-existent',
  'emulator_suspected': 'Device appears to be an emulator or simulator',
  'proxy_vpn': 'Traffic routed through proxy or VPN service',
  'low_engagement': 'User showed minimal engagement before conversion',
};

export default function AdminFraudPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [signalFilter, setSignalFilter] = useState('all');
  const [selectedConversion, setSelectedConversion] = useState<typeof mockConversions[0] | null>(null);

  // Get flagged conversions (fraud status or have fraud signals)
  const flaggedConversions = mockConversions.filter(
    conv => conv.status === 'fraud' || conv.fraud_signals.length > 0
  );

  const filteredConversions = flaggedConversions.filter(conv => {
    const matchesSearch = conv.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'all' || conv.channel_type === channelFilter;
    const matchesSignal = signalFilter === 'all' || conv.fraud_signals.includes(signalFilter as typeof conv.fraud_signals[0]);
    return matchesSearch && matchesChannel && matchesSignal;
  });

  // Get unique fraud signals for filter
  const allFraudSignals = [...new Set(flaggedConversions.flatMap(c => c.fraud_signals))];

  const totalFlagged = flaggedConversions.length;
  const confirmedFraud = flaggedConversions.filter(c => c.status === 'fraud').length;
  const potentialFraud = flaggedConversions.filter(c => c.status !== 'fraud' && c.fraud_signals.length > 0).length;
  const potentialLoss = flaggedConversions.reduce((acc, c) => acc + c.payout_amount, 0);

  const handleDismiss = (id: string) => {
    console.log('Dismiss fraud flag:', id);
  };

  const handleConfirmFraud = (id: string) => {
    console.log('Confirm fraud:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Fraud Review" subtitle="Review flagged conversions and fraud signals" />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Flagged Conversions</p>
                    <p className="text-3xl font-bold text-red-600">{totalFlagged}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Confirmed Fraud</p>
                    <p className="text-3xl font-bold text-red-700">{confirmedFraud}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-200 text-red-700 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Needs Review</p>
                    <p className="text-3xl font-bold text-yellow-600">{potentialFraud}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Monitor className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Potential Loss</p>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(potentialLoss)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
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
              <Select value={signalFilter} onValueChange={setSignalFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Fraud Signal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signals</SelectItem>
                  {allFraudSignals.map((signal) => (
                    <SelectItem key={signal} value={signal}>
                      {signal.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fraud Table */}
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Flagged Conversions ({filteredConversions.length})
                  </CardTitle>
                  <CardDescription>
                    Review conversions with fraud signals and take action
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-red-200">
                    <TableHead>Conversion ID</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Signal Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversions.map((conv) => (
                    <TableRow key={conv.id} className="bg-red-50/50 border-red-200">
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
                        <span className="font-mono text-sm">{conv.ip_address}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500">{conv.device_id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-bold text-red-600">{conv.fraud_signals.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          conv.status === 'fraud' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }>
                          {conv.status === 'fraud' ? 'Confirmed' : 'Pending'}
                        </Badge>
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
                          {conv.status !== 'fraud' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleDismiss(conv.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                                onClick={() => handleConfirmFraud(conv.id)}
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
              {filteredConversions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No flagged conversions found matching your filters.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fraud Details Dialog */}
          <Dialog open={!!selectedConversion} onOpenChange={() => setSelectedConversion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Fraud Review Details
                </DialogTitle>
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
                        selectedConversion.status === 'fraud' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedConversion.status === 'fraud' ? 'Confirmed Fraud' : 'Pending Review'}
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
                      <p className="text-sm text-gray-500">Payout Amount</p>
                      <p className="font-bold text-red-600">{formatCurrency(selectedConversion.payout_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">IP Address</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{selectedConversion.ip_address}</p>
                        {selectedConversion.fraud_signals.includes('proxy_vpn') && (
                          <span title="Proxy/VPN detected"><Wifi className="w-4 h-4 text-red-500" /></span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Device ID</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs">{selectedConversion.device_id}</p>
                        {selectedConversion.fraud_signals.includes('emulator_suspected') && (
                          <span title="Emulator detected"><Monitor className="w-4 h-4 text-red-500" /></span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quality Score</p>
                      <p className="text-red-600 font-medium">{selectedConversion.quality_score}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Timestamp</p>
                      <p>{formatDateTime(selectedConversion.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-800 mb-3">Fraud Signals Detected</p>
                    <div className="space-y-2">
                      {selectedConversion.fraud_signals.map((signal) => (
                        <div key={signal} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-700 capitalize">
                              {signal.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-red-600/80">
                              {fraudSignalDescriptions[signal]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedConversion.status !== 'fraud' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          handleDismiss(selectedConversion.id);
                          setSelectedConversion(null);
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Dismiss (Approve)
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          handleConfirmFraud(selectedConversion.id);
                          setSelectedConversion(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Confirm Fraud (Reject)
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
