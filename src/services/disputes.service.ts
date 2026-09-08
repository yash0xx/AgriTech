import { supabase } from '../lib/supabase';

export interface DisputeRecord {
  id: string;
  orderId: string;
  orderNumber?: string;
  raisedBy: string;
  raisedByName?: string;
  reason: string;
  description?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  resolution?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  createdAt: string;
  resolvedAt?: string;
}

function transformDispute(row: any): DisputeRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order?.order_number,
    raisedBy: row.raised_by,
    raisedByName: row.raised_by_profile?.full_name || 'Verified User',
    reason: row.reason,
    description: row.description || undefined,
    status: row.status,
    resolution: row.resolution || undefined,
    resolvedBy: row.resolved_by || undefined,
    resolvedByName: row.resolver_profile?.full_name || undefined,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at || undefined,
  };
}

export const disputesService = {
  /**
   * Fetch all disputes accessible by current user (parties or admin)
   */
  async getDisputes(): Promise<DisputeRecord[]> {
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        order:orders!order_id(order_number),
        raised_by_profile:profiles!raised_by(full_name),
        resolver_profile:profiles!resolved_by(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load disputes from Supabase:', error);
      throw new Error(`Failed to load disputes: ${error.message}`);
    }

    return (data || []).map(transformDispute);
  },

  /**
   * Raise a new dispute against an order
   */
  async createDispute(params: {
    orderId: string;
    reason: string;
    description?: string;
  }): Promise<DisputeRecord> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      throw new Error('Authentication required to raise dispute');
    }

    const { data: dispute, error } = await supabase
      .from('disputes')
      .insert({
        order_id: params.orderId,
        raised_by: userId,
        reason: params.reason,
        description: params.description || '',
        status: 'OPEN',
      })
      .select(`
        *,
        order:orders!order_id(order_number),
        raised_by_profile:profiles!raised_by(full_name)
      `)
      .single();

    if (error || !dispute) {
      throw new Error(`Failed to create dispute: ${error?.message}`);
    }

    // Update order status to DISPUTED
    await supabase
      .from('orders')
      .update({ status: 'DISPUTED' })
      .eq('id', params.orderId);

    // Append dispute milestone
    await supabase
      .from('order_milestones')
      .insert({
        order_id: params.orderId,
        status: 'DISPUTED',
        location: 'Platform Resolution Desk',
        note: `Dispute opened: ${params.reason}`,
      });

    return transformDispute(dispute);
  },

  /**
   * Admin reviews dispute
   */
  async markUnderReview(disputeId: string): Promise<void> {
    const { error } = await supabase
      .from('disputes')
      .update({ status: 'UNDER_REVIEW' })
      .eq('id', disputeId);

    if (error) {
      throw new Error(`Failed to update dispute status: ${error.message}`);
    }
  },

  /**
   * Admin resolves dispute
   */
  async resolveDispute(params: {
    disputeId: string;
    resolution: string;
    status: 'RESOLVED' | 'REJECTED';
  }): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData.session?.user?.id;

    const { error } = await supabase
      .from('disputes')
      .update({
        status: params.status,
        resolution: params.resolution,
        resolved_by: adminId || null,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', params.disputeId);

    if (error) {
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  },
};
