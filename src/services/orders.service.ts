import { supabase } from '../lib/supabase';
import { OrderItem, OrderStatus, CropUnit } from '../types';

/**
 * Maps database order_status enum to UI OrderStatus type
 */
export function mapDbStatusToUiStatus(dbStatus: string): OrderStatus {
  switch (dbStatus) {
    case 'PLACED':
      return 'Placed';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'DISPATCHED':
      return 'Dispatched';
    case 'IN_TRANSIT':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'DISPUTED':
      return 'Reported';
    default:
      return 'Placed';
  }
}

/**
 * Maps UI OrderStatus to database order_status enum
 */
export function mapUiStatusToDbStatus(uiStatus: OrderStatus): string {
  switch (uiStatus) {
    case 'Placed':
      return 'PLACED';
    case 'Confirmed':
    case 'Accepted':
    case 'Processing':
      return 'CONFIRMED';
    case 'Dispatched':
      return 'DISPATCHED';
    case 'Shipped':
      return 'IN_TRANSIT';
    case 'Delivered':
      return 'DELIVERED';
    case 'Cancelled':
      return 'CANCELLED';
    case 'Reported':
      return 'DISPUTED';
    default:
      return 'PLACED';
  }
}

/**
 * Maps database payment_status enum to UI escrowStatus
 */
export function mapPaymentStatusToEscrow(paymentStatus: string): OrderItem['escrowStatus'] {
  switch (paymentStatus) {
    case 'HELD_IN_ESCROW':
      return 'Held in Escrow';
    case 'RELEASED_TO_FARMER':
      return 'Released to Farmer';
    case 'REFUNDED_TO_BUYER':
      return 'Refunded';
    case 'PENDING':
    default:
      return 'Held';
  }
}

/**
 * Transforms Supabase database row to frontend OrderItem
 */
function transformDbOrder(row: any): OrderItem {
  const item = row.order_items?.[0] || {};
  const product = item.product || {};
  const primaryImg = product.product_images?.[0]?.image_url;

  const timeline = (row.order_milestones || [])
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((m: any) => ({
      status: mapDbStatusToUiStatus(m.status),
      timestamp: new Date(m.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      description: m.note || (m.location ? `Location: ${m.location}` : 'Milestone achieved'),
      completed: true,
    }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    productId: item.product_id || '',
    cropName: product.title || 'Farm Crop',
    productImage: primaryImg || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    farmerId: row.farmer_id,
    farmerName: row.farmer?.full_name || 'Verified Farmer',
    farmerLocation: row.farmer?.district ? `${row.farmer.district}, ${row.farmer.state || 'MH'}` : 'Maharashtra',
    farmerPhone: row.farmer?.phone_number || '',
    buyerId: row.buyer_id,
    buyerName: row.buyer?.full_name || 'Verified Buyer',
    buyerLocation: row.delivery_district ? `${row.delivery_district}, ${row.delivery_state || ''}` : 'Hub Yard',
    buyerPhone: row.buyer?.phone_number || '',
    quantity: Number(item.quantity || 0),
    unit: (product.unit as CropUnit) || 'kg',
    pricePerUnit: Number(item.price_per_unit || 0),
    totalAmount: Number(row.total_amount || 0),
    status: mapDbStatusToUiStatus(row.status),
    placedDate: new Date(row.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: row.created_at,
    expectedDelivery: row.expected_delivery_date || 'Within 3 business days',
    deliveryAddress: row.delivery_address || undefined,
    specialInstructions: row.special_instructions || undefined,
    escrowStatus: mapPaymentStatusToEscrow(row.payment_status),
    timeline: timeline.length > 0 ? timeline : [
      {
        status: 'Placed',
        timestamp: new Date(row.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        description: 'Order placed & held in escrow',
        completed: true,
      },
    ],
  };
}

export const ordersService = {
  /**
   * Fetch all accessible orders for the authenticated user (FARMER or BUYER or ADMIN)
   */
  async getOrders(filters?: { role?: 'FARMER' | 'BUYER' | 'ADMIN'; status?: string; page?: number; limit?: number }): Promise<OrderItem[]> {
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_id,
        farmer_id,
        subtotal,
        logistics_cost,
        platform_fee,
        total_amount,
        status,
        payment_status,
        delivery_address,
        delivery_district,
        delivery_state,
        expected_delivery_date,
        special_instructions,
        created_at,
        updated_at,
        buyer:profiles!buyer_id(id, full_name, phone_number, district, state),
        farmer:profiles!farmer_id(id, full_name, phone_number, district, state),
        order_items(
          id,
          product_id,
          quantity,
          price_per_unit,
          total_price,
          product:products(
            id,
            title,
            category,
            crop_name,
            unit,
            product_images(image_url, is_primary)
          )
        ),
        order_milestones(
          id,
          status,
          location,
          note,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      const dbStatus = mapUiStatusToDbStatus(filters.status as OrderStatus);
      query = query.eq('status', dbStatus);
    }

    // Pagination
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(filters?.limit || 50, 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return (data || []).map(transformDbOrder);
  },

  /**
   * Get single order by ID with all relations
   */
  async getOrderById(orderId: string): Promise<OrderItem | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        buyer_id,
        farmer_id,
        subtotal,
        logistics_cost,
        platform_fee,
        total_amount,
        status,
        payment_status,
        delivery_address,
        delivery_district,
        delivery_state,
        expected_delivery_date,
        special_instructions,
        created_at,
        updated_at,
        buyer:profiles!buyer_id(id, full_name, phone_number, district, state),
        farmer:profiles!farmer_id(id, full_name, phone_number, district, state),
        order_items(
          id,
          product_id,
          quantity,
          price_per_unit,
          total_price,
          product:products(
            id,
            title,
            category,
            crop_name,
            unit,
            product_images(image_url, is_primary)
          )
        ),
        order_milestones(
          id,
          status,
          location,
          note,
          created_at
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error fetching order: ${error.message}`);
    }

    return data ? transformDbOrder(data) : null;
  },

  /**
   * Create order using trusted server calculation.
   * Derives identities and calculates total amount server-side.
   */
  async createOrder(params: {
    productId: string;
    quantity: number;
    deliveryAddress?: string;
    deliveryDistrict?: string;
    deliveryState?: string;
    specialInstructions?: string;
    logisticsCost?: number;
  }): Promise<OrderItem> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const buyerId = sessionData.session?.user?.id;

    if (!buyerId) {
      throw new Error('Authentication required to place orders');
    }

    // Attempt backend trusted creation
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const response = await fetch(`${apiBase}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data?.id) {
          const freshOrder = await this.getOrderById(json.data.id);
          if (freshOrder) return freshOrder;
        }
      }
    } catch (backendErr) {
      console.warn('Backend order creation endpoint unreachable, using client transaction:', backendErr);
    }

    // Direct Supabase fallback with verified product pricing
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, farmer_id, price_per_unit, quantity, title, unit')
      .eq('id', params.productId)
      .single();

    if (prodErr || !product) {
      throw new Error('Product not found in database');
    }

    const unitPrice = Number(product.price_per_unit);
    const subtotal = Math.round(unitPrice * params.quantity * 100) / 100;
    const platformFee = Math.round(subtotal * 0.01 * 100) / 100 + 25.0; // 1% fee + escrow deposit fee
    const logisticsCost = Math.max(0, Number(params.logisticsCost) || 0);
    const totalAmount = Math.round((subtotal + platformFee + logisticsCost) * 100) / 100;
    const orderNumber = `AT-ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        buyer_id: buyerId,
        farmer_id: product.farmer_id,
        subtotal,
        logistics_cost: logisticsCost,
        platform_fee: platformFee,
        total_amount: totalAmount,
        status: 'PLACED',
        payment_status: 'HELD_IN_ESCROW',
        delivery_address: params.deliveryAddress || 'Standard Delivery',
        delivery_district: params.deliveryDistrict || 'District Hub',
        delivery_state: params.deliveryState || 'Maharashtra',
        special_instructions: params.specialInstructions,
      })
      .select()
      .single();

    if (orderErr || !newOrder) {
      throw new Error(`Failed to place order: ${orderErr?.message}`);
    }

    // Insert order line item
    await supabase.from('order_items').insert({
      order_id: newOrder.id,
      product_id: product.id,
      quantity: params.quantity,
      price_per_unit: unitPrice,
      total_price: subtotal,
    });

    // Insert initial milestone
    await supabase.from('order_milestones').insert({
      order_id: newOrder.id,
      status: 'PLACED',
      location: params.deliveryDistrict || 'Origin Yard',
      note: 'Order placed & funds locked in AgriTech Escrow.',
    });

    // Notify farmer
    await supabase.from('notifications').insert({
      user_id: product.farmer_id,
      title: 'New Order Received',
      message: `New order #${orderNumber} placed for ${params.quantity} ${product.unit || 'units'} of ${product.title}.`,
      type: 'ORDER',
      reference_id: newOrder.id,
    });

    const fullOrder = await this.getOrderById(newOrder.id);
    if (!fullOrder) {
      throw new Error('Order placed but failed to retrieve details');
    }

    return fullOrder;
  },

  /**
   * Update order status and append a milestone to historical timeline
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string, location?: string): Promise<void> {
    const dbStatus = mapUiStatusToDbStatus(status);

    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) {
      throw new Error(`Failed to update order status: ${updateErr.message}`);
    }

    // Append milestone
    const { error: milestoneErr } = await supabase
      .from('order_milestones')
      .insert({
        order_id: orderId,
        status: dbStatus,
        location: location || 'Transit Point',
        note: note || `Order updated to ${status}`,
      });

    if (milestoneErr) {
      console.warn('Milestone append warning:', milestoneErr);
    }
  },

  /**
   * Get all milestones for an order
   */
  async getOrderMilestones(orderId: string) {
    const { data, error } = await supabase
      .from('order_milestones')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },
};
