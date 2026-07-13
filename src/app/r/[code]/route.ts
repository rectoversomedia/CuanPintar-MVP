/**
 * Short Link Redirect Route
 *
 * Endpoint:
 * GET /r/[code] - Redirect to landing page with click tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface ClickData {
  id: string;
  link_id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  referrer: string;
  utms: Record<string, string>;
  fingerprint: string;
  created_at: string;
}

// Extract device info from User-Agent
function parseUserAgent(userAgent: string): { device_type: string; browser: string; os: string } {
  const ua = userAgent.toLowerCase();

  // Device type
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    device_type = /ipad|tablet|kindle/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser
  let browser = 'other';
  if (/edg\/|edge/i.test(ua)) browser = 'edge';
  else if (/chrome\/[^0]/i.test(ua) && !/opr\//i.test(ua)) browser = 'chrome';
  else if (/firefox\//i.test(ua)) browser = 'firefox';
  else if (/safari\/[^0]/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
  else if (/opr\//i.test(ua)) browser = 'opera';

  // OS
  let os = 'other';
  if (/windows nt 10/i.test(ua)) os = 'windows_10';
  else if (/windows nt/i.test(ua)) os = 'windows';
  else if (/mac os x/i.test(ua)) os = 'macos';
  else if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
  else if (/linux/i.test(ua)) os = 'linux';

  return { device_type, browser, os };
}

// GET /r/[code] - Redirect and track click
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);

    // Get client info
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || '';

    // Parse device info
    const { device_type, browser, os } = parseUserAgent(userAgent);

    // Extract UTM params
    const utms = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_term: searchParams.get('utm_term') || '',
      utm_content: searchParams.get('utm_content') || '',
    };

    // Fingerprint from cookie or generate
    const fingerprint = request.cookies.get('cp_fp')?.value || '';

    // Demo mode
    if (!isSupabaseConfigured()) {
      // In demo mode, just redirect to home
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com'}?utm_source=short_link&utm_medium=qr`;

      // Return redirect response
      return NextResponse.redirect(redirectUrl, 302);
    }

    // Production mode - Look up the link
    const { data: link, error } = await supabase
      .from('tracking_links')
      .select('id, tracking_url, short_url, is_active, expires_at, program_id, partner_id, channel_type')
      .eq('unique_code', code)
      .single();

    if (error || !link) {
      // Link not found - redirect to home with error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com'}?error=link_not_found`,
        302
      );
    }

    // Check if link is active
    if (!link.is_active) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com'}?error=link_inactive`,
        302
      );
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com'}?error=link_expired`,
        302
      );
    }

    // Track the click asynchronously (fire and forget)
    trackClick(link, ip, userAgent, device_type, browser, os, referer, utms, fingerprint).catch(
      (err) => console.error('Click tracking error:', err)
    );

    // Redirect to the tracking URL (landing page)
    // Parse existing UTM params from the URL and merge with ours
    let redirectUrl = link.tracking_url;
    const existingUrl = new URL(redirectUrl);

    // Merge UTM params
    for (const [key, value] of Object.entries(utms)) {
      if (value && !existingUrl.searchParams.get(key)) {
        existingUrl.searchParams.set(key, value);
      }
    }

    return NextResponse.redirect(existingUrl.toString(), 302);
  } catch (error) {
    console.error('Short link redirect error:', error);
    // On error, redirect to home
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL || 'https://cuanpintar.com',
      302
    );
  }
}

// Track click data asynchronously
async function trackClick(
  link: any,
  ip: string,
  userAgent: string,
  device_type: string,
  browser: string,
  os: string,
  referer: string,
  utms: Record<string, string>,
  fingerprint: string
) {
  try {
    // Generate click ID
    const clickId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create click record
    const clickData = {
      click_id: clickId,
      link_id: link.id,
      program_id: link.program_id,
      partner_id: link.partner_id,
      channel_type: link.channel_type,
      ip_address: ip,
      user_agent: userAgent,
      device_type,
      browser,
      os,
      referrer: referer,
      utms,
      fingerprint,
      created_at: new Date().toISOString(),
    };

    // Insert click record
    await supabase.from('clicks').insert({
      id: clickId,
      click_id: clickId,
      link_id: link.id,
      program_id: link.program_id,
      partner_id: link.partner_id,
      channel_type: link.channel_type,
      ip_address: ip,
      user_agent: userAgent,
      device_type,
      browser,
      os,
      referrer: referer,
      utms,
      fingerprint,
      created_at: new Date().toISOString(),
    });

    // Update link stats
    const today = new Date().toISOString().split('T')[0];

    // Update denormalized stats on tracking_links
    await supabase.rpc('update_link_stats_on_click', {
      p_link_id: link.id,
      p_device_type: device_type,
      p_country: 'ID', // Would need GeoIP lookup for real country
      p_utm_source: utms.utm_source || 'direct',
      p_is_unique: true, // Simplified - real implementation would check fingerprint
    });

    // Upsert daily stats
    const { data: existingDaily } = await supabase
      .from('link_daily_stats')
      .select('id')
      .eq('link_id', link.id)
      .eq('date', today)
      .single();

    if (existingDaily) {
      // Update existing daily stats
      await supabase.rpc('increment_link_daily_clicks', {
        p_link_id: link.id,
        p_date: today,
        p_device_type: device_type,
        p_country: 'ID',
        p_utm_source: utms.utm_source || 'direct',
      });
    } else {
      // Insert new daily stats
      await supabase.from('link_daily_stats').insert({
        link_id: link.id,
        date: today,
        clicks: 1,
        unique_clicks: 1,
        desktop_clicks: device_type === 'desktop' ? 1 : 0,
        mobile_clicks: device_type === 'mobile' ? 1 : 0,
        tablet_clicks: device_type === 'tablet' ? 1 : 0,
        country_stats: { ID: 1 },
        utm_source_stats: { [utms.utm_source || 'direct']: 1 },
      });
    }
  } catch (error) {
    console.error('Error tracking click:', error);
  }
}
