-- ============================================================
-- 020_team_members.sql
-- Internal team members table for AgriTech developers and administrators
-- ============================================================

CREATE TABLE public.team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  team_role    public.team_role NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  assigned_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.team_members IS 'Internal team members linked to profiles with role=ADMIN. Tracks dev/admin team roles (TEAM_LEAD, BACKEND, FRONTEND, DATABASE, AI_ML, QA).';
COMMENT ON COLUMN public.team_members.team_role IS 'Internal engineering/product role. Cannot be self-modified by non-authorized users.';

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
