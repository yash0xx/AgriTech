-- ============================================================
-- 024_indexes.sql
-- Performance indexes for high-frequency queries and joins
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);

-- Farmer & Buyer Profiles
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_district ON public.farmer_profiles(district);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_district ON public.buyer_profiles(district);

-- Products & Listings
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_status_category ON public.products(status, category);
CREATE INDEX IF NOT EXISTS idx_products_district ON public.products(district);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- Mandi Prices
CREATE INDEX IF NOT EXISTS idx_mandi_prices_crop_date ON public.mandi_prices(crop_name, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_mandi_state ON public.mandi_prices(mandi_name, state);

-- Requests & Counters
CREATE INDEX IF NOT EXISTS idx_buyer_requests_buyer ON public.buyer_requests(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_farmer ON public.buyer_requests(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_product ON public.buyer_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_request_counters_request ON public.request_counters(request_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON public.orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_status ON public.orders(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_milestones_order_id ON public.order_milestones(order_id);

-- Escrow & Logistics
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_order_id ON public.escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_bookings_order_id ON public.logistics_bookings(order_id);

-- Notifications & KYC
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_kyc_records_user_id ON public.kyc_records(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);

-- Audit & Team
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_entity ON public.audit_logs(user_id, entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(team_role);
