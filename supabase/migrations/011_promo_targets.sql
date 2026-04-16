-- Add targeting to promo codes
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'hote', 'client'));
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS target_emails TEXT[];
