-- Referral / Parrainage System
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  reward_type TEXT DEFAULT 'commission_free' CHECK (reward_type IN ('commission_free', 'visibility_boost', 'discount')),
  reward_months INTEGER DEFAULT 3,
  max_referrals INTEGER DEFAULT 10,
  current_referrals INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_id UUID REFERENCES auth.users(id),
  referred_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  commission_free_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_host ON public.referral_codes(host_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referral codes
CREATE POLICY "Users see own referral codes" ON public.referral_codes
  FOR SELECT USING (auth.uid() = host_id);

-- Anyone can validate a referral code (for registration)
CREATE POLICY "Public validate referral codes" ON public.referral_codes
  FOR SELECT USING (is_active = true);

-- Admins manage all
CREATE POLICY "Admins manage referral codes" ON public.referral_codes
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins manage referrals" ON public.referrals
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Users see own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
