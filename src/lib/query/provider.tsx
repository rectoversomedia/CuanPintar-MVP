/**
 * React Query Client Configuration
 * Server state management for CuanPintar
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Default query client configuration
export const defaultQueryClientOptions = {
  queries: {
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry: 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Don't refetch on reconnect if data is fresh
    refetchOnReconnect: 'always' as const,
  },
  mutations: {
    // Retry once on failure
    retry: 1,
    retryDelay: 1000,
  },
};

/**
 * Create a configured QueryClient
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });
}

/**
 * QueryClientProvider wrapper with client-side hydration
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export singleton for server components
let serverQueryClient: QueryClient | null = null;

export function getServerQueryClient() {
  if (!serverQueryClient) {
    serverQueryClient = createQueryClient();
  }
  return serverQueryClient;
}
