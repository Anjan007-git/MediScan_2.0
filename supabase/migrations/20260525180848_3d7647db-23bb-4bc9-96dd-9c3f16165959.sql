
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Allow users to delete their own profile (optional symmetry)
DO $$ BEGIN
  CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Generic updated_at trigger helper already exists: public.update_updated_at_column()

-- =========================
-- SCANS
-- =========================
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_name TEXT,
  detected_text TEXT,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'camera' CHECK (source IN ('camera','upload')),
  confidence NUMERIC,
  status TEXT,
  is_medicine BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scans_user_created ON public.scans(user_id, created_at DESC);
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scans_select_own" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scans_insert_own" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scans_update_own" ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "scans_delete_own" ON public.scans FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_scans_updated BEFORE UPDATE ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SAVED MEDICINES
-- =========================
CREATE TABLE IF NOT EXISTS public.saved_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic TEXT,
  composition TEXT,
  description TEXT,
  status TEXT,
  uses TEXT[],
  dosage TEXT,
  precautions TEXT[],
  warnings TEXT[],
  side_effects TEXT[],
  storage TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);
CREATE INDEX IF NOT EXISTS idx_saved_user ON public.saved_medicines(user_id, created_at DESC);
ALTER TABLE public.saved_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_select_own" ON public.saved_medicines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_own" ON public.saved_medicines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_update_own" ON public.saved_medicines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saved_delete_own" ON public.saved_medicines FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_saved_updated BEFORE UPDATE ON public.saved_medicines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- REMINDERS
-- =========================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine TEXT NOT NULL,
  dosage TEXT,
  time TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  enabled BOOLEAN NOT NULL DEFAULT true,
  notifications BOOLEAN NOT NULL DEFAULT true,
  last_fired_key TEXT,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.reminders(user_id, created_at DESC);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_select_own" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminders_insert_own" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminders_update_own" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reminders_delete_own" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_reminders_updated BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- RECEIPTS
-- =========================
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy TEXT,
  total NUMERIC,
  receipt_date TIMESTAMPTZ,
  date_text TEXT,
  image_url TEXT,
  raw_text TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  medicines TEXT[],
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id, created_at DESC);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receipts_select_own" ON public.receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert_own" ON public.receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "receipts_update_own" ON public.receipts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "receipts_delete_own" ON public.receipts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_receipts_updated BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- SUBSCRIPTIONS
-- =========================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  billing JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subs_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subs_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "subs_delete_own" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- INSIGHTS (one row per user, aggregated)
-- =========================
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_scans INTEGER NOT NULL DEFAULT 0,
  total_saved INTEGER NOT NULL DEFAULT 0,
  total_reminders INTEGER NOT NULL DEFAULT 0,
  last_scan_at TIMESTAMPTZ,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_select_own" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insights_insert_own" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insights_update_own" ON public.insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insights_delete_own" ON public.insights FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_insights_updated BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-bump insights on scan insert
CREATE OR REPLACE FUNCTION public.bump_insights_on_scan()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.insights (user_id, total_scans, last_scan_at)
  VALUES (NEW.user_id, 1, NEW.created_at)
  ON CONFLICT (user_id) DO UPDATE
    SET total_scans = public.insights.total_scans + 1,
        last_scan_at = EXCLUDED.last_scan_at,
        updated_at = now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bump_insights_on_scan
  AFTER INSERT ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.bump_insights_on_scan();

-- =========================
-- ACTIVITY LOGS
-- =========================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id, created_at DESC);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select_own" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_insert_own" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_delete_own" ON public.activity_logs FOR DELETE USING (auth.uid() = user_id);

-- =========================
-- STORAGE bucket for scan/receipt images
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('medicine-images', 'medicine-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "med_images_select_own" ON storage.objects FOR SELECT
  USING (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "med_images_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "med_images_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "med_images_delete_own" ON storage.objects FOR DELETE
  USING (bucket_id = 'medicine-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime
ALTER TABLE public.scans REPLICA IDENTITY FULL;
ALTER TABLE public.saved_medicines REPLICA IDENTITY FULL;
ALTER TABLE public.reminders REPLICA IDENTITY FULL;
ALTER TABLE public.receipts REPLICA IDENTITY FULL;

DO $$ BEGIN
  PERFORM 1; ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_medicines;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.receipts;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
