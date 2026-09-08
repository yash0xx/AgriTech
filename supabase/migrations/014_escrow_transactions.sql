-- ============================================================
-- 014_escrow_transactions.sql
-- Financial ledger for escrow operations
-- ============================================================

CREATE TABLE public.escrow_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_type  public.escrow_transaction_type NOT NULL,
  amount            NUMERIC(12, 2) NOT NULL,
  status            public.escrow_status NOT NULL DEFAULT 'PENDING',
  payment_reference TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,

  CONSTRAINT escrow_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.escrow_transactions IS 'Financial ledger. RELEASE/REFUND must be created by service-role only.';

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
