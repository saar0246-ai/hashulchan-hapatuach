-- ============================================================
-- admin_setup.sql
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Promote founders to admin
--    Fill in the actual email addresses before running!
-- ────────────────────────────────────────────────────────────
-- UPDATE profiles SET role = 'admin'
-- WHERE id IN (
--   SELECT id FROM auth.users
--   WHERE email IN (
--     'FOUNDER_EMAIL_1',   -- e.g. 'tsachi@example.com'
--     'FOUNDER_EMAIL_2',   -- e.g. 'tair@example.com'
--     'FOUNDER_EMAIL_3'    -- e.g. 'tal@example.com'
--   )
-- );


-- ────────────────────────────────────────────────────────────
-- 2. Comprehensive analytics RPC
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_get_analytics()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'reg_by_status', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT status, count(*)::int as cnt
        FROM event_registrations GROUP BY status
      ) r
    ),
    'events_by_city', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT city, count(*)::int as cnt
        FROM events WHERE status = 'active'
        GROUP BY city ORDER BY cnt DESC LIMIT 8
      ) r
    ),
    'events_by_type', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT event_type, count(*)::int as cnt
        FROM events GROUP BY event_type
      ) r
    ),
    'users_last_7',    (SELECT count(*)::int FROM profiles WHERE created_at > now() - interval '7 days'),
    'users_prev_7',    (SELECT count(*)::int FROM profiles WHERE created_at BETWEEN now() - interval '14 days' AND now() - interval '7 days'),
    'events_last_7',   (SELECT count(*)::int FROM events WHERE created_at > now() - interval '7 days'),
    'bookings_last_7', (SELECT count(*)::int FROM event_registrations WHERE created_at > now() - interval '7 days'),
    'top_hosts', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT display_name, total_hosted, rating_as_host, city
        FROM profiles WHERE total_hosted > 0
        ORDER BY total_hosted DESC LIMIT 5
      ) r
    ),
    'recent_activity', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT 'user' as kind, display_name as label, city as sub, created_at
        FROM profiles ORDER BY created_at DESC LIMIT 5
      ) r
    )
  ) INTO result;
  RETURN result;
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 3. Approve / Reject registration RPCs
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_approve_registration(reg_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE event_registrations
  SET status = 'approved', responded_at = now()
  WHERE id = reg_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_reject_registration(reg_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE event_registrations
  SET status = 'rejected', responded_at = now()
  WHERE id = reg_id;
END;
$$;
