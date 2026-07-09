/**
 * Supabase Client Configuration
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Create .env.local file with your credentials
 * 4. Run migrations in supabase/migrations folder
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not configured. Using demo mode.\n' +
    'Please create .env.local with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your_project_url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          name: string;
          role: 'advertiser' | 'partner' | 'admin';
          company_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          status: 'active' | 'pending' | 'suspended';
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
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
          verified_at: string | null;
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
          total_conversions: number;
          pending_payout: number;
          verified_at: string | null;
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
          objectives: string[];
          target_audience: Record<string, string>;
          budget: number;
          spent_amount: number;
          payout_model: 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid';
          payout_amount: number;
          target_volume: number | null;
          achieved_volume: number;
          status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
          rejection_reason: string | null;
          start_date: string | null;
          end_date: string | null;
          tracking_pixel: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      conversions: {
        Row: {
          id: string;
          program_id: string;
          advertiser_id: string | null;
          partner_id: string | null;
          channel_type: string;
          conversion_type: string;
          user_identifier: string | null;
          user_data: Record<string, unknown>;
          ip_address: string | null;
          ip_country: string | null;
          ip_city: string | null;
          device_type: string | null;
          device_id: string | null;
          browser: string | null;
          os: string | null;
          fingerprint: string | null;
          utms: Record<string, string>;
          source_url: string | null;
          status: 'pending' | 'valid' | 'rejected' | 'fraud';
          payout_amount: number | null;
          quality_score: number;
          fraud_signals: string[];
          fraud_score: number;
          metadata: Record<string, unknown>;
          created_at: string;
          validated_at: string | null;
          validated_by: string | null;
          validation_notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['conversions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversions']['Insert']>;
      };
      payouts: {
        Row: {
          id: string;
          partner_id: string;
          amount: number;
          platform_fee: number;
          net_amount: number;
          status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed' | 'rejected';
          payment_method: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_holder: string | null;
          approved_conversions: number;
          rejected_conversions: number;
          transaction_id: string | null;
          notes: string | null;
          created_at: string;
          approved_at: string | null;
          processed_at: string | null;
          paid_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['payouts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payouts']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          icon: string | null;
          link: string | null;
          data: Record<string, unknown>;
          read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}

// Type exports
export type User = Database['public']['Tables']['users']['Row'];
export type Advertiser = Database['public']['Tables']['advertisers']['Row'];
export type Partner = Database['public']['Tables']['partners']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type Conversion = Database['public']['Tables']['conversions']['Row'];
export type Payout = Database['public']['Tables']['payouts']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Helper function to get user session
export async function getSession() {
  if (!isSupabaseConfigured()) {
    // Return demo session for development
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
