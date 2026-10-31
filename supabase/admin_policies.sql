-- ============================================================
-- Admin Policies Migration
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

-- 1. is_admin() — checks JWT email (SECURITY DEFINER bypasses RLS safely)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = 'saar0246@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ),
    false
  )
$$;

-- 2. Grant admin role to saar0246@gmail.com
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'saar0246@gmail.com'
);

-- 3. profiles — admin can read all
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR is_admin());

-- 4. profiles — admin can update any
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

-- 5. events — admin can read all
DROP POLICY IF EXISTS "Admin can read all events" ON public.events;
CREATE POLICY "Admin can read all events"
ON public.events FOR SELECT TO authenticated
USING (host_id = auth.uid() OR is_admin());

-- 6. events — admin can update any
DROP POLICY IF EXISTS "Admin can update any event" ON public.events;
CREATE POLICY "Admin can update any event"
ON public.events FOR UPDATE TO authenticated
USING (host_id = auth.uid() OR is_admin())
WITH CHECK (host_id = auth.uid() OR is_admin());

-- 7. event_registrations — admin can read all
DROP POLICY IF EXISTS "Admin can read all registrations" ON public.event_registrations;
CREATE POLICY "Admin can read all registrations"
ON public.event_registrations FOR SELECT TO authenticated
USING (
  guest_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND host_id = auth.uid())
  OR is_admin()
);

-- 8. event_registrations — admin can update any
DROP POLICY IF EXISTS "Admin can update any registration" ON public.event_registrations;
CREATE POLICY "Admin can update any registration"
ON public.event_registrations FOR UPDATE TO authenticated
USING (
  guest_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND host_id = auth.uid())
  OR is_admin()
);

-- 9. reports — admin can read and update all
DROP POLICY IF EXISTS "Admin can read all reports" ON public.reports;
CREATE POLICY "Admin can read all reports"
ON public.reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR reported_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Admin can update reports" ON public.reports;
CREATE POLICY "Admin can update reports"
ON public.reports FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 10. ratings — admin can read all
DROP POLICY IF EXISTS "Admin can read all ratings" ON public.ratings;
CREATE POLICY "Admin can read all ratings"
ON public.ratings FOR SELECT TO authenticated
USING (rater_id = auth.uid() OR rated_id = auth.uid() OR is_admin());

-- ============================================================
-- food_posts table (create if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_posts (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title         text DEFAULT 'מסירת אוכל',
  items         text NOT NULL,
  city          text NOT NULL,
  neighborhood  text NOT NULL,
  full_address  text NOT NULL,
  image_url     text,
  status        text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.food_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active food posts" ON public.food_posts;
CREATE POLICY "Anyone can read active food posts"
ON public.food_posts FOR SELECT TO authenticated
USING (status = 'active' OR host_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Hosts can insert food posts" ON public.food_posts;
CREATE POLICY "Hosts can insert food posts"
ON public.food_posts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can update their food posts" ON public.food_posts;
CREATE POLICY "Hosts can update their food posts"
ON public.food_posts FOR UPDATE TO authenticated
USING (auth.uid() = host_id OR is_admin());

-- ============================================================
-- food_requests table (create if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.food_requests (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       uuid REFERENCES public.food_posts(id) ON DELETE CASCADE NOT NULL,
  requester_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status        text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE (post_id, requester_id)
);

ALTER TABLE public.food_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read relevant food requests" ON public.food_requests;
CREATE POLICY "Users can read relevant food requests"
ON public.food_requests FOR SELECT TO authenticated
USING (
  requester_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.food_posts WHERE id = post_id AND host_id = auth.uid())
  OR is_admin()
);

DROP POLICY IF EXISTS "Users can insert food requests" ON public.food_requests;
CREATE POLICY "Users can insert food requests"
ON public.food_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Hosts can update food requests" ON public.food_requests;
CREATE POLICY "Hosts can update food requests"
ON public.food_requests FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.food_posts WHERE id = post_id AND host_id = auth.uid())
  OR is_admin()
);

-- ============================================================
-- notifications table (create if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type       text NOT NULL,
  title      text NOT NULL,
  body       text,
  data       jsonb,
  read       boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
CREATE POLICY "Users read own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
