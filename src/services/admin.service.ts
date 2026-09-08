import { supabase } from '../lib/supabase';

export interface AdminDashboardStats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  activeProducts: number;
  activeListings: number;
  totalOrders: number;
  gmv: number;
  escrowVolume: number;
  pendingDisputes: number;
  kycPending: number;
  mandiFeedStatus: number;
}

export const adminService = {
  /**
   * Fetch aggregate admin dashboard statistics from v_admin_dashboard_stats view
   * or direct database aggregation
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const { data, error } = await supabase
      .from('v_admin_dashboard_stats')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      return {
        totalUsers: Number(data.total_users || 0),
        totalFarmers: Number(data.total_farmers || 0),
        totalBuyers: Number(data.total_buyers || 0),
        activeProducts: Number(data.active_products || 0),
        activeListings: Number(data.active_listings || 0),
        totalOrders: Number(data.total_orders || 0),
        gmv: Number(data.gmv || 0),
        escrowVolume: Number(data.escrow_volume || 0),
        pendingDisputes: Number(data.pending_disputes || 0),
        kycPending: Number(data.kyc_pending || 0),
        mandiFeedStatus: Number(data.mandi_feed_status || 0),
      };
    }

    // Fallback: direct table counts if view is not yet hydrated
    const [
      { count: usersCount },
      { count: productsCount },
      { count: ordersCount },
      { count: disputesCount },
      { count: kycCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['OPEN', 'UNDER_REVIEW']),
      supabase.from('kyc_records').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    ]);

    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount, payment_status, status');

    let gmv = 0;
    let escrowVolume = 0;
    (ordersData || []).forEach((o) => {
      const amt = Number(o.total_amount || 0);
      if (o.status !== 'CANCELLED') gmv += amt;
      if (o.payment_status === 'HELD_IN_ESCROW') escrowVolume += amt;
    });

    return {
      totalUsers: usersCount || 0,
      totalFarmers: 0,
      totalBuyers: 0,
      activeProducts: productsCount || 0,
      activeListings: productsCount || 0,
      totalOrders: ordersCount || 0,
      gmv,
      escrowVolume,
      pendingDisputes: disputesCount || 0,
      kycPending: kycCount || 0,
      mandiFeedStatus: 24,
    };
  },

  /**
   * Fetch all registered profiles for admin user management
   */
  async getAllUsers(role?: string) {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Suspend user account
   */
  async suspendUser(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(error.message);
  },

  /**
   * Activate user account
   */
  async activateUser(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw new Error(error.message);
  },
};
