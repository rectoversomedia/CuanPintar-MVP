'use client';

import { motion } from 'framer-motion';
import { LucideIcon, CirclePlus } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-100)] to-[var(--primary-200)] flex items-center justify-center mb-6"
      >
        {Icon ? (
          <Icon className="w-8 h-8 text-[var(--primary)]" />
        ) : (
          <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-semibold text-[var(--foreground)] mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-[var(--foreground-muted)] max-w-sm mb-6"
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Button onClick={action.onClick} className="gap-2">
            {Icon ? null : <CirclePlus className="w-4 h-4" />}
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      className={cn(
        'animate-spin text-[var(--primary)]',
        sizes[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Full Page Loading
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-[var(--foreground-muted)]">Loading...</p>
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--background-secondary)] animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 rounded bg-[var(--background-secondary)] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[var(--background-secondary)] animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[var(--background-secondary)] animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-[var(--background-secondary)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--background-secondary)] border-b border-[var(--border)] p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 w-24 rounded bg-[var(--border)] animate-pulse" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-[var(--border-light)]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 rounded bg-[var(--background-secondary)] animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
