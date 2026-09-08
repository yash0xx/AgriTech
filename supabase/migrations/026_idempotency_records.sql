-- ============================================================
-- 026_idempotency_records.sql
-- Idempotency tracking table to prevent duplicate financial/order transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.idempotency_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT UNIQUE NOT NULL,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_path    TEXT NOT NULL,
  request_hash    TEXT NOT NULL,
  response_status INT NOT NULL,
  response_data   JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

COMMENT ON TABLE public.idempotency_records IS 'Stores transaction idempotency keys, hashes, and responses to guarantee at-most-once financial semantics.';

CREATE INDEX IF NOT EXISTS idx_idempotency_records_key ON public.idempotency_records(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_records_user ON public.idempotency_records(user_id);

ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and insert own idempotency records"
  ON public.idempotency_records FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
