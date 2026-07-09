/**
 * Analytics API Routes
 *
 * Endpoints:
 * GET /api/analytics/dashboard/:role  - Get dashboard stats
 * GET /api/analytics/programs/:id     - Get program analytics
 * GET /api/analytics/conversions      - Get conversion analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/analytics/dashboard/:role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('user_id');

    // Demo mode
    if (!isSupabaseConfigured()) {
      const { mockAdvertiserDashboard, mockPartnerDashboard, mockAdminDashboard } = await import('@/lib/mock-data');

      if (role === 'advertiser') {
        return NextResponse.json({ success: true, data: mockAdvertiserDashboard });
      } else if (role === 'partner') {
        return NextResponse.json({ success: true, data: mockPartnerDashboard });
      } else if (role === 'admin') {
        return NextResponse.json({ success: true, data: mockAdminDashboard });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Production mode
    if (role === 'advertiser' && userId) {
      // Get advertiser stats
      const { data: advertiser } = await supabase
        .from('advertisers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!advertiser) {
        return NextResponse.json(
          { success: false, error: 'Advertiser not found' },
          { status: 404 }
        );
      }

      // Get program stats
      const { data: programs } = await supabase
        .from('programs')
        .select('*')
        .eq('advertiser_id', advertiser.id);

      const activePrograms = programs?.filter(p => p.status === 'active').length || 0;

      // Get conversion stats
      const { data: conversions } = await supabase
        .from('conversions')
        .select('*')
        .eq('advertiser_id', advertiser.id);

      const totalConversions = conversions?.length || 0;
      const validConversions = conversions?.filter(c => c.status === 'valid').length || 0;
      const totalSpend = advertiser.total_spend || 0;
      const averageCPA = validConversions > 0 ? totalSpend / validConversions : 0;

      // Calculate fraud risk
      const fraudConversions = conversions?.filter(c => c.status === 'fraud').length || 0;
      const fraudRate = totalConversions > 0 ? fraudConversions / totalConversions : 0;
      const fraudRisk = fraudRate > 0.1 ? 'high' : fraudRate > 0.05 ? 'medium' : 'low';

      return NextResponse.json({
        success: true,
        data: {
          active_programs: activePrograms,
          total_programs: programs?.length || 0,
          total_conversions: totalConversions,
          valid_conversions: validConversions,
          pending_conversions: conversions?.filter(c => c.status === 'pending').length || 0,
          fraud_conversions: fraudConversions,
          total_spend: totalSpend,
          average_cpa: averageCPA,
          fraud_risk: fraudRisk,
          recent_programs: programs?.slice(0, 5) || [],
        },
      });
    }

    if (role === 'partner' && userId) {
      // Get partner stats
      const { data: partner } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!partner) {
        return NextResponse.json(
          { success: false, error: 'Partner not found' },
          { status: 404 }
        );
      }

      // Get conversion stats
      const { data: conversions } = await supabase
        .from('conversions')
        .select('*')
        .eq('partner_id', partner.id);

      const validConversions = conversions?.filter(c => c.status === 'valid').length || 0;

      return NextResponse.json({
        success: true,
        data: {
          active_programs: 0, // Would need join table
          total_earnings: partner.total_earnings || 0,
          pending_payout: partner.pending_payout || 0,
          valid_conversions: validConversions,
          total_reach: partner.audience_size || 0,
          quality_score: partner.quality_score || 0,
          recent_programs: [],
        },
      });
    }

    if (role === 'admin') {
      // Get platform-wide stats
      const { count: advertisers } = await supabase
        .from('advertisers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: partners } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: programs } = await supabase
        .from('programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { data: conversions } = await supabase
        .from('conversions')
        .select('*');

      const { data: payouts } = await supabase
        .from('payouts')
        .select('*');

      return NextResponse.json({
        success: true,
        data: {
          active_advertisers: advertisers || 0,
          active_partners: partners || 0,
          active_programs: programs || 0,
          total_conversions: conversions?.length || 0,
          valid_conversions: conversions?.filter(c => c.status === 'valid').length || 0,
          rejected_conversions: conversions?.filter(c => c.status === 'rejected').length || 0,
          total_payouts: payouts?.filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
          platform_revenue: payouts?.filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.platform_fee || 0), 0) || 0,
          fraud_alerts: conversions?.filter(c => c.status === 'fraud').length || 0,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
