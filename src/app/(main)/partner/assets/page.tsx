'use client';

import { useState } from 'react';
import { Search, Download, Image, FileText, Link2, File, ExternalLink, CheckCircle, XCircle, AlertTriangle, Filter, Grid, List, Eye, Copy } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock assets data
const allAssets = [
  {
    id: 'asset_1',
    name: 'Tunaiku Banner 300x250',
    program: 'Tunaiku Download + Registration',
    brand: 'Tunaiku',
    type: 'banner',
    format: 'PNG',
    size: '245 KB',
    dimensions: '300x250',
    downloads: 45,
    preview: '/placeholder-banner-1.png',
  },
  {
    id: 'asset_2',
    name: 'Tunaiku Banner 728x90',
    program: 'Tunaiku Download + Registration',
    brand: 'Tunaiku',
    type: 'banner',
    format: 'PNG',
    size: '180 KB',
    dimensions: '728x90',
    downloads: 38,
    preview: '/placeholder-banner-2.png',
  },
  {
    id: 'asset_3',
    name: 'Prudential Lead Form Banner',
    program: 'PRULady Lead Form',
    brand: 'Prudential',
    type: 'banner',
    format: 'PNG',
    size: '320 KB',
    dimensions: '300x600',
    downloads: 52,
    preview: '/placeholder-banner-3.png',
  },
  {
    id: 'asset_4',
    name: 'XL Axiata Social Copy',
    program: 'XL eSIM Purchase',
    brand: 'XL',
    type: 'copywriting',
    format: 'DOCX',
    size: '25 KB',
    downloads: 56,
    content: 'Premium copywriting templates for social media posts.',
  },
  {
    id: 'asset_5',
    name: 'Tunaiku Email Template',
    program: 'Tunaiku Download + Registration',
    brand: 'Tunaiku',
    type: 'copywriting',
    format: 'HTML',
    size: '15 KB',
    downloads: 34,
    content: 'Ready-to-use email templates for campaign outreach.',
  },
  {
    id: 'asset_6',
    name: 'XL Landing Page URL',
    program: 'XL eSIM Purchase',
    brand: 'XL',
    type: 'link',
    format: 'URL',
    size: '-',
    downloads: 89,
    url: 'https://promo.xl.co.id/cuanpintar-esim',
  },
  {
    id: 'asset_7',
    name: 'Bank Saqu Landing Page URL',
    program: 'Bank Saqu Download + Registration',
    brand: 'Bank Saqu',
    type: 'link',
    format: 'URL',
    size: '-',
    downloads: 67,
    url: 'https://banksaqu.com/cuanpintar',
  },
  {
    id: 'asset_8',
    name: 'Prudential Product Description',
    program: 'PRULady Lead Form',
    brand: 'Prudential',
    type: 'document',
    format: 'PDF',
    size: '120 KB',
    downloads: 67,
    content: 'Complete product description and key selling points.',
  },
  {
    id: 'asset_9',
    name: 'Tunaiku Brand Guidelines',
    program: 'Tunaiku Download + Registration',
    brand: 'Tunaiku',
    type: 'document',
    format: 'PDF',
    size: '2.5 MB',
    downloads: 23,
    content: 'Official brand guidelines including logo usage and colors.',
  },
  {
    id: 'asset_10',
    name: 'Pegadaian Compliance Notes',
    program: 'Pegadaian App Download + Registration',
    brand: 'Pegadaian',
    type: 'compliance',
    format: 'PDF',
    size: '85 KB',
    downloads: 41,
    content: 'Important compliance requirements and restrictions.',
  },
  {
    id: 'asset_11',
    name: 'Bank Saqu Dos & Donts',
    program: 'Bank Saqu Download + Registration',
    brand: 'Bank Saqu',
    type: 'compliance',
    format: 'PDF',
    size: '45 KB',
    downloads: 38,
    content: 'Marketing do\'s and don\'ts for Bank Saqu promotions.',
  },
  {
    id: 'asset_12',
    name: 'IKEA Banner Set',
    program: 'IKEA Lead Form',
    brand: 'IKEA',
    type: 'banner',
    format: 'ZIP',
    size: '1.2 MB',
    dimensions: 'Multiple sizes',
    downloads: 28,
    preview: '/placeholder-banner-4.png',
  },
];

export default function PartnerAssetsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAssets = allAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.program.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesBrand = brandFilter === 'all' || asset.brand === brandFilter;
    return matchesSearch && matchesType && matchesBrand;
  });

  const brands = [...new Set(allAssets.map((a) => a.brand))];

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
      case 'compliance':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'banner':
        return 'bg-blue-50 border-blue-200';
      case 'copywriting':
        return 'bg-purple-50 border-purple-200';
      case 'link':
        return 'bg-green-50 border-green-200';
      case 'document':
        return 'bg-orange-50 border-orange-200';
      case 'compliance':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const totalDownloads = filteredAssets.reduce((sum, a) => sum + a.downloads, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Marketing Assets" subtitle="Download campaign materials and resources" />

        <main className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Assets</p>
                    <p className="text-2xl font-bold text-gray-900">{allAssets.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <File className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Banners</p>
                    <p className="text-2xl font-bold text-gray-900">{allAssets.filter(a => a.type === 'banner').length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Image className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Copywriting</p>
                    <p className="text-2xl font-bold text-gray-900">{allAssets.filter(a => a.type === 'copywriting').length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDownloads}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Download className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
              <div className="relative flex-1 lg:flex-initial lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="banner">Banners</SelectItem>
                  <SelectItem value="copywriting">Copywriting</SelectItem>
                  <SelectItem value="link">Landing Pages</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({filteredAssets.length})</TabsTrigger>
              <TabsTrigger value="banner">Banners ({filteredAssets.filter(a => a.type === 'banner').length})</TabsTrigger>
              <TabsTrigger value="copywriting">Copywriting ({filteredAssets.filter(a => a.type === 'copywriting').length})</TabsTrigger>
              <TabsTrigger value="link">Landing Pages ({filteredAssets.filter(a => a.type === 'link').length})</TabsTrigger>
              <TabsTrigger value="compliance">Dos & Donts ({filteredAssets.filter(a => a.type === 'compliance').length})</TabsTrigger>
            </TabsList>

            {/* All Assets */}
            <TabsContent value="all">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className={`overflow-hidden ${getAssetColor(asset.type)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.type === 'banner' ? 'bg-blue-100' : asset.type === 'copywriting' ? 'bg-purple-100' : asset.type === 'link' ? 'bg-green-100' : 'bg-orange-100'}`}>
                            {getAssetIcon(asset.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.brand}</p>
                          </div>
                        </div>

                        {asset.type === 'banner' && (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-24 mb-3 flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        {asset.type === 'link' && asset.url && (
                          <div className="bg-white rounded-lg p-2 mb-3 border border-gray-200">
                            <p className="text-xs text-gray-500 truncate">{asset.url}</p>
                          </div>
                        )}

                        {asset.content && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{asset.content}</p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{asset.format}</Badge>
                            {asset.size !== '-' && (
                              <span className="text-xs text-gray-500">{asset.size}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{asset.downloads} DL</span>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead className="text-right">Downloads</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center ${asset.type === 'banner' ? 'bg-blue-100' : asset.type === 'copywriting' ? 'bg-purple-100' : asset.type === 'link' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                  {getAssetIcon(asset.type)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{asset.name}</p>
                                  <p className="text-xs text-gray-500">{asset.program}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{asset.brand}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">{asset.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{asset.format}</Badge>
                              {asset.size !== '-' && (
                                <span className="text-xs text-gray-500 ml-2">{asset.size}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{asset.downloads}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Banners Tab */}
            <TabsContent value="banner">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAssets.filter(a => a.type === 'banner').map((asset) => (
                  <Card key={asset.id} className="overflow-hidden bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Image className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.dimensions}</p>
                        </div>
                      </div>

                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-32 mb-3 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                        <Badge variant="secondary">{asset.format}</Badge>
                        <span className="text-xs text-gray-500">{asset.size}</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">Preview</Button>
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Copywriting Tab */}
            <TabsContent value="copywriting">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.filter(a => a.type === 'copywriting').map((asset) => (
                  <Card key={asset.id} className="overflow-hidden bg-purple-50 border-purple-200">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.brand}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{asset.content}</p>

                      <div className="bg-white rounded-lg p-3 border border-purple-100 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Sample content preview:</p>
                        <p className="text-sm text-gray-700 italic">"Dapatkan akses keuangan mudah dengan Tunaiku..."</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{asset.format}</Badge>
                          <span className="text-xs text-gray-500">{asset.size}</span>
                        </div>
                        <span className="text-xs text-gray-500">{asset.downloads} downloads</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Landing Pages Tab */}
            <TabsContent value="link">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssets.filter(a => a.type === 'link').map((asset) => (
                  <Card key={asset.id} className="overflow-hidden bg-green-50 border-green-200">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <Link2 className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{asset.name}</p>
                          <p className="text-sm text-gray-500">{asset.brand}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-green-100 mb-4">
                        <p className="text-xs text-gray-500 mb-1">Landing Page URL:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-blue-600 font-mono truncate">{asset.url}</p>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{asset.downloads} clicks</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button size="sm">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Dos & Donts / Compliance Tab */}
            <TabsContent value="compliance">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dos */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Dos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Use the official brand assets provided in the downloads</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Include clear disclaimers where required by regulations</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Disclose that you are promoting as an affiliate partner</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Target the specified audience demographics</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Donts */}
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-5 w-5" />
                      Don'ts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Do not make false or misleading claims about the product</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Do not guarantee returns or specific financial outcomes</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Do not use unofficial or modified brand assets</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-sm text-gray-700">Do not spam or use aggressive marketing tactics</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Documents */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Compliance Documents</CardTitle>
                    <CardDescription>
                      Download official compliance guidelines and regulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAssets.filter(a => a.type === 'compliance').map((asset) => (
                        <div key={asset.id} className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.format} - {asset.size}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {filteredAssets.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <File className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
