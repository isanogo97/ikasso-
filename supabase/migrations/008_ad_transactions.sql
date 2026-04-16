-- Ad Transaction / Invoice System
CREATE TABLE IF NOT EXISTS public.ad_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('devis', 'facture', 'paiement', 'remboursement')),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  description TEXT,
  invoice_number TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_tx_sponsor ON public.ad_transactions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_ad_tx_type ON public.ad_transactions(type);

ALTER TABLE public.ad_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ad transactions" ON public.ad_transactions
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));
