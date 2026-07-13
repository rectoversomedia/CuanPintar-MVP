'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Monitor, Smartphone, Tablet, Globe, Utensils, MousePointer } from 'lucide-react';
import { formatCurrency } from '@/lib/mock-data';

interface LinkStats {
  overview: {
    total_clicks: number;
    unique_clicks: number;
    total_conversions: number;
    valid_conversions: number;
    pending_conversions: number;
    rejected_conversions: number;
    fraud_conversions: number;
    conversion_rate: number;
    avg_daily_clicks: number;
    total_payout: number;
    avg_cpc: number;
  };
  trend: {
    clicks_change: number;
    conversions_change: number;
    payout_change: number;
  };
  top_devices: Array<{
    type: string;
    clicks: number;
    percentage: number;
  }>;
  top_countries: Array<{
    country: string;
    clicks: number;
    conversions: number;
    percentage: number;
  }>;
  top_utm_sources: Array<{
    source: string;
    clicks: number;
    conversions: number;
  }>;
  daily_stats: Array<{
    date: string;
    clicks: number;
    unique_clicks: number;
    conversions: number;
    valid_conversions: number;
    payout: number;
  }>;
}

interface LinkStatsProps {
  linkId: string;
  days?: number;
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage';
}) {
  const isPositive = change !== undefined && change >= 0;
  const displayValue =
    format === 'currency'
      ? formatCurrency(value)
      : format === 'percentage'
      ? `${value.toFixed(2)}%`
      : value.toLocaleString();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{displayValue}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}
                >
                  {isPositive ? '+' : ''}
                  {change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple Bar Chart Component
function BarChart({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate">{item.label}</span>
            <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Line Chart for daily trends
function LineChart({ data }: { data: { date: string; clicks: number; conversions: number }[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground text-center py-8">No data available</p>;

  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-40 flex items-end gap-1">
        {data.map((item, index) => {
          const height = (item.clicks / maxClicks) * 100;
          return (
            <div
              key={index}
              className="flex-1 group relative"
            >
              <div
                className="bg-primary/80 rounded-t transition-all hover:bg-primary"
                style={{ height: `${height}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-medium">{item.clicks} clicks</p>
                <p className="text-muted-foreground">{item.conversions} conv.</p>
                <p className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date ? new Date(data[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}</span>
        <span>{data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}</span>
      </div>
    </div>
  );
}

export function LinkStats({ linkId, days = 30 }: LinkStatsProps) {
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(days.toString());

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/links/${linkId}/stats?days=${selectedDays}`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [linkId, selectedDays]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={stats.overview.total_clicks}
          change={stats.trend.clicks_change}
          icon={MousePointer}
        />
        <StatCard
          title="Conversions"
          value={stats.overview.total_conversions}
          change={stats.trend.conversions_change}
          icon={TrendingUp}
        />
        <StatCard
          title="Conversion Rate"
          value={stats.overview.conversion_rate}
          icon={TrendingUp}
          format="percentage"
        />
        <StatCard
          title="Total Earnings"
          value={stats.overview.total_payout}
          change={stats.trend.payout_change}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valid Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {stats.overview.valid_conversions.toLocaleString()}
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-yellow-50">
                Pending: {stats.overview.pending_conversions}
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                Rejected: {stats.overview.rejected_conversions}
              </Badge>
              <Badge variant="outline" className="bg-gray-50">
                Fraud: {stats.overview.fraud_conversions}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unique Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.overview.unique_clicks.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Avg. daily: {stats.overview.avg_daily_clicks.toFixed(1)} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg. CPC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(stats.overview.avg_cpc)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Cost per conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trend" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="geo">Geography</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>

          <Select value={selectedDays} onValueChange={setSelectedDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Daily Trend Chart */}
        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clicks & Conversions Trend</CardTitle>
              <CardDescription>Daily performance over selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={stats.daily_stats.map((d) => ({
                  date: d.date,
                  clicks: d.clicks,
                  conversions: d.conversions,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Breakdown */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Click distribution by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.top_devices.map((device) => (
                  <div key={device.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {device.type === 'desktop' && <Monitor className="h-4 w-4" />}
                        {device.type === 'mobile' && <Smartphone className="h-4 w-4" />}
                        {device.type === 'tablet' && <Tablet className="h-4 w-4" />}
                        <span className="capitalize">{device.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{device.clicks.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({device.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          device.type === 'desktop'
                            ? 'bg-blue-500'
                            : device.type === 'mobile'
                            ? 'bg-green-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Breakdown */}
        <TabsContent value="geo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Breakdown</CardTitle>
              <CardDescription>Top countries by clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={stats.top_countries.map((c) => ({
                  label: c.country === 'OTHER' ? 'Other' : c.country,
                  value: c.clicks,
                }))}
                maxValue={Math.max(...stats.top_countries.map((c) => c.clicks), 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* UTM Sources */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Clicks by UTM source</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={stats.top_utm_sources.map((s) => ({
                  label: s.source,
                  value: s.clicks,
                }))}
                maxValue={Math.max(...stats.top_utm_sources.map((s) => s.clicks), 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LinkStats;
