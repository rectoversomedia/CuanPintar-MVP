/**
 * Link Statistics API Routes
 *
 * Endpoints:
 * GET /api/links/[id]/stats - Get detailed stats for a link
 * GET /api/links/[id]/stats/daily - Daily breakdown
 * GET /api/links/[id]/stats/geo - Geographic breakdown
 * GET /api/links/[id]/stats/devices - Device breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/links/[id]/stats - Get overall statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { id: linkId } = await params;
    const days = parseInt(searchParams.get('days') || '30');

    // Demo mode
    if (!isSupabaseConfigured()) {
      // Generate mock data for demo
      const mockStats = {
        overview: {
          total_clicks: 1234,
          unique_clicks: 892,
          total_conversions: 87,
          valid_conversions: 72,
          pending_conversions: 8,
          rejected_conversions: 4,
          fraud_conversions: 3,
          conversion_rate: 7.05,
          avg_daily_clicks: 41.13,
          total_payout: 1800000,
          avg_cpc: 1458.35,
        },
        trend: {
          clicks_change: 12.5,
          conversions_change: 8.2,
          payout_change: 15.3,
        },
        top_devices: [
          { type: 'mobile', clicks: 654, percentage: 53 },
          { type: 'desktop', clicks: 432, percentage: 35 },
          { type: 'tablet', clicks: 148, percentage: 12 },
        ],
        top_countries: [
          { country: 'ID', clicks: 890, conversions: 52, percentage: 72.1 },
          { country: 'MY', clicks: 156, conversions: 11, percentage: 12.6 },
          { country: 'SG', clicks: 98, conversions: 6, percentage: 7.9 },
          { country: 'OTHER', clicks: 90, conversions: 3, percentage: 7.4 },
        ],
        top_utm_sources: [
          { source: 'instagram', clicks: 456, conversions: 32 },
          { source: 'whatsapp', clicks: 345, conversions: 28 },
          { source: 'tiktok', clicks: 234, conversions: 15 },
          { source: 'facebook', clicks: 123, conversions: 8 },
          { source: 'direct', clicks: 76, conversions: 4 },
        ],
      };

      return NextResponse.json({
        success: true,
        data: mockStats,
      });
    }

    // Production mode
    // Get link info
    const { data: link, error: linkError } = await supabase
      .from('tracking_links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Get daily stats for the period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: dailyStats } = await supabase
      .from('link_daily_stats')
      .select('*')
      .eq('link_id', linkId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Aggregate stats
    const overview = {
      total_clicks: link.total_clicks || 0,
      unique_clicks: dailyStats?.reduce((sum, s) => sum + (s.unique_clicks || 0), 0) || 0,
      total_conversions: link.total_conversions || 0,
      valid_conversions: link.valid_conversions || 0,
      pending_conversions: link.pending_conversions || 0,
      rejected_conversions: link.rejected_conversions || 0,
      fraud_conversions: link.fraud_conversions || 0,
      conversion_rate:
        link.total_clicks > 0
          ? ((link.valid_conversions || 0) / link.total_clicks) * 100
          : 0,
      avg_daily_clicks:
        dailyStats && dailyStats.length > 0
          ? link.total_clicks / dailyStats.length
          : 0,
      total_payout: link.total_payout || 0,
    };

    // Calculate trend (compare to previous period)
    const halfPoint = Math.floor(dailyStats?.length || 0 / 2);
    const recentStats = dailyStats?.slice(halfPoint) || [];
    const olderStats = dailyStats?.slice(0, halfPoint) || [];

    const recentClicks = recentStats.reduce((sum, s) => sum + (s.clicks || 0), 0);
    const olderClicks = olderStats.reduce((sum, s) => sum + (s.clicks || 0), 0);

    const trend = {
      clicks_change:
        olderClicks > 0 ? ((recentClicks - olderClicks) / olderClicks) * 100 : 0,
      conversions_change: 0,
      payout_change: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        trend,
        top_devices: [],
        top_countries: [],
        daily_stats: dailyStats || [],
      },
    });
  } catch (error) {
    console.error('Get link stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
