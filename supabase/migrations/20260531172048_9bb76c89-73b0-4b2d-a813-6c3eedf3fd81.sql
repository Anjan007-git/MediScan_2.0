
-- =========================================
-- PROMO CODES (server-only)
-- =========================================
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0
);

-- No client grants — only service_role (edge functions) can access
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Seed the ANJANMEDISCAN promo
INSERT INTO public.promo_codes (code, is_active, max_uses)
VALUES ('ANJANMEDISCAN', true, NULL);

-- =========================================
-- USAGE COUNTERS
-- =========================================
CREATE TABLE public.usage_counters (
  user_id uuid PRIMARY KEY,
  medicine_scans_used integer NOT NULL DEFAULT 0,
  medicine_scan_reset_at timestamptz NOT NULL DEFAULT now(),
  receipt_scans_used integer NOT NULL DEFAULT 0,
  receipt_scan_reset_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clients can only READ their own row. All mutations go via service_role.
GRANT SELECT ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_select_own" ON public.usage_counters
  FOR SELECT USING (auth.uid() = user_id);

-- Explicitly deny client writes (defense in depth)
CREATE POLICY "usage_no_insert" ON public.usage_counters
  AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "usage_no_update" ON public.usage_counters
  AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "usage_no_delete" ON public.usage_counters
  AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

CREATE TRIGGER usage_counters_updated_at
  BEFORE UPDATE ON public.usage_counters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- EXTEND SUBSCRIPTIONS
-- =========================================
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_type text,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;
