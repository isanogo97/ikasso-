-- Sponsors / Advertising System
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  property_id UUID,
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('standard', 'premium', 'elite')),
  amount_paid INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'FCFA',
  payment_method TEXT,
  payment_reference TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsors_dates ON public.sponsors(start_date, end_date);

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sponsors" ON public.sponsors
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Public read active sponsors" ON public.sponsors
  FOR SELECT USING (is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);
