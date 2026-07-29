-- Migration 00006: bakery_settings table
-- Author: Pastello bootstrap (B02)
-- Description: Single-row configuration table enforced via a fixed UUID
--   CHECK constraint. Public SELECT, admin-only UPDATE. JSONB columns for
--   business_hours and social_links. Includes updated_at trigger (W-10)
--   and a seed row with the default WhatsApp number.

CREATE TABLE public.bakery_settings (
  id UUID PRIMARY KEY
    DEFAULT '00000000-0000-0000-0000-000000000001'
    CHECK (id = '00000000-0000-0000-0000-000000000001'),
  whatsapp_number TEXT NOT NULL,
  business_hours JSONB,
  theme TEXT DEFAULT 'system',
  social_links JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bakery_settings ENABLE ROW LEVEL SECURITY;

-- SELECT: public (anyone can read bakery settings)
CREATE POLICY "bakery_settings_select_public" ON public.bakery_settings
  FOR SELECT USING (true);

-- UPDATE: admin only
CREATE POLICY "bakery_settings_update_admin" ON public.bakery_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed the single allowed row with a placeholder WhatsApp number
INSERT INTO public.bakery_settings (whatsapp_number) VALUES ('+5491100000000');

-- updated_at trigger (W-10)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.bakery_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();