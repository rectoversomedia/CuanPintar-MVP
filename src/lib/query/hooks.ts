/**
 * React Query Hooks for CuanPintar
 * Pre-configured hooks for common data fetching patterns
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useCallback } from 'react';

// ============================================
// API Client Helper
// ============================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// ============================================
// Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Query Keys Factory
// ============================================

export const queryKeys = {
  // Auth
  auth: ['auth'] as const,
  user: ['auth', 'user'] as const,

  // Programs
  programs: ['programs'] as const,
  program: (id: string) => ['programs', id] as const,
  programStats: (id: string) => ['programs', id, 'stats'] as const,

  // Partners
  partners: ['partners'] as const,
  partner: (id: string) => ['partners', id] as const,

  // Conversions
  conversions: ['conversions'] as const,
  conversion: (id: string) => ['conversions', id] as const,

  // Payouts
  payouts: ['payouts'] as const,
  payout: (id: string) => ['payouts', id] as const,

  // Analytics
  analytics: ['analytics'] as const,
  dashboard: ['analytics', 'dashboard'] as const,
  cohort: ['analytics', 'cohort'] as const,
  ltv: ['analytics', 'ltv'] as const,

  // Links
  links: ['links'] as const,
  link: (id: string) => ['links', id] as const,
  linkStats: (id: string) => ['links', id, 'stats'] as const,

  // Admin
  adminAudit: ['admin', 'audit'] as const,
  adminKyc: ['admin', 'kyc'] as const,
  adminTickets: ['admin', 'tickets'] as const,

  // Notifications
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread'] as const,
} as const;

// ============================================
// Programs Hooks
// ============================================

export interface ProgramFilters {
  status?: string;
  industry?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function usePrograms(filters: ProgramFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.industry) params.set('industry', filters.industry);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.programs, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/programs?${params}`),
  });
}

export function useProgram(id: string, options?: UseQueryOptions) {
  return useQuery({
    queryKey: queryKeys.program(id),
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/programs/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi<ApiResponse<unknown>>('/api/programs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetchApi<ApiResponse<unknown>>(`/api/programs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.program(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<ApiResponse<unknown>>(`/api/programs/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs });
    },
  });
}

// ============================================
// Partners Hooks
// ============================================

export function usePartners(filters: { search?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.partners, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/partners?${params}`),
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: queryKeys.partner(id),
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/partners/${id}`),
    enabled: !!id,
  });
}

// ============================================
// Conversions Hooks
// ============================================

export function useConversions(filters: {
  program_id?: string;
  partner_id?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filters.program_id) params.set('program_id', filters.program_id);
  if (filters.partner_id) params.set('partner_id', filters.partner_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.conversions, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/conversions?${params}`),
  });
}

export function useConversion(id: string) {
  return useQuery({
    queryKey: queryKeys.conversion(id),
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/conversions/${id}`),
    enabled: !!id,
  });
}

// ============================================
// Analytics Hooks
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>('/api/analytics/dashboard'),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCohortAnalysis(months: number = 6) {
  return useQuery({
    queryKey: [...queryKeys.cohort, months],
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/analytics/cohort?months=${months}`),
  });
}

export function useLTV() {
  return useQuery({
    queryKey: queryKeys.ltv,
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>('/api/analytics/ltv'),
  });
}

// ============================================
// Payouts Hooks
// ============================================

export function usePayouts(filters: { status?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.payouts, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/payouts?${params}`),
  });
}

// ============================================
// Notifications Hooks
// ============================================

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () =>
      fetchApi<ApiResponse<unknown[]>>('/api/notifications'),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: queryKeys.unreadNotifications,
    queryFn: () =>
      fetchApi<ApiResponse<{ count: number }>>('/api/notifications?unread=true'),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<ApiResponse<unknown>>(`/api/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
    },
  });
}

// ============================================
// Links Hooks
// ============================================

export function useLinks(filters: { program_id?: string; partner_id?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.program_id) params.set('program_id', filters.program_id);
  if (filters.partner_id) params.set('partner_id', filters.partner_id);

  return useQuery({
    queryKey: [...queryKeys.links, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/links?${params}`),
  });
}

export function useLink(id: string) {
  return useQuery({
    queryKey: queryKeys.link(id),
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/links/${id}`),
    enabled: !!id,
  });
}

export function useLinkStats(id: string) {
  return useQuery({
    queryKey: queryKeys.linkStats(id),
    queryFn: () =>
      fetchApi<ApiResponse<unknown>>(`/api/links/${id}/stats`),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { program_id: string; title?: string }) =>
      fetchApi<ApiResponse<unknown>>('/api/links', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links });
    },
  });
}

// ============================================
// Admin Hooks
// ============================================

export function useAdminAuditLogs(filters: {
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return useQuery({
    queryKey: [...queryKeys.adminAudit, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/admin/audit?${params}`),
  });
}

export function useAdminKyc(filters: {
  status?: string;
  page?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));

  return useQuery({
    queryKey: [...queryKeys.adminKyc, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/admin/kyc?${params}`),
  });
}

export function useAdminTickets(filters: {
  status?: string;
  priority?: string;
  page?: number;
} = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.page) params.set('page', String(filters.page));

  return useQuery({
    queryKey: [...queryKeys.adminTickets, filters],
    queryFn: () =>
      fetchApi<PaginatedResponse<unknown>>(`/api/admin/tickets?${params}`),
  });
}
