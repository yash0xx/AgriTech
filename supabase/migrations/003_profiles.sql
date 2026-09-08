-- ============================================================
-- 003_profiles.sql
-- Core user profiles linked to auth.users
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  role        public.user_role NOT NULL,
  status      public.profile_status NOT NULL DEFAULT 'ACTIVE',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Platform user profiles. 1:1 with auth.users. Role determines access level.';
COMMENT ON COLUMN public.profiles.role IS 'FARMER, BUYER, or ADMIN. Cannot be changed by the user.';
COMMENT ON COLUMN public.profiles.status IS 'ACTIVE, SUSPENDED, or PENDING. Controls application access.';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
