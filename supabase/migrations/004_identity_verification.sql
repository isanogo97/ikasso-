-- Identity Verification System
CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('nina', 'passport', 'id_card', 'driver_license')),
  document_number TEXT,
  document_front_url TEXT,
  document_back_url TEXT,
  face_front_url TEXT,
  face_left_url TEXT,
  face_right_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verif_user ON public.identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verif_status ON public.identity_verifications(status);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS identity_verification_id UUID;

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own verifications" ON public.identity_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit verifications" ON public.identity_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update verifications" ON public.identity_verifications FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

INSERT INTO storage.buckets (id, name, public) VALUES ('identity-docs', 'identity-docs', false) ON CONFLICT (id) DO NOTHING;
