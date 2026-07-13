/**
 * CuanPintar - Unique Link & QR Code System
 *
 * Generates unique tracking links and QR codes for partners
 */

import crypto from 'crypto';

export interface UniqueLink {
  id: string;
  partner_id: string;
  program_id: string;
  link_code: string; // Unique identifier (e.g., JKS-TUN-001)
  full_url: string;
  short_url: string;
  qr_code_data: string;
  qr_code_image_url?: string; // Base64 or URL to generated QR
  click_count: number;
  conversion_count: number;
  valid_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;
  conversion_rate: number;
  earnings: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface LinkStats {
  total_clicks: number;
  total_conversions: number;
  valid_conversions: number;
  pending_conversions: number;
  rejected_conversions: number;
  fraud_conversions: number;
  conversion_rate: number;
  total_earnings: number;
  period_stats: PeriodStat[];
}

export interface PeriodStat {
  date: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

// Configuration
const LINK_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com',
  shortDomain: process.env.SHORT_DOMAIN || 'cp.link',
  codeLength: 8,
  expiresInDays: 90, // Default link expiry
};

/**
 * Generate unique link code
 * Format: PARTNER-PROGRAM-XXXX (e.g., JKS-TUN-A3F2)
 */
export function generateLinkCode(
  partnerId: string,
  programId: string
): string {
  // Get partner prefix (first 3 chars of partner ID or custom)
  const partnerPrefix = getPartnerPrefix(partnerId);

  // Get program prefix (first 3 chars of program ID or custom)
  const programPrefix = getProgramPrefix(programId);

  // Generate random suffix
  const randomSuffix = crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()
    .slice(0, 4);

  return `${partnerPrefix}-${programPrefix}-${randomSuffix}`;
}

/**
 * Get partner prefix from partner ID
 */
function getPartnerPrefix(partnerId: string): string {
  const prefixMap: Record<string, string> = {
    'part_1': 'JKS', // JakselNews
    'part_2': 'FIN', // Finance Creator
    'part_3': 'BDG', // Bandung Media
    'part_4': 'PRG', // Parenting
    'part_5': 'CMP', // Campus
    'part_6': 'AFF', // Affiliate
    'part_7': 'MSN', // Mission
    'part_8': 'AUT', // Automotive
    'part_9': 'MUS', // Muslim
    'part_10': 'LFS', // Lifestyle
  };

  return prefixMap[partnerId] || partnerId.slice(0, 3).toUpperCase();
}

/**
 * Get program prefix from program ID
 */
function getProgramPrefix(programId: string): string {
  const prefixMap: Record<string, string> = {
    'prog_1': 'TUN', // Tunaiku
    'prog_2': 'PRD', // Prudential
    'prog_3': 'XLA', // XL Axiata
    'prog_4': 'PGD', // Pegadaian
    'prog_5': 'AST', // AstraPay
    'prog_6': 'SAQ', // Bank Saqu
    'prog_7': 'TMR', // TMRW
    'prog_8': 'IKE', // IKEA
    'prog_9': 'PHU', // Pizza Hut
    'prog_10': 'YAM', // Yamaha
  };

  return prefixMap[programId] || programId.slice(0, 3).toUpperCase();
}

/**
 * Generate full tracking URL
 */
export function generateTrackingUrl(linkCode: string): string {
  return `${LINK_CONFIG.baseUrl}/track/${linkCode}`;
}

/**
 * Generate short URL
 */
export function generateShortUrl(linkCode: string): string {
  return `https://${LINK_CONFIG.shortDomain}/${linkCode}`;
}

/**
 * Generate QR code as base64 data URL
 * Uses a simple QR code generation approach
 */
export async function generateQRCodeData(
  url: string,
  options: {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  const { size = 300, margin = 2 } = options;

  // For demo purposes, we'll return a placeholder
  // In production, use a QR code library like 'qrcode'
  const encodedUrl = encodeURIComponent(url);

  // Return SVG QR code as data URL
  // This is a simplified version - in production use actual QR generation
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="white"/>
      <rect x="${margin * 10}" y="${margin * 10}" width="${size - margin * 20}" height="${size - margin * 20}" fill="black" rx="4"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">QR</text>
      <text x="50%" y="60%" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dy=".3em">${url.slice(0, 8)}</text>
    </svg>
  `.trim();

  // In production, use actual QR code library:
  // import QRCode from 'qrcode';
  // return await QRCode.toDataURL(url, { width: size, margin });

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Create unique link for partner + program
 */
export async function createUniqueLink(
  partnerId: string,
  programId: string,
  options: {
    customCode?: string;
    expiresInDays?: number;
  } = {}
): Promise<UniqueLink> {
  const linkCode = options.customCode || generateLinkCode(partnerId, programId);
  const fullUrl = generateTrackingUrl(linkCode);
  const shortUrl = generateShortUrl(linkCode);
  const qrCodeData = await generateQRCodeData(shortUrl);

  const expiresAt = options.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + LINK_CONFIG.expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: `link_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    partner_id: partnerId,
    program_id: programId,
    link_code: linkCode,
    full_url: fullUrl,
    short_url: shortUrl,
    qr_code_data: qrCodeData,
    click_count: 0,
    conversion_count: 0,
    valid_conversions: 0,
    rejected_conversions: 0,
    fraud_conversions: 0,
    conversion_rate: 0,
    earnings: 0,
    is_active: true,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };
}

/**
 * Parse link code to get partner and program info
 */
export function parseLinkCode(linkCode: string): {
  partnerPrefix: string;
  programPrefix: string;
  suffix: string;
} | null {
  const parts = linkCode.split('-');

  if (parts.length !== 3) {
    return null;
  }

  return {
    partnerPrefix: parts[0],
    programPrefix: parts[1],
    suffix: parts[2],
  };
}

/**
 * Validate link code format
 */
export function isValidLinkCode(linkCode: string): boolean {
  const pattern = /^[A-Z]{3}-[A-Z]{3}-[A-Z0-9]{4}$/;
  return pattern.test(linkCode);
}

/**
 * Generate link stats for a specific link
 */
export function calculateLinkStats(
  linkData: UniqueLink,
  periodDays: number = 30
): LinkStats {
  const conversionRate =
    linkData.click_count > 0
      ? (linkData.conversion_count / linkData.click_count) * 100
      : 0;

  // Generate period stats (mock data for demo)
  const periodStats: PeriodStat[] = [];
  const now = new Date();

  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Mock daily stats
    const dailyClicks = Math.floor(linkData.click_count / periodDays * (0.5 + Math.random()));
    const dailyConversions = Math.floor(dailyClicks * conversionRate / 100);
    const dailyEarnings = dailyConversions * 5000; // Assuming Rp 5000 per conversion

    periodStats.push({
      date: date.toISOString().split('T')[0],
      clicks: dailyClicks,
      conversions: dailyConversions,
      earnings: dailyEarnings,
    });
  }

  return {
    total_clicks: linkData.click_count,
    total_conversions: linkData.conversion_count,
    valid_conversions: linkData.valid_conversions,
    pending_conversions: linkData.conversion_count - linkData.valid_conversions - linkData.rejected_conversions - linkData.fraud_conversions,
    rejected_conversions: linkData.rejected_conversions,
    fraud_conversions: linkData.fraud_conversions,
    conversion_rate: Math.round(conversionRate * 100) / 100,
    total_earnings: linkData.earnings,
    period_stats: periodStats,
  };
}

/**
 * Get shareable content for a link
 */
export function getShareableContent(link: UniqueLink): {
  text: string;
  email: string;
  whatsapp: string;
} {
  const shortUrl = link.short_url;
  const programCode = link.link_code.split('-')[1];

  return {
    text: `Dapatkan reward dengan klik link ini! ${shortUrl}\n\nCode: ${link.link_code}`,

    email: `
Hi!

Gabung program kami dan dapatkan komisi untuk setiap conversion yang valid.

Link kamu: ${shortUrl}
Code: ${link.link_code}

Happy promoting!
    `.trim(),

    whatsapp: `Hey! Join program ini dan mulai earn! 🎉\n\n${shortUrl}\n\nCode: ${link.link_code}`,
  };
}

/**
 * Track click on link
 */
export function trackLinkClick(
  link: UniqueLink,
  metadata: {
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    timestamp?: Date;
  }
): void {
  // In production, record this to database
  console.log('[Link Click]', {
    link_code: link.link_code,
    partner_id: link.partner_id,
    program_id: link.program_id,
    ...metadata,
    timestamp: metadata.timestamp?.toISOString() || new Date().toISOString(),
  });
}

/**
 * Check if link is expired
 */
export function isLinkExpired(link: UniqueLink): boolean {
  if (!link.expires_at) return false;
  return new Date(link.expires_at) < new Date();
}

/**
 * Get link status
 */
export function getLinkStatus(
  link: UniqueLink
): 'active' | 'expired' | 'paused' | 'exhausted' {
  if (!link.is_active) return 'paused';
  if (isLinkExpired(link)) return 'expired';

  // Check if link has been exhausted (e.g., budget depleted)
  // This would check against program budget in real implementation

  return 'active';
}

export default {
  createUniqueLink,
  generateLinkCode,
  generateTrackingUrl,
  generateShortUrl,
  generateQRCodeData,
  parseLinkCode,
  isValidLinkCode,
  calculateLinkStats,
  getShareableContent,
  trackLinkClick,
  isLinkExpired,
  getLinkStatus,
};
