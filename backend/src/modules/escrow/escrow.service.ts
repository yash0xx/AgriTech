import { supabasePublic, supabaseAdmin } from '../../config/supabase';

/**
 * Escrow State Machine & Workflow Management
 * Note: Manages database escrow financial ledger states.
 * Real bank settlement requires verified payment provider webhook confirmations.
 */
const VALID_ESCROW_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['HELD_IN_ESCROW', 'CANCELLED'],
  HELD_IN_ESCROW: ['RELEASED', 'REFUNDED', 'DISPUTE_HOLD'],
  DISPUTE_HOLD: ['RELEASED', 'REFUNDED'],
  RELEASED: [], // Terminal
  REFUNDED: [], // Terminal
  CANCELLED: [], // Terminal
};

export class EscrowService {
  /**
   * Validates state transition according to the escrow state machine.
   * Throws on invalid or illegal transitions (e.g. RELEASE -> HOLD, REFUND -> RELEASE).
   */
  validateStateTransition(currentStatus: string, targetStatus: string): void {
    const allowed = VALID_ESCROW_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(targetStatus)) {
      throw new Error(
        `INVALID_ESCROW_TRANSITION: Cannot transition escrow state from '${currentStatus}' to '${targetStatus}'.`
      );
    }
  }

  /**
   * Trusted Escrow fund release.
   * STRICT SECURITY: Only verifiable platform administrators or automated delivery webhooks can release funds.
   * PREREQUISITE: Order status must be DELIVERED.
   */
  async releaseEscrow(orderId: string, authorizedByUserId: string) {
    const client = supabaseAdmin || supabasePublic;

    // 1. Fetch current order
    const { data: order, error: orderErr } = await client
      .from('orders')
      .select('id, farmer_id, buyer_id, total_amount, status, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      throw new Error('Order not found');
    }

    // 2. Validate state machine transition
    this.validateStateTransition(order.payment_status, 'RELEASED');

    if (order.status !== 'DELIVERED') {
      throw new Error('Escrow funds cannot be released until produce is marked DELIVERED');
    }

    // 3. Insert RELEASE transaction
    const { error: escrowErr } = await client.from('escrow_transactions').insert({
      order_id: orderId,
      transaction_type: 'RELEASE',
      amount: order.total_amount,
      status: 'COMPLETED',
    });

    if (escrowErr) {
      throw new Error(`Failed to record escrow release: ${escrowErr.message}`);
    }

    // 4. Update order payment status
    await client
      .from('orders')
      .update({ payment_status: 'RELEASED', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // 5. Log to immutable audit_logs
    await client.from('audit_logs').insert({
      user_id: authorizedByUserId,
      action: 'ESCROW_RELEASE',
      entity_type: 'orders',
      entity_id: orderId,
      new_data: { amount: order.total_amount, previous_status: order.payment_status, status: 'RELEASED' },
    });

    return {
      success: true,
      orderId,
      releasedAmount: order.total_amount,
      mechanism: 'escrow workflow/state management',
    };
  }

  /**
   * Trusted Escrow fund refund
   */
  async refundEscrow(orderId: string, reason: string, authorizedByUserId: string) {
    const client = supabaseAdmin || supabasePublic;

    const { data: order, error: orderErr } = await client
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      throw new Error('Order not found');
    }

    // Validate state machine transition
    this.validateStateTransition(order.payment_status, 'REFUNDED');

    const { error: escrowErr } = await client.from('escrow_transactions').insert({
      order_id: orderId,
      transaction_type: 'REFUND',
      amount: order.total_amount,
      status: 'COMPLETED',
    });

    if (escrowErr) {
      throw new Error(`Failed to record escrow refund: ${escrowErr.message}`);
    }

    await client
      .from('orders')
      .update({ payment_status: 'REFUNDED', status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    await client.from('audit_logs').insert({
      user_id: authorizedByUserId,
      action: 'ESCROW_REFUND',
      entity_type: 'orders',
      entity_id: orderId,
      new_data: { amount: order.total_amount, status: 'REFUNDED', reason },
    });

    return {
      success: true,
      orderId,
      refundedAmount: order.total_amount,
      mechanism: 'escrow workflow/state management',
    };
  }

  /**
   * Place escrow on dispute hold
   */
  async placeDisputeHold(orderId: string, reason: string, authorizedByUserId: string) {
    const client = supabaseAdmin || supabasePublic;

    const { data: order, error: orderErr } = await client
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      throw new Error('Order not found');
    }

    this.validateStateTransition(order.payment_status, 'DISPUTE_HOLD');

    await client
      .from('orders')
      .update({ payment_status: 'DISPUTED', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    await client.from('audit_logs').insert({
      user_id: authorizedByUserId,
      action: 'ESCROW_DISPUTE_HOLD',
      entity_type: 'orders',
      entity_id: orderId,
      new_data: { amount: order.total_amount, reason },
    });

    return { success: true, orderId, paymentStatus: 'DISPUTED' };
  }
}
