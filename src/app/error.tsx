'use client';

/**
 * Global Error Boundary
 * Catches all unhandled errors in the app
 */

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            <h1 className="text-3xl font-bold mb-3">Oops! Terjadi Kesalahan</h1>
            <p className="text-muted-foreground mb-6">
              Kami sedang berusaha memperbaiki masalah ini. Silakan coba lagi dalam beberapa saat.
            </p>

            {!isProduction && error?.message && (
              <div className="mb-6 p-4 rounded-lg bg-muted text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-destructive break-all">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="default" size="lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
