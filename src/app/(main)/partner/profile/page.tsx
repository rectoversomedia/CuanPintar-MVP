'use client';

import { useState } from 'react';
import { Edit, Camera, Save, MapPin, Users, Star, TrendingUp, DollarSign, CheckCircle, AlertTriangle, Calendar, Globe, Award, Target, Clock, Shield } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockPartnerDashboard, formatCurrency, formatDate } from '@/lib/mock-data';
import { getPartnerTypeLabel, getQualityColor } from '@/lib/utils';

// Mock partner profile data
const partnerProfile = {
  id: 'part_1',
  partner_name: 'JakselNews Media Network',
  partner_type: 'media',
  niche: 'Lifestyle & Urban',
  location: 'Jakarta Selatan',
  audience_size: 2500000,
  quality_score: 92,
  fraud_risk: 'low',
  status: 'active',
  total_earnings: 18500000,
  email: 'contact@jakselnews.com',
  phone: '+62 812 3456 7890',
  website: 'https://jakselnews.com',
  instagram: '@jakselnews',
  joined_at: '2024-02-20T10:00:00Z',
  bio: 'Leading lifestyle and urban news platform targeting young professionals in South Jakarta. We specialize in fintech, lifestyle, and urban content that resonates with our engaged audience of urban millennials.',
  specialties: ['Financial Services', 'Lifestyle', 'Urban Content', 'Tech Reviews'],
  monthlyReach: 2500000,
  avgEngagement: 4.8,
  totalContent: 1250,
};

// Mock earnings summary
const earningsSummary = {
  totalEarnings: 18500000,
  pendingPayout: 3500000,
  thisMonth: 5250000,
  lastMonth: 4100000,
  earningsGrowth: 28,
  totalConversions: 740,
  validConversions: 698,
  conversionRate: 94.3,
};

export default function PartnerProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(partnerProfile);

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the backend
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    } else if (score >= 75) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Partner Profile" subtitle="Manage your partner account and settings" />

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                          <AvatarImage src="/placeholder-avatar.png" />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl font-bold">
                            {profile.partner_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className="mt-3 bg-blue-100 text-blue-800 border-blue-200">
                        {getPartnerTypeLabel(profile.partner_type)}
                      </Badge>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{profile.partner_name}</h2>
                          <p className="text-gray-500">{profile.niche}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {profile.status}
                          </Badge>
                          {isEditing ? (
                            <Button onClick={handleSave} size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          ) : (
                            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{profile.bio}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {profile.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={profile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            Website
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          Joined {formatDate(profile.joined_at)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          {profile.audience_size.toLocaleString()} reach
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile Form */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your partner profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Partner Name</label>
                        <Input
                          value={profile.partner_name}
                          onChange={(e) => setProfile({ ...profile, partner_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Niche</label>
                        <Input
                          value={profile.niche}
                          onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                        <Select value={profile.location} onValueChange={(value) => setProfile({ ...profile, location: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                            <SelectItem value="Jakarta">Jakarta</SelectItem>
                            <SelectItem value="Bandung">Bandung</SelectItem>
                            <SelectItem value="Surabaya">Surabaya</SelectItem>
                            <SelectItem value="Nasional">Nasional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Partner Type</label>
                        <Select value={profile.partner_type} onValueChange={(value) => setProfile({ ...profile, partner_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="creator">Creator</SelectItem>
                            <SelectItem value="affiliate">Affiliate</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                      <textarea
                        className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Partner Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Partner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quality Score */}
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-700">Quality Score</span>
                        </div>
                        {getQualityBadge(profile.quality_score)}
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-blue-600">{profile.quality_score}</span>
                        <span className="text-sm text-gray-500 mb-1">/ 100</span>
                      </div>
                      <Progress value={profile.quality_score} className="mt-2 h-2" />
                    </div>

                    {/* Fraud Risk */}
                    <div className={`p-4 rounded-lg ${profile.fraud_risk === 'low' ? 'bg-green-50' : profile.fraud_risk === 'medium' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-700">Fraud Risk</span>
                        </div>
                        <Badge className={profile.fraud_risk === 'low' ? 'bg-green-100 text-green-800' : profile.fraud_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {profile.fraud_risk === 'low' ? <CheckCircle className="h-3 w-3 mr-1" /> : profile.fraud_risk === 'medium' ? <AlertTriangle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                          {profile.fraud_risk}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {profile.fraud_risk === 'low' ? 'Your account has a clean record with no suspicious activities.' : 'Please review your conversion patterns to improve your fraud score.'}
                      </p>
                    </div>
                  </div>

                  {/* Audience Info */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Audience Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{profile.monthlyReach.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Monthly Reach</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{profile.avgEngagement}%</p>
                        <p className="text-xs text-gray-500">Avg Engagement</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{profile.totalContent}</p>
                        <p className="text-xs text-gray-500">Total Content</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{profile.specialties.length}</p>
                        <p className="text-xs text-gray-500">Specialties</p>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Social Links
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      <Input placeholder="Website URL" defaultValue={profile.website} className="max-w-xs" />
                      <Input placeholder="Instagram" defaultValue={profile.instagram} className="max-w-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Earnings */}
            <div className="space-y-6">
              {/* Earnings Summary */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="h-5 w-5" />
                    Earnings Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(earningsSummary.totalEarnings)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">This Month</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.thisMonth)}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Last Month</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(earningsSummary.lastMonth)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+{earningsSummary.earningsGrowth}%</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Payout */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Clock className="h-5 w-5" />
                    Pending Payout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{formatCurrency(earningsSummary.pendingPayout)}</p>
                  <p className="text-sm text-gray-500 mt-1">Processing - Est. 3-5 business days</p>
                  <Button className="w-full mt-4" variant="outline">
                    View Payout History
                  </Button>
                </CardContent>
              </Card>

              {/* Conversion Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Conversion Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Conversions</span>
                      <span className="font-medium text-gray-900">{earningsSummary.totalConversions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Conversions</span>
                      <span className="font-medium text-green-600">{earningsSummary.validConversions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Conversion Rate</span>
                      <span className="font-medium text-blue-600">{earningsSummary.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rejected</span>
                      <span className="font-medium text-red-600">{earningsSummary.totalConversions - earningsSummary.validConversions}</span>
                    </div>
                  </div>
                  <Progress value={earningsSummary.conversionRate} className="h-2" />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Manage Payment Methods
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    View Performance Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
