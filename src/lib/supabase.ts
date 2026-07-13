/**
 * Supabase Client Configuration
 *
 * Generated from: vediyxsldxfptctwnnqh.supabase.co
 * Last Updated: 2026-07-13
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vediyxsldxfptctwnnqh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGl5eHNsZHhmcHRjdHdubnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzkyNTQsImV4cCI6MjA5OTE1NTI1NH0.Id0HloaRoE2DUU6xkpP-z0_QKhFnXZeyoHgbLNQc5Hg';

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// ============================================
// DATABASE TYPES - Generated from Supabase
// ============================================

export interface Database {
  public: {
    Tables: {
      // ============ USER MANAGEMENT ============
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role: 'admin' | 'advertiser' | 'partner';
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          email_verified: boolean;
          email_verified_at: string | null;
          email_verification_token: string | null;
          email_verification_expires: string | null;
          password_reset_token: string | null;
          password_reset_expires: string | null;
          password_reset_attempts: number;
          password_changed_at: string | null;
          failed_login_attempts: number;
          locked_until: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          fingerprint: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_info: Record<string, unknown> | null;
          is_active: boolean;
          is_current: boolean;
          expires_at: string;
          last_active: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_sessions']['Insert']>;
      };

      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          language: string;
          timezone: string;
          email_notifications: boolean;
          push_notifications: boolean;
          sms_notifications: boolean;
          notification_preferences: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>;
      };

      user_2fa_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'totp' | 'sms';
          identifier: string | null;
          secret_encrypted: string;
          is_verified: boolean;
          is_primary: boolean;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_2fa_methods']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_2fa_methods']['Insert']>;
      };

      user_2fa_recovery_codes: {
        Row: {
          id: string;
          user_id: string;
          code_index: number;
          code_hash: string;
          is_used: boolean;
          used_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_2fa_recovery_codes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_2fa_recovery_codes']['Insert']>;
      };

      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          permissions: string[];
          rate_limit: number;
          is_active: boolean;
          expires_at: string | null;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_keys']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>;
      };

      api_sessions: {
        Row: {
          id: string;
          user_id: string;
          api_key_id: string;
          token_hash: string;
          permissions: string[];
          rate_limit: number;
          is_active: boolean;
          expires_at: string;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['api_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['api_sessions']['Insert']>;
      };

      // ============ CORE BUSINESS ============
      advertisers: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          industry: string | null;
          website: string | null;
          logo_url: string | null;
          status: 'active' | 'pending' | 'suspended';
          total_spend: number;
          active_programs: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['advertisers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['advertisers']['Insert']>;
      };

      partners: {
        Row: {
          id: string;
          user_id: string;
          partner_name: string;
          partner_type: 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community' | 'agency';
          niche: string | null;
          location: string | null;
          audience_size: number;
          quality_score: number;
          fraud_risk: 'low' | 'medium' | 'high';
          status: 'active' | 'pending' | 'suspended';
          total_earnings: number;
          total_paid: number;
          pending_payout: number;
          total_conversions: number;
          valid_conversions: number;
          audience_age_group: string | null;
          audience_gender: string | null;
          audience_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['partners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['partners']['Insert']>;
      };

      programs: {
        Row: {
          id: string;
          advertiser_id: string;
          name: string;
          brand_name: string;
          industry: string | null;
          description: string | null;
          objectives: string[] | null;
          target_audience: Record<string, unknown> | null;
          budget: number;
          payout_model: 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid';
          advertiser_price: number;
          partner_payout: number;
          target_volume: number | null;
          total_conversions: number;
          valid_conversions: number;
          channels: Record<string, unknown>[] | null;
          status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };

      program_channels: {
        Row: {
          id: string;
          program_id: string;
          channel_type: 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community' | 'agency';
          allocated_budget: number;
          spent_amount: number;
          estimated_volume: number;
          achieved_volume: number;
          quality_score: number;
          fraud_risk: 'low' | 'medium' | 'high';
          status: 'active' | 'paused' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['program_channels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['program_channels']['Insert']>;
      };

      payment_methods: {
        Row: {
          id: string;
          partner_id: string;
          type: 'bank_transfer' | 'gopay' | 'ovo' | 'dana' | 'linkaja' | 'shopeepay';
          bank_name: string | null;
          bank_code: string | null;
          account_number: string | null;
          account_holder: string;
          ewallet_number: string | null;
          is_default: boolean;
          is_verified: boolean;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_methods']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
      };

      media_partners: {
        Row: {
          id: string;
          partner_id: string;
          media_name: string;
          category: string | null;
          region: string | null;
          monthly_pageviews: number;
          monthly_reach: number;
          avg_conversion_rate: number;
          avg_session_duration: number;
          available_slots: number;
          rate_card: Record<string, unknown> | null;
          quality_score: number;
          status: 'active' | 'pending' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['media_partners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['media_partners']['Insert']>;
      };

      tracking_links: {
        Row: {
          id: string;
          partner_id: string;
          program_id: string;
          unique_code: string;
          short_url: string | null;
          tracking_url: string;
          title: string | null;
          is_active: boolean;
          total_clicks: number;
          total_conversions: number;
          valid_conversions: number;
          total_payout: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tracking_links']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tracking_links']['Insert']>;
      };

      // ============ TRACKING ============
      clicks: {
        Row: {
          id: string;
          click_id: string;
          partner_id: string;
          program_id: string;
          fingerprint: string | null;
          ip_address: string | null;
          country: string | null;
          city: string | null;
          device_type: string | null;
          device_id: string | null;
          browser: string | null;
          os: string | null;
          channel_type: string | null;
          source_url: string | null;
          referrer: string | null;
          user_agent: string | null;
          utms: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clicks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['clicks']['Insert']>;
      };

      conversions: {
        Row: {
          id: string;
          click_id: string | null;
          program_id: string;
          partner_id: string | null;
          channel_type: string | null;
          conversion_type: string | null;
          user_identifier: string | null;
          fingerprint: string | null;
          ip_address: string | null;
          device_id: string | null;
          quality_score: number;
          fraud_score: number;
          fraud_signals: string[] | null;
          status: 'pending' | 'valid' | 'rejected' | 'fraud';
          payout_amount: number | null;
          attributed_partner_id: string | null;
          attribution_model: string | null;
          attributed_at: string | null;
          view_through: boolean;
          utms: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversions']['Insert']>;
      };

      attribution_touchpoints: {
        Row: {
          id: string;
          visitor_id: string;
          click_id: string | null;
          partner_id: string;
          program_id: string;
          touchpoint_type: 'click' | 'view' | 'interaction';
          country: string | null;
          device_type: string | null;
          referrer: string | null;
          utms: Record<string, unknown> | null;
          attribution_window_days: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attribution_touchpoints']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attribution_touchpoints']['Insert']>;
      };

      attribution_models: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attribution_models']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['attribution_models']['Insert']>;
      };

      device_graph: {
        Row: {
          id: string;
          visitor_id: string;
          device_id: string;
          linked_visitor_id: string | null;
          linked_device_id: string | null;
          link_method: string | null;
          confidence_score: number | null;
          match_data: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['device_graph']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['device_graph']['Insert']>;
      };

      // ============ FRAUD DETECTION ============
      fraud_rules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          rule_type: 'velocity' | 'pattern' | 'geolocation' | 'device';
          conditions: Record<string, unknown>;
          action: 'block' | 'flag' | 'score';
          score_penalty: number;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fraud_rules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['fraud_rules']['Insert']>;
      };

      fraud_blocklist: {
        Row: {
          id: string;
          type: 'ip' | 'device' | 'email' | 'email_domain' | 'fingerprint';
          value: string;
          reason: string | null;
          added_by: string | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fraud_blocklist']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['fraud_blocklist']['Insert']>;
      };

      fraud_scores: {
        Row: {
          id: string;
          conversion_id: string;
          rule_id: string | null;
          rule_name: string;
          score: number;
          action_taken: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['fraud_scores']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['fraud_scores']['Insert']>;
      };

      // ============ PAYMENTS ============
      payouts: {
        Row: {
          id: string;
          partner_id: string;
          amount: number;
          platform_fee: number;
          net_amount: number;
          status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'rejected';
          payment_method: string | null;
          ewallet_type: string | null;
          ewallet_number: string | null;
          approved_conversions: number;
          transaction_id: string | null;
          payment_reference: string | null;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>;
      };

      // ============ WEBHOOKS ============
      webhooks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          secret: string;
          events: string[];
          headers: Record<string, unknown> | null;
          active: boolean;
          total_deliveries: number;
          success_rate: number;
          failed_deliveries: number;
          last_triggered: string | null;
          last_success: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['webhooks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['webhooks']['Insert']>;
      };

      webhook_deliveries: {
        Row: {
          id: string;
          webhook_id: string;
          event: string;
          payload: Record<string, unknown>;
          response_status: number;
          response_body: string | null;
          response_time: number;
          attempts: number;
          success: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['webhook_deliveries']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['webhook_deliveries']['Insert']>;
      };

      // ============ NOTIFICATIONS ============
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };

      // ============ SUPPORT ============
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          ticket_number: string;
          subject: string;
          category: 'technical' | 'billing' | 'account' | 'payout' | 'fraud' | 'integration' | 'other';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
          assigned_to: string | null;
          first_response_at: string | null;
          resolved_at: string | null;
          closed_at: string | null;
          resolution_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['support_tickets']['Row'], 'id' | 'ticket_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['support_tickets']['Insert']>;
      };

      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          message: string;
          is_internal: boolean;
          attachments: Record<string, unknown>[] | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['support_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['support_messages']['Insert']>;
      };

      // ============ KYC ============
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: 'ktp' | 'passport' | 'sim' | 'npwp' | 'business_license';
          document_number: string;
          file_url: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          verification_status: 'pending' | 'verified' | 'rejected';
          verified_at: string | null;
          verified_by: string | null;
          rejection_reason: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['kyc_documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['kyc_documents']['Insert']>;
      };

      // ============ AUDIT & LOGGING ============
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
      };

      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_type: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };

      auth_audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['auth_audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['auth_audit_logs']['Insert']>;
      };

      // ============ PLATFORM CONFIG ============
      platform_settings: {
        Row: {
          id: string;
          key: string;
          value: unknown;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['platform_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['platform_settings']['Insert']>;
      };

      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'success' | 'error';
          target_roles: string[] | null;
          starts_at: string | null;
          ends_at: string | null;
          is_published: boolean;
          is_dismissible: boolean;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
    };
  };
}

// ============================================
// TYPE EXPORTS
// ============================================

export type User = Database['public']['Tables']['users']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type UserPreference = Database['public']['Tables']['user_preferences']['Row'];
export type User2FAMethod = Database['public']['Tables']['user_2fa_methods']['Row'];
export type User2FARecoveryCode = Database['public']['Tables']['user_2fa_recovery_codes']['Row'];
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type ApiSession = Database['public']['Tables']['api_sessions']['Row'];

export type Advertiser = Database['public']['Tables']['advertisers']['Row'];
export type Partner = Database['public']['Tables']['partners']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type ProgramChannel = Database['public']['Tables']['program_channels']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type MediaPartner = Database['public']['Tables']['media_partners']['Row'];
export type TrackingLink = Database['public']['Tables']['tracking_links']['Row'];

export type Click = Database['public']['Tables']['clicks']['Row'];
export type Conversion = Database['public']['Tables']['conversions']['Row'];
export type AttributionTouchpoint = Database['public']['Tables']['attribution_touchpoints']['Row'];
export type AttributionModel = Database['public']['Tables']['attribution_models']['Row'];
export type DeviceGraphEntry = Database['public']['Tables']['device_graph']['Row'];

export type FraudRule = Database['public']['Tables']['fraud_rules']['Row'];
export type FraudBlocklistEntry = Database['public']['Tables']['fraud_blocklist']['Row'];
export type FraudScore = Database['public']['Tables']['fraud_scores']['Row'];

export type Payout = Database['public']['Tables']['payouts']['Row'];

export type Webhook = Database['public']['Tables']['webhooks']['Row'];
export type WebhookDelivery = Database['public']['Tables']['webhook_deliveries']['Row'];

export type Notification = Database['public']['Tables']['notifications']['Row'];

export type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
export type SupportMessage = Database['public']['Tables']['support_messages']['Row'];

export type KYCDocument = Database['public']['Tables']['kyc_documents']['Row'];

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuthAuditLog = Database['public']['Tables']['auth_audit_logs']['Row'];

export type PlatformSetting = Database['public']['Tables']['platform_settings']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];

// ============================================
// ENUMS
// ============================================

export type UserRole = 'admin' | 'advertiser' | 'partner';
export type PartnerType = 'media' | 'creator' | 'affiliate' | 'sales' | 'mission' | 'community' | 'agency';
export type ProgramStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
export type PayoutModel = 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid';
export type ConversionStatus = 'pending' | 'valid' | 'rejected' | 'fraud';
export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'rejected';
export type FraudRisk = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'account' | 'payout' | 'fraud' | 'integration' | 'other';
export type PaymentMethodType = 'bank_transfer' | 'gopay' | 'ovo' | 'dana' | 'linkaja' | 'shopeepay';

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    const storedUser = typeof window !== 'undefined'
      ? localStorage.getItem('cp_user')
      : null;

    if (storedUser) {
      return { user: JSON.parse(storedUser), session: null };
    }
    return { user: null, session: null };
  }

  const { data: { session } } = await supabase.auth.getSession();
  return { user: session?.user ?? null, session };
}

// ============================================
// RELATIONSHIP TYPES
// ============================================

export interface UserWithProfile extends User {
  advertiser?: Advertiser;
  partner?: Partner;
}

export interface PartnerWithStats extends Partner {
  total_earnings_formatted?: string;
  conversion_rate?: number;
}

export interface ProgramWithAdvertiser extends Program {
  advertiser?: Advertiser;
}

export interface ConversionWithDetails extends Conversion {
  program?: Program;
  partner?: Partner;
}
