/**
 * API Client
 *
 * Centralized API client for all HTTP requests
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Standard response format
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request options
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// Generic GET request
async function get<T = unknown>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options || {};

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  return handleResponse(response);
}

// Generic POST request
async function post<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse(response);
}

// Generic PUT request
async function put<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse(response);
}

// Generic DELETE request
async function del<T = unknown>(
  endpoint: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return handleResponse(response);
}

// Handle response
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse response',
    };
  }
}

// Export API client
export const api = {
  get,
  post,
  put,
  delete: del,

  // Convenience methods for auth
  auth: {
    login: (email: string, password: string) =>
      post('/auth', { action: 'login', email, password }),
    register: (data: {
      email: string;
      password: string;
      name: string;
      role: 'advertiser' | 'partner';
      companyName?: string;
    }) => post('/auth', { action: 'register', ...data }),
    logout: () => post('/auth', { action: 'logout' }),
    me: () => get('/auth'),
  },

  // Programs
  programs: {
    list: (params?: { status?: string; page?: number; limit?: number }) =>
      get('/programs', { params }),
    get: (id: string) => get(`/programs/${id}`),
    create: (data: Record<string, unknown>) => post('/programs', data),
    update: (id: string, data: Record<string, unknown>) => put(`/programs/${id}`, data),
    delete: (id: string) => del(`/programs/${id}`),
  },

  // Partners
  partners: {
    list: (params?: { status?: string; type?: string; search?: string; page?: number }) =>
      get('/partners', { params }),
    get: (id: string) => get(`/partners/${id}`),
    create: (data: Record<string, unknown>) => post('/partners', data),
    update: (id: string, data: Record<string, unknown>) => put(`/partners/${id}`, data),
    delete: (id: string) => del(`/partners/${id}`),
  },

  // Conversions
  conversions: {
    list: (params?: {
      status?: string;
      program_id?: string;
      partner_id?: string;
      page?: number;
    }) => get('/conversions', { params }),
    get: (id: string) => get(`/conversions/${id}`),
    validate: (id: string, data?: { notes?: string; quality_score?: number }) =>
      post(`/conversions/${id}`, { action: 'validate', ...data }),
    reject: (id: string, data?: { notes?: string }) =>
      post(`/conversions/${id}`, { action: 'reject', ...data }),
  },

  // Payouts
  payouts: {
    list: (params?: { status?: string; partner_id?: string; page?: number }) =>
      get('/payouts', { params }),
    create: (data: Record<string, unknown>) => post('/payouts', data),
    update: (id: string, data: { action: string; notes?: string }) =>
      post(`/payouts`, { ...data, payout_id: id }),
  },

  // Analytics
  analytics: {
    dashboard: (role: string, userId?: string) =>
      get('/analytics', { params: { role, user_id: userId } }),
    program: (id: string) => get(`/analytics/programs/${id}`),
  },

  // Notifications
  notifications: {
    list: (params?: { user_id: string; unread?: boolean; page?: number }) =>
      get('/notifications', { params }),
    markRead: (id: string) => put(`/notifications/${id}`, { read: true }),
  },

  // Media
  media: {
    list: (params?: { category?: string; region?: string; page?: number }) =>
      get('/media', { params }),
    get: (id: string) => get(`/media/${id}`),
  },

  // Links (Tracking Links & QR)
  links: {
    list: (params?: {
      partner_id?: string;
      program_id?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }) => get('/links', { params }),
    get: (id: string) => get(`/links/${id}`),
    create: (data: {
      program_id: string;
      channel_type: string;
      title?: string;
      description?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    }) => post('/links', data),
    update: (id: string, data: { title?: string; description?: string; is_active?: boolean }) =>
      put(`/links/${id}`, data),
    delete: (id: string) => del(`/links/${id}`),

    // Stats
    stats: (id: string, params?: { days?: number }) =>
      get(`/links/${id}/stats`, { params }),

    // QR Code
    qr: (id: string, params?: {
      format?: string;
      size?: number;
      margin?: number;
      fg?: string;
      bg?: string;
      error?: string;
    }) => get(`/links/${id}/qr`, { params }),
  },
};

export default api;
