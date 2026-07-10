/**
 * Performance Optimization Utilities
 *
 * Provides utilities for optimizing app performance:
 * - Image optimization
 * - Code splitting
 * - Prefetching
 * - Caching strategies
 * - Bundle analysis
 */

'use client';

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
}

// Generate srcset for responsive images
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ');
}

// Generate blur placeholder data URL
export function generateBlurPlaceholder(
  width: number,
  height: number,
  color = '#f0f0f0'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ============================================================================
// CODE SPLITTING
// ============================================================================

// Dynamic import with loading state
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ReactNode;
    ssr?: boolean;
  }
) {
  const { lazy, Suspense } = require('react');
  return lazy(importFn);
}

// Preload component
export function preloadComponent(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    importFn();
  }
}

// ============================================================================
// PREFETCHING
// ============================================================================

interface PrefetchOptions {
  priority?: 'high' | 'low';
  timeout?: number;
}

// Prefetch URL
export function prefetch(url: string, options: PrefetchOptions = {}): void {
  if (typeof window === 'undefined') return;

  const { priority = 'low' } = options;

  // Use Next.js router for internal URLs
  if (url.startsWith('/')) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } else {
    // External URLs
    fetch(url, { mode: 'no-cors' });
  }
}

// Prefetch on hover
export function prefetchOnHover(
  element: HTMLElement,
  urls: string[],
  options: PrefetchOptions = {}
): void {
  const handler = () => {
    urls.forEach(url => prefetch(url, options));
    element.removeEventListener('mouseenter', handler);
  };
  element.addEventListener('mouseenter', handler);
}

// ============================================================================
// CACHING
// ============================================================================

// Local storage cache with TTL
export class LocalCache {
  private prefix: string;

  constructor(prefix = 'cp_cache') {
    this.prefix = prefix;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    if (typeof window === 'undefined') return;

    const data = {
      value,
      expiry: Date.now() + ttlMs,
    };

    localStorage.setItem(
      `${this.prefix}_${key}`,
      JSON.stringify(data)
    );
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const item = localStorage.getItem(`${this.prefix}_${key}`);
    if (!item) return null;

    try {
      const data = JSON.parse(item);
      if (Date.now() > data.expiry) {
        localStorage.removeItem(`${this.prefix}_${key}`);
        return null;
      }
      return data.value;
    } catch {
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}_${key}`);
  }

  clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith(`${this.prefix}_`)
    );
    keys.forEach(k => localStorage.removeItem(k));
  }
}

// Memory cache (for session)
export class MemoryCache {
  private cache: Map<string, { value: unknown; expiry: number }> = new Map();

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instances
export const localCache = new LocalCache();
export const memoryCache = new MemoryCache();

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface PerformanceMetrics {
  fcp?: number;      // First Contentful Paint
  lcp?: number;      // Largest Contentful Paint
  fid?: number;      // First Input Delay
  cls?: number;      // Cumulative Layout Shift
  ttfb?: number;     // Time to First Byte
  domLoad?: number;
  windowLoad?: number;
}

// Measure performance
export function measurePerformance(): PerformanceMetrics {
  if (typeof window === 'undefined') return {};

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  const metrics: PerformanceMetrics = {};

  if (navigation) {
    metrics.ttfb = navigation.responseStart;
    metrics.domLoad = navigation.domContentLoadedEventEnd;
    metrics.windowLoad = navigation.loadEventEnd;
  }

  const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    metrics.fcp = fcpEntry.startTime;
  }

  return metrics;
}

// Report Web Vitals
export function reportWebVitals(callback?: (metrics: PerformanceMetrics) => void): void {
  if (typeof window === 'undefined') return;

  // Use web-vitals library if available
  if ('PerformanceObserver' in window) {
    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      callback?.({ lcp: lastEntry.startTime });
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      callback?.({ fid: firstEntry.processingStart - firstEntry.startTime });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      callback?.({ cls: clsValue });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

// Get bundle size
export function getBundleSize(): { js: number; css: number } {
  if (typeof window === 'undefined') return { js: 0, css: 0 };

  let jsSize = 0;
  let cssSize = 0;

  performance.getEntriesByType('resource').forEach((entry: any) => {
    if (entry.name.endsWith('.js')) {
      jsSize += entry.transferSize || 0;
    } else if (entry.name.endsWith('.css')) {
      cssSize += entry.transferSize || 0;
    }
  });

  return {
    js: Math.round(jsSize / 1024), // KB
    css: Math.round(cssSize / 1024),
  };
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

// Clear all caches
export function clearAllCaches(): void {
  localCache.clear();
  memoryCache.clear();

  // Clear indexedDB caches
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    indexedDB.deleteDatabase('cuanpintar');
  }
}

// Force garbage collection (if available)
export function forceGC(): void {
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as any).gc();
  }
}

// ============================================================================
// OPTIMIZATION HOOKS
// ============================================================================

import { useState, useEffect, useRef } from 'react';

// Hook for intersection observer
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

// Hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    reportWebVitals(setMetrics);
    const interval = setInterval(() => {
      setMetrics(measurePerformance());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook for lazy loading
export function useLazyLoad(threshold = 0.1) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin: '50px',
  });

  return { ref, isVisible };
}

// Hook for network quality
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'4g' | '3g' | '2g' | 'slow-2g'>('4g');

  useEffect(() => {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) return;

    const updateQuality = () => {
      setQuality(connection.effectiveType);
    };

    updateQuality();
    connection.addEventListener('change', updateQuality);

    return () => connection.removeEventListener('change', updateQuality);
  }, []);

  return quality;
}

// Export all utilities
export default {
  generateSrcSet,
  generateBlurPlaceholder,
  lazyLoad,
  preloadComponent,
  prefetch,
  prefetchOnHover,
  LocalCache,
  MemoryCache,
  localCache,
  memoryCache,
  debounce,
  throttle,
  measurePerformance,
  reportWebVitals,
  getBundleSize,
  clearAllCaches,
  forceGC,
  useIntersectionObserver,
  usePerformanceMetrics,
  useOnlineStatus,
  useLazyLoad,
  useNetworkQuality,
};
