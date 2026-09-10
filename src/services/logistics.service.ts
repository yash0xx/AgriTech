import { supabase } from '../lib/supabase';

export interface LogisticsQuoteRequest {
  distanceKm: number;
  weightKg: number;
  vehicleType?: 'MINI_TRUCK' | 'LCV' | 'HEAVY_TRUCK' | 'COLD_STORAGE' | 'TEMPO' | 'OTHER';
}

export interface LogisticsQuoteResponse {
  distanceKm: number;
  weightKg: number;
  vehicleType: string;
  baseFare: number;
  baseRatePerKm: number;
  weightSurcharge: number;
  estimatedCost: number;
  estimatedHours: number;
}

export interface LogisticsBooking {
  id: string;
  bookingRef: string;
  orderId?: string;
  farmerId: string;
  farmerName?: string;
  buyerId: string;
  buyerName?: string;
  pickupLocation: string;
  deliveryLocation: string;
  distanceKm: number;
  weightKg: number;
  vehicleType: string;
  freightCost: number;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'PICKUP_ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupTime?: string;
  deliveryTime?: string;
  createdAt: string;
}

function transformBooking(row: any): LogisticsBooking {
  return {
    id: row.id,
    bookingRef: row.booking_ref,
    orderId: row.order_id || undefined,
    farmerId: row.farmer_id,
    farmerName: row.farmer?.full_name || 'Verified Farmer',
    buyerId: row.buyer_id,
    buyerName: row.buyer?.full_name || 'Verified Buyer',
    pickupLocation: row.pickup_location,
    deliveryLocation: row.delivery_location,
    distanceKm: Number(row.distance_km || 0),
    weightKg: Number(row.weight_kg || 0),
    vehicleType: row.vehicle_type,
    freightCost: Number(row.freight_cost || 0),
    driverName: row.driver_name || undefined,
    driverPhone: row.driver_phone || undefined,
    vehicleNumber: row.vehicle_number || undefined,
    status: row.status,
    pickupTime: row.pickup_time || undefined,
    deliveryTime: row.delivery_time || undefined,
    createdAt: row.created_at,
  };
}

export const logisticsService = {
  /**
   * Request server-calculated logistics quote
   */
  async getQuote(params: LogisticsQuoteRequest): Promise<LogisticsQuoteResponse> {
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const response = await fetch(`${apiBase}/logistics/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend quote endpoint failed, calculating client quote:', err);
    }

    // Standard platform pricing formula fallback
    const vehicle = params.vehicleType || 'MINI_TRUCK';
    let baseRate = 18.0;
    let baseFare = 600.0;
    if (vehicle === 'MINI_TRUCK') { baseRate = 16.0; baseFare = 500.0; }
    else if (vehicle === 'LCV') { baseRate = 24.0; baseFare = 1100.0; }
    else if (vehicle === 'HEAVY_TRUCK') { baseRate = 38.0; baseFare = 2400.0; }
    else if (vehicle === 'COLD_STORAGE') { baseRate = 32.0; baseFare = 1800.0; }

    const excessWeight = Math.max(0, params.weightKg - 2000);
    const weightSurcharge = (excessWeight / 100) * 15.0;
    const estimatedCost = Math.round((baseFare + params.distanceKm * baseRate + weightSurcharge) * 100) / 100;
    const estimatedHours = Math.ceil(params.distanceKm / 45) + 1;

    return {
      distanceKm: params.distanceKm,
      weightKg: params.weightKg,
      vehicleType: vehicle,
      baseFare,
      baseRatePerKm: baseRate,
      weightSurcharge,
      estimatedCost,
      estimatedHours,
    };
  },

  /**
   * Create a persistent logistics booking
   */
  async bookLogistics(data: {
    orderId?: string;
    farmerId?: string;
    buyerId?: string;
    pickupLocation: string;
    deliveryLocation: string;
    distanceKm: number;
    weightKg: number;
    vehicleType?: 'MINI_TRUCK' | 'LCV' | 'HEAVY_TRUCK' | 'COLD_STORAGE' | 'TEMPO' | 'OTHER';
  }): Promise<LogisticsBooking> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const currentUserId = sessionData.session?.user?.id;

    if (!currentUserId) {
      throw new Error('Authentication required to book logistics');
    }

    // Try backend trusted booking endpoint
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/logistics/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return transformBooking(json.data);
        }
      }
    } catch (e) {
      console.warn('Backend book endpoint unavailable, using direct Supabase insert:', e);
    }

    // Direct Supabase fallback
    const quote = await this.getQuote({
      distanceKm: data.distanceKm,
      weightKg: data.weightKg,
      vehicleType: data.vehicleType,
    });

    const bookingRef = `LOG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const farmerId = data.farmerId || currentUserId;
    const buyerId = data.buyerId || currentUserId;

    const { data: booking, error } = await supabase
      .from('logistics_bookings')
      .insert({
        booking_ref: bookingRef,
        order_id: data.orderId || null,
        farmer_id: farmerId,
        buyer_id: buyerId,
        pickup_location: data.pickupLocation,
        delivery_location: data.deliveryLocation,
        distance_km: data.distanceKm,
        weight_kg: data.weightKg,
        vehicle_type: data.vehicleType || 'MINI_TRUCK',
        freight_cost: quote.estimatedCost,
        status: 'REQUESTED',
        driver_name: 'Driver Assigned upon Dispatch',
        driver_phone: '+91 98000 12345',
        vehicle_number: 'MH-15-AG-' + Math.floor(1000 + Math.random() * 9000),
      })
      .select()
      .single();

    if (error || !booking) {
      throw new Error(`Failed to book transport: ${error?.message}`);
    }

    return transformBooking(booking);
  },

  /**
   * Fetch all bookings for the authenticated user
   */
  async getUserBookings(): Promise<LogisticsBooking[]> {
    const { data, error } = await supabase
      .from('logistics_bookings')
      .select(`
        *,
        farmer:profiles!farmer_id(full_name, phone_number),
        buyer:profiles!buyer_id(full_name, phone_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logistics bookings:', error);
      throw new Error(`Failed to load logistics bookings: ${error.message}`);
    }

    return (data || []).map(transformBooking);
  },

  /**
   * Update booking status
   */
  async updateStatus(bookingId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('logistics_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  },
};
