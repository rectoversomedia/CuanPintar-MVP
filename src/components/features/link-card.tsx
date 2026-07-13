'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, MoreVertical, QrCode, Trash2, Edit, Eye, TrendingUp, MousePointer, Target } from 'lucide-react';
import { QRCodeInline } from '@/components/ui/qr-code';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/mock-data';

export interface TrackingLink {
  id: string;
  unique_code: string;
  short_url: string;
  tracking_url: string;
  title: string;
  description?: string;
  channel_type: string;
  total_clicks: number;
  total_conversions: number;
  valid_conversions: number;
  total_payout: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  program?: {
    id: string;
    name: string;
    brand_name: string;
    payout_model: string;
    payout_amount: number;
  };
}

interface LinkCardProps {
  link: TrackingLink;
  onEdit?: (link: TrackingLink) => void;
  onDelete?: (link: TrackingLink) => void;
  onViewStats?: (link: TrackingLink) => void;
  onGenerateQR?: (link: TrackingLink) => void;
  showProgram?: boolean;
}

export function LinkCard({
  link,
  onEdit,
  onDelete,
  onViewStats,
  onGenerateQR,
  showProgram = true,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate =
    link.total_clicks > 0
      ? ((link.valid_conversions / link.total_clicks) * 100).toFixed(2)
      : '0.00';

  const statusColor = link.is_active ? 'bg-green-500' : 'bg-gray-500';
  const statusText = link.is_active ? 'Active' : 'Inactive';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {link.title || `Link - ${link.channel_type}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs"
              >
                {link.channel_type}
              </Badge>
              <Badge
                variant={link.is_active ? 'default' : 'secondary'}
                className="text-xs"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor} mr-1`} />
                {statusText}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewStats?.(link)}>
                <Eye className="h-4 w-4 mr-2" />
                View Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGenerateQR?.(link)}>
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(link)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(link)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Link URL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
              {link.short_url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => copyToClipboard(link.short_url)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => copyToClipboard(link.short_url)}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="h-3 w-3 mr-1" />
              QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => window.open(link.short_url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Mini QR Code */}
        {showQR && (
          <div className="flex justify-center bg-white p-3 rounded-lg border">
            <QRCodeInline
              linkId={link.id}
              url={link.short_url}
              size={120}
            />
          </div>
        )}

        {/* Program Info */}
        {showProgram && link.program && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Program</p>
            <p className="text-sm font-medium truncate">{link.program.brand_name}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <MousePointer className="h-3 w-3" />
              <span className="text-xs">Clicks</span>
            </div>
            <p className="text-lg font-semibold">{link.total_clicks.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="text-xs">Conv.</span>
            </div>
            <p className="text-lg font-semibold">{link.total_conversions.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Rate</span>
            </div>
            <p className="text-lg font-semibold">{conversionRate}%</p>
          </div>
        </div>

        {/* Payout */}
        {link.total_payout > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Total Earnings</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(link.total_payout)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Link Table Row Component for table view
export function LinkTableRow({
  link,
  onEdit,
  onDelete,
  onViewStats,
}: {
  link: TrackingLink;
  onEdit?: (link: TrackingLink) => void;
  onDelete?: (link: TrackingLink) => void;
  onViewStats?: (link: TrackingLink) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate =
    link.total_clicks > 0
      ? ((link.valid_conversions / link.total_clicks) * 100).toFixed(1)
      : '0';

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <div className="space-y-1">
          <p className="font-medium truncate max-w-[200px]">
            {link.title || `Link - ${link.channel_type}`}
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
        <span className={link.is_active ? 'text-green-600' : 'text-gray-500'}>
          {link.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-3 px-4 text-center">{link.total_clicks.toLocaleString()}</td>
      <td className="py-3 px-4 text-center">{link.total_conversions.toLocaleString()}</td>
      <td className="py-3 px-4 text-center">{conversionRate}%</td>
      <td className="py-3 px-4 text-right font-medium">
        {formatCurrency(link.total_payout)}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => copyToClipboard(link.short_url)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Link href={`/partner/links/${link.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default LinkCard;
