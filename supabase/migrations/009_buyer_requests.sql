-- ============================================================
-- 009_buyer_requests.sql
-- Buyer purchase requests / offers on products
-- ============================================================

CREATE TABLE public.buyer_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offered_quantity NUMERIC(12, 2) NOT NULL,
  offered_price    NUMERIC(10, 2) NOT NULL,
  message          TEXT,
  status           public.request_status NOT NULL DEFAULT 'PENDING',
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT buyer_requests_qty_positive CHECK (offered_quantity > 0),
  CONSTRAINT buyer_requests_price_positive CHECK (offered_price >= 0),
  CONSTRAINT buyer_requests_not_self CHECK (buyer_id != farmer_id)
);

ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
