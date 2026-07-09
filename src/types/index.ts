// User and Authentication Types
export type UserRole = 'advertiser' | 'partner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_name?: string;
  avatar?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Advertiser Types
export interface Advertiser {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  website: string;
  status: 'active' | 'pending' | 'suspended';
  total_spend: number;
  active_programs: number;
  created_at: string;
}

// Partner Types
export type PartnerType = 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community' | 'agency';

export interface Partner {
  id: string;
  user_id: string;
  partner_name: string;
  partner_type: PartnerType;
  niche: string;
  location: string;
  audience_size: number;
  quality_score: number;
  fraud_risk: 'low' | 'medium' | 'high';
  status: 'active' | 'pending' | 'suspended';
  total_earnings: number;
  created_at: string;
}

// Program Types
export type ProgramObjective =
  | 'app_install'
  | 'registration'
  | 'lead_form'
  | 'kyc'
  | 'purchase'
  | 'review_rating'
  | 'event_attendance'
  | 'survey_completion';

export type PayoutModel = 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid';
export type ProgramStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
export type ChannelType = 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community';

export interface Program {
  id: string;
  advertiser_id: string;
  advertiser_name: string;
  name: string;
  brand_name: string;
  industry: string;
  description: string;
  objectives: ProgramObjective[];
  target_audience: TargetAudience;
  budget: number;
  payout_model: PayoutModel;
  payout_amount: number;
  target_volume: number;
  status: ProgramStatus;
  channels: ProgramChannel[];
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface TargetAudience {
  age?: string;
  gender?: string;
  location?: string;
  interest?: string;
  device?: string;
  notes?: string;
}

export interface ProgramChannel {
  channel_type: ChannelType;
  allocated_budget: number;
  estimated_volume: number;
  quality_score: number;
  fraud_risk: 'low' | 'medium' | 'high';
}

// Conversion Types
export type ConversionStatus = 'pending' | 'valid' | 'rejected' | 'fraud';
export type FraudSignal =
  | 'duplicate_ip'
  | 'duplicate_device'
  | 'suspicious_velocity'
  | 'invalid_phone'
  | 'invalid_email'
  | 'emulator_suspected'
  | 'proxy_vpn'
  | 'low_engagement';

export interface Conversion {
  id: string;
  program_id: string;
  program_name: string;
  partner_id: string;
  partner_name: string;
  channel_type: ChannelType;
  conversion_type: ProgramObjective;
  user_identifier: string;
  ip_address: string;
  device_id: string;
  status: ConversionStatus;
  payout_amount: number;
  quality_score: number;
  fraud_signals: FraudSignal[];
  created_at: string;
}

// Payout Types
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'ewallet' | 'gopay' | 'ovo' | 'dana';

export interface Payout {
  id: string;
  partner_id: string;
  partner_name: string;
  amount: number;
  status: PayoutStatus;
  payment_method: PaymentMethod;
  bank_account?: string;
  approved_conversions: number;
  paid_at?: string;
  created_at: string;
}

// Media Network Types
export type MediaCategory =
  | 'national_news'
  | 'local_news'
  | 'finance'
  | 'lifestyle'
  | 'parenting'
  | 'automotive'
  | 'education'
  | 'tech'
  | 'muslim_family'
  | 'entertainment';

export interface MediaInventory {
  id: string;
  partner_id: string;
  media_name: string;
  category: MediaCategory;
  region: string;
  monthly_reach: number;
  available_slots: number;
  avg_conversion_rate: number;
  quality_score: number;
  status: 'active' | 'inactive' | 'maintenance';
}

// Analytics Types
export interface ProgramStats {
  total_conversions: number;
  valid_conversions: number;
  pending_validations: number;
  rejected_conversions: number;
  total_spend: number;
  average_cpa: number;
  quality_score: number;
  fraud_risk: 'low' | 'medium' | 'high';
}

export interface ChannelStats {
  channel_type: ChannelType;
  allocated_budget: number;
  conversions: number;
  valid_rate: number;
  cpa: number;
  quality_score: number;
}

// Dashboard Types
export interface AdvertiserDashboard {
  active_programs: number;
  total_conversions: number;
  average_cpa: number;
  fraud_risk: 'low' | 'medium' | 'high';
  top_partner_type: ChannelType;
  recent_programs: Program[];
  ai_recommendation?: string;
}

export interface PartnerDashboard {
  active_programs: number;
  total_earnings: number;
  pending_payout: number;
  valid_conversions: number;
  total_reach: number;
  recent_programs: Program[];
}

export interface AdminDashboard {
  active_advertisers: number;
  active_partners: number;
  active_programs: number;
  total_conversions: number;
  valid_conversions: number;
  rejected_conversions: number;
  total_payouts: number;
  platform_revenue: number;
  fraud_alerts: number;
}
