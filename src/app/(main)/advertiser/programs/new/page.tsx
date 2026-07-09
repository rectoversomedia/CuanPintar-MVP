'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Plus, X, DollarSign, Users, Target, MapPin, Smartphone, User } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const steps = [
  { id: 1, name: 'Program Basics', description: 'Basic program information' },
  { id: 2, name: 'Objective', description: 'Define conversion goals' },
  { id: 3, name: 'Target Audience', description: 'Set audience parameters' },
  { id: 4, name: 'Budget & Payout', description: 'Configure pricing model' },
  { id: 5, name: 'Distribution', description: 'Select channels' },
  { id: 6, name: 'Review', description: 'Confirm and publish' },
];

const objectives = [
  { id: 'app_install', label: 'App Install', description: 'Drive app downloads' },
  { id: 'registration', label: 'Registration', description: 'New user sign-ups' },
  { id: 'lead_form', label: 'Lead Form', description: 'Capture qualified leads' },
  { id: 'kyc', label: 'KYC', description: 'Identity verification' },
  { id: 'purchase', label: 'Purchase', description: 'Completed transactions' },
  { id: 'review_rating', label: 'Review & Rating', description: 'App store reviews' },
  { id: 'event_attendance', label: 'Event Attendance', description: 'Offline event visits' },
  { id: 'survey_completion', label: 'Survey Completion', description: 'Survey responses' },
];

const channels = [
  {
    id: 'media',
    label: 'Media Network',
    description: '100+ Indonesian media partners',
    stats: { volume: 'High', intent: 'Medium', cost: 'Medium', quality: 'High', fraud: 'Low' },
  },
  {
    id: 'creator',
    label: 'Creator',
    description: 'Influencers and content creators',
    stats: { volume: 'Medium', intent: 'High', cost: 'Medium', quality: 'High', fraud: 'Low' },
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    description: 'Commission-based partners',
    stats: { volume: 'High', intent: 'Medium', cost: 'High', quality: 'Medium', fraud: 'Medium' },
  },
  {
    id: 'sales',
    label: 'Sales Canvassing',
    description: 'Direct sales teams',
    stats: { volume: 'Low', intent: 'High', cost: 'High', quality: 'High', fraud: 'Low' },
  },
  {
    id: 'mission',
    label: 'Mission',
    description: 'Task-based user acquisition',
    stats: { volume: 'High', intent: 'Low', cost: 'Low', quality: 'Low', fraud: 'High' },
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Community groups and forums',
    stats: { volume: 'Medium', intent: 'Medium', cost: 'Low', quality: 'High', fraud: 'Low' },
  },
];

export default function CreateProgramPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand_name: '',
    industry: '',
    description: '',
    selectedObjectives: [] as string[],
    targetAudience: {
      age: '',
      gender: '',
      location: '',
      interest: '',
      device: '',
      notes: '',
    },
    budget: '',
    target_volume: '',
    payout_model: '',
    payout_amount: '',
    selectedChannels: [] as string[],
  });

  const toggleObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedObjectives: prev.selectedObjectives.includes(id)
        ? prev.selectedObjectives.filter(o => o !== id)
        : [...prev.selectedObjectives, id],
    }));
  };

  const toggleChannel = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedChannels: prev.selectedChannels.includes(id)
        ? prev.selectedChannels.filter(c => c !== id)
        : [...prev.selectedChannels, id],
    }));
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header title="Create New Program" subtitle="Set up your acquisition program" />

        <main className="p-6">
          {/* Back Button */}
          <Link href="/advertiser/programs">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Programs
            </Button>
          </Link>

          {/* Progress Steps */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                          currentStep > step.id
                            ? 'bg-green-600 text-white'
                            : currentStep === step.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                      </div>
                      <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / 6) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Program Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Program Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Tunaiku Registration Campaign"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="brand_name">Brand Name</Label>
                      <Input
                        id="brand_name"
                        placeholder="e.g., Tunaiku"
                        value={formData.brand_name}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Industry</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="telecom">Telecommunications</SelectItem>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="banking">Banking</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="fnb">F&B</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Describe your program goals and targeting..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2 w-full h-32 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Objectives */}
              {currentStep === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  {objectives.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.selectedObjectives.includes(obj.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{obj.label}</span>
                        {formData.selectedObjectives.includes(obj.id) && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{obj.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Target Audience */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="age">Age Range</Label>
                      <Input
                        id="age"
                        placeholder="e.g., 21-35"
                        value={formData.targetAudience.age}
                        onChange={(e) => setFormData({
                          ...formData,
                          targetAudience: { ...formData.targetAudience, age: e.target.value }
                        })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select onValueChange={(v) => setFormData({
                        ...formData,
                        targetAudience: { ...formData.targetAudience, gender: v }
                      })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="device">Device</Label>
                      <Select onValueChange={(v) => setFormData({
                        ...formData,
                        targetAudience: { ...formData.targetAudience, device: v }
                      })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Jakarta, Surabaya, Bandung"
                      value={formData.targetAudience.location}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetAudience: { ...formData.targetAudience, location: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest">Interest</Label>
                    <Input
                      id="interest"
                      placeholder="e.g., Personal Finance, Investment"
                      value={formData.targetAudience.interest}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetAudience: { ...formData.targetAudience, interest: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <textarea
                      id="notes"
                      placeholder="Any additional targeting notes..."
                      value={formData.targetAudience.notes}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetAudience: { ...formData.targetAudience, notes: e.target.value }
                      })}
                      className="mt-2 w-full h-24 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Budget & Payout */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="budget">Total Budget (IDR)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 50000000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_volume">Target Volume</Label>
                      <Input
                        id="target_volume"
                        type="number"
                        placeholder="e.g., 2000"
                        value={formData.target_volume}
                        onChange={(e) => setFormData({ ...formData, target_volume: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label>Payout Model</Label>
                      <Select onValueChange={(v) => setFormData({ ...formData, payout_model: v })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CPL">CPL - Cost Per Lead</SelectItem>
                          <SelectItem value="CPA">CPA - Cost Per Acquisition</SelectItem>
                          <SelectItem value="CPI">CPI - Cost Per Install</SelectItem>
                          <SelectItem value="CPS">CPS - Cost Per Sale</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payout_amount">Payout Amount (IDR)</Label>
                      <Input
                        id="payout_amount"
                        type="number"
                        placeholder="e.g., 25000"
                        value={formData.payout_amount}
                        onChange={(e) => setFormData({ ...formData, payout_amount: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  {formData.budget && formData.target_volume && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-800">Estimated CPA</p>
                            <p className="text-xl font-bold text-blue-900">
                              Rp {parseInt(formData.budget || '0') / parseInt(formData.target_volume || '1') || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 5: Distribution Channels */}
              {currentStep === 5 && (
                <div className="grid grid-cols-2 gap-4">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.selectedChannels.includes(channel.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.selectedChannels.includes(channel.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">{channel.label}</span>
                            <p className="text-xs text-gray-500">{channel.description}</p>
                          </div>
                        </div>
                        {formData.selectedChannels.includes(channel.id) && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-500">Volume</p>
                          <p className="font-medium">{channel.stats.volume}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Intent</p>
                          <p className="font-medium">{channel.stats.intent}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Cost</p>
                          <p className="font-medium">{channel.stats.cost}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Quality</p>
                          <p className="font-medium">{channel.stats.quality}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Fraud</p>
                          <p className="font-medium">{channel.stats.fraud}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <Card className="bg-gray-50">
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Program Name</p>
                          <p className="font-medium">{formData.name || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Brand</p>
                          <p className="font-medium">{formData.brand_name || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Industry</p>
                          <p className="font-medium">{formData.industry || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium">Rp {parseInt(formData.budget || '0').toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payout Model</p>
                          <p className="font-medium">{formData.payout_model || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payout Amount</p>
                          <p className="font-medium">Rp {parseInt(formData.payout_amount || '0').toLocaleString() || '0'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Objectives</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedObjectives.length > 0
                            ? formData.selectedObjectives.map((obj) => (
                                <Badge key={obj} variant="secondary">
                                  {objectives.find(o => o.id === obj)?.label}
                                </Badge>
                              ))
                            : <span className="text-gray-400">No objectives selected</span>
                          }
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Distribution Channels</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedChannels.length > 0
                            ? formData.selectedChannels.map((ch) => (
                                <Badge key={ch} variant="secondary">
                                  {channels.find(c => c.id === ch)?.label}
                                </Badge>
                              ))
                            : <span className="text-gray-400">No channels selected</span>
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep < 6 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline">
                      Save Draft
                    </Button>
                    <Button>
                      <Check className="w-4 h-4 mr-2" />
                      Publish Program
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
