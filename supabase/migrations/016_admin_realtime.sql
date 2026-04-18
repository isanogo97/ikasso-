-- Enable Supabase Realtime for admin incident tables
-- This allows instant message delivery in admin panel

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'incident_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_messages;
  END IF;
END $$;
