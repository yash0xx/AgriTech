-- ============================================================
-- 018_kyc_records.sql
-- KYC compliance and verification records
-- ============================================================

CREATE TABLE public.kyc_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type    TEXT NOT NULL,
  document_number  TEXT NOT NULL,
  document_url     TEXT,
  status           public.kyc_status_type NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  verified_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.kyc_records IS 'KYC verification documents for farmers and buyers, reviewed by admins.';

ALTER TABLE public.kyc_records ENABLE ROW LEVEL SECURITY;
