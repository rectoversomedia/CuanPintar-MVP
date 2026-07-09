'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingUp, Users, Target, Clock, DollarSign, MapPin, Star, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
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
import { mockPrograms, mockPartners, formatCurrency } from '@/lib/mock-data';
import { getStatusColor, getObjectiveLabel, getChannelLabel, getRiskColor } from '@/lib/utils';

export default function PartnerMarketplacePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredPrograms = mockPrograms.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.industry === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const industries = [...new Set(mockPrograms.map(p => p.industry))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Partner Marketplace" subtitle="Discover programs that match your audience" />

        <main className="p-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-80"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Programs */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.slice(0, 3).map((program) => (
                <Card key={program.id} className="card-hover border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                          {program.brand_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-500">{program.advertiser_name}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600">Featured</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Payout</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(program.payout_amount)} / {program.payout_model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Objective</span>
                        <div className="flex gap-1">
                          {program.objectives.slice(0, 2).map((obj) => (
                            <Badge key={obj} variant="secondary" className="text-xs">
                              {getObjectiveLabel(obj)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-gray-700">{program.industry}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Channels</span>
                        <div className="flex gap-1">
                          {program.channels.slice(0, 3).map((ch) => (
                            <span key={ch.channel_type} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getChannelLabel(ch.channel_type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link href={`/partner/programs/${program.id}`}>
                      <Button className="w-full">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Programs */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All Available Programs ({filteredPrograms.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
                          {program.brand_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-500">{program.advertiser_name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Payout</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(program.payout_amount)} / {program.payout_model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-gray-700">{program.industry}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/partner/programs/${program.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Details
                        </Button>
                      </Link>
                      <Button className="flex-1">
                        Join Program
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
