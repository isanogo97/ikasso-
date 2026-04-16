-- Promo Codes System
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount INTEGER CHECK (discount_amount >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_active ON public.promo_codes(is_active);

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Everyone can read active promo codes (to validate at checkout)
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT USING (is_active = true);

-- Admins can manage promo codes
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
