'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, TrendingUp, Users, DollarSign, Target, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/mock-data';

interface Program {
  id: string;
  name: string;
  brand_name: string;
  industry: string;
  description: string;
  status: string;
  budget: number;
  payout_model: string;
  partner_payout: number;
  target_volume: number;
}

export default function PartnerDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total_programs: 0,
    earnings: 0,
    conversions: 0,
    quality_score: 85,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();

      if (data.success && data.data) {
        setPrograms(data.data);
        setStats({
          total_programs: data.data.length,
          earnings: 2500000,
          conversions: 150,
          quality_score: 92,
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name.toLowerCase().includes(search.toLowerCase()) ||
    p.industry.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
        <p className="text-gray-500">Discover programs and track your earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Programs</p>
                <p className="text-xl font-bold">{loading ? '...' : stats.total_programs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold">{loading ? '...' : formatCurrency(stats.earnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversions</p>
                <p className="text-xl font-bold">{loading ? '...' : stats.conversions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quality Score</p>
                <p className="text-xl font-bold">{loading ? '...' : stats.quality_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search programs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading programs...</div>
        ) : filteredPrograms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No programs found</p>
            {search && (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {program.brand_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{program.name}</h3>
                      <p className="text-sm text-gray-500">{program.brand_name}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {program.description || `Program untuk industri ${program.industry}`}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payout Model</span>
                    <span className="font-medium">{program.payout_model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payout Amount</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(program.partner_payout || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Industry</span>
                    <span className="font-medium">{program.industry}</span>
                  </div>
                </div>

                <Link href={`/partner/programs/${program.id}`}>
                  <Button className="w-full gap-2">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
