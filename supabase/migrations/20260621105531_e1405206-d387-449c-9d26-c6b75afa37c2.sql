-- Prevent users from deleting their own activity logs (immutable audit trail)
CREATE POLICY "No deletes on activity_logs"
ON public.activity_logs
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (false);

-- Lock down promo_codes: only service_role may access (edge function uses service role key)
CREATE POLICY "No client access to promo_codes"
ON public.promo_codes
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);