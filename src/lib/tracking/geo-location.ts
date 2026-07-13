/**
 * Geo-Location Service
 * IP-based location detection for fraud prevention
 */

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// Geo-location cache (in production, use Redis)
const geoCache = new Map<string, GeoData>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export interface GeoData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  isMobile: boolean;
  timezone: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  cachedAt: number;
}

export interface GeoCheckResult {
  isSuspicious: boolean;
  score: number;
  reasons: string[];
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  geoMismatch: boolean;
}

// Datacenter IP ranges (simplified - in production use a proper database)
const DATACENTER_ISP_PATTERNS = [
  'amazon', 'aws', 'amazon web services',
  'google cloud', 'gcp', 'google llc',
  'microsoft', 'azure', 'microsoft azure',
  'digitalocean', 'do virtual machine',
  'linode', 'linode llc',
  'vultr', 'vultr holdings',
  'cloudflare', 'cloudflare, inc.',
  'heroku', 'heroku, inc.',
  'ovh', 'ovh sas',
  'hetzner', 'hetzner online gmbh',
  'rackspace', 'rackspace us',
  'akamai', 'akamai Technologies',
  'fastly', 'fastly, inc.',
  'data center', 'datacenter',
];

const VPN_PROVIDER_PATTERNS = [
  'nordvpn', 'expressvpn', 'surfshark', 'cyberghost',
  'private internet access', 'pia', 'ipvanish',
  'windscribe', 'tunnelbear', 'hotspot shield',
  'protonvpn', 'mullvad', 'vyprvpn',
  'hide my ass', 'hma', 'zenmate',
  'vpn', 'virtual private network',
];

const PROXY_PATTERNS = [
  'proxy', 'squid', 'nginx proxy',
  'reverse proxy', 'http proxy', 'socks',
  'web proxy', 'transparent proxy',
];

const TOR_EXIT_NODES = [
  'torproject', 'tor exit node', 'exit tor',
];

/**
 * Get IP info from external API (free tier: ip-api.com)
 */
export async function getGeoFromIP(ip: string): Promise<GeoData | null> {
  // Check cache first
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached;
  }

  // Skip for localhost/private IPs
  if (isPrivateIP(ip)) {
    return null;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,isp,org,as,lat,lon,timezone,query`, {
      headers: {
        'User-Agent': 'CuanPintar-Fraud/1.0',
      },
    });

    if (!response.ok) {
      console.error('Geo lookup failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success') {
      return null;
    }

    const isp = (data.isp || '').toLowerCase();
    const org = (data.org || '').toLowerCase();
    const combined = `${isp} ${org}`;

    const isDatacenter = DATACENTER_ISP_PATTERNS.some(p => combined.includes(p));
    const isVPN = VPN_PROVIDER_PATTERNS.some(p => combined.includes(p));
    const isProxy = PROXY_PATTERNS.some(p => combined.includes(p)) && !isVPN;
    const isTor = TOR_EXIT_NODES.some(p => combined.includes(p));

    const geoData: GeoData = {
      ip,
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX',
      region: data.regionName || data.region || 'Unknown',
      city: data.city || 'Unknown',
      isp: data.isp || 'Unknown',
      org: data.org || 'Unknown',
      asn: data.as || 'Unknown',
      isProxy: isProxy,
      isVPN: isVPN || isTor,
      isTor: isTor,
      isDatacenter: isDatacenter,
      isMobile: false, // Cannot determine from IP alone
      timezone: data.timezone || 'Asia/Jakarta',
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      accuracy: 50000, // Default accuracy for IP geolocation
      cachedAt: Date.now(),
    };

    // Cache the result
    geoCache.set(ip, geoData);

    return geoData;
  } catch (error) {
    console.error('Geo lookup error:', error);
    return null;
  }
}

/**
 * Check if IP is private/local
 */
export function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return true;

  // 127.0.0.0 - 127.255.255.255 (loopback)
  if (parts[0] === 127) return true;

  // 10.0.0.0 - 10.255.255.255 (private)
  if (parts[0] === 10) return true;

  // 172.16.0.0 - 172.31.255.255 (private)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

  // 192.168.0.0 - 192.168.255.255 (private)
  if (parts[0] === 192 && parts[1] === 168) return true;

  // 169.254.0.0 - 169.254.255.255 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;

  // 0.0.0.0 (unspecified)
  if (parts.every(p => p === 0)) return true;

  return false;
}

/**
 * Perform geo-location fraud check
 */
export async function checkGeoFraud(
  ip: string,
  context?: {
    expectedCountry?: string;
    expectedTimezone?: string;
    expectedISP?: string;
    userAgent?: string;
  }
): Promise<GeoCheckResult> {
  const result: GeoCheckResult = {
    isSuspicious: false,
    score: 0,
    reasons: [],
    isVPN: false,
    isProxy: false,
    isTor: false,
    isDatacenter: false,
    geoMismatch: false,
  };

  // Skip for private IPs
  if (isPrivateIP(ip)) {
    return result;
  }

  const geo = await getGeoFromIP(ip);

  if (!geo) {
    // If we can't get geo data, flag it
    result.score += 10;
    result.reasons.push('Unable to determine IP location');
    return result;
  }

  // Check for VPN
  if (geo.isVPN) {
    result.isVPN = true;
    result.score += 30;
    result.reasons.push('VPN detected');

    // Higher score if VPN is from different country
    if (context?.expectedCountry && geo.countryCode !== context.expectedCountry) {
      result.score += 20;
      result.reasons.push(`VPN from ${geo.country} (expected ${context.expectedCountry})`);
      result.geoMismatch = true;
    }
  }

  // Check for Proxy
  if (geo.isProxy) {
    result.isProxy = true;
    result.score += 40;
    result.reasons.push('Proxy detected');
    result.isSuspicious = true;
  }

  // Check for Tor
  if (geo.isTor) {
    result.isTor = true;
    result.score += 50;
    result.reasons.push('Tor exit node detected');
    result.isSuspicious = true;
  }

  // Check for Datacenter IP
  if (geo.isDatacenter) {
    result.isDatacenter = true;
    result.score += 25;
    result.reasons.push(`Datacenter IP: ${geo.isp}`);

    // Check expected ISP mismatch
    if (context?.expectedISP && !geo.isp.toLowerCase().includes(context.expectedISP.toLowerCase())) {
      result.score += 15;
      result.reasons.push('ISP mismatch');
    }
  }

  // Check timezone mismatch
  if (context?.expectedTimezone && geo.timezone !== context.expectedTimezone) {
    // Only flag if other suspicious indicators exist
    if (result.score > 20) {
      result.score += 10;
      result.reasons.push(`Timezone mismatch: ${geo.timezone} vs expected ${context.expectedTimezone}`);
      result.geoMismatch = true;
    }
  }

  // Check country mismatch
  if (context?.expectedCountry && geo.countryCode !== context.expectedCountry) {
    result.score += 25;
    result.reasons.push(`Country mismatch: ${geo.country} (${geo.countryCode}) vs expected ${context.expectedCountry}`);
    result.geoMismatch = true;
  }

  result.isSuspicious = result.score >= 30;

  return result;
}

/**
 * Get country from IP (simple)
 */
export async function getCountryFromIP(ip: string): Promise<string | null> {
  const geo = await getGeoFromIP(ip);
  return geo?.countryCode || null;
}

/**
 * Check if IPs are from same region
 */
export async function areIPsFromSameRegion(ip1: string, ip2: string): Promise<boolean> {
  const geo1 = await getGeoFromIP(ip1);
  const geo2 = await getGeoFromIP(ip2);

  if (!geo1 || !geo2) return false;

  return geo1.countryCode === geo2.countryCode;
}

/**
 * Get timezone from IP
 */
export async function getTimezoneFromIP(ip: string): Promise<string | null> {
  const geo = await getGeoFromIP(ip);
  return geo?.timezone || null;
}

/**
 * Validate IP against fraud blocklist
 */
export async function isIPBlockedForFraud(ip: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { data, error } = await supabase
    .from('fraud_blocklist')
    .select('id')
    .eq('type', 'ip')
    .eq('value', ip)
    .eq('is_active', true)
    .single();

  return !!data && !error;
}

/**
 * Add IP to fraud blocklist
 */
export async function blockIPForFraud(
  ip: string,
  reason: string,
  blockedBy?: string,
  expiresAt?: Date
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const { error } = await supabase.from('fraud_blocklist').insert({
    type: 'ip',
    value: ip,
    reason,
    added_by: blockedBy,
    expires_at: expiresAt?.toISOString(),
    is_active: true,
  });

  return !error;
}

/**
 * Clear geo cache (for testing)
 */
export function clearGeoCache(): void {
  geoCache.clear();
}

/**
 * Get cache stats
 */
export function getGeoCacheStats(): { size: number; entries: string[] } {
  return {
    size: geoCache.size,
    entries: Array.from(geoCache.keys()),
  };
}

export default {
  getGeoFromIP,
  checkGeoFraud,
  getCountryFromIP,
  getTimezoneFromIP,
  areIPsFromSameRegion,
  isPrivateIP,
  isIPBlockedForFraud,
  blockIPForFraud,
  clearGeoCache,
  getGeoCacheStats,
};
