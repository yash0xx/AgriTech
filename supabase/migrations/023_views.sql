-- ============================================================
-- 023_views.sql
-- Helpful analytical and presentation views for AgriTech
-- ============================================================

-- 1. Active Marketplace Listings View
CREATE OR REPLACE VIEW public.marketplace_listings AS
SELECT
  p.id,
  p.title,
  p.crop_name,
  p.category,
  p.variety,
  p.quantity,
  p.unit,
  p.price_per_unit,
  p.quality_grade,
  p.min_order_quantity,
  p.harvest_date,
  p.availability_date,
  p.shelf_life_days,
  p.village,
  p.district,
  p.state,
  p.description,
  p.status,
  p.featured,
  p.organic_certified,
  p.views_count,
  p.requests_count,
  p.created_at,
  p.updated_at,
  p.farmer_id,
  prof.full_name AS farmer_name,
  fp.farm_name,
  fp.kyc_status AS farmer_kyc_status,
  (
    SELECT pi.image_url
    FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.sort_order ASC
    LIMIT 1
  ) AS primary_image_url
FROM public.products p
JOIN public.profiles prof ON p.farmer_id = prof.id
LEFT JOIN public.farmer_profiles fp ON p.farmer_id = fp.user_id
WHERE p.status = 'ACTIVE';

-- 2. Team Members View (Admin Only)
CREATE OR REPLACE VIEW public.team_members_overview AS
SELECT
  tm.id AS team_member_id,
  tm.user_id,
  u.email,
  tm.display_name,
  tm.team_role,
  tm.is_active,
  tm.assigned_at,
  prof.full_name,
  prof.role AS platform_role,
  prof.status AS account_status,
  assigner.full_name AS assigned_by_name
FROM public.team_members tm
JOIN public.profiles prof ON tm.user_id = prof.id
LEFT JOIN auth.users u ON tm.user_id = u.id
LEFT JOIN public.profiles assigner ON tm.assigned_by = assigner.id;

-- 3. Order Details View
CREATE OR REPLACE VIEW public.order_overview AS
SELECT
  o.id,
  o.order_number,
  o.buyer_id,
  buyer_prof.full_name AS buyer_name,
  bp.business_name AS buyer_business,
  o.farmer_id,
  farmer_prof.full_name AS farmer_name,
  o.total_amount,
  o.status AS order_status,
  o.payment_status,
  o.delivery_address,
  o.delivery_district,
  o.delivery_state,
  o.created_at,
  o.updated_at
FROM public.orders o
JOIN public.profiles buyer_prof ON o.buyer_id = buyer_prof.id
LEFT JOIN public.buyer_profiles bp ON o.buyer_id = bp.user_id
JOIN public.profiles farmer_prof ON o.farmer_id = farmer_prof.id;

-- 4. Admin Dashboard Aggregate Statistics View
CREATE OR REPLACE VIEW public.v_admin_dashboard_stats AS
SELECT
  (SELECT count(*)::INT FROM public.profiles WHERE status != 'SUSPENDED') AS total_users,
  (SELECT count(*)::INT FROM public.profiles WHERE role = 'FARMER') AS total_farmers,
  (SELECT count(*)::INT FROM public.profiles WHERE role = 'BUYER') AS total_buyers,
  (SELECT count(*)::INT FROM public.products WHERE status = 'ACTIVE') AS active_products,
  (SELECT count(*)::INT FROM public.products WHERE status = 'ACTIVE') AS active_listings,
  (SELECT count(*)::INT FROM public.orders) AS total_orders,
  (SELECT COALESCE(sum(total_amount), 0)::NUMERIC(14,2) FROM public.orders WHERE status != 'CANCELLED') AS gmv,
  (SELECT COALESCE(sum(total_amount), 0)::NUMERIC(14,2) FROM public.orders WHERE payment_status = 'HELD_IN_ESCROW') AS escrow_volume,
  (SELECT count(*)::INT FROM public.disputes WHERE status IN ('OPEN', 'UNDER_REVIEW')) AS pending_disputes,
  (SELECT count(*)::INT FROM public.kyc_records WHERE status = 'PENDING') AS kyc_pending,
  (SELECT count(*)::INT FROM public.mandi_prices WHERE price_date >= CURRENT_DATE - INTERVAL '1 day') AS mandi_feed_status;
