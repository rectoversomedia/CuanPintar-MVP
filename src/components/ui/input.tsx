import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm',
            'placeholder:text-[var(--foreground-subtle)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
            'focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-100)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'disabled:bg-[var(--background-secondary)]',
            'transition-all duration-200',
            error && 'border-[var(--danger)] focus:ring-[var(--danger)]/20 focus:border-[var(--danger)]',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm',
          'placeholder:text-[var(--foreground-subtle)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
          'focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-100)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y transition-all duration-200',
          error && 'border-[var(--danger)] focus:ring-[var(--danger)]/20',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
