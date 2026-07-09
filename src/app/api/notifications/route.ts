/**
 * Notifications API Routes
 *
 * Endpoints:
 * GET    /api/notifications         - List notifications
 * POST   /api/notifications         - Create notification
 * PUT    /api/notifications/:id     - Mark as read
 * PUT    /api/notifications/read-all - Mark all as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Demo mode - return mock notifications
    if (!isSupabaseConfigured()) {
      const mockNotifications = [
        {
          id: 'notif_1',
          user_id: userId,
          type: 'conversion',
          title: 'New Valid Conversion',
          message: 'You received a new valid conversion from JakselNews Media.',
          icon: 'check-circle',
          link: '/partner/conversions',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif_2',
          user_id: userId,
          type: 'payout',
          title: 'Payout Processed',
          message: 'Your payout of Rp 5,250,000 has been processed.',
          icon: 'credit-card',
          link: '/partner/payouts',
          read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'notif_3',
          user_id: userId,
          type: 'program',
          title: 'New Program Available',
          message: 'Tunaiku is looking for partners for their new campaign.',
          icon: 'megaphone',
          link: '/partner/programs',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      let data = mockNotifications.filter(n => n.user_id === userId);
      if (unreadOnly) data = data.filter(n => !n.read);

      const unreadCount = mockNotifications.filter(n => n.user_id === userId && !n.read).length;

      return NextResponse.json({
        success: true,
        data,
        unreadCount,
        pagination: { page, limit, total: data.length, totalPages: 1 },
      });
    }

    // Production mode
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return NextResponse.json({
      success: true,
      data,
      unreadCount: unreadCount || 0,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
    });
  } catch (error) {
    console.error('List notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, icon, link, data } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, error: 'User ID and title are required' },
        { status: 400 }
      );
    }

    // Demo mode
    if (!isSupabaseConfigured()) {
      const newNotification = {
        id: `notif_${Date.now()}`,
        user_id: userId,
        type: type || 'info',
        title,
        message,
        icon,
        link,
        data: data || {},
        read: false,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: newNotification,
        message: 'Notification created (demo mode)',
      }, { status: 201 });
    }

    // Production mode
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type || 'info',
        title,
        message,
        icon,
        link,
        data: data || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification created',
    }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
