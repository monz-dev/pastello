-- Migration 00003: pre_designed_cakes table
-- Author: Pastello bootstrap (B02)
-- Description: Pre-designed cakes shown on the home grid. Public read
--   (active only), admin-only writes. Includes updated_at trigger (W-10).

CREATE TABLE public.pre_designed_cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[],
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  estimated_time INTEGER,
  image_url TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pre_designed_cakes ENABLE ROW LEVEL SECURITY;

-- SELECT: public can read only active cakes
CREATE POLICY "cakes_select_public" ON public.pre_designed_cakes
  FOR SELECT USING (is_active = true);

-- INSERT: admin only
CREATE POLICY "cakes_insert_admin" ON public.pre_designed_cakes
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- UPDATE: admin only
CREATE POLICY "cakes_update_admin" ON public.pre_designed_cakes
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- DELETE: admin only
CREATE POLICY "cakes_delete_admin" ON public.pre_designed_cakes
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- updated_at trigger (W-10)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pre_designed_cakes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();