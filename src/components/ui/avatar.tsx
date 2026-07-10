import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl',
  };

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        'bg-gradient-to-br from-[var(--primary-200)] to-[var(--primary-400)]',
        'ring-2 ring-white shadow-sm',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full',
      'bg-gradient-to-br from-[var(--primary-200)] to-[var(--primary-400)]',
      'text-white font-semibold',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Avatar Group Component
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  avatars: Array<{
    src?: string;
    alt?: string;
    fallback?: string;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, avatars, size = 'sm', ...props }, ref) => {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <Avatar key={index} size={size} className="ring-2 ring-white">
            {avatar.src && <AvatarImage src={avatar.src} alt={avatar.alt} />}
            <AvatarFallback>{avatar.fallback?.[0] || '?'}</AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              'relative inline-flex items-center justify-center rounded-full',
              'bg-[var(--background-secondary)] ring-2 ring-white',
              'font-medium text-[var(--foreground-muted)]',
              'text-xs'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
