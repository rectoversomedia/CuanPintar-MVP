'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { StatsCard } from '@/components/ui/stats-card';
import { LinkCard, TrackingLink } from '@/components/features/link-card';
import { QrCode, Plus, Search, Filter, Grid3X3, List, LinkIcon, TrendingUp, MousePointer, Target, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

// Mock data for demo
const mockPrograms = [
  { id: 'prog-1', name: 'Tunaiku Personal Loan', brand_name: 'Tunaiku', payout_model: 'CPA', payout_amount: 25000 },
  { id: 'prog-2', name: 'Prudential Insurance', brand_name: 'Prudential', payout_model: 'CPL', payout_amount: 15000 },
  { id: 'prog-3', name: 'XL Axiata Postpaid', brand_name: 'XL Axiata', payout_model: 'CPI', payout_amount: 5000 },
];

const mockLinks: TrackingLink[] = [
  {
    id: 'link-1',
    unique_code: 'abc123xy',
    short_url: 'https://cuanpintar.com/r/abc123xy',
    tracking_url: 'https://cuanpintar.com/track/prog-1/part-1?ch=social',
    title: 'Instagram Story Link',
    channel_type: 'social',
    total_clicks: 1234,
    total_conversions: 87,
    valid_conversions: 72,
    total_payout: 1800000,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    program: mockPrograms[0],
  },
  {
    id: 'link-2',
    unique_code: 'def456zw',
    short_url: 'https://cuanpintar.com/r/def456zw',
    tracking_url: 'https://cuanpintar.com/track/prog-1/part-1?ch=whatsapp',
    title: 'WhatsApp Broadcast',
    channel_type: 'whatsapp',
    total_clicks: 567,
    total_conversions: 45,
    valid_conversions: 38,
    total_payout: 950000,
    is_active: true,
    created_at: '2024-01-20T14:30:00Z',
    program: mockPrograms[0],
  },
  {
    id: 'link-3',
    unique_code: 'ghi789ab',
    short_url: 'https://cuanpintar.com/r/ghi789ab',
    tracking_url: 'https://cuanpintar.com/track/prog-2/part-1?ch=media',
    title: 'Media Banner Campaign',
    channel_type: 'media',
    total_clicks: 2345,
    total_conversions: 156,
    valid_conversions: 142,
    total_payout: 2130000,
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    program: mockPrograms[1],
  },
];

export default function PartnerLinksPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating new link
  const [newLink, setNewLink] = useState({
    program_id: '',
    channel_type: 'social',
    title: '',
    description: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  useEffect(() => {
    // Simulate API call
    const fetchLinks = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLinks(mockLinks);
      setIsLoading(false);
    };

    fetchLinks();
  }, []);

  // Calculate summary stats
  const totalClicks = links.reduce((sum, l) => sum + l.total_clicks, 0);
  const totalConversions = links.reduce((sum, l) => sum + l.total_conversions, 0);
  const totalPayout = links.reduce((sum, l) => sum + l.total_payout, 0);

  // Filter links
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      !searchQuery ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.unique_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && link.is_active) ||
      (statusFilter === 'inactive' && !link.is_active);

    return matchesSearch && matchesStatus;
  });

  const handleCreateLink = async () => {
    // In real app, this would call the API
    const newLinkData: TrackingLink = {
      id: `link-${Date.now()}`,
      unique_code: Math.random().toString(36).substring(2, 10),
      short_url: `https://cuanpintar.com/r/${Math.random().toString(36).substring(2, 10)}`,
      tracking_url: `https://cuanpintar.com/track/${newLink.program_id}/part-1?ch=${newLink.channel_type}`,
      title: newLink.title || `${newLink.channel_type} - ${new Date().toLocaleDateString()}`,
      description: newLink.description,
      channel_type: newLink.channel_type,
      total_clicks: 0,
      total_conversions: 0,
      valid_conversions: 0,
      total_payout: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      program: mockPrograms.find((p) => p.id === newLink.program_id),
    };

    setLinks([newLinkData, ...links]);
    setIsCreateDialogOpen(false);
    setNewLink({
      program_id: '',
      channel_type: 'social',
      title: '',
      description: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <PageHeader
        title="My Tracking Links"
        description="Create and manage your unique tracking links with QR codes"
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Tracking Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Program Selection */}
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select
                    value={newLink.program_id}
                    onValueChange={(value) => setNewLink({ ...newLink, program_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPrograms.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.brand_name} - {program.payout_model} {formatCurrency(program.payout_amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Channel Type */}
                <div className="space-y-2">
                  <Label>Channel *</Label>
                  <Select
                    value={newLink.channel_type}
                    onValueChange={(value) => setNewLink({ ...newLink, channel_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="media">Media/Banner</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="offline">Offline/Print</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Link Title (Optional)</Label>
                  <Input
                    placeholder="e.g., Instagram Story Q1 Campaign"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    placeholder="Brief description of this link"
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  />
                </div>

                {/* UTM Parameters */}
                <div className="space-y-2">
                  <Label>UTM Parameters (Optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="utm_source"
                      value={newLink.utm_source}
                      onChange={(e) => setNewLink({ ...newLink, utm_source: e.target.value })}
                    />
                    <Input
                      placeholder="utm_medium"
                      value={newLink.utm_medium}
                      onChange={(e) => setNewLink({ ...newLink, utm_medium: e.target.value })}
                    />
                    <Input
                      placeholder="utm_campaign"
                      value={newLink.utm_campaign}
                      onChange={(e) => setNewLink({ ...newLink, utm_campaign: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLink} disabled={!newLink.program_id}>
                    Create Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Links"
          value={links.length.toString()}
          icon={LinkIcon}
          change={{ value: 0, label: 'vs last month', positive: true }}
        />
        <StatsCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointer}
          change={{ value: 12.5, label: 'vs last month', positive: true }}
        />
        <StatsCard
          title="Total Conversions"
          value={totalConversions.toLocaleString()}
          icon={Target}
          change={{ value: 8.2, label: 'vs last month', positive: true }}
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(totalPayout)}
          icon={Wallet}
          change={{ value: 15.3, label: 'vs last month', positive: true }}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Links List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        <EmptyState
          icon={LinkIcon}
          title="No links found"
          description={
            searchQuery || statusFilter !== 'all'
              ? "Try adjusting your search or filters"
              : "Create your first tracking link to start tracking conversions"
          }
          action={
            !searchQuery && statusFilter === 'all'
              ? { label: 'Create Link', onClick: () => setIsCreateDialogOpen(true) }
              : { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setStatusFilter('all'); }}
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onViewStats={(l) => window.location.href = `/partner/links/${l.id}`}
              onGenerateQR={(l) => window.location.href = `/partner/links/${l.id}`}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">Link</th>
                    <th className="text-left py-3 px-4 font-medium">Channel</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Clicks</th>
                    <th className="text-center py-3 px-4 font-medium">Conv.</th>
                    <th className="text-center py-3 px-4 font-medium">Rate</th>
                    <th className="text-right py-3 px-4 font-medium">Earnings</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="font-medium truncate max-w-[200px]">
                            {link.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {link.short_url}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{link.channel_type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {link.total_clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {link.total_conversions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {link.total_clicks > 0
                          ? ((link.valid_conversions / link.total_clicks) * 100).toFixed(1)
                          : '0'}%
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(link.total_payout)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/partner/links/${link.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for filtered but no results */}
      {filteredLinks.length === 0 && !isLoading && (searchQuery || statusFilter !== 'all') && (
        <EmptyState
          icon={LinkIcon}
          title="No links found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Clear Filters',
            onClick: () => { setSearchQuery(''); setStatusFilter('all'); }
          }}
        />
      )}
    </div>
  );
}
