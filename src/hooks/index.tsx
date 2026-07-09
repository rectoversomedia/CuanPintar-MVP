/**
 * Custom Hooks
 *
 * Reusable hooks for common data fetching patterns
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

// Generic data hook with loading and error states
export function useData<T>(
  fetcher: () => Promise<{ data?: T; error?: string }>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, setData, isLoading, error, refetch: fetch };
}

// Programs hook
export function usePrograms(params?: { status?: string; page?: number }) {
  return useData<{
    data: Array<Record<string, unknown>>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(
    () => api.programs.list(params) as Promise<{ data?: { data: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }; error?: string }>,
    [JSON.stringify(params)]
  );
}

// Single program hook
export function useProgram(id: string) {
  return useData<Record<string, unknown>>(
    () => api.programs.get(id) as Promise<{ data?: Record<string, unknown>; error?: string }>,
    [id]
  );
}

// Partners hook
export function usePartners(params?: { status?: string; type?: string; search?: string; page?: number }) {
  return useData<{
    data: Array<Record<string, unknown>>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(
    () => api.partners.list(params) as Promise<{ data?: { data: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }; error?: string }>,
    [JSON.stringify(params)]
  );
}

// Single partner hook
export function usePartner(id: string) {
  return useData<Record<string, unknown>>(
    () => api.partners.get(id) as Promise<{ data?: Record<string, unknown>; error?: string }>,
    [id]
  );
}

// Conversions hook
export function useConversions(params?: {
  status?: string;
  program_id?: string;
  partner_id?: string;
  page?: number;
}) {
  return useData<{
    data: Array<Record<string, unknown>>;
    stats: {
      total: number;
      valid: number;
      pending: number;
      rejected: number;
      fraud: number;
      totalPayout: number;
    };
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(
    () => api.conversions.list(params) as Promise<{ data?: { data: Array<Record<string, unknown>>; stats: { total: number; valid: number; pending: number; rejected: number; fraud: number; totalPayout: number }; pagination: { page: number; limit: number; total: number; totalPages: number } }; error?: string }>,
    [JSON.stringify(params)]
  );
}

// Payouts hook
export function usePayouts(params?: { status?: string; partner_id?: string; page?: number }) {
  return useData<{
    data: Array<Record<string, unknown>>;
    stats: {
      totalPayouts: number;
      pendingAmount: number;
      processingAmount: number;
      paidAmount: number;
    };
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(
    () => api.payouts.list(params) as Promise<{ data?: { data: Array<Record<string, unknown>>; stats: { totalPayouts: number; pendingAmount: number; processingAmount: number; paidAmount: number }; pagination: { page: number; limit: number; total: number; totalPages: number } }; error?: string }>,
    [JSON.stringify(params)]
  );
}

// Dashboard hook
export function useDashboard(role: 'advertiser' | 'partner' | 'admin', userId?: string) {
  return useData<Record<string, unknown>>(
    () => api.analytics.dashboard(role, userId) as Promise<{ data?: Record<string, unknown>; error?: string }>,
    [role, userId]
  );
}

// Notifications hook
export function useNotifications(userId: string, unreadOnly = false) {
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await api.notifications.list({ user_id: userId, unread: unreadOnly });
      if (result.success && result.data) {
        setNotifications(result.data as Array<Record<string, unknown>>);
        setUnreadCount((result as unknown as { unreadCount?: number }).unreadCount || 0);
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return { notifications, unreadCount, isLoading, error, refetch: fetchNotifications, markAsRead };
}

// Media partners hook
export function useMedia(params?: { category?: string; region?: string; page?: number }) {
  return useData<{
    data: Array<Record<string, unknown>>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(
    () => api.media.list(params) as Promise<{ data?: { data: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }; error?: string }>,
    [JSON.stringify(params)]
  );
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T | undefined>();

  useEffect(() => {
    setPrevious(value);
  }, [value]);

  return previous;
}

// Interval hook
export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Click outside hook
export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
