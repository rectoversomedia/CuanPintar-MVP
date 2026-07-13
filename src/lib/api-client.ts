/**
 * API Client Service
 * Production-ready API client for CuanPintar
 */

import { isSupabaseConfigured } from '@/lib/supabase';

// API Base URL
const API_BASE = '/api';

// Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

// Get auth headers
function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') {
    return {};
  }

  // Try to get token from localStorage
  const sessionData = localStorage.getItem('cp_session');
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      return {
        'Authorization': `Bearer ${session.email || session.userId}`,
        'Content-Type': 'application/json',
      };
    } catch {
      return { 'Content-Type': 'application/json' };
    }
  }

  return { 'Content-Type': 'application/json' };
}

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok && !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ==========================================
// AUTH API
// ==========================================

export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    return apiFetch('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: 'advertiser' | 'partner';
    company_name?: string;
    phone?: string;
  }): Promise<ApiResponse> => {
    return apiFetch('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', ...data }),
    });
  },

  logout: async (): Promise<ApiResponse> => {
    return apiFetch('/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout' }),
    });
  },

  me: async (): Promise<ApiResponse> => {
    return apiFetch('/auth', { method: 'GET' });
  },
};

// ==========================================
// PROGRAMS API
// ==========================================

export interface Program {
  id: string;
  advertiser_id: string;
  name: string;
  brand_name: string;
  industry: string;
  description: string;
  budget: number;
  spent_amount: number;
  payout_model: string;
  payout_amount: number;
  target_volume: number;
  achieved_volume: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface CreateProgramInput {
  name: string;
  brand_name: string;
  industry: string;
  description: string;
  budget: number;
  payout_model: 'CPL' | 'CPA' | 'CPI' | 'CPS' | 'hybrid';
  payout_amount: number;
  target_volume?: number;
  start_date?: string;
  end_date?: string;
}

export const programsApi = {
  list: async (params?: {
    status?: string;
    industry?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Program[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.industry) searchParams.set('industry', params.industry);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return apiFetch(`/programs${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<ApiResponse<Program>> => {
    return apiFetch(`/programs/${id}`);
  },

  create: async (data: CreateProgramInput): Promise<ApiResponse<Program>> => {
    return apiFetch('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CreateProgramInput>): Promise<ApiResponse<Program>> => {
    return apiFetch(`/programs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiFetch(`/programs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// CONVERSIONS API
// ==========================================

export interface Conversion {
  id: string;
  program_id: string;
  partner_id: string;
  channel_type: string;
  conversion_type: string;
  status: string;
  payout_amount: number;
  quality_score: number;
  ip_country: string;
  device_type: string;
  created_at: string;
}

export const conversionsApi = {
  list: async (params?: {
    status?: string;
    program_id?: string;
    partner_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Conversion[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.program_id) searchParams.set('program_id', params.program_id);
    if (params?.partner_id) searchParams.set('partner_id', params.partner_id);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return apiFetch(`/conversions${query ? `?${query}` : ''}`);
  },

  track: async (data: {
    program_id: string;
    partner_id: string;
    conversion_type: string;
    user_identifier?: string;
    device_id?: string;
    fingerprint?: string;
  }): Promise<ApiResponse<Conversion>> => {
    return apiFetch('/conversions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validate: async (id: string, status: 'valid' | 'rejected', notes?: string): Promise<ApiResponse> => {
    return apiFetch(`/conversions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, validation_notes: notes }),
    });
  },
};

// ==========================================
// PARTNERS API
// ==========================================

export interface Partner {
  id: string;
  user_id: string;
  partner_name: string;
  partner_type: string;
  niche: string;
  location: string;
  audience_size: number;
  quality_score: number;
  fraud_risk: string;
  status: string;
  total_earnings: number;
  total_conversions: number;
  pending_payout: number;
}

export const partnersApi = {
  list: async (params?: {
    partner_type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Partner[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.partner_type) searchParams.set('partner_type', params.partner_type);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return apiFetch(`/partners${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<ApiResponse<Partner>> => {
    return apiFetch(`/partners/${id}`);
  },

  update: async (id: string, data: Partial<Partner>): Promise<ApiResponse<Partner>> => {
    return apiFetch(`/partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ==========================================
// PAYOUTS API
// ==========================================

export interface Payout {
  id: string;
  partner_id: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  status: string;
  payment_method: string;
  bank_name: string;
  account_number: string;
  approved_conversions: number;
  rejected_conversions: number;
  created_at: string;
  paid_at: string;
}

export const payoutsApi = {
  list: async (params?: {
    status?: string;
    partner_id?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Payout[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.partner_id) searchParams.set('partner_id', params.partner_id);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return apiFetch(`/payouts${query ? `?${query}` : ''}`);
  },

  request: async (data: {
    amount: number;
    payment_method: string;
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
  }): Promise<ApiResponse<Payout>> => {
    return apiFetch('/payouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==========================================
// ANALYTICS API
// ==========================================

export interface DashboardStats {
  total_programs: number;
  active_programs: number;
  total_conversions: number;
  valid_conversions: number;
  total_payout: number;
  pending_payout: number;
  conversion_rate: number;
}

export const analyticsApi = {
  dashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiFetch('/analytics');
  },

  cohort: async (params?: { date_from?: string; date_to?: string }): Promise<ApiResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const query = searchParams.toString();
    return apiFetch(`/analytics/cohort${query ? `?${query}` : ''}`);
  },

  ltv: async (): Promise<ApiResponse> => {
    return apiFetch('/analytics/ltv');
  },
};

// ==========================================
// NOTIFICATIONS API
// ==========================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export const notificationsApi = {
  list: async (): Promise<ApiResponse<Notification[]>> => {
    return apiFetch('/notifications');
  },

  markRead: async (id: string): Promise<ApiResponse> => {
    return apiFetch(`/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  },

  markAllRead: async (): Promise<ApiResponse> => {
    return apiFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify({ action: 'mark_all_read' }),
    });
  },
};

// ==========================================
// LINKS API
// ==========================================

export interface TrackingLink {
  id: string;
  code: string;
  program_id: string;
  partner_id: string;
  url: string;
  short_url: string;
  clicks: number;
  conversions: number;
  created_at: string;
}

export const linksApi = {
  create: async (programId: string): Promise<ApiResponse<TrackingLink>> => {
    return apiFetch('/links', {
      method: 'POST',
      body: JSON.stringify({ program_id: programId }),
    });
  },

  get: async (code: string): Promise<ApiResponse<TrackingLink>> => {
    return apiFetch(`/links/${code}`);
  },

  stats: async (code: string): Promise<ApiResponse> => {
    return apiFetch(`/links/${code}/stats`);
  },

  generateQR: async (code: string): Promise<ApiResponse<{ qr_code: string }>> => {
    return apiFetch(`/links/${code}/qr`);
  },
};

// Export all APIs
export default {
  auth: authApi,
  programs: programsApi,
  conversions: conversionsApi,
  partners: partnersApi,
  payouts: payoutsApi,
  analytics: analyticsApi,
  notifications: notificationsApi,
  links: linksApi,
};
