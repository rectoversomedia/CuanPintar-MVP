'use client';

import { useState } from 'react';
import { Radio, Search, Filter, MapPin, TrendingUp, Star, Activity, MoreHorizontal, Check, X } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockMediaInventory, formatNumber } from '@/lib/mock-data';
import { getMediaCategoryLabel, getStatusColor } from '@/lib/utils';

export default function AdminMediaNetworkPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const filteredMedia = mockMediaInventory.filter(media => {
    const matchesSearch = media.media_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || media.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || media.region === regionFilter;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const categories = [...new Set(mockMediaInventory.map(m => m.category))];
  const regions = [...new Set(mockMediaInventory.map(m => m.region))];

  // Stats
  const totalMedia = mockMediaInventory.length;
  const activeMedia = mockMediaInventory.filter(m => m.status === 'active').length;
  const totalReach = mockMediaInventory.reduce((acc, m) => acc + m.monthly_reach, 0);
  const avgQuality = Math.round(mockMediaInventory.reduce((acc, m) => acc + m.quality_score, 0) / totalMedia);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Media Network" subtitle="Manage 100+ Indonesian media distribution partners" />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Media Partners</p>
                    <p className="text-3xl font-bold text-gray-900">{totalMedia}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Partners</p>
                    <p className="text-3xl font-bold text-green-600">{activeMedia}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Monthly Reach</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(totalReach)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Avg Quality Score</p>
                    <p className="text-3xl font-bold text-gray-900">{avgQuality}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Star className="w-6 h-6" />
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
                  placeholder="Search media partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{getMediaCategoryLabel(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((reg) => (
                    <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>
              Add Media Partner
            </Button>
          </div>

          {/* Media Partners Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Media Partners ({filteredMedia.length})</CardTitle>
                  <CardDescription>
                    Indonesia&apos;s largest media distribution network
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Media Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Monthly Reach</TableHead>
                    <TableHead>Available Slots</TableHead>
                    <TableHead>Conv. Rate</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedia.slice(0, 50).map((media) => (
                    <TableRow key={media.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                            {media.media_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{media.media_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getMediaCategoryLabel(media.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {media.region}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatNumber(media.monthly_reach)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{media.available_slots}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{media.avg_conversion_rate.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{media.quality_score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(media.status)}>
                          {media.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                            <DropdownMenuItem>View Performance</DropdownMenuItem>
                            {media.status === 'active' ? (
                              <DropdownMenuItem>Deactivate</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>Activate</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMedia.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 50 of {filteredMedia.length} media partners. Use filters to narrow results.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
