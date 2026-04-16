ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;
