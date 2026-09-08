-- ============================================================
-- 019_audit_logs.sql
-- Immutable administrative audit trail
-- ============================================================

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail. No UPDATE or DELETE allowed via client.';

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
