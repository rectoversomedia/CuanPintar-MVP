/**
 * Offline Page
 *
 * Displayed when the user is offline and tries to access a page
 */

'use client';

import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Anda Sedang Offline
        </h1>
        <p className="text-muted-foreground mb-6">
          Sepertinya koneksi internet Anda terputus. Silakan periksa koneksi dan coba lagi.
        </p>
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
