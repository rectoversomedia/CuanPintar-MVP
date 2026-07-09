'use client';

import { AuthProvider } from '@/lib/auth';
import { UIProvider } from '@/stores';
import { Toast } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        {children}
        <Toast />
      </UIProvider>
    </AuthProvider>
  );
}
