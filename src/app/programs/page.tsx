'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowRight, TrendingUp, DollarSign, Target, Users, MapPin, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPrograms, formatCurrency } from '@/lib/mock-data';
import { getStatusColor, getObjectiveLabel, getChannelLabel } from '@/lib/utils';

export default function PublicMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [objectiveFilter, setObjectiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredPrograms = mockPrograms
    .filter(p => p.status === 'active')
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.industry === categoryFilter;
      const matchesObjective = objectiveFilter === 'all' ||
        p.objectives.some(o => o === objectiveFilter);
      return matchesSearch && matchesCategory && matchesObjective;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'payout-high') return b.payout_amount - a.payout_amount;
      if (sortBy === 'budget-high') return b.budget - a.budget;
      return 0;
    });

  const industries = [...new Set(mockPrograms.map(p => p.industry))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">CuanPintar</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/for-partners">
                <Button variant="ghost" size="sm">Become a Partner</Button>
              </Link>
              <Link href="/login?role=partner">
                <Button size="sm">Join Program</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Partner Marketplace
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Discover high-converting programs from Indonesia&apos;s leading brands. Join as a partner and start earning today.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>100+ Active Programs</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>Rp 15K - 50K Avg Payout</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>850+ Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Objectives</SelectItem>
                  <SelectItem value="app_install">App Install</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="lead_form">Lead Form</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="payout-high">Highest Payout</SelectItem>
                  <SelectItem value="budget-high">Largest Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredPrograms.length}</span> programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="card-hover overflow-hidden">
              <CardContent className="p-6">
                {/* Header */}
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
                  <Badge className={getStatusColor(program.status)}>Active</Badge>
                </div>

                {/* Payout Highlight */}
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Payout</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(program.payout_amount)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {program.payout_model}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Industry</span>
                    <span className="font-medium text-gray-900">{program.industry}</span>
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
                    <span className="text-gray-500">Channels</span>
                    <span className="font-medium text-gray-900">
                      {program.channels.length} types
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(program.budget)}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link href="/login?role=partner" className="block">
                  <Button className="w-full">
                    Join This Program
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back later for new programs.</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setObjectiveFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to start earning?</h3>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Join thousands of partners who are already earning by promoting top brands through CuanPintar.
          </p>
          <Link href="/login?role=partner">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              Become a Partner
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-white">CuanPintar</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/for-advertisers" className="hover:text-white transition-colors">For Advertisers</Link>
              <Link href="/for-partners" className="hover:text-white transition-colors">For Partners</Link>
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            </div>
            <div className="text-sm">
              &copy; 2024 CuanPintar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
