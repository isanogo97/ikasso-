-- Incident/Ticket System
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'on_hold', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by_admin TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incident_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'user', 'system')),
  sender_name TEXT,
  content TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_user ON public.incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incident_messages_incident ON public.incident_messages(incident_id);

-- RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_messages ENABLE ROW LEVEL SECURITY;

-- Users can see their own incidents
CREATE POLICY "Users see own incidents" ON public.incidents
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins manage incidents" ON public.incidents
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Users see own incident messages" ON public.incident_messages
  FOR SELECT USING (incident_id IN (SELECT id FROM public.incidents WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage incident messages" ON public.incident_messages
  FOR ALL USING (
    incident_id IN (
      SELECT id FROM public.incidents
    ) AND auth.uid() IN (SELECT user_id FROM public.admin_users)
  );
