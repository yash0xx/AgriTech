-- ============================================================
-- 010_request_counters.sql
-- Append-only negotiation history for buyer requests
-- ============================================================

CREATE TABLE public.request_counters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES public.buyer_requests(id) ON DELETE CASCADE,
  offered_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  price       NUMERIC(10, 2) NOT NULL,
  quantity    NUMERIC(12, 2),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT counters_price_positive CHECK (price >= 0),
  CONSTRAINT counters_qty_positive CHECK (quantity IS NULL OR quantity > 0)
);

COMMENT ON TABLE public.request_counters IS 'Immutable negotiation history. Never overwrite previous counter-offers.';

ALTER TABLE public.request_counters ENABLE ROW LEVEL SECURITY;
