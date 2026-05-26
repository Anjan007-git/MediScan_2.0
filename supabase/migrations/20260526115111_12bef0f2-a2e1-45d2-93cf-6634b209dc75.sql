
-- 1) Prevent privilege escalation via profiles.plan
CREATE OR REPLACE FUNCTION public.prevent_profile_plan_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service_role (server-side) may change the plan column
  IF NEW.plan IS DISTINCT FROM OLD.plan
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role' THEN
    NEW.plan := OLD.plan;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_plan_change ON public.profiles;
CREATE TRIGGER profiles_prevent_plan_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_plan_change();

-- 2) Remove client INSERT/UPDATE on subscriptions (only server-side writes allowed)
DROP POLICY IF EXISTS subs_insert_own ON public.subscriptions;
DROP POLICY IF EXISTS subs_update_own ON public.subscriptions;
DROP POLICY IF EXISTS subs_delete_own ON public.subscriptions;
-- Keep subs_select_own so users can read their own subscription

-- 3) Remove tables from realtime publication (app does not use realtime;
--    leaving them published lets any authenticated client subscribe to topics).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'scans'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.scans';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'saved_medicines'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.saved_medicines';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'reminders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.reminders';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'receipts'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.receipts';
  END IF;
END $$;
