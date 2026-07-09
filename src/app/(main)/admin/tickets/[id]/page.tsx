'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Clock, User, AlertCircle, CheckCircle2, FileText, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow, formatDate } from '@/lib/utils';

interface Message {
  id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  user: { name: string; email: string; role: string };
}

interface TicketDetail {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  user: { name: string; email: string; role: string };
  assignee: { name: string; email: string } | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  first_response_at: string | null;
  messages: Message[];
}

const mockTicket: TicketDetail = {
  id: '1',
  ticket_number: 'TKT-2026-07-000001',
  subject: 'Conversion tracking not working properly',
  category: 'technical',
  priority: 'high',
  status: 'open',
  user: { name: 'Budi Santoso', email: 'budi@jakselnews.com', role: 'partner' },
  assignee: null,
  resolution_notes: null,
  created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  resolved_at: null,
  first_response_at: null,
  messages: [
    {
      id: 'm1',
      message: 'Hi, I noticed that conversions from my website are not being tracked properly. The pixel shows 0 conversions but I know there should be some.',
      is_internal: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: { name: 'Budi Santoso', email: 'budi@jakselnews.com', role: 'partner' },
    },
    {
      id: 'm2',
      message: 'Could you please check if the tracking pixel is installed correctly on all pages? Also verify the program ID matches.',
      is_internal: false,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      user: { name: 'Budi Santoso', email: 'budi@jakselnews.com', role: 'partner' },
    },
  ],
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500 bg-gray-100' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-100' },
};

export default function TicketDetailPage() {
  const params = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(mockTicket.status);
  const [ticketPriority, setTicketPriority] = useState(mockTicket.priority);

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    console.log('Sending reply:', { message: replyMessage, isInternal });
    setReplyMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header
          title={`Ticket ${mockTicket.ticket_number}`}
          subtitle={mockTicket.subject}
          action={
            <div className="flex items-center gap-2">
              <Link href="/admin/tickets">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <main className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content - Messages */}
            <div className="col-span-2 space-y-4">
              {/* Messages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Conversation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${msg.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                          {msg.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{msg.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {msg.user.role}
                            </Badge>
                            {msg.is_internal && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                Internal Note
                              </Badge>
                            )}
                            <span className="text-sm text-gray-400 ml-auto">
                              {formatDistanceToNow(new Date(msg.created_at))}
                            </span>
                          </div>
                          <p className="text-gray-700">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Reply Box */}
              {ticketStatus !== 'closed' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Reply</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant={isInternal ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsInternal(false)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                      <Button
                        variant={isInternal ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsInternal(true)}
                        className={isInternal ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Internal Note
                      </Button>
                    </div>
                    <Textarea
                      placeholder={isInternal ? 'Add internal note (not visible to user)...' : 'Type your reply...'}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSendReply} disabled={!replyMessage.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resolution Notes */}
              {(ticketStatus === 'resolved' || ticketStatus === 'closed') && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Resolution Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{mockTicket.resolution_notes || 'No resolution notes provided.'}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Ticket Info */}
            <div className="space-y-4">
              {/* Status Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Status</label>
                    <Select value={ticketStatus} onValueChange={setTicketStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Priority</label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Category</label>
                    <Badge variant="outline" className="capitalize">
                      {mockTicket.category}
                    </Badge>
                  </div>

                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Requester</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-medium">
                      {mockTicket.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{mockTicket.user.name}</p>
                      <p className="text-sm text-gray-500">{mockTicket.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant="outline" className="capitalize">
                      {mockTicket.user.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm font-medium">{formatDate(new Date(mockTicket.created_at))}</p>
                    </div>
                  </div>
                  {mockTicket.first_response_at && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">First Response</p>
                        <p className="text-sm font-medium">{formatDate(new Date(mockTicket.first_response_at))}</p>
                      </div>
                    </div>
                  )}
                  {mockTicket.resolved_at && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Resolved</p>
                        <p className="text-sm font-medium">{formatDate(new Date(mockTicket.resolved_at))}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
