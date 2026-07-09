'use client';

import { useState } from 'react';
import { Search, Filter, Users, Star, TrendingUp, MapPin, UserPlus, MessageSquare, Check } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
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
import { mockPartners, formatNumber } from '@/lib/mock-data';
import { getPartnerTypeLabel, getRiskColor } from '@/lib/utils';

export default function AdvertiserPartnersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredPartners = mockPartners.filter(p => {
    const matchesSearch = p.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.niche.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.partner_type === typeFilter;
    return matchesSearch && matchesType && p.status === 'active';
  });

  const partnerTypes = [...new Set(mockPartners.map(p => p.partner_type))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Partner Discovery" subtitle="Find and connect with acquisition partners" />

        <main className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Partner type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {partnerTypes.map((type) => (
                    <SelectItem key={type} value={type}>{getPartnerTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Partner Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { type: 'Media', count: mockPartners.filter(p => p.partner_type === 'media').length, color: 'bg-blue-100 text-blue-600' },
              { type: 'Creator', count: mockPartners.filter(p => p.partner_type === 'creator').length, color: 'bg-purple-100 text-purple-600' },
              { type: 'Affiliate', count: mockPartners.filter(p => p.partner_type === 'affiliate').length, color: 'bg-green-100 text-green-600' },
              { type: 'Community', count: mockPartners.filter(p => p.partner_type === 'community').length, color: 'bg-orange-100 text-orange-600' },
            ].map((stat) => (
              <Card key={stat.type} className="card-hover">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                  <div className="text-sm text-gray-500">{stat.type} Partners</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.partner_name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {getPartnerTypeLabel(partner.partner_type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium text-gray-900">{partner.quality_score}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Niche</span>
                      <span className="font-medium text-gray-700">{partner.niche}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {partner.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Audience</span>
                      <span className="font-medium text-gray-700">{formatNumber(partner.audience_size)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fraud Risk</span>
                      <span className={`font-medium capitalize ${getRiskColor(partner.fraud_risk)}`}>
                        {partner.fraud_risk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Earnings</span>
                      <span className="font-medium text-green-600">
                        Rp {formatNumber(partner.total_earnings)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button className="flex-1">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
