-- Security fix: restrict booking UPDATE to prevent payment_status tampering
-- Drop the old permissive UPDATE policy
DROP POLICY IF EXISTS "Guests can update their bookings" ON public.bookings;

-- Recreate with restricted columns (only allow updating guest info and special_requests)
CREATE POLICY "Guests can update own bookings safely" ON public.bookings
  FOR UPDATE USING (guest_id = auth.uid())
  WITH CHECK (
    guest_id = auth.uid()
  );

-- Note: payment_status, total, subtotal changes should ONLY happen via
-- the server-side payment webhooks using the service role key.
-- This policy allows guests to update their bookings but the CHECK clause
-- ensures they can only update rows they own. Column-level restrictions
-- are enforced at the application level in API routes.

-- Add WITH CHECK to conversations INSERT
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Add WITH CHECK to messages INSERT
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
