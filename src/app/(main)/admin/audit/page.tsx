'use client';

import { useState } from 'react';
import { Search, Filter, Download, ChevronRight, User, Settings, Shield, FileText, Clock, Globe } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from '@/lib/utils';

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: '1',
    action: 'user.login',
    entity_type: 'user',
    entity_id: '123',
    actor: { name: 'Sarah Chen', email: 'sarah@tunaiku.com' },
    ip_address: '192.168.1.1',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    metadata: { device: 'Chrome on Windows' },
  },
  {
    id: '2',
    action: 'program.created',
    entity_type: 'program',
    entity_id: '456',
    actor: { name: 'Budi Santoso', email: 'budi@jakselnews.com' },
    ip_address: '10.0.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: { program_name: 'Tunaiku Q3 Campaign' },
  },
  {
    id: '3',
    action: 'conversion.approved',
    entity_type: 'conversion',
    entity_id: '789',
    actor: { name: 'Admin', email: 'admin@cuanpintar.com' },
    ip_address: '172.16.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    metadata: { conversion_id: 'CNV-2024-0001' },
  },
  {
    id: '4',
    action: 'partner.kyc_verified',
    entity_type: 'partner',
    entity_id: '101',
    actor: { name: 'Admin', email: 'admin@cuanpintar.com' },
    ip_address: '172.16.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    metadata: { document_type: 'ktp' },
  },
  {
    id: '5',
    action: 'settings.updated',
    entity_type: 'platform_settings',
    entity_id: null,
    actor: { name: 'Admin', email: 'admin@cuanpintar.com' },
    ip_address: '172.16.0.1',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    metadata: { key: 'min_payout_amount', old_value: '25000', new_value: '50000' },
  },
];

const actionIcons: Record<string, React.ReactNode> = {
  'user': <User className="w-4 h-4" />,
  'program': <FileText className="w-4 h-4" />,
  'conversion': <Shield className="w-4 h-4" />,
  'partner': <User className="w-4 h-4" />,
  'settings': <Settings className="w-4 h-4" />,
  'default': <Clock className="w-4 h-4" />,
};

const actionColors: Record<string, string> = {
  'login': 'bg-green-100 text-green-700',
  'created': 'bg-blue-100 text-blue-700',
  'updated': 'bg-yellow-100 text-yellow-700',
  'approved': 'bg-green-100 text-green-700',
  'rejected': 'bg-red-100 text-red-700',
  'verified': 'bg-purple-100 text-purple-700',
  'deleted': 'bg-red-100 text-red-700',
};

export default function AuditLogsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const getActionIcon = (action: string) => {
    const prefix = action.split('.')[0];
    return actionIcons[prefix] || actionIcons['default'];
  };

  const getActionBadgeColor = (action: string) => {
    const suffix = action.split('.')[1] || '';
    return actionColors[suffix] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Audit Logs" subtitle="Track all platform activities for compliance" />

        <main className="p-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by actor, action, or entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="user">User Actions</SelectItem>
                    <SelectItem value="program">Program Actions</SelectItem>
                    <SelectItem value="conversion">Conversion Actions</SelectItem>
                    <SelectItem value="partner">Partner Actions</SelectItem>
                    <SelectItem value="settings">Settings Changes</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="advertiser">Advertiser</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionBadgeColor(log.action)} variant="secondary">
                          {log.action}
                        </Badge>
                        <span className="text-sm text-gray-500 capitalize">
                          {log.entity_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-900">{log.actor.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{log.actor.email}</span>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(log.created_at))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Globe className="w-3 h-3" />
                        {log.ip_address}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
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
