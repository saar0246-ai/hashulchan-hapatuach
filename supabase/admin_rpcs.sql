-- ============================================================
-- admin_rpcs.sql
-- Run this in Supabase Dashboard → SQL Editor
-- Run AFTER promote_admin.sql so you have admin access first
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Admin bypass RLS policies (so admins can read all data)
-- ────────────────────────────────────────────────────────────

-- profiles: admins can read all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'admin_read_all_profiles'
  ) THEN
    EXECUTE 'CREATE POLICY admin_read_all_profiles ON profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ''admin'')
    )';
  END IF;
END $$;

-- events: admins can read all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'admin_read_all_events'
  ) THEN
    EXECUTE 'CREATE POLICY admin_read_all_events ON events FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ''admin'')
    )';
  END IF;
END $$;

-- event_registrations: admins can read all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'admin_read_all_registrations'
  ) THEN
    EXECUTE 'CREATE POLICY admin_read_all_registrations ON event_registrations FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ''admin'')
    )';
  END IF;
END $$;

-- reports: admins can read all (reports table might have no existing SELECT policy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'admin_read_all_reports'
  ) THEN
    EXECUTE 'CREATE POLICY admin_read_all_reports ON reports FOR SELECT USING (
      reporter_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = ''admin'')
    )';
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────
-- 2. admin_get_users — returns all users (profiles + auth email)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE result json;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT json_agg(row_to_json(r)) INTO result FROM (
    SELECT
      p.id,
      p.display_name,
      u.email::text                 AS email,
      p.city,
      p.religious_level,
      p.kashrut_level,
      p.gender,
      p.birthday,
      p.phone,
      p.role,
      p.is_banned,
      p.onboarding_completed,
      p.total_hosted,
      p.total_guested,
      p.rating_as_host,
      p.rating_count_host,
      p.created_at,
      u.last_sign_in_at
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC
  ) r;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. admin_get_shabbat_events — upcoming shabbat events (7 days)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_shabbat_events()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE result json;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT json_agg(row_to_json(r)) INTO result FROM (
    SELECT
      e.id,
      e.title,
      p.display_name      AS host_name,
      e.city,
      e.event_date::text  AS event_date,
      e.event_time::text  AS event_time,
      e.event_type,
      e.max_guests,
      e.current_guests,
      e.kashrut_level,
      (
        SELECT json_agg(gp.display_name)
        FROM event_registrations er
        JOIN profiles gp ON gp.id = er.guest_id
        WHERE er.event_id = e.id AND er.status = 'approved'
      ) AS guest_names
    FROM events e
    JOIN profiles p ON p.id = e.host_id
    WHERE e.status = 'active'
      AND e.event_type IN ('shabbat_dinner', 'shabbat_lunch')
      AND e.event_date >= current_date
      AND e.event_date <= current_date + interval '7 days'
    ORDER BY e.event_date, e.event_time
  ) r;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 4. admin_ban_user
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_ban_user(target_id uuid, ban_state boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE profiles SET is_banned = ban_state WHERE id = target_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 5. admin_cancel_event
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_cancel_event(target_event_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE events SET status = 'cancelled' WHERE id = target_event_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 6. admin_delete_user (anonymises + bans; Auth user stays)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_delete_user(target_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE profiles SET
    display_name = 'משתמש מחוק',
    phone        = NULL,
    bio          = NULL,
    avatar_url   = NULL,
    is_banned    = true
  WHERE id = target_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 7. admin_resolve_report
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_resolve_report(
  report_id  uuid,
  new_status text,
  notes      text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE reports SET
    status      = new_status,
    admin_notes = notes,
    resolved_at = now()
  WHERE id = report_id;
END;
$$;
