-- ============================================================
-- 011_orders.sql
-- ============================================================

CREATE TABLE public.orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number           TEXT NOT NULL UNIQUE,
  buyer_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subtotal               NUMERIC(12, 2) NOT NULL DEFAULT 0,
  logistics_cost         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  platform_fee           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status                 public.order_status NOT NULL DEFAULT 'PLACED',
  payment_status         public.payment_status NOT NULL DEFAULT 'PENDING',
  delivery_address       TEXT,
  delivery_district      TEXT,
  delivery_state         TEXT,
  expected_delivery_date DATE,
  special_instructions   TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT orders_subtotal_positive CHECK (subtotal >= 0),
  CONSTRAINT orders_logistics_positive CHECK (logistics_cost >= 0),
  CONSTRAINT orders_fee_positive CHECK (platform_fee >= 0),
  CONSTRAINT orders_total_positive CHECK (total_amount >= 0),
  CONSTRAINT orders_not_self CHECK (buyer_id != farmer_id)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
