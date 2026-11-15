-- Add 'leisure' to events.event_type allowed values
-- Finds and drops the existing CHECK constraint by content, then recreates it.
DO $$
DECLARE
  c TEXT;
BEGIN
  SELECT tc.constraint_name INTO c
  FROM information_schema.table_constraints tc
  JOIN information_schema.check_constraints cc
    ON tc.constraint_schema = cc.constraint_schema
   AND tc.constraint_name   = cc.constraint_name
  WHERE tc.table_name       = 'events'
    AND tc.constraint_type  = 'CHECK'
    AND cc.check_clause     LIKE '%shabbat_dinner%';
  IF c IS NOT NULL THEN
    EXECUTE 'ALTER TABLE events DROP CONSTRAINT ' || quote_ident(c);
  END IF;
END $$;

ALTER TABLE events
  ADD CONSTRAINT events_event_type_check
  CHECK (event_type IN ('shabbat_dinner', 'shabbat_lunch', 'holiday', 'weekday', 'leisure'));
