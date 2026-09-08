-- ============================================================
-- 012_order_items.sql
-- ============================================================

CREATE TABLE public.order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity       NUMERIC(12, 2) NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  total_price    NUMERIC(12, 2) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT order_items_qty_positive CHECK (quantity > 0),
  CONSTRAINT order_items_price_positive CHECK (price_per_unit >= 0),
  CONSTRAINT order_items_total_positive CHECK (total_price >= 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
