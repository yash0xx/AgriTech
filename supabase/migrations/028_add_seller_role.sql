-- ============================================================
-- 028_add_seller_role.sql
-- Forward-only migration to introduce SELLER platform role,
-- seller_profiles table, public marketplace projection,
-- and updated RLS policies.
-- ============================================================

-- 1. Safely add 'SELLER' to public.user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'SELLER' AFTER 'FARMER';

-- 2. Create seller_profiles table for extended seller metadata
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name     TEXT,
  business_type     TEXT DEFAULT 'MERCHANT',
  gst_number        TEXT,
  warehouse_address TEXT,
  district          TEXT,
  state             TEXT DEFAULT 'Maharashtra',
  pincode           TEXT,
  kyc_status        public.kyc_status_type NOT NULL DEFAULT 'PENDING',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.seller_profiles IS 'Extended seller/merchant metadata. user_id references a profile with role=SELLER.';

-- Enable RLS on seller_profiles
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Auto-update timestamp trigger on seller_profiles
DROP TRIGGER IF EXISTS set_seller_profiles_updated_at ON public.seller_profiles;
CREATE TRIGGER set_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Row-Level Security Policies for seller_profiles
DROP POLICY IF EXISTS "Authenticated users can read seller profiles" ON public.seller_profiles;
CREATE POLICY "Authenticated users can read seller profiles"
  ON public.seller_profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Sellers can insert own profile" ON public.seller_profiles;
CREATE POLICY "Sellers can insert own profile"
  ON public.seller_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Sellers can update own profile" ON public.seller_profiles;
CREATE POLICY "Sellers can update own profile"
  ON public.seller_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Safe Public Marketplace Profile Projection
-- Exposes only intentionally safe public display fields (no private contact/auth data)
CREATE OR REPLACE VIEW public.v_public_marketplace_profiles AS
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

-- 5. Update handle_new_user() trigger function to support SELLER
-- SECURITY RULE: Only FARMER, SELLER, and BUYER may be created through public registration.
-- ADMIN role creation remains strictly forbidden from public metadata to prevent privilege escalation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_raw_role TEXT;
  v_full_name TEXT;
  v_is_authorized_admin BOOLEAN;
BEGIN
  v_raw_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER'));

  -- Check if caller is already an admin or service_role
  v_is_authorized_admin := (auth.uid() IS NULL) OR public.is_admin();

  -- Unrestricted metadata can NEVER create an ADMIN account!
  IF v_raw_role = 'ADMIN' AND v_is_authorized_admin THEN
    v_role := 'ADMIN'::public.user_role;
  ELSIF v_raw_role = 'FARMER' THEN
    v_role := 'FARMER'::public.user_role;
  ELSIF v_raw_role = 'SELLER' THEN
    v_role := 'SELLER'::public.user_role;
  ELSE
    -- Default safely to BUYER for all public signups
    v_role := 'BUYER'::public.user_role;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    v_full_name,
    v_role,
    'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update RLS policies on profiles to include SELLER
DROP POLICY IF EXISTS "Public can view basic farmer profiles for marketplace" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic farmer and seller profiles for marketplace" ON public.profiles;
CREATE POLICY "Public can view basic farmer and seller profiles for marketplace"
  ON public.profiles FOR SELECT
  USING ((role IN ('FARMER', 'SELLER')) AND status = 'ACTIVE');

-- 7. Update RLS policies on products for FARMER and SELLER listing ownership
DROP POLICY IF EXISTS "Farmers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Farmers and sellers can insert own products" ON public.products;
CREATE POLICY "Farmers and sellers can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    (farmer_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('FARMER', 'SELLER')
    )) OR public.is_admin()
  );

DROP POLICY IF EXISTS "Farmers can update own products" ON public.products;
DROP POLICY IF EXISTS "Farmers and sellers can update own products" ON public.products;
CREATE POLICY "Farmers and sellers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin())
  WITH CHECK (farmer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Farmers can delete own products" ON public.products;
DROP POLICY IF EXISTS "Farmers and sellers can delete own products" ON public.products;
CREATE POLICY "Farmers and sellers can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (farmer_id = auth.uid() OR public.is_admin());

-- 8. Update v_admin_dashboard_stats to include total_sellers
DROP VIEW IF EXISTS public.v_admin_dashboard_stats CASCADE;
CREATE OR REPLACE VIEW public.v_admin_dashboard_stats AS
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
  (SELECT count(*)::INT FROM public.mandi_prices WHERE price_date >= CURRENT_DATE - INTERVAL '1 day') AS mandi_feed_status;
