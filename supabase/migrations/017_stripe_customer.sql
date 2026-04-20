-- Add stripe_customer_id to profiles for saved payment methods
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
