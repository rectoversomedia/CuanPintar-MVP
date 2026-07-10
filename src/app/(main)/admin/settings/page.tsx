'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Key, Globe, Shield, Eye, EyeOff, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
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
import { formatDate } from '@/lib/mock-data';

// Mock data
const adminProfile = {
  name: 'Admin User',
  email: 'admin@cuanpintar.com',
  role: 'Super Admin',
};

const platformSettings = [
  { id: 'registration', label: 'User Registration', description: 'Allow new user registrations', enabled: true },
  { id: 'advertiser_approval', label: 'Advertiser Approval', description: 'Require admin approval for new advertisers', enabled: true },
  { id: 'partner_approval', label: 'Partner Approval', description: 'Require admin approval for new partners', enabled: true },
  { id: 'fraud_auto_reject', label: 'Auto-Reject Fraud', description: 'Automatically reject conversions with high fraud score', enabled: true },
  { id: 'email_verification', label: 'Email Verification', description: 'Require email verification for new accounts', enabled: true },
];

const systemSettings = [
  { id: 'maintenance', label: 'Maintenance Mode', description: 'Put the platform in maintenance mode', enabled: false },
  { id: 'debug_mode', label: 'Debug Mode', description: 'Enable debug logging and features', enabled: false },
  { id: 'rate_limiting', label: 'Rate Limiting', description: 'Enable API rate limiting', enabled: true },
  { id: 'webhook_retry', label: 'Webhook Retry', description: 'Enable automatic webhook retry on failure', enabled: true },
];

export default function AdminSettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const adminApiKey = 'cp_admin_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Platform Settings" subtitle="Configure system-wide settings" />

        <main className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general" className="gap-2">
                <Globe className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2">
                <Key className="w-4 h-4" />
                API
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Platform Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Configuration</CardTitle>
                      <CardDescription>Control core platform behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {platformSettings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              setting.id.includes('fraud') ? 'bg-red-100 text-red-600' :
                              setting.id.includes('approval') ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">{setting.label}</p>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                          </div>
                          <Switch checked={setting.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* System Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System Settings</CardTitle>
                      <CardDescription>Advanced system configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {systemSettings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              setting.id === 'maintenance' ? 'bg-amber-100 text-amber-600' :
                              setting.id === 'debug_mode' ? 'bg-purple-100 text-purple-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {setting.id === 'maintenance' ? <AlertTriangle className="w-5 h-5" /> :
                               setting.id === 'debug_mode' ? <Key className="w-5 h-5" /> :
                               <Globe className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium">{setting.label}</p>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                          </div>
                          <Switch checked={setting.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Admin Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-semibold">
                          {adminProfile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{adminProfile.name}</p>
                          <Badge variant="destructive">{adminProfile.role}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Announcement
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        System Notification
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Maintenance Mode
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Platform Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Users</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Active Sessions</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">API Requests (24h)</span>
                        <span className="font-medium">45,678</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Configure platform security policies</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label>Session Timeout (minutes)</Label>
                        <Select defaultValue="30">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>Password Policy</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Minimum 8 characters</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Require uppercase letter</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Require number</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Require special character</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>IP Whitelist (for Admin Access)</Label>
                        <Input placeholder="Enter IP addresses, one per line" className="font-mono text-sm" />
                        <p className="text-sm text-gray-500">Leave empty to allow all IPs</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Audit Log</CardTitle>
                      <CardDescription>Recent security-related activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Admin login</TableCell>
                            <TableCell>admin@cuanpintar.com</TableCell>
                            <TableCell className="font-mono text-sm">192.168.1.100</TableCell>
                            <TableCell>{formatDate(new Date().toISOString())}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Settings changed</TableCell>
                            <TableCell>admin@cuanpintar.com</TableCell>
                            <TableCell className="font-mono text-sm">192.168.1.100</TableCell>
                            <TableCell>{formatDate(new Date(Date.now() - 3600000).toISOString())}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Security Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        View All Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Key className="w-4 h-4 mr-2" />
                        Rotate Admin Keys
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report Security Issue
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
                  <CardTitle>System Notifications</CardTitle>
                  <CardDescription>Configure system-wide notification settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: 'user_signup', label: 'New User Registration', enabled: true },
                    { id: 'advertiser_signup', label: 'New Advertiser Signup', enabled: true },
                    { id: 'partner_signup', label: 'New Partner Signup', enabled: true },
                    { id: 'high_fraud', label: 'High Fraud Alert', enabled: true },
                    { id: 'system_error', label: 'System Errors', enabled: true },
                    { id: 'api_limit', label: 'API Limit Warnings', enabled: false },
                  ].map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <p className="font-medium">{setting.label}</p>
                      <Switch checked={setting.enabled} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Admin API Key</CardTitle>
                  <CardDescription>Use this key to access admin-only API endpoints</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <code className="flex-1 font-mono text-sm">
                      {showApiKey ? adminApiKey : adminApiKey.replace(/.(?=.{16})/g, '*')}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Copy Key
                    </Button>
                    <Button variant="destructive">
                      Regenerate Key
                    </Button>
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
