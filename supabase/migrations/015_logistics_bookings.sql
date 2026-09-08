-- ============================================================
-- 015_logistics_bookings.sql
-- ============================================================

CREATE TABLE public.logistics_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref       TEXT NOT NULL UNIQUE,
  order_id          UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  farmer_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pickup_location   TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  distance_km       NUMERIC(8, 2),
  weight_kg         NUMERIC(10, 2),
  vehicle_type      public.vehicle_type NOT NULL DEFAULT 'MINI_TRUCK',
  freight_cost      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  driver_name       TEXT,
  driver_phone      TEXT,
  vehicle_number    TEXT,
  status            public.logistics_status NOT NULL DEFAULT 'REQUESTED',
  pickup_time       TIMESTAMPTZ,
  delivery_time     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT logistics_cost_positive CHECK (freight_cost >= 0),
  CONSTRAINT logistics_distance_positive CHECK (distance_km IS NULL OR distance_km >= 0),
  CONSTRAINT logistics_weight_positive CHECK (weight_kg IS NULL OR weight_kg >= 0)
);

ALTER TABLE public.logistics_bookings ENABLE ROW LEVEL SECURITY;
