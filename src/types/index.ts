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
  total_spend: number; // Total yang advertiser bayarkan ke kita
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

  // Earnings tracking
  total_earnings: number; // Total yang partner dapet dari kita
  total_paid: number; // Yang sudah dibayar
  pending_payout: number; // Yang belum dibayar
  pending_conversions: number; // Conversion yang belum divalidasi

  // Fraud tracking per partner
  total_conversions: number;
  valid_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;
  fraud_rate: number; // Percentage (0-100)

  // Partner metrics
  conversion_rate: number; // Percentage
  avg_payout_per_conversion: number;

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

  // Budget & Volume
  budget: number; // Budget dari advertiser (harga ke advertiser × target)
  target_volume: number; // Target jumlah conversion

  // PRICING - Model bisnis kita
  payout_model: PayoutModel;

  // Deprecated: use advertiser_price + partner_payout instead
  payout_amount: number;

  // Harga ke Advertiser (BRP KITA CHARGE KE ADVERTISER)
  advertiser_price: number; // Per conversion

  // Yang partner dapet (BRP KITA BERIKAN KE PARTNER)
  partner_payout: number; // Per conversion

  // Profit kita per conversion
  platform_profit: number; // = advertiser_price - partner_payout

  // Calculated
  total_advertiser_cost: number; // advertiser_price × actual_conversions
  total_partner_payout: number; // partner_payout × valid_conversions
  total_platform_profit: number; // platform_profit × valid_conversions

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
  | 'low_engagement'
  | 'headless_browser'
  | 'disposable_email'
  | 'same_device_different_time'
  | 'geo_mismatch';

export interface Conversion {
  id: string;
  program_id: string;
  program_name: string;

  // Partner info
  partner_id: string;
  partner_name: string;
  channel_type: ChannelType;

  // Conversion details
  conversion_type: ProgramObjective;
  user_identifier: string; // Email/phone/device fingerprint

  // Technical tracking
  ip_address: string;
  device_id: string;
  fingerprint: string;
  user_agent?: string;
  referrer?: string;

  // PRICING BREAKDOWN
  advertiser_price: number; // Harga ke advertiser (untuk invoice)
  partner_payout: number; // Yang partner dapet
  platform_profit: number; // Profit kita

  // Deprecated alias for partner_payout (for backward compatibility)
  payout_amount: number;

  // Status
  status: ConversionStatus;
  quality_score: number;
  fraud_signals: FraudSignal[];
  fraud_reason?: string; // Alasan rejected/fraud
  validated_by?: string; // Admin who validated
  validated_at?: string;

  // Timestamps
  created_at: string;
}

// Payout Types
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'gopay' | 'ovo' | 'dana' | 'linkaja' | 'qris';

export interface Payout {
  id: string;
  partner_id: string;
  partner_name: string;
  amount: number; // Yang partner dapet
  status: PayoutStatus;
  payment_method: PaymentMethod;
  bank_account?: string;
  approved_conversions: number;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
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
  // Volume
  total_conversions: number;
  valid_conversions: number;
  pending_validations: number;
  rejected_conversions: number;
  fraud_conversions: number;

  // Financial (from Advertiser perspective)
  total_advertiser_cost: number; // Yang advertiser bayarkan
  average_cpa_to_advertiser: number; // advertiser_price per valid

  // Financial (to Partner perspective)
  total_partner_payout: number; // Yang partner dapet
  average_payout_to_partner: number; // partner_payout per valid

  // Platform profit
  total_platform_profit: number;

  // Quality
  quality_score: number;
  fraud_rate: number; // Percentage
  fraud_risk: 'low' | 'medium' | 'high';

  // Conversion rate
  conversion_rate: number;
  click_through_rate: number;
}

export interface ChannelStats {
  channel_type: ChannelType;
  conversions: number;
  valid_rate: number;
  cpa_to_advertiser: number;
  payout_to_partner: number;
  quality_score: number;
  fraud_rate: number;
}

// Dashboard Types
export interface AdvertiserDashboard {
  active_programs: number;
  total_conversions: number;
  total_advertiser_spend: number; // Total yang advertiser bayarkan ke kita
  average_cpa: number;
  fraud_risk: 'low' | 'medium' | 'high';
  top_partner_type: ChannelType;
  recent_programs: Program[];
  ai_recommendation?: string;
}

export interface PartnerDashboard {
  active_programs: number;
  total_conversions: number;
  total_earnings: number; // Yang partner dapet total
  pending_payout: number;
  paid_out: number; // Yang sudah dibayar
  valid_conversions: number;
  fraud_rate: number;
  total_reach: number; // Audience size / reach
  recent_programs: Program[];
}

export interface AdminDashboard {
  active_advertisers: number;
  active_partners: number;
  active_programs: number;

  total_conversions: number;
  valid_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;

  // Financial (legacy names for compatibility)
  total_payouts: number; // deprecated alias
  platform_revenue: number; // deprecated alias

  // Financial (actual names)
  total_advertiser_revenue: number; // Yang advertiser bayarkan ke kita
  total_partner_payout: number; // Yang kita bayarkan ke partner
  total_platform_profit: number; // Profit kita = revenue - payout

  pending_payouts: number;
  fraud_alerts: number;
}

// Tracking Types
export interface TrackingPixel {
  program_id: string;
  partner_id: string;
  unique_link: string;
  qr_code_url: string;
  shortcode: string;
  click_count: number;
  conversion_count: number;
  created_at: string;
}

export interface ConversionEvent {
  event_type: 'click' | 'pageview' | 'conversion';
  visitor_id: string;
  fingerprint: string;
  ip_address: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  timestamp: string;
}

// Unique Link/QR Types
export interface UniqueLink {
  id: string;
  partner_id: string;
  program_id: string;
  link_code: string; // Unique identifier
  full_url: string;
  qr_code_data: string;
  short_url: string;
  click_count: number;
  conversion_count: number;
  valid_conversions: number;
  total_payout: number;
  created_at: string;
  is_active: boolean;
}

// Tracking Links Types (from 009_links_system migration)
export interface TrackingLink {
  id: string;
  partner_id: string;
  program_id: string;
  channel_type: string;
  unique_code: string;
  tracking_url: string;
  short_url: string;
  title?: string;
  description?: string;
  total_clicks: number;
  total_conversions: number;
  valid_conversions: number;
  pending_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;
  total_payout: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  program?: {
    id: string;
    name: string;
    brand_name: string;
    payout_model: PayoutModel;
    payout_amount: number;
    advertiser?: {
      id: string;
      company_name: string;
    };
  };
  partner?: {
    id: string;
    partner_name: string;
    partner_type: PartnerType;
  };
}

export interface LinkDailyStats {
  id: string;
  link_id: string;
  date: string;
  clicks: number;
  unique_clicks: number;
  conversions: number;
  valid_conversions: number;
  payout_amount: number;
  desktop_clicks: number;
  mobile_clicks: number;
  tablet_clicks: number;
  browser_stats: Record<string, number>;
  country_stats: Record<string, number>;
  utm_source_stats: Record<string, number>;
  created_at: string;
}

export interface LinkStats {
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

export interface QRCodeOptions {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodePreset {
  id: string;
  user_id: string;
  name: string;
  foreground_color: string;
  background_color: string;
  size: number;
  margin: number;
  error_correction_level: string;
  logo_url?: string;
  logo_size?: number;
  logo_margin?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
