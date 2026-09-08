-- ============================================================
-- 017_disputes.sql
-- Order disputes and resolution tracking
-- ============================================================

CREATE TABLE public.disputes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  raised_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  description TEXT,
  status      public.dispute_status NOT NULL DEFAULT 'OPEN',
  resolution  TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE public.disputes IS 'Order disputes raised by buyers or farmers, handled by platform admins.';

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
