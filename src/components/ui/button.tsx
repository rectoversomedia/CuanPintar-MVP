import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-600)] text-white hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:-translate-y-0.5 active:translate-y-0',
        destructive: 'bg-gradient-to-br from-[var(--danger)] to-red-600 text-white hover:shadow-lg hover:shadow-[var(--danger)]/20 hover:-translate-y-0.5',
        outline: 'border-2 border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] hover:border-[var(--primary-200)] hover:text-[var(--primary)]',
        secondary: 'bg-[var(--background-secondary)] text-[var(--foreground)] hover:bg-[var(--border)]',
        ghost: 'hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
        success: 'bg-gradient-to-br from-[var(--success)] to-emerald-600 text-white hover:shadow-lg hover:shadow-[var(--success)]/20 hover:-translate-y-0.5',
        gradient: 'bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] text-white hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base font-semibold',
        xl: 'h-14 rounded-xl px-10 text-lg font-semibold',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 0h12a8 8 0 010 16z" />
            </svg>
            <span>Loading...</span>
          </>
        ) : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
