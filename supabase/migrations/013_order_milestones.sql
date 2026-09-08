-- ============================================================
-- 013_order_milestones.sql
-- ============================================================

CREATE TABLE public.order_milestones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     public.order_status NOT NULL,
  location   TEXT,
  note       TEXT,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_milestones IS 'Complete order timeline. Append-only history.';

ALTER TABLE public.order_milestones ENABLE ROW LEVEL SECURITY;
