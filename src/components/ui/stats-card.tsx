'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatsCard({ title, value, change, icon: Icon, iconColor = 'var(--primary)', className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm',
        'hover:shadow-md hover:border-[var(--primary-200)]',
        'transition-all duration-200',
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div
          className="w-full h-full rounded-full blur-3xl"
          style={{ backgroundColor: iconColor }}
        />
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--foreground-muted)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold',
                  change.positive !== false ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                )}
              >
                <svg
                  className={cn('w-3 h-3 mr-0.5', change.positive === false && 'rotate-180')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-[var(--foreground-subtle)]">{change.label}</span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  );
}

// Mini Stats for compact display
interface MiniStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
  className?: string;
}

export function MiniStats({ stats, className }: MiniStatsProps) {
  return (
    <div className={cn('flex gap-6', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="space-y-1">
          <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
          <p
            className="text-lg font-bold"
            style={{ color: stat.color || 'var(--foreground)' }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
