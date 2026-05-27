-- 1) activity_logs: remove user DELETE policy to make logs immutable from client
DROP POLICY IF EXISTS activity_delete_own ON public.activity_logs;
REVOKE DELETE, UPDATE ON public.activity_logs FROM authenticated;

-- 2) subscriptions: add explicit restrictive deny policies for client writes
CREATE POLICY subs_no_insert ON public.subscriptions
  AS RESTRICTIVE FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY subs_no_update ON public.subscriptions
  AS RESTRICTIVE FOR UPDATE TO authenticated, anon
  USING (false);

CREATE POLICY subs_no_delete ON public.subscriptions
  AS RESTRICTIVE FOR DELETE TO authenticated, anon
  USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon;
GRANT ALL ON public.subscriptions TO service_role;