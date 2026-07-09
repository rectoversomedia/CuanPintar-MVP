'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MessageSquare, Clock, User, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from '@/lib/utils';

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user: { name: string; email: string; role: string };
  assignee: { name: string; email: string } | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    ticket_number: 'TKT-2026-07-000001',
    subject: 'Conversion tracking not working properly',
    category: 'technical',
    priority: 'high',
    status: 'open',
    user: { name: 'Budi Santoso', email: 'budi@jakselnews.com', role: 'partner' },
    assignee: null,
    message_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    ticket_number: 'TKT-2026-07-000002',
    subject: 'Payout not received for June',
    category: 'payout',
    priority: 'urgent',
    status: 'in_progress',
    user: { name: 'Sarah Chen', email: 'sarah@tunaiku.com', role: 'advertiser' },
    assignee: { name: 'Admin', email: 'admin@cuanpintar.com' },
    message_count: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '3',
    ticket_number: 'TKT-2026-07-000003',
    subject: 'API integration documentation request',
    category: 'integration',
    priority: 'medium',
    status: 'pending',
    user: { name: 'Ahmad Rizki', email: 'ahmad@techindo.id', role: 'partner' },
    assignee: { name: 'Admin', email: 'admin@cuanpintar.com' },
    message_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '4',
    ticket_number: 'TKT-2026-07-000004',
    subject: 'Account access issue',
    category: 'account',
    priority: 'high',
    status: 'resolved',
    user: { name: 'Dewi Lestari', email: 'dewi@mediaku.com', role: 'advertiser' },
    assignee: { name: 'Admin', email: 'admin@cuanpintar.com' },
    message_count: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    ticket_number: 'TKT-2026-06-000005',
    subject: 'Billing inquiry for May invoice',
    category: 'billing',
    priority: 'low',
    status: 'closed',
    user: { name: 'Michael Tan', email: 'michael@finance.co.id', role: 'advertiser' },
    assignee: { name: 'Admin', email: 'admin@cuanpintar.com' },
    message_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: <AlertCircle className="w-3 h-3" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', icon: <Clock className="w-3 h-3" /> },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="w-3 h-3" /> },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-yellow-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

const categoryLabels: Record<string, string> = {
  technical: 'Technical',
  billing: 'Billing',
  account: 'Account',
  payout: 'Payout',
  fraud: 'Fraud',
  integration: 'Integration',
  other: 'Other',
};

export default function SupportTicketsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    open: mockTickets.filter(t => t.status === 'open').length,
    in_progress: mockTickets.filter(t => t.status === 'in_progress').length,
    pending: mockTickets.filter(t => t.status === 'pending').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header
          title="Support Tickets"
          subtitle="Manage customer support requests"
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          }
        />

        <main className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Open</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.in_progress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Category</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ticket List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Badge className={statusConfig[ticket.status].color} variant="secondary">
                        <span className="flex items-center gap-1">
                          {statusConfig[ticket.status].icon}
                          {statusConfig[ticket.status].label}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-500">{ticket.ticket_number}</span>
                        <span className={`text-sm font-medium ${priorityConfig[ticket.priority].color}`}>
                          {priorityConfig[ticket.priority].label}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[ticket.category]}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.message_count}
                        </span>
                        {ticket.assignee && (
                          <span className="text-purple-600">Assigned to {ticket.assignee.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(ticket.created_at))}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated {formatDistanceToNow(new Date(ticket.updated_at))}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
