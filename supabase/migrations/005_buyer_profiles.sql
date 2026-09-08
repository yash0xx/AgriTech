-- ============================================================
-- 005_buyer_profiles.sql
-- Extended profile for BUYER users
-- ============================================================

CREATE TABLE public.buyer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name   TEXT,
  business_type   public.buyer_type NOT NULL DEFAULT 'WHOLESALER',
  gst_number      TEXT,
  address         TEXT,
  district        TEXT,
  state           TEXT DEFAULT 'Maharashtra',
  pincode         TEXT,
  kyc_status      public.kyc_status_type NOT NULL DEFAULT 'PENDING',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.buyer_profiles IS 'Extended buyer metadata. user_id must reference a profile with role=BUYER.';

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
