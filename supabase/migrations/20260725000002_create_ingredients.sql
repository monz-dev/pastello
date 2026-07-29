-- Migration 00002: ingredients table
-- Author: Pastello bootstrap (B02)
-- Description: Catalog of customizable ingredients (pan / relleno / cobertura)
--   with public read (active only) and admin-only writes via RLS.

CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pan', 'relleno', 'cobertura')),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  additional_price DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- SELECT: public can read only active ingredients
CREATE POLICY "ingredients_select_public" ON public.ingredients
  FOR SELECT USING (is_active = true);

-- INSERT: admin only
CREATE POLICY "ingredients_insert_admin" ON public.ingredients
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- UPDATE: admin only
CREATE POLICY "ingredients_update_admin" ON public.ingredients
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- DELETE: admin only
CREATE POLICY "ingredients_delete_admin" ON public.ingredients
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Index to support filtering by type (pan/relleno/cobertura)
CREATE INDEX idx_ingredients_type ON public.ingredients(type);