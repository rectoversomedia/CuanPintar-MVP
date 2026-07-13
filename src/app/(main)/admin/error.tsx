'use client';

/**
 * Error boundary for Admin Dashboard
 */

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
        <p className="text-muted-foreground mb-6">
          Maaf, terjadi kesalahan saat memuat halaman. Silakan coba lagi atau hubungi tim support jika masalah berlanjut.
        </p>

        {!isProduction && error.message && (
          <div className="mb-6 p-4 rounded-lg bg-muted text-left">
            <p className="text-sm font-mono text-destructive break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
