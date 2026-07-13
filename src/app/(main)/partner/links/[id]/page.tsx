'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { QRCodeGenerator } from '@/components/ui/qr-code';
import { LinkStats } from '@/components/features/link-stats';
import { Copy, ExternalLink, ArrowLeft, Edit, Trash2, Share2, MessageCircle, Mail, QrCode, Check, LinkIcon, Calendar, MousePointer, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

// Mock data for demo
const mockLink = {
  id: 'link-1',
  unique_code: 'abc123xy',
  short_url: 'https://cuanpintar.com/r/abc123xy',
  tracking_url: 'https://cuanpintar.com/track/prog-1/part-1?ch=social&utm_source=instagram&utm_campaign=q1_2024',
  title: 'Instagram Story Link',
  description: 'Instagram story campaign for Tunaiku personal loan product Q1 2024',
  channel_type: 'social',
  total_clicks: 1234,
  total_conversions: 87,
  valid_conversions: 72,
  pending_conversions: 8,
  rejected_conversions: 4,
  fraud_conversions: 3,
  total_payout: 1800000,
  is_active: true,
  expires_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T14:30:00Z',
  program: {
    id: 'prog-1',
    name: 'Tunaiku Personal Loan',
    brand_name: 'Tunaiku',
    payout_model: 'CPA',
    payout_amount: 25000,
    advertiser: {
      id: 'adv-1',
      company_name: 'Tunaiku by Amar Bank',
    },
  },
  partner: {
    id: 'part-1',
    partner_name: 'JakselNews Media',
    partner_type: 'media',
  },
};

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;

  const [link, setLink] = useState<typeof mockLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedLink, setEditedLink] = useState({ title: '', description: '' });

  useEffect(() => {
    // Simulate API call
    const fetchLink = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLink(mockLink);
      setEditedLink({ title: mockLink.title, description: mockLink.description || '' });
      setIsLoading(false);
    };

    fetchLink();
  }, [linkId]);

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareToWhatsApp = () => {
    if (!link) return;
    const message = `Check out this link! ${link.short_url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToEmail = () => {
    if (!link) return;
    const subject = encodeURIComponent('Check out this link');
    const body = encodeURIComponent(`Hi,\n\nCheck out this link: ${link.short_url}\n\n${link.title ? `Title: ${link.title}\n` : ''}${link.description ? `Description: ${link.description}\n` : ''}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSaveEdit = async () => {
    if (!link) return;
    // In real app, this would call the API
    setLink({ ...link, ...editedLink });
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    // In real app, this would call the API
    router.push('/partner/links');
  };

  if (isLoading || !link) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const conversionRate = link.total_clicks > 0
    ? ((link.valid_conversions / link.total_clicks) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/partner/links">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Links
          </Button>
        </Link>
      </div>

      <PageHeader
        title={link.title || `Link - ${link.channel_type}`}
        description={link.description || `${link.channel_type} channel tracking link`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Link Info & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QRCodeGenerator
              linkId={link.id}
              url={link.short_url}
              title={link.title}
              defaultSize={250}
              showPreview={true}
            />

            {/* Share Actions */}
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">Share</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={shareToWhatsApp}>
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={shareToEmail}>
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Link Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge variant={link.is_active ? 'default' : 'secondary'} className="text-sm">
                {link.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{link.channel_type}</Badge>
            </div>

            {/* URLs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Short URL</Label>
                <div className="flex gap-2">
                  <Input value={link.short_url} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.short_url, 'short')}
                  >
                    {copied === 'short' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.short_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Tracking URL</Label>
                <div className="flex gap-2">
                  <Input value={link.tracking_url} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.tracking_url, 'tracking')}
                  >
                    {copied === 'tracking' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium">{link.program?.brand_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advertiser</p>
                <p className="font-medium">{link.program?.advertiser?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payout Model</p>
                <p className="font-medium">
                  {link.program?.payout_model} {formatCurrency(link.program?.payout_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Code</p>
                <p className="font-mono font-medium">{link.unique_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(link.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(link.updated_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MousePointer className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{link.total_clicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{link.total_conversions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{link.valid_conversions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Valid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(link.total_payout)}</p>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <LinkStats linkId={link.id} days={30} />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editedLink.title}
                onChange={(e) => setEditedLink({ ...editedLink, title: e.target.value })}
                placeholder="Enter link title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editedLink.description}
                onChange={(e) => setEditedLink({ ...editedLink, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this link? This action cannot be undone and all
            associated statistics will be lost.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
