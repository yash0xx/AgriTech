export class LogisticsService {
  /**
   * Trusted freight and distance estimate calculation
   */
  calculateLogisticsQuote(distanceKm: number, weightKg: number, vehicleType: string) {
    if (distanceKm <= 0 || weightKg <= 0) {
      throw new Error('Distance and weight must be positive numbers');
    }

    let baseRatePerKm = 18.0;
    let baseFare = 600.0;

    switch (vehicleType) {
      case 'MINI_TRUCK':
        baseRatePerKm = 16.0;
        baseFare = 500.0;
        break;
      case 'LCV':
        baseRatePerKm = 24.0;
        baseFare = 1100.0;
        break;
      case 'HEAVY_TRUCK':
        baseRatePerKm = 38.0;
        baseFare = 2400.0;
        break;
      case 'COLD_STORAGE':
        baseRatePerKm = 32.0;
        baseFare = 1800.0;
        break;
      default:
        baseRatePerKm = 20.0;
        baseFare = 700.0;
    }

    // Weight surcharge if exceeding 2000kg
    const excessWeight = Math.max(0, weightKg - 2000);
    const weightSurcharge = (excessWeight / 100) * 15.0;

    const freightCost = Math.round((baseFare + distanceKm * baseRatePerKm + weightSurcharge) * 100) / 100;
    const transitHoursEstimate = Math.ceil(distanceKm / 45) + 1; // 45 km/h avg rural highway

    return {
      distanceKm,
      weightKg,
      vehicleType,
      baseFare,
      baseRatePerKm,
      weightSurcharge,
      estimatedCost: freightCost,
      estimatedHours: transitHoursEstimate,
    };
  }

  /**
   * Create persistent logistics booking with server-calculated freight
   */
  async createBooking(params: {
    userId: string;
    role: string;
    farmerId?: string;
    buyerId?: string;
    orderId?: string;
    pickupLocation: string;
    deliveryLocation: string;
    distanceKm: number;
    weightKg: number;
    vehicleType?: string;
  }) {
    const { supabaseAdmin, supabasePublic } = await import('../../config/supabase');
    const client = supabaseAdmin || supabasePublic;

    const vehicle = params.vehicleType || 'MINI_TRUCK';
    const quote = this.calculateLogisticsQuote(params.distanceKm, params.weightKg, vehicle);

    // Derive parties
    let farmerId = params.farmerId;
    let buyerId = params.buyerId;

    if (params.orderId) {
      const { data: order } = await client
        .from('orders')
        .select('farmer_id, buyer_id')
        .eq('id', params.orderId)
        .single();

      if (order) {
        farmerId = order.farmer_id;
        buyerId = order.buyer_id;
      }
    }

    if (!farmerId && (params.role === 'FARMER' || params.role === 'SELLER')) farmerId = params.userId;
    if (!buyerId && params.role === 'BUYER') buyerId = params.userId;

    if (!farmerId || !buyerId) {
      // Fallback to active user as one party and system/other party
      if (params.role === 'FARMER' || params.role === 'SELLER') {
        farmerId = params.userId;
        buyerId = buyerId || params.userId;
      } else {
        buyerId = params.userId;
        farmerId = farmerId || params.userId;
      }
    }

    const bookingRef = `LOG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const { data: booking, error } = await client
      .from('logistics_bookings')
      .insert({
        booking_ref: bookingRef,
        order_id: params.orderId || null,
        farmer_id: farmerId,
        buyer_id: buyerId,
        pickup_location: params.pickupLocation,
        delivery_location: params.deliveryLocation,
        distance_km: params.distanceKm,
        weight_kg: params.weightKg,
        vehicle_type: vehicle,
        freight_cost: quote.estimatedCost,
        status: 'REQUESTED',
        driver_name: 'Driver Assigned upon Dispatch',
        driver_phone: '+91 98000 12345',
        vehicle_number: 'MH-15-AG-' + Math.floor(1000 + Math.random() * 9000),
      })
      .select()
      .single();

    if (error || !booking) {
      throw new Error(`Failed to create logistics booking: ${error?.message || 'DB Error'}`);
    }

    return booking;
  }

  async getBookingById(bookingId: string, userId: string, isAdmin: boolean) {
    const { supabaseAdmin, supabasePublic } = await import('../../config/supabase');
    const client = supabaseAdmin || supabasePublic;

    const { data: booking, error } = await client
      .from('logistics_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Logistics booking not found');
    }

    if (!isAdmin && booking.farmer_id !== userId && booking.buyer_id !== userId) {
      throw new Error('Access denied to this booking');
    }

    return booking;
  }

  async updateBookingStatus(bookingId: string, status: string, userId: string, isAdmin: boolean) {
    const { supabaseAdmin, supabasePublic } = await import('../../config/supabase');
    const client = supabaseAdmin || supabasePublic;

    // Validate access
    await this.getBookingById(bookingId, userId, isAdmin);

    const validStatuses = ['REQUESTED', 'CONFIRMED', 'PICKUP_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
    }

    const { data: updated, error } = await client
      .from('logistics_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update booking status: ${error?.message}`);
    }

    return updated;
  }
}
