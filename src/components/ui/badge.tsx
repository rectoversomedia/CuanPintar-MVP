import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-600)] text-white shadow-sm',
        secondary: 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]',
        success: 'bg-gradient-to-br from-[var(--success)] to-emerald-600 text-white shadow-sm',
        warning: 'bg-gradient-to-br from-[var(--warning)] to-amber-600 text-white shadow-sm',
        destructive: 'bg-gradient-to-br from-[var(--danger)] to-red-600 text-white shadow-sm',
        outline: 'border-2 border-[var(--border)] bg-transparent text-[var(--foreground-muted)]',
        info: 'bg-gradient-to-br from-[var(--info)] to-blue-600 text-white shadow-sm',
        gradient: 'bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] text-white shadow-md',
        // Status badges
        'success-outline': 'border border-[var(--success)] bg-[var(--success-light)] text-[var(--success-foreground)]',
        'warning-outline': 'border border-[var(--warning)] bg-[var(--warning-light)] text-[var(--warning-foreground)]',
        'danger-outline': 'border border-[var(--danger)] bg-[var(--danger-light)] text-[var(--danger-foreground)]',
        'info-outline': 'border border-[var(--info)] bg-[var(--info-light)] text-[var(--info-foreground)]',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

// Status Badge Component for cleaner usage
interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'active' | 'pending' | 'inactive' | 'success' | 'warning' | 'error' | 'draft' | 'processing';
}

const statusStyles: Record<StatusBadgeProps['status'], string> = {
  active: 'success',
  success: 'success',
  pending: 'warning',
  warning: 'warning',
  inactive: 'secondary',
  error: 'destructive',
  draft: 'outline',
  processing: 'info',
};

const statusLabels: Record<StatusBadgeProps['status'], string> = {
  active: 'Active',
  success: 'Success',
  pending: 'Pending',
  warning: 'Warning',
  inactive: 'Inactive',
  error: 'Error',
  draft: 'Draft',
  processing: 'Processing',
};

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={statusStyles[status] as any} className={className} {...props}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        ['active', 'success'].includes(status) ? 'bg-white' : 'bg-current opacity-70'
      }`} />
      {statusLabels[status]}
    </Badge>
  );
}

export { Badge, badgeVariants, StatusBadge };
