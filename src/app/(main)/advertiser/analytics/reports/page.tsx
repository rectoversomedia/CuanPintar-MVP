/**
 * Custom Report Builder
 *
 * Allows advertisers to create custom reports with:
 * - Multiple data sources
 * - Date ranges
 * - Filters
 * - Aggregations
 * - Visualizations
 * - Export options
 */

'use client';

import { useState } from 'react';
import { Download, Plus, Trash2, Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ReportConfig {
  id: string;
  name: string;
  dataSources: string[];
  dateRange: { from: string; to: string };
  filters: Filter[];
  aggregations: Aggregation[];
  groupBy: string[];
  chartType: 'bar' | 'line' | 'pie' | 'table';
}

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Aggregation {
  id: string;
  field: string;
  function: 'sum' | 'count' | 'avg' | 'min' | 'max';
}

const DATA_SOURCES = [
  { id: 'conversions', name: 'Conversions', fields: ['conversion_id', 'partner', 'channel', 'program', 'status', 'payout', 'quality_score', 'created_at'] },
  { id: 'clicks', name: 'Clicks', fields: ['click_id', 'partner', 'channel', 'program', 'fingerprint', 'created_at'] },
  { id: 'partners', name: 'Partners', fields: ['partner_id', 'name', 'type', 'location', 'quality_score', 'total_earnings'] },
  { id: 'programs', name: 'Programs', fields: ['program_id', 'name', 'advertiser', 'status', 'budget', 'payout_model'] },
];

const OPERATORS = [
  { id: 'equals', name: 'Equals' },
  { id: 'not_equals', name: 'Not Equals' },
  { id: 'contains', name: 'Contains' },
  { id: 'greater_than', name: 'Greater Than' },
  { id: 'less_than', name: 'Less Than' },
  { id: 'between', name: 'Between' },
];

const AGGREGATION_FUNCTIONS = [
  { id: 'sum', name: 'Sum' },
  { id: 'count', name: 'Count' },
  { id: 'avg', name: 'Average' },
  { id: 'min', name: 'Minimum' },
  { id: 'max', name: 'Maximum' },
];

const PRESET_REPORTS = [
  { id: '1', name: 'Conversion Summary', description: 'Overview of all conversions', chartType: 'bar' as const },
  { id: '2', name: 'Channel Performance', description: 'Compare performance across channels', chartType: 'pie' as const },
  { id: '3', name: 'Partner Leaderboard', description: 'Top performing partners', chartType: 'bar' as const },
  { id: '4', name: 'Fraud Analysis', description: 'Fraud detection report', chartType: 'table' as const },
  { id: '5', name: 'Daily Trends', description: 'Conversions over time', chartType: 'line' as const },
];

export default function ReportBuilderPage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    id: '',
    name: 'New Report',
    dataSources: ['conversions'],
    dateRange: { from: '2024-01-01', to: '2024-06-30' },
    filters: [],
    aggregations: [],
    groupBy: ['channel'],
    chartType: 'bar',
  });
  const [savedReports, setSavedReports] = useState(PRESET_REPORTS);

  // Mock data for preview
  const mockData = [
    { channel: 'Media Network', conversions: 1250, spend: 18500000, cpa: 14800, quality: 92 },
    { channel: 'Creator', conversions: 890, spend: 15600000, cpa: 17528, quality: 88 },
    { channel: 'Affiliate', conversions: 560, spend: 9800000, cpa: 17500, quality: 85 },
    { channel: 'Community', conversions: 340, spend: 4200000, cpa: 12353, quality: 90 },
    { channel: 'Sales', conversions: 180, spend: 3200000, cpa: 17778, quality: 82 },
    { channel: 'Mission', conversions: 420, spend: 2800000, cpa: 6667, quality: 62 },
  ];

  const addFilter = () => {
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { id: Date.now().toString(), field: 'status', operator: 'equals', value: '' }],
    }));
  };

  const removeFilter = (id: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== id),
    }));
  };

  const addAggregation = () => {
    setReportConfig(prev => ({
      ...prev,
      aggregations: [...prev.aggregations, { id: Date.now().toString(), field: 'payout', function: 'sum' }],
    }));
  };

  const getSelectedDataSourceFields = () => {
    return DATA_SOURCES.filter(ds => reportConfig.dataSources.includes(ds.id)).flatMap(ds => ds.fields);
  };

  const exportReport = (format: 'csv' | 'xlsx' | 'pdf') => {
    console.log(`Exporting report as ${format}`);
    // In production, this would generate the file
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
            <p className="text-gray-600">Create custom reports and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => exportReport('xlsx')}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="builder">Report Builder</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Report Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Panel - Configuration */}
              <div className="col-span-2 space-y-6">
                {/* Report Name */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Report Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Report Name</Label>
                      <Input
                        value={reportConfig.name}
                        onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="My Custom Report"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <Label>Date Range</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <Input type="date" value={reportConfig.dateRange.from} onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: e.target.value } }))} />
                        <Input type="date" value={reportConfig.dateRange.to} onChange={(e) => setReportConfig(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: e.target.value } }))} />
                      </div>
                    </div>

                    {/* Data Sources */}
                    <div>
                      <Label>Data Sources</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {DATA_SOURCES.map((source) => (
                          <label key={source.id} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                            <Checkbox
                              checked={reportConfig.dataSources.includes(source.id)}
                              onCheckedChange={(checked) => {
                                setReportConfig(prev => ({
                                  ...prev,
                                  dataSources: checked
                                    ? [...prev.dataSources, source.id]
                                    : prev.dataSources.filter(id => id !== source.id),
                                }));
                              }}
                            />
                            <span className="text-sm">{source.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Filters */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Filters</Label>
                        <Button variant="ghost" size="sm" onClick={addFilter}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Filter
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {reportConfig.filters.map((filter) => (
                          <div key={filter.id} className="flex items-center gap-2">
                            <Select value={filter.field} onValueChange={(value) => setReportConfig(prev => ({ ...prev, filters: prev.filters.map(f => f.id === filter.id ? { ...f, field: value } : f) }))}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSelectedDataSourceFields().map((field) => (
                                  <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={filter.operator} onValueChange={(value) => setReportConfig(prev => ({ ...prev, filters: prev.filters.map(f => f.id === filter.id ? { ...f, operator: value } : f) }))}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                {OPERATORS.map((op) => (
                                  <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={filter.value}
                              onChange={(e) => setReportConfig(prev => ({ ...prev, filters: prev.filters.map(f => f.id === filter.id ? { ...f, value: e.target.value } : f) }))}
                              placeholder="Value"
                              className="flex-1"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeFilter(filter.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {reportConfig.filters.length === 0 && (
                          <p className="text-sm text-gray-500 py-4 text-center">No filters added</p>
                        )}
                      </div>
                    </div>

                    {/* Group By */}
                    <div>
                      <Label>Group By</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getSelectedDataSourceFields().map((field) => (
                          <Badge
                            key={field}
                            variant={reportConfig.groupBy.includes(field) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              setReportConfig(prev => ({
                                ...prev,
                                groupBy: prev.groupBy.includes(field)
                                  ? prev.groupBy.filter(f => f !== field)
                                  : [...prev.groupBy, field],
                              }));
                            }}
                          >
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Aggregations */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Aggregations</Label>
                        <Button variant="ghost" size="sm" onClick={addAggregation}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Aggregation
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {reportConfig.aggregations.map((agg) => (
                          <div key={agg.id} className="flex items-center gap-2">
                            <Select value={agg.function} onValueChange={(value) => setReportConfig(prev => ({ ...prev, aggregations: prev.aggregations.map(a => a.id === agg.id ? { ...a, function: value as Aggregation['function'] } : a) }))}>
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AGGREGATION_FUNCTIONS.map((fn) => (
                                  <SelectItem key={fn.id} value={fn.id}>{fn.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={agg.field} onValueChange={(value) => setReportConfig(prev => ({ ...prev, aggregations: prev.aggregations.map(a => a.id === agg.id ? { ...a, field: value } : a) }))}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSelectedDataSourceFields().filter(f => !['conversion_id', 'partner_id', 'program_id', 'created_at'].includes(f)).map((field) => (
                                  <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={() => setReportConfig(prev => ({ ...prev, aggregations: prev.aggregations.filter(a => a.id !== agg.id) }))}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {reportConfig.aggregations.length === 0 && (
                          <p className="text-sm text-gray-500 py-4 text-center">No aggregations added</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chart Type */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
                        { type: 'line' as const, icon: TrendingUp, label: 'Line Chart' },
                        { type: 'pie' as const, icon: PieChartIcon, label: 'Pie Chart' },
                        { type: 'table' as const, icon: FileText, label: 'Table' },
                      ].map((chart) => (
                        <button
                          key={chart.type}
                          onClick={() => setReportConfig(prev => ({ ...prev, chartType: chart.type }))}
                          className={`p-4 rounded-lg border text-center transition-colors ${
                            reportConfig.chartType === chart.type
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <chart.icon className={`w-8 h-8 mx-auto mb-2 ${
                            reportConfig.chartType === chart.type ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <span className="text-sm font-medium">{chart.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Report Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data Sources</span>
                      <span className="font-medium">{reportConfig.dataSources.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Filters</span>
                      <span className="font-medium">{reportConfig.filters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Group By</span>
                      <span className="font-medium">{reportConfig.groupBy.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Aggregations</span>
                      <span className="font-medium">{reportConfig.aggregations.length}</span>
                    </div>
                    <Progress value={65} className="mt-4" />
                    <p className="text-xs text-gray-500 text-center">Report is 65% configured</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Available Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedDataSourceFields().map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Saved Reports Tab */}
          <TabsContent value="saved">
            <div className="grid grid-cols-3 gap-6">
              {savedReports.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {report.chartType === 'bar' && <BarChart3 className="w-3 h-3 mr-1" />}
                        {report.chartType === 'line' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {report.chartType === 'pie' && <PieChartIcon className="w-3 h-3 mr-1" />}
                        {report.chartType === 'table' && <FileText className="w-3 h-3 mr-1" />}
                        {report.chartType}
                      </Badge>
                      <Button variant="ghost" size="sm">Run</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{reportConfig.name}</CardTitle>
                    <CardDescription>
                      {reportConfig.dateRange.from} to {reportConfig.dateRange.to}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Preview Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">CPA</TableHead>
                      <TableHead className="text-right">Quality</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockData.map((row) => (
                      <TableRow key={row.channel}>
                        <TableCell className="font-medium">{row.channel}</TableCell>
                        <TableCell className="text-right">{row.conversions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">Rp {row.spend.toLocaleString()}</TableCell>
                        <TableCell className="text-right">Rp {row.cpa.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.quality >= 85 ? 'default' : 'secondary'}>
                            {row.quality}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
