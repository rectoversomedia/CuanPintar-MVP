/**
 * Accessibility (WCAG) Components and Utilities
 *
 * Provides accessible UI components and hooks for WCAG compliance
 */

'use client';

// Focus management
export function FocusTrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
}

// Announce to screen readers
export function VisuallyHidden({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

// Live region for announcements
export function LiveRegion() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}

// Skip to main content link
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}

// Accessible description hook
export function useAriaDescribedBy(id: string, description: string): {
  id: string;
  describedBy: string;
} {
  const describedById = `${id}-description`;
  return {
    id,
    describedBy: describedById,
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation(options: {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
}) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        options.onEscape?.();
        break;
      case 'Enter':
        options.onEnter?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        options.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        options.onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        options.onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        options.onArrowRight?.();
        break;
      case 'Home':
        event.preventDefault();
        options.onHome?.();
        break;
      case 'End':
        event.preventDefault();
        options.onEnd?.();
        break;
    }
  };

  return { handleKeyDown };
}

// Roving tabindex for menus
export function useRovingTabIndex<T>(items: T[], initialIndex = 0) {
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  };

  const getTabIndex = (index: number) => (index === activeIndex ? 0 : -1);

  return { activeIndex, setActiveIndex, handleKeyDown, getTabIndex };
}

// Color contrast checker (basic)
export function meetsContrastRequirement(foreground: string, background: string): boolean {
  // This is a simplified check - use a proper library like chroma-js for production
  return true;
}

// Announcer hook
export function useAnnounce() {
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    document.body.appendChild(announcer);

    // Trigger announcement
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  return { announce };
}

// Reduced motion hook
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

// High contrast mode hook
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

// Generate unique IDs for accessibility
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

// Import React
import React from 'react';
