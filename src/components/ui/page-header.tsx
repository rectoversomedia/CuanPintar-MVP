'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-4', className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-[var(--foreground-subtle)]">/</span>}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--primary)] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--foreground)] font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-600)] shadow-lg shadow-[var(--primary)]/20"
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          )}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-[var(--foreground)] tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-1 text-sm text-[var(--foreground-muted)]"
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>

        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Section Header (for cards/sections)
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-600)] transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-600)] transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
