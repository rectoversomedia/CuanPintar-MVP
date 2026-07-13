'use client';

/**
 * Global Loading State
 * Shown during initial app loading
 */

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-primary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">CuanPintar</h2>
        <p className="text-sm text-muted-foreground">Memuat...</p>

        {/* Progress bar */}
        <div className="mt-6 w-48 h-1 mx-auto rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}
