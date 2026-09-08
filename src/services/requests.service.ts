import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BuyerRequest, RequestStatus } from '../types';

export interface CreateBuyerRequestInput {
  productId: string;
  offeredQuantity: number;
  offeredPrice: number;
  message?: string;
  expiresInDays?: number;
}

export const requestsService = {
  /**
   * Fetch buyer requests involving the authenticated user (farmer or buyer)
   */
  async getRequests(): Promise<BuyerRequest[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('buyer_requests')
        .select(`
          *,
          product:products(
            id,
            title,
            crop_name,
            unit,
            price_per_unit,
            quantity
          ),
          buyer:profiles!buyer_requests_buyer_id_fkey(
            id,
            full_name,
            avatar_url,
            phone
          ),
          buyer_profile:buyer_profiles!buyer_requests_buyer_id_fkey(
            business_name,
            buyer_type,
            operating_city,
            operating_state
          ),
          farmer:profiles!buyer_requests_farmer_id_fkey(
            id,
            full_name
          ),
          counters:request_counters(
            id,
            offered_by,
            price,
            quantity,
            note,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching buyer requests:', error);
        throw error;
      }

      if (!data) return [];

      return data.map((r: any) => {
        const cropName = r.product?.crop_name || r.product?.title || 'Crop Produce';
        const qty = Number(r.offered_quantity);
        const price = Number(r.offered_price);

        // Map status enum to frontend format
        let status: RequestStatus = 'Pending';
        if (r.status === 'ACCEPTED') status = 'Accepted';
        else if (r.status === 'DECLINED') status = 'Declined';
        else if (r.status === 'COUNTER_OFFERED') status = 'Counter Offered';
        else if (r.status === 'CANCELLED') status = 'Declined';

        // Check latest counter offer
        const sortedCounters = (r.counters || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestCounter = sortedCounters[0];

        return {
          id: r.id,
          buyerId: r.buyer_id,
          buyerName: r.buyer?.full_name || 'Verified Buyer',
          buyerType: r.buyer_profile?.buyer_type || 'Wholesaler',
          buyerAvatar: r.buyer?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          buyerLocation: `${r.buyer_profile?.operating_city || 'APMC Yard'}, ${r.buyer_profile?.operating_state || 'Maharashtra'}`,
          productId: r.product_id,
          cropName,
          farmerId: r.farmer_id,
          requestedQuantity: qty,
          unit: r.product?.unit || 'kg',
          offeredPrice: price,
          totalOfferedValue: qty * price,
          status,
          counterPrice: latestCounter ? Number(latestCounter.price) : undefined,
          counterNote: latestCounter ? latestCounter.note : undefined,
          message: r.message || 'Direct procurement proposal',
          createdAt: r.created_at,
        };
      });
    } catch (err) {
      console.error('requestsService.getRequests failed:', err);
      throw err;
    }
  },

  /**
   * Create a new purchase request / offer on a product (Buyer authenticated)
   */
  async createRequest(input: CreateBuyerRequestInput): Promise<{ request?: BuyerRequest; error?: string }> {
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        return { error: 'Authentication required to submit proposals.' };
      }

      // Fetch product to resolve actual farmer_id
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('id, farmer_id, crop_name, title, unit')
        .eq('id', input.productId)
        .single();

      if (prodErr || !prod) {
        return { error: 'The specified product listing was not found.' };
      }

      if (prod.farmer_id === userData.user.id) {
        return { error: 'You cannot submit an offer on your own product listing.' };
      }

      const { data: newReq, error: insertErr } = await supabase
        .from('buyer_requests')
        .insert({
          product_id: prod.id,
          buyer_id: userData.user.id,
          farmer_id: prod.farmer_id,
          offered_quantity: input.offeredQuantity,
          offered_price: input.offeredPrice,
          message: input.message?.trim() || null,
          status: 'PENDING',
        })
        .select('*')
        .single();

      if (insertErr || !newReq) {
        return { error: insertErr?.message || 'Failed to submit proposal.' };
      }

      return {
        request: {
          id: newReq.id,
          buyerId: newReq.buyer_id,
          buyerName: 'You',
          buyerType: 'Commercial Buyer',
          buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          buyerLocation: 'APMC Yard',
          productId: prod.id,
          cropName: prod.crop_name || prod.title,
          requestedQuantity: Number(newReq.offered_quantity),
          unit: prod.unit || 'kg',
          offeredPrice: Number(newReq.offered_price),
          totalOfferedValue: Number(newReq.offered_quantity) * Number(newReq.offered_price),
          status: 'Pending',
          message: newReq.message,
          createdAt: newReq.created_at,
        },
      };
    } catch (err: any) {
      return { error: err.message || 'Unexpected error creating proposal.' };
    }
  },

  /**
   * Submit an immutable counter offer record and update request status
   */
  async sendCounterOffer(
    requestId: string,
    counterPrice: number,
    counterQuantity?: number,
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { success: false, error: 'Authentication required to submit counter-offers.' };
      }

      // 1. Insert into immutable request_counters table
      const { error: counterErr } = await supabase.from('request_counters').insert({
        request_id: requestId,
        offered_by: userData.user.id,
        price: counterPrice,
        quantity: counterQuantity || null,
        note: note || 'Counter proposal submitted',
      });

      if (counterErr) {
        return { success: false, error: counterErr.message };
      }

      // 2. Update buyer_request status to COUNTER_OFFERED
      const { error: updateErr } = await supabase
        .from('buyer_requests')
        .update({ status: 'COUNTER_OFFERED' })
        .eq('id', requestId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit counter offer.' };
    }
  },

  /**
   * Accept a buyer request / counter offer
   */
  async acceptRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('buyer_requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to accept proposal.' };
    }
  },

  /**
   * Decline a buyer request
   */
  async declineRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('buyer_requests')
        .update({ status: 'DECLINED' })
        .eq('id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to decline proposal.' };
    }
  },
};
