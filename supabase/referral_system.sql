-- ============================================================
-- Referral System + Fix kashrut prefs column
-- Run in Supabase SQL Editor → New query → RUN
-- ============================================================

-- 1. Add guest_kashrut_prefs column if missing (fixes prefs not saving)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS guest_kashrut_prefs text[] DEFAULT NULL;

-- 2. Add referral columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Function to generate an 8-char referral code (no confusable chars)
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i      int;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 4. Trigger: auto-assign referral code on new profile INSERT
CREATE OR REPLACE FUNCTION tr_fn_assign_referral_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := generate_referral_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code);
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_assign_referral_code ON public.profiles;
CREATE TRIGGER tr_assign_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION tr_fn_assign_referral_code();

-- 5. Back-fill referral codes for existing profiles
DO $$
DECLARE
  r        RECORD;
  new_code text;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      new_code := generate_referral_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = new_code AND id != r.id
      );
    END LOOP;
    UPDATE public.profiles SET referral_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

-- 6. RLS: allow reading referral_code for lookup during registration
-- (existing profiles policies cover SELECT; referred_by is readable by anyone who can read that profile)
-- Allow any authenticated user to look up a profile by its referral_code:
DROP POLICY IF EXISTS "Anyone can read referral codes" ON public.profiles;
CREATE POLICY "Anyone can read referral codes"
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- 7. Admin RPC: referral stats
CREATE OR REPLACE FUNCTION admin_get_referral_stats()
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'total_referred', (
      SELECT count(*)::int FROM profiles WHERE referred_by IS NOT NULL
    ),
    'top_referrers', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT
          p.id,
          p.display_name,
          p.city,
          count(r2.id)::int AS referral_count
        FROM profiles p
        JOIN profiles r2 ON r2.referred_by = p.id
        GROUP BY p.id, p.display_name, p.city
        ORDER BY referral_count DESC
        LIMIT 10
      ) r
    ),
    'recent_referred', (
      SELECT json_agg(row_to_json(r)) FROM (
        SELECT
          p.id,
          p.display_name,
          p.city,
          p.created_at,
          ref.display_name AS referred_by_name
        FROM profiles p
        JOIN profiles ref ON ref.id = p.referred_by
        ORDER BY p.created_at DESC
        LIMIT 20
      ) r
    )
  );
END;
$$;
