-- Security compliance fixes

-- 1. Missing DELETE policies
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = guest_id);

CREATE POLICY "Guests can delete own bookings" ON public.bookings
  FOR DELETE USING (auth.uid() = guest_id AND status IN ('pending', 'cancelled'));

CREATE POLICY "Admins manage admin_users" ON public.admin_users
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users WHERE role = 'super_admin')
  );

-- 2. Missing indexes on user_id
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_user_id ON public.sponsors(user_id);
