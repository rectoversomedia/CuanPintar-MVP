/**
 * CuanPintar - Enhanced Client-Side Fingerprinting
 * Phase 3: Tracking & Attribution
 *
 * Comprehensive browser fingerprinting with:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Audio context fingerprinting
 * - Font fingerprinting
 * - Hardware concurrency
 * - Device memory
 * - Touch support detection
 */

import crypto from 'crypto';

// Re-export existing server-side functions
export {
  generateFingerprintHash,
  fingerprintFromHeaders,
  detectPlatform,
  detectDeviceType,
  detectBrowser,
  detectOS,
  parseDeviceInfo,
  generateVisitorId,
  hashEmail,
  hashPhone,
} from './fingerprint';

export interface ClientFingerprint {
  hash: string;
  components: FingerprintComponents;
  confidence: number;
  timestamp: number;
}

export interface FingerprintComponents {
  // Basic (from headers)
  userAgent: string;
  language: string;
  platform: string;
  screen: string;
  timezone: string;

  // Canvas
  canvas?: string;
  canvasHash?: string;

  // WebGL
  webgl?: string;
  webglRenderer?: string;
  webglVendor?: string;

  // Audio
  audioHash?: string;

  // Fonts
  fonts?: string[];
  fontsHash?: string;

  // Hardware
  hardwareConcurrency?: number;
  deviceMemory?: number;

  // Display
  colorDepth?: number;
  pixelRatio?: number;

  // Touch & Input
  touchSupport?: boolean;
  maxTouchPoints?: number;

  // Storage
  cookiesEnabled?: boolean;
  localStorage?: boolean;
  sessionStorage?: boolean;

  // Network
  connectionType?: string;

  // Plugins
  plugins?: string[];
}

// Store generated fingerprint in memory for consistency
let cachedFingerprint: ClientFingerprint | null = null;

/**
 * Get canvas fingerprint with noise injection
 */
export function getCanvasFingerprint(): { hash: string; data: string } {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { hash: '', data: '' };

    // Set canvas size
    canvas.width = 200;
    canvas.height = 50;

    // Draw text with specific font and style
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('CuanPintar', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Fingerprint', 4, 17);

    // Add subtle variations based on browser
    ctx.beginPath();
    ctx.arc(50, 25, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Get data URL and create hash
    const dataUrl = canvas.toDataURL();
    const hash = crypto.createHash('sha256').update(dataUrl).digest('hex').slice(0, 32);

    return { hash, data: dataUrl };
  } catch {
    return { hash: '', data: '' };
  }
}

/**
 * Get WebGL fingerprint with renderer spoofing detection
 */
export function getWebGLFingerprint(): {
  hash: string;
  vendor: string;
  renderer: string;
  extensions: string[];
} {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return { hash: '', vendor: '', renderer: '', extensions: [] };
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');

    let vendor = '';
    let renderer = '';

    if (debugInfo) {
      vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    }

    // Get supported extensions
    const extensions = (gl as WebGLRenderingContext).getSupportedExtensions() || [];

    // Create hash from WebGL params
    const params = [
      (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VERSION),
      (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).SHADING_LANGUAGE_VERSION),
      (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR),
      (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER),
      vendor,
      renderer,
      extensions.join(','),
    ].join('|');

    const hash = crypto.createHash('sha256').update(params).digest('hex').slice(0, 32);

    return { hash, vendor, renderer, extensions };
  } catch {
    return { hash: '', vendor: '', renderer: '', extensions: [] };
  }
}

/**
 * Get audio context fingerprint
 */
export function getAudioFingerprint(): { hash: string; supported: boolean } {
  try {
    const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create oscillator and analyser
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const processor = context.createScriptProcessor(4096, 1, 1);

    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    // Connect nodes
    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gain);
    gain.connect(context.destination);

    // Start and stop
    oscillator.start(0);

    // Get frequency data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    oscillator.stop();
    context.close();

    // Hash the frequency data
    const data = Array.from(frequencyData.slice(0, 50)).join(',');
    const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);

    return { hash, supported: true };
  } catch {
    return { hash: '', supported: false };
  }
}

/**
 * Get font fingerprint by testing common fonts
 */
export function getFontFingerprint(): { fonts: string[]; hash: string } {
  try {
    const testString = 'mmmmmmmmmmlli';
    const testFonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
      'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Helvetica',
      'Monaco', 'Menlo', 'Consolas', 'Segoe UI', 'Roboto', 'Open Sans',
      'Lato', 'Source Sans Pro', 'Ubuntu', 'Droid Sans', 'PingFang SC',
      'Microsoft YaHei', 'SimHei', 'Malgun Gothic', 'Apple System'
    ];

    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testSize = '72px';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { fonts: [], hash: '' };

    const detected: string[] = [];

    // Get default dimensions for each base font
    const defaultWidths: Record<string, number> = {};
    for (const baseFont of baseFonts) {
      ctx.font = `${testSize} ${baseFont}`;
      defaultWidths[baseFont] = ctx.measureText(testString).width;
    }

    // Test each font
    for (const font of testFonts) {
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} '${font}', ${baseFont}`;
        const width = ctx.measureText(testString).width;

        if (width !== defaultWidths[baseFont]) {
          if (!detected.includes(font)) {
            detected.push(font);
          }
          break;
        }
      }
    }

    // Hash the font list
    const hash = crypto.createHash('sha256').update(detected.sort().join(',')).digest('hex').slice(0, 32);

    return { fonts: detected, hash };
  } catch {
    return { fonts: [], hash: '' };
  }
}

/**
 * Get timezone fingerprint
 */
export function getTimezoneInfo(): {
  timezone: string;
  offset: number;
  abbr: string;
  isDst: boolean;
} {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);

  const stdOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  );

  const isDst = jan.getTimezoneOffset() !== stdOffset;

  // Get timezone abbreviation
  const abbr = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(),
    abbr,
    isDst,
  };
}

/**
 * Get device info (hardware)
 */
export function getDeviceInfo(): {
  hardwareConcurrency: number;
  deviceMemory: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  platform: string;
} {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    maxTouchPoints?: number;
  };

  const maxTouch = nav.maxTouchPoints || 0;

  return {
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: nav.deviceMemory || 0,
    touchSupport: maxTouch > 0,
    maxTouchPoints: maxTouch,
    platform: nav.platform || '',
  };
}

/**
 * Get screen info
 */
export function getScreenInfo(): {
  width: number;
  height: number;
  colorDepth: number;
  pixelRatio: number;
  availableWidth: number;
  availableHeight: number;
} {
  return {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    availableWidth: window.screen.availWidth,
    availableHeight: window.screen.availHeight,
  };
}

/**
 * Check storage availability
 */
export function getStorageInfo(): {
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
} {
  let localStorageAvailable = false;
  let sessionStorageAvailable = false;
  let indexedDBAvailable = false;

  try {
    localStorageAvailable = typeof window.localStorage !== 'undefined';
    sessionStorageAvailable = typeof window.sessionStorage !== 'undefined';
    indexedDBAvailable = typeof window.indexedDB !== 'undefined';
  } catch {
    // Storage might be blocked
  }

  return {
    cookiesEnabled: navigator.cookieEnabled,
    localStorage: localStorageAvailable,
    sessionStorage: sessionStorageAvailable,
    indexedDB: indexedDBAvailable,
  };
}

/**
 * Get network information
 */
export function getNetworkInfo(): {
  connectionType: string;
  effectiveType: string;
  downlink: number;
} {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType: string;
      downlink: number;
      type: string;
    };
  };

  const connection = nav.connection;

  if (connection) {
    return {
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
    };
  }

  return {
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
  };
}

/**
 * Get all fingerprint components
 */
export function getAllFingerprintComponents(): FingerprintComponents {
  const canvas = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const audio = getAudioFingerprint();
  const fonts = getFontFingerprint();
  const timezone = getTimezoneInfo();
  const device = getDeviceInfo();
  const screen = getScreenInfo();
  const storage = getStorageInfo();
  const network = getNetworkInfo();

  return {
    // Basic
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform || device.platform,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: timezone.timezone,

    // Canvas
    canvas: canvas.data,
    canvasHash: canvas.hash,

    // WebGL
    webgl: webgl.renderer,
    webglRenderer: webgl.renderer,
    webglVendor: webgl.vendor,

    // Audio
    audioHash: audio.hash,

    // Fonts
    fonts: fonts.fonts,
    fontsHash: fonts.hash,

    // Hardware
    hardwareConcurrency: device.hardwareConcurrency,
    deviceMemory: device.deviceMemory,

    // Display
    colorDepth: screen.colorDepth,
    pixelRatio: screen.pixelRatio,

    // Touch
    touchSupport: device.touchSupport,
    maxTouchPoints: device.maxTouchPoints,

    // Storage
    cookiesEnabled: storage.cookiesEnabled,
    localStorage: storage.localStorage,
    sessionStorage: storage.sessionStorage,
  };
}

/**
 * Generate comprehensive client-side fingerprint
 */
export function generateClientFingerprint(): ClientFingerprint {
  // Return cached fingerprint if exists (for consistency within session)
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  const components = getAllFingerprintComponents();

  // Create weighted hash from components
  const hashInputs = [
    components.userAgent,
    components.language,
    components.platform,
    components.screen,
    components.timezone,
    components.canvasHash || '',
    components.webgl || '',
    components.audioHash || '',
    components.fontsHash || '',
    String(components.hardwareConcurrency || ''),
    String(components.deviceMemory || ''),
    String(components.colorDepth || ''),
  ].join('|');

  const hash = crypto.createHash('sha256').update(hashInputs).digest('hex');

  // Calculate confidence based on available components
  let confidence = 60; // Base from headers
  if (components.canvasHash) confidence += 10;
  if (components.webgl) confidence += 10;
  if (components.audioHash) confidence += 5;
  if (components.fonts && components.fonts.length > 5) confidence += 10;
  if (components.hardwareConcurrency) confidence += 3;
  if (components.deviceMemory) confidence += 2;

  const fingerprint: ClientFingerprint = {
    hash,
    components,
    confidence: Math.min(confidence, 100),
    timestamp: Date.now(),
  };

  cachedFingerprint = fingerprint;
  return fingerprint;
}

/**
 * Generate visitor ID with fingerprint
 */
export function generateVisitorIdFromClient(ipAddress?: string): string {
  const fp = generateClientFingerprint();
  const raw = `${fp.hash}:${ipAddress || 'unknown'}:${Date.now()}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

/**
 * Check if browser appears to be headless/automated
 */
export function detectAutomation(): { isAutomated: boolean; signals: string[] } {
  const signals: string[] = [];

  // Check for automation indicators
  if (navigator.webdriver) signals.push('webdriver');

  // Check for Chrome availability
  const hasChrome = typeof window !== 'undefined' && 'chrome' in window;

  // Check for plugins
  if (navigator.plugins && navigator.plugins.length === 0) {
    signals.push('no_plugins');
  }

  // Check for languages
  if (!navigator.languages || navigator.languages.length === 0) {
    signals.push('no_languages');
  }

  // Check for automation-specific variables
  const automationVars = [
    'callPhantom',
    'callSelenium',
    '_phantom',
    '_selenium',
    'driver',
    '__webdriver_evaluate',
    '__selenium_evaluate',
    'webdriver',
    'window.domAutomation',
    'window.domAutomationController',
  ];

  if (typeof window !== 'undefined') {
    for (const varName of automationVars) {
      if ((window as unknown as Record<string, unknown>)[varName]) {
        signals.push(`automation_var:${varName}`);
      }
    }
  }

  // Check for headless mode indicators
  if (navigator.userAgent.includes('HeadlessChrome')) {
    signals.push('headless_chrome');
  }

  return {
    isAutomated: signals.length > 0,
    signals,
  };
}

/**
 * Get full device fingerprint summary
 */
export function getDeviceSummary(): {
  fingerprint: ClientFingerprint;
  automation: { isAutomated: boolean; signals: string[] };
  summary: string;
} {
  const fingerprint = generateClientFingerprint();
  const automation = detectAutomation();

  const summary = [
    fingerprint.components.platform,
    fingerprint.components.screen,
    fingerprint.components.timezone,
    `${fingerprint.components.hardwareConcurrency || '?'} cores`,
    `${fingerprint.components.deviceMemory || '?'} GB RAM`,
    fingerprint.components.touchSupport ? 'Touch' : 'No Touch',
  ].join(' | ');

  return {
    fingerprint,
    automation,
    summary,
  };
}

// Export for use in tracking pixel
export default {
  generateClientFingerprint,
  getAllFingerprintComponents,
  getCanvasFingerprint,
  getWebGLFingerprint,
  getAudioFingerprint,
  getFontFingerprint,
  getTimezoneInfo,
  getDeviceInfo,
  getScreenInfo,
  getStorageInfo,
  getNetworkInfo,
  detectAutomation,
  generateVisitorIdFromClient,
  getDeviceSummary,
};
