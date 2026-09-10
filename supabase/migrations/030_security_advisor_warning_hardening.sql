-- ============================================================
-- 030_security_advisor_warning_hardening.sql
-- Resolves Supabase Security Advisor warnings:
--   1. is_admin()             → Move to private schema
--   2. create_order_atomic()  → Revoke authenticated EXECUTE
--   3. protect_profile_role() → Revoke authenticated EXECUTE
--   4. protect_team_members() → Revoke authenticated EXECUTE
--   5. product-images storage → Narrow SELECT policy
--
-- NON-DESTRUCTIVE. Forward-only. Does NOT modify 001–029.
-- ============================================================

-- ============================================================
-- PART 1: PRIVATE SCHEMA FOR PRIVILEGED HELPER FUNCTIONS
-- ============================================================

-- Create private schema (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

-- Least-privilege grants on schema
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
-- anon does NOT get USAGE — no anonymous code path needs is_admin()

-- ============================================================
-- PART 2: MOVE is_admin() CORE LOGIC TO private SCHEMA
-- ============================================================

-- Create the actual privileged implementation in private schema.
-- This is the ONLY copy that runs as SECURITY DEFINER.
-- It mirrors the existing public.is_admin() logic exactly.
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
  );
END;
$$;

-- Grant EXECUTE to authenticated (needed by RLS) and service_role
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;
-- Revoke from anon and PUBLIC on private function
REVOKE EXECUTE ON FUNCTION private.is_admin() FROM anon, PUBLIC;

-- ============================================================
-- PART 3: REPLACE public.is_admin() WITH SECURITY INVOKER WRAPPER
-- ============================================================

-- Replace the existing SECURITY DEFINER function with a thin
-- SECURITY INVOKER wrapper. All 50+ RLS policies reference
-- public.is_admin() — they continue to work unchanged.
-- The advisor will NOT flag a SECURITY INVOKER function.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.is_admin();
$$;

-- Preserve existing grants: authenticated + service_role only
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ============================================================
-- PART 4: REVOKE AUTHENTICATED EXECUTE ON BACKEND-ONLY FUNCTION
-- create_order_atomic() is called exclusively via service_role
-- from backend/src/modules/orders/orders.service.ts
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.create_order_atomic(
  p_buyer_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_delivery_address text,
  p_delivery_district text,
  p_delivery_state text,
  p_special_instructions text,
  p_logistics_cost numeric,
  p_idempotency_key text
) FROM authenticated, anon, PUBLIC;

-- Keep service_role access (backend uses supabaseAdmin)
GRANT EXECUTE ON FUNCTION public.create_order_atomic(
  p_buyer_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_delivery_address text,
  p_delivery_district text,
  p_delivery_state text,
  p_special_instructions text,
  p_logistics_cost numeric,
  p_idempotency_key text
) TO service_role;

-- ============================================================
-- PART 5: REVOKE AUTHENTICATED EXECUTE ON TRIGGER-ONLY FUNCTIONS
-- These are invoked by PostgreSQL trigger mechanism only.
-- Triggers fire as the function owner regardless of EXECUTE grants.
-- Direct RPC calls from PostgREST are not needed and are blocked.
-- ============================================================

-- protect_profile_role() — trigger: check_profile_updates ON profiles
REVOKE EXECUTE ON FUNCTION public.protect_profile_role() FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_profile_role() TO service_role;

-- protect_team_members() — trigger: check_team_members_permission ON team_members
REVOKE EXECUTE ON FUNCTION public.protect_team_members() FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_team_members() TO service_role;

-- ============================================================
-- PART 6: NARROW STORAGE SELECT POLICY ON product-images
-- The bucket remains public=true so direct image URLs still work.
-- This only restricts the Storage API listing endpoint.
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    -- Drop the overly-broad anonymous listing policy
    DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

    -- Replace with authenticated-only listing
    DROP POLICY IF EXISTS "Authenticated users can list product images" ON storage.objects;
    CREATE POLICY "Authenticated users can list product images"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- ============================================================
-- PART 7: VERIFY handle_new_user GRANTS ARE TIGHT
-- This is a trigger-only function (on_auth_user_created on auth.users).
-- It should not be callable via PostgREST.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================================
-- PART 8: COMPREHENSIVE SECURITY DEFINER AUDIT SUMMARY
-- ============================================================
-- After this migration, the following SECURITY DEFINER functions exist
-- in the public schema:
--
-- create_order_atomic()        → EXECUTE: service_role ONLY
-- decrement_product_inventory()→ EXECUTE: service_role ONLY (from 029)
-- handle_new_user()            → EXECUTE: service_role ONLY (trigger-only)
-- protect_profile_role()       → EXECUTE: service_role ONLY (trigger-only)
-- protect_team_members()       → EXECUTE: service_role ONLY (trigger-only)
-- restore_product_inventory()  → EXECUTE: service_role ONLY (from 029)
--
-- public.is_admin() is now SECURITY INVOKER (wrapper → private.is_admin())
--
-- private.is_admin()           → EXECUTE: authenticated + service_role
--   (SECURITY DEFINER, NOT exposed by PostgREST)
--
-- All SECURITY DEFINER functions have SET search_path = ''
-- ============================================================
