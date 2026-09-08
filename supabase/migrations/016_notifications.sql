-- ============================================================
-- 016_notifications.sql
-- ============================================================

CREATE TABLE public.notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           public.notification_type NOT NULL DEFAULT 'SYSTEM',
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  reference_type TEXT,
  reference_id   UUID,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
