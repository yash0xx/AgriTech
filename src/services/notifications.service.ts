import { supabase } from '../lib/supabase';
import { AppNotification } from '../types';

export function mapDbTypeToCategory(type: string): AppNotification['category'] {
  switch (type) {
    case 'ORDER':
    case 'REQUEST':
    case 'PAYMENT':
      return 'Orders';
    case 'MANDI_ALERT':
      return 'Market';
    case 'KYC':
    case 'SYSTEM':
    default:
      return 'System';
  }
}

function transformNotification(row: any): AppNotification {
  return {
    id: row.id,
    category: mapDbTypeToCategory(row.type),
    title: row.title,
    message: row.message,
    timestamp: new Date(row.created_at).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isRead: Boolean(row.is_read),
    linkAction: row.reference_type === 'ORDER' ? '/buyer/orders' : undefined,
  };
}

export const notificationsService = {
  /**
   * Fetch all notifications for the authenticated user
   */
  async getNotifications(limit: number = 50): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100));

    if (error) {
      console.error('Failed to load notifications from Supabase:', error);
      throw new Error(`Failed to load notifications: ${error.message}`);
    }

    return (data || []).map(transformNotification);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  },

  /**
   * Create a notification for a target user
   */
  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'SYSTEM' | 'REQUEST' | 'ORDER' | 'PAYMENT' | 'KYC' | 'MANDI_ALERT';
    referenceType?: string;
    referenceId?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'SYSTEM',
        reference_type: params.referenceType || null,
        reference_id: params.referenceId || null,
        is_read: false,
      });

    if (error) {
      console.warn('Failed to insert notification:', error);
    }
  },
};
