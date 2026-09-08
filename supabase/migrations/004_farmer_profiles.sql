-- ============================================================
-- 004_farmer_profiles.sql
-- Extended profile for FARMER users
-- ============================================================

CREATE TABLE public.farmer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name       TEXT,
  village         TEXT,
  taluka          TEXT,
  district        TEXT,
  state           TEXT DEFAULT 'Maharashtra',
  pincode         TEXT,
  farm_size_acres NUMERIC(10, 2),
  crops           TEXT[] DEFAULT '{}',
  kyc_status      public.kyc_status_type NOT NULL DEFAULT 'PENDING',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT farmer_size_positive CHECK (farm_size_acres IS NULL OR farm_size_acres >= 0)
);

COMMENT ON TABLE public.farmer_profiles IS 'Extended farmer metadata. user_id must reference a profile with role=FARMER.';

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
