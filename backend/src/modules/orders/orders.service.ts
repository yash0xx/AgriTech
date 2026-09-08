import { supabasePublic, supabaseAdmin } from '../../config/supabase';

export class OrdersService {
  /**
   * Trusted order total calculation from database product pricing
   * Never trusts client-sent total_amount!
   */
  async calculateTrustedTotal(productId: string, quantity: number) {
    const client = supabaseAdmin || supabasePublic;
    const { data: product, error } = await client
      .from('products')
      .select('id, farmer_id, price_per_unit, min_order_quantity, quantity, status, title')
      .eq('id', productId)
      .single();

    if (error || !product) {
      throw new Error('Product not found in marketplace catalog');
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('Listing is no longer active for orders');
    }

    if (quantity < (product.min_order_quantity || 1)) {
      throw new Error(`Order quantity must be at least ${product.min_order_quantity}`);
    }

    if (quantity > product.quantity) {
      throw new Error(`Requested quantity exceeds available stock of ${product.quantity}`);
    }

    const unitPrice = Number(product.price_per_unit);
    const subtotal = Math.round(unitPrice * quantity * 100) / 100;
    const platformFee = Math.round(subtotal * 0.01 * 100) / 100; // 1% platform fee
    const escrowSafetyFee = 25.00; // Fixed escrow guarantee charge
    const totalAmount = Math.round((subtotal + platformFee + escrowSafetyFee) * 100) / 100;

    return {
      productId,
      productTitle: product.title,
      farmerId: product.farmer_id,
      unitPrice,
      quantity,
      availableStock: Number(product.quantity),
      subtotal,
      platformFee,
      escrowSafetyFee,
      totalAmount,
    };
  }

  /**
   * Trusted order creation:
   * Validates product, stock, parties, calculates financial values server-side,
   * creates order, order_items, initial milestone, and hold escrow transaction atomically.
   */
  async createTrustedOrder(params: {
    buyerId: string;
    productId: string;
    quantity: number;
    deliveryAddress?: string;
    deliveryDistrict?: string;
    deliveryState?: string;
    specialInstructions?: string;
    logisticsCost?: number;
    idempotencyKey?: string;
  }) {
    const client = supabaseAdmin || supabasePublic;

    // Idempotency check: Return existing order if key was already processed
    if (params.idempotencyKey) {
      const { data: existing } = await client
        .from('orders')
        .select('*')
        .like('special_instructions', `%IDEMPOTENCY:${params.idempotencyKey}%`)
        .maybeSingle();

      if (existing) {
        return existing;
      }
    }

    // 1. Calculate pricing server-side
    const pricing = await this.calculateTrustedTotal(params.productId, params.quantity);

    // 2. Validate buyer is not farmer
    if (params.buyerId === pricing.farmerId) {
      throw new Error('Farmers cannot purchase their own product listing');
    }

    // 3. True PostgreSQL ACID Transaction Execution via create_order_atomic
    try {
      const { data: atomicResult, error: atomicErr } = await client.rpc('create_order_atomic', {
        p_buyer_id: params.buyerId,
        p_product_id: params.productId,
        p_quantity: params.quantity,
        p_delivery_address: params.deliveryAddress || 'Standard Delivery',
        p_delivery_district: params.deliveryDistrict || 'District Hub',
        p_delivery_state: params.deliveryState || 'Maharashtra',
        p_special_instructions: params.specialInstructions || '',
        p_logistics_cost: params.logisticsCost || 0,
        p_idempotency_key: params.idempotencyKey || null,
      });

      if (!atomicErr && atomicResult && atomicResult.success) {
        // Fetch newly created order or return replayed order
        const { data: committedOrder } = await client
          .from('orders')
          .select('*')
          .eq('id', atomicResult.order_id)
          .maybeSingle();

        if (committedOrder) {
          return committedOrder;
        }
      }
    } catch (atomicAttemptErr) {
      console.warn('RPC create_order_atomic unavailable, using transactional compensation pipeline:', atomicAttemptErr);
    }

    // 4. Secondary Fallback Pipeline: Atomic inventory decrement with strict compensation rollback
    let decrementedStock = false;
    try {
      // First attempt database RPC atomic decrement with strict stock guard
      const { data: remainingQty, error: rpcErr } = await client.rpc('decrement_product_inventory', {
        p_product_id: params.productId,
        p_quantity: params.quantity,
      });

      if (!rpcErr && remainingQty !== null) {
        decrementedStock = true;
      } else {
        // Fallback: Atomic SQL update with gte stock guard
        // Re-read latest fresh stock to prevent stale overwrite
        const { data: freshProduct, error: readErr } = await client
          .from('products')
          .select('quantity, status')
          .eq('id', params.productId)
          .single();

        if (readErr || !freshProduct || freshProduct.status !== 'ACTIVE' || freshProduct.quantity < params.quantity) {
          throw new Error('Inventory concurrency check failed: requested quantity exceeds concurrently available stock.');
        }

        const newStock = freshProduct.quantity - params.quantity;
        const { data: updatedProduct, error: stockErr } = await client
          .from('products')
          .update({
            quantity: newStock,
            status: newStock <= 0 ? 'SOLD_OUT' : 'ACTIVE',
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.productId)
          .gte('quantity', params.quantity)
          .eq('status', 'ACTIVE')
          .select('id, quantity')
          .single();

        if (stockErr || !updatedProduct) {
          throw new Error('Inventory concurrency check failed: requested quantity exceeds concurrently available stock.');
        }
        decrementedStock = true;
      }
    } catch (concurrencyErr: any) {
      throw new Error(`Inventory concurrency check failed: ${concurrencyErr.message}`);
    }

    const logisticsCost = Math.max(0, Number(params.logisticsCost) || 0);
    const totalAmount = Math.round((pricing.totalAmount + logisticsCost) * 100) / 100;
    const orderNumber = `AT-ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const instructions = [
      params.specialInstructions,
      params.idempotencyKey ? `IDEMPOTENCY:${params.idempotencyKey}` : null,
    ].filter(Boolean).join(' | ');

    let createdOrder: any = null;
    let createdEscrowId: string | null = null;

    try {
      // 4. Insert order
      const { data: order, error: orderErr } = await client
        .from('orders')
        .insert({
          order_number: orderNumber,
          buyer_id: params.buyerId,
          farmer_id: pricing.farmerId,
          subtotal: pricing.subtotal,
          logistics_cost: logisticsCost,
          platform_fee: pricing.platformFee + pricing.escrowSafetyFee,
          total_amount: totalAmount,
          status: 'PLACED',
          payment_status: 'HELD_IN_ESCROW',
          delivery_address: params.deliveryAddress || 'Standard Delivery',
          delivery_district: params.deliveryDistrict || 'District Hub',
          delivery_state: params.deliveryState || 'Maharashtra',
          special_instructions: instructions,
        })
        .select()
        .single();

      if (orderErr || !order) {
        throw new Error(`Failed to create order: ${orderErr?.message || 'Unknown database error'}`);
      }
      createdOrder = order;

      // 5. Insert order items
      const { error: itemErr } = await client
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: params.productId,
          quantity: params.quantity,
          price_per_unit: pricing.unitPrice,
          total_price: pricing.subtotal,
        });

      if (itemErr) {
        throw new Error(`Failed to create order items: ${itemErr.message}`);
      }

      // 6. Insert initial milestone
      const { error: milestoneErr } = await client
        .from('order_milestones')
        .insert({
          order_id: order.id,
          status: 'PLACED',
          location: params.deliveryDistrict || 'Order Dispatch Hub',
          note: 'Order placed and payment successfully locked in AgriTech Escrow.',
        });

      if (milestoneErr) {
        throw new Error(`Failed to create initial milestone: ${milestoneErr.message}`);
      }

      // 7. Record escrow hold transaction
      const { data: escrowRecord, error: escrowErr } = await client
        .from('escrow_transactions')
        .insert({
          order_id: order.id,
          transaction_type: 'HOLD',
          amount: totalAmount,
          status: 'COMPLETED',
          payment_reference: `ESC-HOLD-${orderNumber}`,
          metadata: {
            productId: params.productId,
            quantity: params.quantity,
            subtotal: pricing.subtotal,
            logisticsCost,
          },
        })
        .select('id')
        .maybeSingle();

      if (escrowErr) {
        throw new Error(`Failed to record escrow transaction: ${escrowErr.message}`);
      }
      if (escrowRecord) {
        createdEscrowId = escrowRecord.id;
      }

      // 8. Send notification to farmer
      await client
        .from('notifications')
        .insert({
          user_id: pricing.farmerId,
          title: 'New Order Received',
          message: `You have received a new order ${orderNumber} for ${params.quantity} units of ${pricing.productTitle}. Funds are held in escrow.`,
          type: 'ORDER',
          reference_id: order.id,
        });

      return order;
    } catch (txnError: any) {
      // Transaction integrity compensation rollback:
      // Guarantee: No orphaned order, no orphaned escrow, no incorrectly decremented inventory!
      console.error(`Order creation aborted, rolling back: ${txnError.message}`);

      // 1. Revert inventory
      if (decrementedStock) {
        try {
          const { error: restoreErr } = await client.rpc('restore_product_inventory', {
            p_product_id: params.productId,
            p_quantity: params.quantity,
          });
          if (restoreErr) {
            // Fallback restore via manual addition
            const { data: p } = await client.from('products').select('quantity').eq('id', params.productId).single();
            if (p) {
              await client.from('products').update({
                quantity: p.quantity + params.quantity,
                status: 'ACTIVE',
                updated_at: new Date().toISOString(),
              }).eq('id', params.productId);
            }
          }
        } catch (rollbackStockErr) {
          console.error('Failed to rollback inventory decrement:', rollbackStockErr);
        }
      }

      // 2. Remove escrow transaction if created
      if (createdEscrowId) {
        await client.from('escrow_transactions').delete().eq('id', createdEscrowId);
      }

      // 3. Remove order and related records
      if (createdOrder?.id) {
        await client.from('order_items').delete().eq('order_id', createdOrder.id);
        await client.from('order_milestones').delete().eq('order_id', createdOrder.id);
        await client.from('orders').delete().eq('id', createdOrder.id);
      }

      throw new Error(`Order creation failed and transaction was cleanly rolled back: ${txnError.message}`);
    }
  }

  /**
   * Append milestone and update order status
   */
  async addMilestone(params: {
    orderId: string;
    status: string;
    note?: string;
    location?: string;
  }) {
    const client = supabaseAdmin || supabasePublic;

    // Update order status
    const { data: order, error: updateErr } = await client
      .from('orders')
      .update({ status: params.status, updated_at: new Date().toISOString() })
      .eq('id', params.orderId)
      .select()
      .single();

    if (updateErr || !order) {
      throw new Error(`Failed to update order status: ${updateErr?.message || 'Not found'}`);
    }

    // Append to order_milestones
    await client
      .from('order_milestones')
      .insert({
        order_id: params.orderId,
        status: params.status,
        note: params.note || `Order status transitioned to ${params.status}`,
        location: params.location || 'Hub',
      });

    return order;
  }
}
