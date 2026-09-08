-- ============================================================
-- 008_mandi_prices.sql
-- Historical APMC/mandi market price records
-- ============================================================

CREATE TABLE public.mandi_prices (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandi_name           TEXT NOT NULL,
  apmc_code            TEXT,
  district             TEXT NOT NULL,
  state                TEXT NOT NULL DEFAULT 'Maharashtra',
  crop_name            TEXT NOT NULL,
  variety              TEXT,
  min_price            NUMERIC(10, 2),
  max_price            NUMERIC(10, 2),
  modal_price          NUMERIC(10, 2) NOT NULL,
  arrivals_quintals    NUMERIC(12, 2),
  price_date           DATE NOT NULL,
  source               public.mandi_source NOT NULL DEFAULT 'APMC_LIVE_FEED',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT mandi_prices_positive CHECK (modal_price >= 0),
  CONSTRAINT mandi_min_max CHECK (min_price IS NULL OR max_price IS NULL OR min_price <= max_price)
);

COMMENT ON TABLE public.mandi_prices IS 'Historical APMC price data. 7d/30d averages are computed via views.';

ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
