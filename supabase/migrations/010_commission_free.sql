-- Add commission_free_until to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_free_until TIMESTAMPTZ;
