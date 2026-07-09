'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Bell, AlertTriangle, AlertCircle, Wrench, Megaphone, Calendar, Eye, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, formatDate } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_roles: string[] | null;
  is_published: boolean;
  is_dismissible: boolean;
  published_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  creator: { name: string };
  created_at: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    content: 'We will be performing scheduled maintenance on July 15, 2026 from 02:00-04:00 WIB. During this time, the platform may be intermittently unavailable.',
    type: 'maintenance',
    target_roles: null,
    is_published: true,
    is_dismissible: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    starts_at: '2026-07-15T02:00:00Z',
    ends_at: '2026-07-15T04:00:00Z',
    creator: { name: 'Admin' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '2',
    title: 'New Partner Dashboard Features',
    content: 'We have released new features for partners including enhanced analytics, real-time conversion tracking, and improved payout reports.',
    type: 'info',
    target_roles: ['partner'],
    is_published: true,
    is_dismissible: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    starts_at: null,
    ends_at: null,
    creator: { name: 'Admin' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    title: 'Important: Payment Processing Update',
    content: 'Please update your payment method details before July 20, 2026. Old payment configurations will be deprecated.',
    type: 'urgent',
    target_roles: ['advertiser', 'partner'],
    is_published: true,
    is_dismissible: false,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    starts_at: null,
    ends_at: '2026-07-20T00:00:00Z',
    creator: { name: 'Admin' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '4',
    title: 'Holiday Schedule Notice',
    content: 'Payouts scheduled during Eid holiday period will be processed on the next business day.',
    type: 'warning',
    target_roles: ['partner'],
    is_published: false,
    is_dismissible: true,
    published_at: null,
    starts_at: null,
    ends_at: null,
    creator: { name: 'Admin' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5',
    title: 'API Rate Limit Increase',
    content: 'Good news! We have increased API rate limits from 1000 to 5000 requests per minute for all API users.',
    type: 'info',
    target_roles: null,
    is_published: true,
    is_dismissible: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    starts_at: null,
    ends_at: null,
    creator: { name: 'Admin' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  info: {
    label: 'Info',
    color: 'text-blue-600',
    icon: <Bell className="w-4 h-4" />,
    bgColor: 'bg-blue-100',
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-600',
    icon: <AlertTriangle className="w-4 h-4" />,
    bgColor: 'bg-yellow-100',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-gray-600',
    icon: <Wrench className="w-4 h-4" />,
    bgColor: 'bg-gray-100',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    icon: <AlertCircle className="w-4 h-4" />,
    bgColor: 'bg-red-100',
  },
};

export default function AnnouncementsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAnnouncements = mockAnnouncements.filter(ann => {
    const matchesSearch = !searchQuery ||
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || ann.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && ann.is_published) ||
      (statusFilter === 'draft' && !ann.is_published);

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockAnnouncements.length,
    published: mockAnnouncements.filter(a => a.is_published).length,
    draft: mockAnnouncements.filter(a => !a.is_published).length,
    urgent: mockAnnouncements.filter(a => a.type === 'urgent' && a.is_published).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header
          title="Announcements"
          subtitle="Manage platform-wide announcements"
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          }
        />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Megaphone className="w-8 h-8 text-gray-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gray-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Drafts</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                  </div>
                  <Pencil className="w-8 h-8 text-gray-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Urgent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
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
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => (
              <Card key={ann.id} className={!ann.is_published ? 'opacity-70' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${typeConfig[ann.type].bgColor} flex items-center justify-center ${typeConfig[ann.type].color}`}>
                      {typeConfig[ann.type].icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={typeConfig[ann.type].color} variant="outline">
                              {typeConfig[ann.type].label}
                            </Badge>
                            {!ann.is_published && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                            {ann.is_dismissible === false && (
                              <Badge variant="outline" className="border-red-200 text-red-600">
                                Non-dismissible
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{ann.content}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {ann.creator.name}</span>
                        <span>•</span>
                        <span>{ann.is_published ? `Published ${formatDistanceToNow(new Date(ann.published_at!))}` : `Created ${formatDistanceToNow(new Date(ann.created_at))}`}</span>

                        {ann.target_roles && (
                          <>
                            <span>•</span>
                            <span>Target: {ann.target_roles.join(', ')}</span>
                          </>
                        )}

                        {(ann.starts_at || ann.ends_at) && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {ann.starts_at && formatDate(new Date(ann.starts_at))}
                              {ann.starts_at && ann.ends_at && ' - '}
                              {ann.ends_at && formatDate(new Date(ann.ends_at))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnnouncements.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-500 mb-4">Create your first announcement to notify users about important updates.</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
