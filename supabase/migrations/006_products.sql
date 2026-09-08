-- ============================================================
-- 006_products.sql
-- Crop product listings created by farmers
-- ============================================================

CREATE TABLE public.products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  crop_name            TEXT NOT NULL,
  category             public.crop_category NOT NULL,
  variety              TEXT,
  quantity             NUMERIC(12, 2) NOT NULL,
  unit                 public.crop_unit NOT NULL DEFAULT 'kg',
  price_per_unit       NUMERIC(10, 2) NOT NULL,
  quality_grade        public.quality_grade NOT NULL DEFAULT 'Standard',
  min_order_quantity   NUMERIC(12, 2) DEFAULT 1,
  harvest_date         DATE,
  availability_date    TEXT DEFAULT 'Immediate',
  shelf_life_days      INTEGER,
  village              TEXT,
  district             TEXT,
  state                TEXT DEFAULT 'Maharashtra',
  description          TEXT,
  status               public.product_status NOT NULL DEFAULT 'ACTIVE',
  featured             BOOLEAN DEFAULT FALSE,
  organic_certified    BOOLEAN DEFAULT FALSE,
  views_count          INTEGER NOT NULL DEFAULT 0,
  requests_count       INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT products_quantity_positive CHECK (quantity >= 0),
  CONSTRAINT products_price_positive CHECK (price_per_unit >= 0),
  CONSTRAINT products_min_order_positive CHECK (min_order_quantity IS NULL OR min_order_quantity >= 0),
  CONSTRAINT products_shelf_life_positive CHECK (shelf_life_days IS NULL OR shelf_life_days >= 0),
  CONSTRAINT products_views_positive CHECK (views_count >= 0),
  CONSTRAINT products_requests_positive CHECK (requests_count >= 0)
);

COMMENT ON TABLE public.products IS 'Crop listings created by farmers for the marketplace.';

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
