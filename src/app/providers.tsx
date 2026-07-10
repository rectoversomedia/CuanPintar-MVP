'use client';

import { AuthProvider } from '@/lib/auth';
import { UIProvider } from '@/stores';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { Toast } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <I18nProvider initialLocale="id">
        <AuthProvider>
          <UIProvider>
            {children}
            <Toast />
          </UIProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
