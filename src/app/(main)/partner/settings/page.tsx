'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Key, CreditCard, Shield, Eye, EyeOff, Plus, Trash2, Edit, Check, Upload } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/mock-data';

// Mock data
const partnerProfile = {
  name: 'Budi Santoso',
  email: 'budi@jakselnews.com',
  company: 'JakselNews Media',
  type: 'Media Partner',
  phone: '+62 812 3456 7890',
  website: 'https://jakselnews.com',
  qualityScore: 92,
  audienceSize: '500K - 1M',
  niche: 'Lifestyle & Entertainment',
  location: 'Jakarta',
};

const notificationSettings = [
  { id: 'new_programs', label: 'New Programs Available', description: 'Get notified when new programs match your profile', enabled: true },
  { id: 'conversion_validated', label: 'Conversion Validated', description: 'Get notified when your conversions are validated', enabled: true },
  { id: 'payout_ready', label: 'Payout Ready', description: 'Get notified when your payout is ready', enabled: true },
  { id: 'program_update', label: 'Program Updates', description: 'Get notified about program changes', enabled: false },
  { id: 'fraud_alert', label: 'Fraud Alert', description: 'Get notified about potential fraud on your conversions', enabled: true },
  { id: 'weekly_summary', label: 'Weekly Summary', description: 'Receive weekly performance summary', enabled: true },
];

const paymentMethods = [
  { id: 'pm_1', type: 'bank_transfer', name: 'Bank BCA', accountNumber: '1234567890', accountHolder: 'Budi Santoso', isDefault: true },
  { id: 'pm_2', type: 'gopay', name: 'GoPay', accountNumber: '081234567890', accountHolder: 'Budi Santoso', isDefault: false },
];

const bankOptions = ['Bank BCA', 'Bank Mandiri', 'Bank BNI', 'Bank BRI', 'Bank CIMB', 'Bank BTPN'];

export default function PartnerSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const apiKey = 'cp_partner_xxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
            <p className="text-gray-500">Kelola akun dan preferensi kamu</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifikasi
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Pembayaran
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="w-4 h-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Keamanan
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Informasi Profile</CardTitle>
                        <CardDescription>Kelola informasi akun kamu</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Simpan
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-2xl">
                          {partnerProfile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          defaultValue={partnerProfile.name}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={partnerProfile.email}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Nama Brand/Channel</Label>
                        <Input
                          id="company"
                          defaultValue={partnerProfile.company}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor HP</Label>
                        <Input
                          id="phone"
                          type="tel"
                          defaultValue={partnerProfile.phone}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipe Partner</Label>
                        <Select defaultValue="media" disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="media">Media Partner</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="affiliate">Affiliate</SelectItem>
                            <SelectItem value="sales">Sales Team</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          defaultValue={partnerProfile.website}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="niche">Niche</Label>
                        <Input
                          id="niche"
                          defaultValue={partnerProfile.niche}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Lokasi</Label>
                        <Input
                          id="location"
                          defaultValue={partnerProfile.location}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Statistik</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Quality Score</span>
                      <Badge className="bg-green-100 text-green-800">{partnerProfile.qualityScore}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Audience Size</span>
                      <span className="font-medium">{partnerProfile.audienceSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Lihat Profile Public
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Kelola Payment Methods
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
                <CardTitle>Pengaturan Notifikasi</CardTitle>
                <CardDescription>Pilih bagaimana kamu ingin menerima notifikasi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        setting.id.includes('fraud') ? 'bg-red-100 text-red-600' :
                        setting.id.includes('payout') ? 'bg-green-100 text-green-600' :
                        setting.id.includes('program') ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <Bell className="w-5 h-5" />
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
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Metode Pembayaran</CardTitle>
                      <CardDescription>Kelola rekening untuk menerima payout</CardDescription>
                    </div>
                    <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Metode
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
                          <DialogDescription>
                            Tambahkan rekening bank atau e-wallet untuk menerima payout
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Tipe</Label>
                            <Select defaultValue="bank">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank">Transfer Bank</SelectItem>
                                <SelectItem value="gopay">GoPay</SelectItem>
                                <SelectItem value="ovo">OVO</SelectItem>
                                <SelectItem value="dana">DANA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Bank</Label>
                            <Select defaultValue="">
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih bank" />
                              </SelectTrigger>
                              <SelectContent>
                                {bankOptions.map((bank) => (
                                  <SelectItem key={bank} value={bank.toLowerCase().replace(' ', '_')}>
                                    {bank}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Nomor Rekening</Label>
                            <Input placeholder="Masukkan nomor rekening" />
                          </div>
                          <div className="space-y-2">
                            <Label>Nama Pemilik</Label>
                            <Input placeholder="Nama sesuai di rekening" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                            Batal
                          </Button>
                          <Button onClick={() => setIsAddPaymentOpen(false)}>
                            Simpan
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
                        <TableHead>Tipe</TableHead>
                        <TableHead>Informasi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentMethods.map((method) => (
                        <TableRow key={method.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{method.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{method.accountNumber}</p>
                              <p className="text-sm text-gray-500">{method.accountHolder}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {method.isDefault && (
                              <Badge className="bg-green-100 text-green-800">Default</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!method.isDefault && (
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Partner API Key</CardTitle>
                <CardDescription>
                  Gunakan API key ini untuk tracking conversions secara programmatic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50">
                  <code className="flex-1 font-mono text-sm">
                    {showApiKey ? apiKey : apiKey.replace(/.(?=.{20})/g, '*')}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey(apiKey)}
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCopyKey(apiKey)}>
                    Copy Key
                  </Button>
                  <Button variant="outline">
                    View API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ubah Password</CardTitle>
                    <CardDescription>Update password secara berkala untuk keamanan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Password Saat Ini</Label>
                      <Input id="current-password" type="password" placeholder="Masukkan password saat ini" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password Baru</Label>
                      <Input id="new-password" type="password" placeholder="Minimal 8 karakter" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                      <Input id="confirm-password" type="password" placeholder="Masukkan password lagi" />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Tambah lapisan keamanan ekstra dengan 2FA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium">2FA belum aktif</p>
                          <p className="text-sm text-gray-500">Lindugi akun dengan autentikasi dua faktor</p>
                        </div>
                      </div>
                      <Button>Aktifkan 2FA</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Aktivitas Login</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="text-gray-500">Login terakhir</p>
                      <p className="font-medium">Hari ini, 09:30</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">IP Address</p>
                      <p className="font-medium font-mono">192.168.1.100</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Device</p>
                      <p className="font-medium">Chrome on macOS</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
