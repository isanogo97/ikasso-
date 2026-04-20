-- Add professional verification fields to identity_verifications
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS verification_type TEXT DEFAULT 'particulier';
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS business_registration TEXT;
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS business_doc_url TEXT;
ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS business_license_url TEXT;
