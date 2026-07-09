'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Key, Users, Plus, Trash2, Edit, Copy, Check, AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/mock-data';

// Mock data
const profile = {
  name: 'Sarah Wijaya',
  email: 'sarah@tunaiku.com',
  company: 'Tunaiku',
  industry: 'Financial Services',
  phone: '+62 812 3456 7890',
  website: 'https://tunaiku.com',
  role: 'Administrator',
};

const notificationSettings = [
  { id: 'conv_alerts', label: 'Conversion Alerts', description: 'Get notified when conversions are detected', enabled: true },
  { id: 'fraud_alerts', label: 'Fraud Alerts', description: 'Get notified about potential fraud attempts', enabled: true },
  { id: 'budget_alerts', label: 'Budget Alerts', description: 'Get notified when approaching budget limits', enabled: true },
  { id: 'weekly_report', label: 'Weekly Performance Report', description: 'Receive weekly summary of campaign performance', enabled: true },
  { id: 'program_updates', label: 'Program Updates', description: 'Get notified about program status changes', enabled: false },
  { id: 'partner_updates', label: 'Partner Updates', description: 'Get notified about new partners and opportunities', enabled: false },
  { id: 'billing_updates', label: 'Billing Updates', description: 'Receive invoice and payment notifications', enabled: true },
];

const apiKeys = [
  { id: 'key_1', name: 'Production API', key: 'cp_live_xxxxxxxxxxxxxxxxxxxxx', createdAt: '2024-01-15', lastUsed: '2024-06-03', status: 'active' },
  { id: 'key_2', name: 'Development API', key: 'cp_test_xxxxxxxxxxxxxxxxxxxxx', createdAt: '2024-01-15', lastUsed: '2024-06-02', status: 'active' },
];

const teamMembers = [
  { id: 'tm_1', name: 'Sarah Wijaya', email: 'sarah@tunaiku.com', role: 'Owner', status: 'active', avatar: 'SW' },
  { id: 'tm_2', name: 'Ahmad Rizki', email: 'ahmad@tunaiku.com', role: 'Admin', status: 'active', avatar: 'AR' },
  { id: 'tm_3', name: 'Diana Putri', email: 'diana@tunaiku.com', role: 'Manager', status: 'active', avatar: 'DP' },
  { id: 'tm_4', name: 'Budi Santoso', email: 'budi@tunaiku.com', role: 'Analyst', status: 'pending', avatar: 'BS' },
];

const rolePermissions = {
  Owner: ['All permissions', 'Manage billing', 'Delete account'],
  Admin: ['Manage programs', 'Manage team', 'View analytics', 'Manage partners'],
  Manager: ['Manage programs', 'View analytics', 'View reports'],
  Analyst: ['View analytics', 'View reports', 'Export data'],
};

export default function AdvertiserSettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleCopyKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleShowKey = (keyId: string) => {
    setShowApiKey((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    return key.replace(/.(?=.{16})/g, '*');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Settings" subtitle="Manage your account and preferences" />

        <main className="p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Profile</CardTitle>
                      <CardDescription>Manage your company information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" defaultValue={profile.name} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={profile.email} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input id="company" defaultValue={profile.company} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Select defaultValue={profile.industry.toLowerCase().replace(' ', '_')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="financial_services">Financial Services</SelectItem>
                              <SelectItem value="fintech">Fintech</SelectItem>
                              <SelectItem value="banking">Banking</SelectItem>
                              <SelectItem value="insurance">Insurance</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="telecommunications">Telecommunications</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" type="tel" defaultValue={profile.phone} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" type="url" defaultValue={profile.website} />
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <Button>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Account Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          <Badge variant="secondary">{profile.role}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          setting.id.includes('fraud') ? 'bg-red-100 text-red-600' :
                          setting.id.includes('budget') ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {setting.id.includes('fraud') ? <AlertTriangle className="w-5 h-5" /> :
                           setting.id.includes('budget') ? <Bell className="w-5 h-5" /> :
                           <Bell className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{setting.label}</p>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                      </div>
                      <Switch checked={setting.enabled} />
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <Button>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage your API keys for integrations</CardDescription>
                      </div>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Key
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Key className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">{apiKey.name}</p>
                                <p className="text-sm text-gray-500">
                                  Created {formatDate(apiKey.createdAt)} | Last used {formatDate(apiKey.lastUsed)}
                                </p>
                              </div>
                            </div>
                            <Badge className={apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {apiKey.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                            <code className="flex-1 text-sm font-mono">
                              {showApiKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleShowKey(apiKey.id)}
                            >
                              {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                            >
                              {copiedKey === apiKey.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Learn how to integrate with CuanPintar API to track conversions and manage your campaigns programmatically.
                    </p>
                    <Button variant="outline">
                      View API Documentation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage who has access to your account</CardDescription>
                    </div>
                    <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Team Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to your organization
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-email">Email</Label>
                            <Input id="member-email" type="email" placeholder="colleague@company.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-role">Role</Label>
                            <Select defaultValue="analyst">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsAddMemberOpen(false)}>
                            Send Invite
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                {member.avatar}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{member.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {rolePermissions[member.role as keyof typeof rolePermissions]?.slice(0, 2).join(', ')}...
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.role !== 'Owner' && (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(rolePermissions).map(([role, permissions]) => (
                      <div key={role} className="p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold mb-2">{role}</h4>
                        <ul className="space-y-1">
                          {permissions.map((perm, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-500" />
                              {perm}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
