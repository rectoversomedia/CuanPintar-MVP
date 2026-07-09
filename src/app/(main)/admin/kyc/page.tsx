'use client';

import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, AlertCircle, FileText, User, Clock, Download, Upload } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from '@/lib/utils';

interface KycDocument {
  id: string;
  document_type: string;
  document_number: string;
  file_url: string;
  file_name: string;
  verification_status: string;
  rejection_reason: string | null;
  user: { name: string; email: string; role: string };
  verifier: { name: string } | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const mockKycDocuments: KycDocument[] = [
  {
    id: '1',
    document_type: 'ktp',
    document_number: '3171061201900001',
    file_url: '/documents/ktp-1.jpg',
    file_name: 'KTP_BudiSantoso.jpg',
    verification_status: 'pending',
    rejection_reason: null,
    user: { name: 'Budi Santoso', email: 'budi@jakselnews.com', role: 'partner' },
    verifier: null,
    verified_at: null,
    expires_at: '2030-06-15T00:00:00Z',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    document_type: 'npwp',
    document_number: '01.234.567.8-999.000',
    file_url: '/documents/npwp-2.jpg',
    file_name: 'NPWP_Tunaiku.pdf',
    verification_status: 'pending',
    rejection_reason: null,
    user: { name: 'Sarah Chen', email: 'sarah@tunaiku.com', role: 'advertiser' },
    verifier: null,
    verified_at: null,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '3',
    document_type: 'siup',
    document_number: 'SIUP-2024-12345',
    file_url: '/documents/siup-3.pdf',
    file_name: 'SIUP_TechIndo.pdf',
    verification_status: 'verified',
    rejection_reason: null,
    user: { name: 'Ahmad Rizki', email: 'ahmad@techindo.id', role: 'partner' },
    verifier: { name: 'Admin' },
    verified_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    expires_at: '2027-12-31T00:00:00Z',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '4',
    document_type: 'ktp',
    document_number: '3171069876543210',
    file_url: '/documents/ktp-4.jpg',
    file_name: 'KTP_DewiLestari.jpg',
    verification_status: 'rejected',
    rejection_reason: 'Document is blurry and partially obscured. Please upload a clearer image.',
    user: { name: 'Dewi Lestari', email: 'dewi@mediaku.com', role: 'advertiser' },
    verifier: { name: 'Admin' },
    verified_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    expires_at: '2035-01-01T00:00:00Z',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '5',
    document_type: 'akta',
    document_number: 'AKTA-2023-001',
    file_url: '/documents/akta-5.pdf',
    file_name: 'Akta_Pendirian_CuanPintar.pdf',
    verification_status: 'verified',
    rejection_reason: null,
    user: { name: 'Michael Tan', email: 'michael@finance.co.id', role: 'advertiser' },
    verifier: { name: 'Admin' },
    verified_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: <AlertCircle className="w-3 h-3" /> },
};

const documentTypeLabels: Record<string, string> = {
  ktp: 'KTP (ID Card)',
  npwp: 'NPWP (Tax ID)',
  siup: 'SIUP (Business License)',
  tdp: 'TDP (Company Registration)',
  akta: 'Akta (Deed of Establishment)',
  passport: 'Passport',
  other: 'Other',
};

const documentTypeIcons: Record<string, React.ReactNode> = {
  ktp: <User className="w-4 h-4" />,
  npwp: <FileText className="w-4 h-4" />,
  siup: <FileText className="w-4 h-4" />,
  tdp: <FileText className="w-4 h-4" />,
  akta: <FileText className="w-4 h-4" />,
  passport: <User className="w-4 h-4" />,
  other: <FileText className="w-4 h-4" />,
};

export default function KycVerificationPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredDocuments = mockKycDocuments.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.verification_status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    pending: mockKycDocuments.filter(d => d.verification_status === 'pending').length,
    verified: mockKycDocuments.filter(d => d.verification_status === 'verified').length,
    rejected: mockKycDocuments.filter(d => d.verification_status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header
          title="KYC Verification"
          subtitle="Verify identity and business documents"
          action={
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          }
        />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or document number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ktp">KTP</SelectItem>
                    <SelectItem value="npwp">NPWP</SelectItem>
                    <SelectItem value="siup">SIUP</SelectItem>
                    <SelectItem value="tdp">TDP</SelectItem>
                    <SelectItem value="akta">Akta</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                    {/* Document Type Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {documentTypeIcons[doc.document_type]}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{documentTypeLabels[doc.document_type]}</span>
                        <Badge className={statusConfig[doc.verification_status].color} variant="secondary">
                          <span className="flex items-center gap-1">
                            {statusConfig[doc.verification_status].icon}
                            {statusConfig[doc.verification_status].label}
                          </span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-500 font-mono mb-2">{doc.document_number}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                          <User className="w-3 h-3" />
                          {doc.user.name}
                          <Badge variant="outline" className="ml-1 text-xs capitalize">
                            {doc.user.role}
                          </Badge>
                        </span>
                        <span className="text-gray-400">{doc.user.email}</span>
                      </div>

                      {/* Rejection Reason */}
                      {doc.verification_status === 'rejected' && doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Reason:</strong> {doc.rejection_reason}
                        </div>
                      )}

                      {/* Verification Info */}
                      {doc.verification_status === 'verified' && doc.verifier && (
                        <div className="mt-2 text-sm text-green-600">
                          Verified by {doc.verifier.name} • {formatDistanceToNow(new Date(doc.verified_at!))}
                        </div>
                      )}
                    </div>

                    {/* File Preview & Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(doc.created_at))}
                        </p>
                        {doc.expires_at && (
                          <p className="text-xs text-gray-400">
                            Expires: {new Date(doc.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {doc.verification_status === 'pending' ? (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
