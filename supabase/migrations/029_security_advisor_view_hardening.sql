-- ============================================================
-- 029_security_advisor_view_hardening.sql
-- Forward-Only Security Advisor Remediation:
-- 1. Eliminate auth.users direct exposure in team_members_overview
-- 2. Enforce security_invoker = true on all analytical & presentation views
-- 3. Enforce strict least-privilege role grants (anon, authenticated, service_role)
-- 4. Pin immutable search_path = '' on all project functions
-- 5. Revoke unauthorized public/anon execute on SECURITY DEFINER functions
-- ============================================================

-- ------------------------------------------------------------
-- 1. HARDEN team_members AND team_members_overview
-- ------------------------------------------------------------
-- Add email column to public.team_members so team_members_overview
-- never needs to query or join auth.users directly.
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users for existing team members
UPDATE public.team_members tm
SET email = u.email
FROM auth.users u
WHERE tm.user_id = u.id AND tm.email IS NULL;

-- Recreate team_members_overview with security_invoker = true
-- and zero reference to sensitive auth.users table.
DROP VIEW IF EXISTS public.team_members_overview CASCADE;
CREATE OR REPLACE VIEW public.team_members_overview
WITH (security_invoker = true) AS
SELECT
  tm.id AS team_member_id,
  tm.user_id,
  tm.email,
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
LEFT JOIN public.profiles assigner ON tm.assigned_by = assigner.id;

-- Revoke anonymous access (internal team management is admin context only)
REVOKE ALL ON public.team_members_overview FROM anon;
REVOKE ALL ON public.team_members_overview FROM PUBLIC;
GRANT SELECT ON public.team_members_overview TO authenticated;
GRANT SELECT ON public.team_members_overview TO service_role;


-- ------------------------------------------------------------
-- 2. HARDEN marketplace_listings
-- ------------------------------------------------------------
-- Recreate marketplace_listings with security_invoker = true
-- Exposes only intentionally safe public marketplace info (no private KYC/contact)
DROP VIEW IF EXISTS public.marketplace_listings CASCADE;
CREATE OR REPLACE VIEW public.marketplace_listings
WITH (security_invoker = true) AS
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
  (CASE WHEN fp.kyc_status = 'VERIFIED' THEN 'VERIFIED' ELSE 'UNVERIFIED' END) AS farmer_kyc_status,
  (fp.kyc_status = 'VERIFIED') AS is_verified,
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

-- Grant SELECT to anon and authenticated for public marketplace
GRANT SELECT ON public.marketplace_listings TO anon, authenticated, service_role;

-- Ensure underlying table policies permit anonymous read for public active produce
DROP POLICY IF EXISTS "Public can view active products for marketplace" ON public.products;
CREATE POLICY "Public can view active products for marketplace"
  ON public.products FOR SELECT
  TO anon
  USING (status = 'ACTIVE');

DROP POLICY IF EXISTS "Public can view active product images" ON public.product_images;
CREATE POLICY "Public can view active product images"
  ON public.product_images FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Public can view farmer profiles for marketplace" ON public.farmer_profiles;
CREATE POLICY "Public can view farmer profiles for marketplace"
  ON public.farmer_profiles FOR SELECT
  TO anon
  USING (true);


-- ------------------------------------------------------------
-- 3. HARDEN order_overview
-- ------------------------------------------------------------
-- Recreate order_overview with security_invoker = true
-- Automatically enforces underlying RLS on orders (buyer, farmer, admin)
DROP VIEW IF EXISTS public.order_overview CASCADE;
CREATE OR REPLACE VIEW public.order_overview
WITH (security_invoker = true) AS
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

-- Revoke anon access from order overview
REVOKE ALL ON public.order_overview FROM anon;
REVOKE ALL ON public.order_overview FROM PUBLIC;
GRANT SELECT ON public.order_overview TO authenticated;
GRANT SELECT ON public.order_overview TO service_role;

-- Ensure order participants can read counterparty display names under security_invoker
DROP POLICY IF EXISTS "Order participants can read counterparty profile" ON public.profiles;
CREATE POLICY "Order participants can read counterparty profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE (o.buyer_id = auth.uid() AND o.farmer_id = profiles.id)
         OR (o.farmer_id = auth.uid() AND o.buyer_id = profiles.id)
    )
  );

DROP POLICY IF EXISTS "Order farmers can read counterparty buyer business" ON public.buyer_profiles;
CREATE POLICY "Order farmers can read counterparty buyer business"
  ON public.buyer_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.farmer_id = auth.uid() AND o.buyer_id = buyer_profiles.user_id
    )
  );


-- ------------------------------------------------------------
-- 4. HARDEN v_admin_dashboard_stats
-- ------------------------------------------------------------
-- Recreate v_admin_dashboard_stats with security_invoker = true
-- and explicit WHERE public.is_admin() to guarantee 0-row leakage for non-admins
DROP VIEW IF EXISTS public.v_admin_dashboard_stats CASCADE;
CREATE OR REPLACE VIEW public.v_admin_dashboard_stats
WITH (security_invoker = true) AS
SELECT
  (SELECT count(*)::INT FROM public.profiles WHERE status != 'SUSPENDED') AS total_users,
  (SELECT count(*)::INT FROM public.profiles WHERE role = 'FARMER') AS total_farmers,
  (SELECT count(*)::INT FROM public.profiles WHERE role = 'SELLER') AS total_sellers,
  (SELECT count(*)::INT FROM public.profiles WHERE role = 'BUYER') AS total_buyers,
  (SELECT count(*)::INT FROM public.products WHERE status = 'ACTIVE') AS active_products,
  (SELECT count(*)::INT FROM public.products WHERE status = 'ACTIVE') AS active_listings,
  (SELECT count(*)::INT FROM public.orders) AS total_orders,
  (SELECT COALESCE(sum(total_amount), 0)::NUMERIC(14,2) FROM public.orders WHERE status != 'CANCELLED') AS gmv,
  (SELECT COALESCE(sum(total_amount), 0)::NUMERIC(14,2) FROM public.orders WHERE payment_status = 'HELD_IN_ESCROW') AS escrow_volume,
  (SELECT count(*)::INT FROM public.disputes WHERE status IN ('OPEN', 'UNDER_REVIEW')) AS pending_disputes,
  (SELECT count(*)::INT FROM public.kyc_records WHERE status = 'PENDING') AS kyc_pending,
  (SELECT count(*)::INT FROM public.mandi_prices WHERE price_date >= CURRENT_DATE - INTERVAL '1 day') AS mandi_feed_status
WHERE public.is_admin();

-- Revoke anon access from administrative dashboard stats
REVOKE ALL ON public.v_admin_dashboard_stats FROM anon;
REVOKE ALL ON public.v_admin_dashboard_stats FROM PUBLIC;
GRANT SELECT ON public.v_admin_dashboard_stats TO authenticated;
GRANT SELECT ON public.v_admin_dashboard_stats TO service_role;


-- ------------------------------------------------------------
-- 5. HARDEN v_public_marketplace_profiles
-- ------------------------------------------------------------
-- Recreate v_public_marketplace_profiles with security_invoker = true
DROP VIEW IF EXISTS public.v_public_marketplace_profiles CASCADE;
CREATE OR REPLACE VIEW public.v_public_marketplace_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.full_name AS display_name,
  p.role,
  p.status,
  p.avatar_url,
  COALESCE(fp.district, sp.district, bp.district) AS district,
  COALESCE(fp.state, sp.state, bp.state) AS state
FROM public.profiles p
LEFT JOIN public.farmer_profiles fp ON p.id = fp.user_id
LEFT JOIN public.seller_profiles sp ON p.id = sp.user_id
LEFT JOIN public.buyer_profiles bp ON p.id = bp.user_id
WHERE p.status = 'ACTIVE';

GRANT SELECT ON public.v_public_marketplace_profiles TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public can view seller profiles for marketplace" ON public.seller_profiles;
CREATE POLICY "Public can view seller profiles for marketplace"
  ON public.seller_profiles FOR SELECT
  TO anon
  USING (true);


-- ------------------------------------------------------------
-- 6. HARDEN FUNCTIONS: PIN search_path AND RESTRICT EXECUTE
-- ------------------------------------------------------------
-- Pin search_path = '' on all project functions
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.is_admin() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.protect_profile_role() SET search_path = '';
ALTER FUNCTION public.validate_buyer_request() SET search_path = '';
ALTER FUNCTION public.protect_team_members() SET search_path = '';
ALTER FUNCTION public.generate_order_number() SET search_path = '';
ALTER FUNCTION public.decrement_product_inventory(UUID, NUMERIC) SET search_path = '';
ALTER FUNCTION public.restore_product_inventory(UUID, NUMERIC) SET search_path = '';
ALTER FUNCTION public.create_order_atomic(UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT) SET search_path = '';

-- Revoke execute on SECURITY DEFINER functions from unprivileged roles
REVOKE EXECUTE ON FUNCTION public.create_order_atomic(UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, UUID, NUMERIC, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.decrement_product_inventory(UUID, NUMERIC) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_product_inventory(UUID, NUMERIC) TO service_role;

REVOKE EXECUTE ON FUNCTION public.restore_product_inventory(UUID, NUMERIC) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_product_inventory(UUID, NUMERIC) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE EXECUTE ON FUNCTION public.protect_profile_role() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_team_members() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_buyer_request() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, PUBLIC;
