/**
 * Tracking Pixel Hook
 *
 * Client-side hook for tracking page views, clicks, and conversions
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { generateClientFingerprint, detectAutomation, getDeviceSummary } from '@/lib/tracking/client-fingerprint';

export interface TrackingEvent {
  event: 'pageview' | 'click' | 'conversion' | 'lead' | 'signup' | 'purchase' | 'install';
  eventId?: string;
  value?: number;
  currency?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackingContext {
  programId: string;
  partnerId?: string;
  channel?: string;
  apiUrl?: string;
}

interface UseTrackingPixelOptions {
  programId: string;
  partnerId?: string;
  channel?: string;
  apiUrl?: string;
  debug?: boolean;
  autoTrackPageView?: boolean;
  sessionTimeout?: number;
}

interface StoredData {
  visitorId: string;
  fingerprint: string;
  fingerprintData: ReturnType<typeof generateClientFingerprint>;
  sessionId: string;
  firstVisit: number;
  visitCount: number;
  lastVisit: number;
  utmData: Record<string, string>;
  events: TrackingEvent[];
}

const STORAGE_KEY = 'cp_tracking_data';
const SESSION_KEY = 'cp_session';

/**
 * Get or create stored tracking data
 */
function getStoredData(programId: string): StoredData | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${programId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Save tracking data to storage
 */
function saveStoredData(programId: string, data: StoredData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${programId}`, JSON.stringify(data));
  } catch {
    // Ignore errors
  }
}

/**
 * Parse UTM parameters from URL
 */
function parseUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmData: Record<string, string> = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
    const value = params.get(key);
    if (value) utmData[key] = value;
  });

  return utmData;
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Hook for tracking pixel functionality
 */
export function useTrackingPixel(options: UseTrackingPixelOptions) {
  const {
    programId,
    partnerId,
    channel,
    apiUrl = '/api/track',
    debug = false,
    autoTrackPageView = true,
    sessionTimeout = 1800000, // 30 minutes
  } = options;

  const initialized = useRef(false);
  const sessionId = useRef<string>('');

  // Initialize tracking data
  const initialize = useCallback(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Generate or retrieve session ID
    try {
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      const now = Date.now();

      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (now - session.timestamp < sessionTimeout) {
          sessionId.current = session.id;
        } else {
          sessionId.current = generateSessionId();
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            id: sessionId.current,
            timestamp: now,
          }));
        }
      } else {
        sessionId.current = generateSessionId();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          id: sessionId.current,
          timestamp: now,
        }));
      }
    } catch {
      sessionId.current = generateSessionId();
    }

    // Get or create stored data
    let stored = getStoredData(programId);
    const fingerprintData = generateClientFingerprint();
    const utmData = parseUTMParams();

    if (!stored) {
      stored = {
        visitorId: fingerprintData.hash,
        fingerprint: fingerprintData.hash,
        fingerprintData,
        sessionId: sessionId.current,
        firstVisit: Date.now(),
        visitCount: 1,
        lastVisit: Date.now(),
        utmData,
        events: [],
      };
    } else {
      // Update existing data
      stored.visitCount++;
      stored.lastVisit = Date.now();
      stored.sessionId = sessionId.current;
      stored.fingerprintData = fingerprintData;

      // Merge UTM data (keep original values if not set)
      stored.utmData = { ...stored.utmData, ...utmData };
    }

    saveStoredData(programId, stored);

    if (debug) {
      console.log('[Tracking] Initialized:', {
        visitorId: stored.visitorId,
        sessionId: sessionId.current,
        visitCount: stored.visitCount,
        fingerprint: fingerprintData.hash.substring(0, 8) + '...',
      });
    }

    return stored;
  }, [programId, debug, sessionTimeout]);

  // Track event
  const track = useCallback(async (event: TrackingEvent): Promise<string | null> => {
    const stored = getStoredData(programId);
    if (!stored) {
      console.warn('[Tracking] Not initialized');
      return null;
    }

    const eventId = event.eventId || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const eventData = { ...event, eventId };

    // Store event locally
    stored.events.push(eventData);
    saveStoredData(programId, stored);

    if (debug) {
      console.log('[Tracking] Event:', eventData);
    }

    // Check for automation
    const automation = detectAutomation();

    // Send to server
    try {
      const response = await fetch(`${apiUrl}/conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'event',
          eventId,
          programId,
          partnerId: partnerId || stored.utmData.utm_source,
          channel: channel || stored.utmData.utm_medium,
          event: event.event,
          value: event.value,
          currency: event.currency || 'IDR',
          customerId: event.customerId,
          customerEmail: event.customerEmail,
          customerPhone: event.customerPhone,
          customerName: event.customerName,
          visitorId: stored.visitorId,
          fingerprint: stored.fingerprint,
          sessionId: sessionId.current,
          utms: stored.utmData,
          automation: automation.isAutomated,
          automationSignals: automation.signals,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (debug) {
        console.log('[Tracking] Server response:', result);
      }

      return result.conversionId || eventId;
    } catch (error) {
      console.error('[Tracking] Failed to send event:', error);
      return null;
    }
  }, [programId, partnerId, channel, apiUrl, debug]);

  // Track page view
  const trackPageView = useCallback(async (pageData?: {
    title?: string;
    url?: string;
    referrer?: string;
  }): Promise<string | null> => {
    return track({
      event: 'pageview',
      metadata: {
        title: pageData?.title || document.title,
        url: pageData?.url || window.location.href,
        referrer: pageData?.referrer || document.referrer,
      },
    });
  }, [track]);

  // Track click
  const trackClick = useCallback(async (elementId: string, elementData?: Record<string, unknown>): Promise<string | null> => {
    return track({
      event: 'click',
      metadata: {
        elementId,
        ...elementData,
      },
    });
  }, [track]);

  // Track conversion
  const trackConversion = useCallback(async (data: {
    value?: number;
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> => {
    return track({
      event: 'conversion',
      ...data,
    });
  }, [track]);

  // Track lead
  const trackLead = useCallback(async (data: {
    value?: number;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> => {
    return track({
      event: 'lead',
      ...data,
    });
  }, [track]);

  // Track signup/registration
  const trackSignup = useCallback(async (data: {
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> => {
    return track({
      event: 'signup',
      ...data,
    });
  }, [track]);

  // Track purchase
  const trackPurchase = useCallback(async (data: {
    value: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string | null> => {
    return track({
      event: 'purchase',
      ...data,
    });
  }, [track]);

  // Track app install
  const trackInstall = useCallback(async (metadata?: Record<string, unknown>): Promise<string | null> => {
    return track({
      event: 'install',
      metadata,
    });
  }, [track]);

  // Get current tracking data
  const getTrackingData = useCallback(() => {
    return getStoredData(programId);
  }, [programId]);

  // Get device summary for debugging
  const getDeviceInfo = useCallback(() => {
    return getDeviceSummary();
  }, []);

  // Auto-track page view on mount
  useEffect(() => {
    if (autoTrackPageView) {
      initialize();

      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        trackPageView();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoTrackPageView, initialize, trackPageView]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save state when user leaves
        const stored = getStoredData(programId);
        if (stored) {
          saveStoredData(programId, stored);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [programId]);

  return {
    initialize,
    track,
    trackPageView,
    trackClick,
    trackConversion,
    trackLead,
    trackSignup,
    trackPurchase,
    trackInstall,
    getTrackingData,
    getDeviceInfo,
  };
}

export default useTrackingPixel;
