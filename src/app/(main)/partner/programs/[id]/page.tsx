'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, Check, ExternalLink, Download, FileText, Image, Link2, File, AlertCircle, Info, Calendar, Target, DollarSign, Users, TrendingUp, QrCode, Share2, MessageCircle } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QRCodeGenerator } from '@/components/ui/qr-code';
import { mockPrograms, formatCurrency, formatDate } from '@/lib/mock-data';
import { getStatusColor, getObjectiveLabel, getChannelLabel } from '@/lib/utils';

// Mock assets for programs
const programAssets = [
  { id: 'asset_1', name: 'Banner 300x250', type: 'banner', format: 'PNG', size: '245 KB', downloads: 45 },
  { id: 'asset_2', name: 'Banner 728x90', type: 'banner', format: 'PNG', size: '180 KB', downloads: 38 },
  { id: 'asset_3', name: 'Banner 320x50', type: 'banner', format: 'PNG', size: '95 KB', downloads: 42 },
  { id: 'asset_4', name: 'Social Post Copy', type: 'copywriting', format: 'DOCX', size: '25 KB', downloads: 56 },
  { id: 'asset_5', name: 'Email Template', type: 'copywriting', format: 'HTML', size: '15 KB', downloads: 34 },
  { id: 'asset_6', name: 'Landing Page URL', type: 'link', format: 'URL', size: '-', downloads: 89 },
  { id: 'asset_7', name: 'Product Description', type: 'document', format: 'PDF', size: '120 KB', downloads: 67 },
  { id: 'asset_8', name: 'Brand Guidelines', type: 'document', format: 'PDF', size: '2.5 MB', downloads: 23 },
];

// Mock partner performance for this program
const partnerPerformance = {
  totalConversions: 72,
  validConversions: 68,
  pendingConversions: 4,
  rejectedConversions: 0,
  earnings: 1700000,
  conversionRate: 3.2,
};

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [trackingLink, setTrackingLink] = useState(`https://cuanpintar.com/track/${programId}/partner_1`);
  const [shortLink, setShortLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

  const program = mockPrograms.find((p) => p.id === programId) || mockPrograms[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShortLink = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateShortLink = () => {
    // In real app, this would call the API
    const code = Math.random().toString(36).substring(2, 10);
    setShortLink(`https://cuanpintar.com/r/${code}`);
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const message = `Check out this link! ${shortLink || trackingLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareToTelegram = () => {
    const message = `Check out this link! ${shortLink || trackingLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shortLink || trackingLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'copywriting':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'link':
        return <Link2 className="h-5 w-5 text-green-500" />;
      case 'document':
        return <File className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title={program.name} subtitle="Program details and tracking" />

        <main className="p-6">
          {/* Back Button */}
          <Link href="/partner/programs">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </Link>

          {/* Program Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                    {program.brand_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                      <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                    </div>
                    <p className="text-gray-500">{program.advertiser_name} - {program.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Marketplace
                  </Button>
                  <Button>Join Program</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
                <p className="text-2xl font-bold text-gray-900">{partnerPerformance.totalConversions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Valid</p>
                <p className="text-2xl font-bold text-green-600">{partnerPerformance.validConversions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{partnerPerformance.pendingConversions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(partnerPerformance.earnings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">Conv. Rate</p>
                <p className="text-2xl font-bold text-blue-600">{partnerPerformance.conversionRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tracking" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tracking">Tracking Link</TabsTrigger>
              <TabsTrigger value="assets">Available Assets</TabsTrigger>
              <TabsTrigger value="info">Program Info</TabsTrigger>
            </TabsList>

            {/* Tracking Link Tab */}
            <TabsContent value="tracking">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Tracking Link Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-blue-500" />
                      Your Tracking Link
                    </CardTitle>
                    <CardDescription>
                      Use this unique link to track your conversions. Share it across your channels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Full Tracking Link */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Tracking URL</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={trackingLink}
                          readOnly
                          className="font-mono text-sm flex-1"
                        />
                        <Button onClick={handleCopyLink} variant={copied ? 'success' : 'default'} size="sm">
                          {copied ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
                        </Button>
                      </div>
                    </div>

                    {/* Short Link (Generated) */}
                    {shortLink && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Short URL</p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={shortLink}
                            readOnly
                            className="font-mono text-sm flex-1 bg-green-50 border-green-200"
                          />
                          <Button onClick={handleCopyShortLink} variant="outline" size="sm">
                            {copied ? <><Check className="h-4 w-4 mr-1" /> Copied!</> : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">How to use your tracking link</p>
                          <ul className="text-sm text-blue-700 mt-2 space-y-1">
                            <li>Add this link to your website, social media posts, or emails</li>
                            <li>Each conversion will be tracked and attributed to your account</li>
                            <li>You can customize the link parameters using UTM codes</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* UTM Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">UTM Source</p>
                        <Input placeholder="e.g., instagram" className="font-mono text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">UTM Medium</p>
                        <Input placeholder="e.g., social" className="font-mono text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">UTM Campaign</p>
                        <Input placeholder="e.g., summer_2024" className="font-mono text-sm" />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={generateShortLink} className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Generate Short Link
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <QrCode className="h-4 w-4 mr-2" />
                              QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Generate QR Code</DialogTitle>
                            </DialogHeader>
                            <QRCodeGenerator
                              linkId={programId}
                              url={shortLink || trackingLink}
                              title={program.name}
                              defaultSize={300}
                              showPreview={true}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" onClick={shareToWhatsApp}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* QR Code Preview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-purple-500" />
                      Quick QR Preview
                    </CardTitle>
                    <CardDescription>
                      Scan to test your tracking link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors cursor-pointer">
                          <QrCode className="h-32 w-32 text-gray-400" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Generate QR Code</DialogTitle>
                        </DialogHeader>
                        <QRCodeGenerator
                          linkId={programId}
                          url={shortLink || trackingLink}
                          title={program.name}
                          defaultSize={300}
                          showPreview={true}
                        />
                      </DialogContent>
                    </Dialog>

                    <p className="text-sm text-gray-500 mt-4 text-center">
                      Click to generate QR code with your tracking link
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={shareToWhatsApp}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareToTelegram}>
                        <Share2 className="h-4 w-4 mr-1" />
                        Telegram
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-500" />
                    Available Marketing Assets
                  </CardTitle>
                  <CardDescription>
                    Download banners, copywriting templates, and other materials to promote this program.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {programAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              {getAssetIcon(asset.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                              <p className="text-xs text-gray-500">{asset.format} - {asset.size}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{asset.downloads} downloads</span>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Compliance Notice</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Please review the dos and don'ts before promoting. Non-compliant promotions may result in rejected conversions.
                        </p>
                        <Button variant="link" className="text-amber-700 p-0 h-auto mt-2">
                          Read Compliance Guidelines
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Program Info Tab */}
            <TabsContent value="info">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Payout</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(program.payout_amount)} / {program.payout_model}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Objectives</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {program.objectives.map((obj) => (
                            <Badge key={obj} variant="secondary">{getObjectiveLabel(obj)}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duration</p>
                        <p className="text-gray-900">{formatDate(program.start_date)} - {formatDate(program.end_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Target Volume</p>
                        <p className="text-gray-900">{program.target_volume.toLocaleString()} conversions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget</p>
                        <p className="text-gray-900">{formatCurrency(program.budget)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{program.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {program.target_audience.age && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age</span>
                        <span className="font-medium text-gray-900">{program.target_audience.age}</span>
                      </div>
                    )}
                    {program.target_audience.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gender</span>
                        <span className="font-medium text-gray-900 capitalize">{program.target_audience.gender}</span>
                      </div>
                    )}
                    {program.target_audience.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium text-gray-900">{program.target_audience.location}</span>
                      </div>
                    )}
                    {program.target_audience.interest && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Interest</span>
                        <span className="font-medium text-gray-900">{program.target_audience.interest}</span>
                      </div>
                    )}
                    {program.target_audience.device && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Device</span>
                        <span className="font-medium text-gray-900">{program.target_audience.device}</span>
                      </div>
                    )}
                    {program.target_audience.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                        <p className="text-sm text-gray-600">{program.target_audience.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accepted Channels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {program.channels.map((channel) => (
                        <div key={channel.channel_type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                              {getChannelLabel(channel.channel_type).substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{getChannelLabel(channel.channel_type)}</p>
                              <p className="text-xs text-gray-500">Quality: {channel.quality_score}%</p>
                            </div>
                          </div>
                          <Badge className={channel.fraud_risk === 'low' ? 'bg-green-100 text-green-800' : channel.fraud_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {channel.fraud_risk} risk
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
