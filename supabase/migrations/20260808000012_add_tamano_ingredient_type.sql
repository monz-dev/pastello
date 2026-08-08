-- Migration 00012: add tamaño to ingredient type constraint + seed sizes
-- Author: Pastello (create-flow slice)
-- Description: Drops the existing CHECK constraint on ingredients.type,
--   re-creates it with 'tamaño' included, and seeds 5 cake sizes.

-- Drop existing CHECK constraint (auto-generated name must be discovered at runtime,
-- but in recreate scenarios we drop using the known constraint name pattern).
-- Supabase generates CHECK constraint names as: <table>_<column>_check
ALTER TABLE public.ingredients DROP CONSTRAINT IF EXISTS ingredients_type_check;

-- Re-create with 'tamaño' included
ALTER TABLE public.ingredients ADD CONSTRAINT ingredients_type_check
  CHECK (type IN ('tamaño', 'pan', 'relleno', 'cobertura'));

-- Admin SELECT: allow admins to see ALL ingredients (active and inactive)
CREATE POLICY "ingredients_select_admin" ON public.ingredients
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Seed 5 cake sizes
INSERT INTO public.ingredients (type, name, description, image_url, additional_price, sort_order) VALUES
  ('tamaño', 'Mini',
    '7cm — Ideal para 2-4 personas',
    '/images/placeholder-size.svg',
    0, 1),
  ('tamaño', 'Mediano',
    '14cm — Ideal para 6-8 personas',
    '/images/placeholder-size.svg',
    80, 2),
  ('tamaño', 'Doble piso',
    '14cm + 14cm — Dos niveles, ideal para 12-15 personas',
    '/images/placeholder-size.svg',
    150, 3),
  ('tamaño', 'Grande',
    '20cm — Ideal para 15-20 personas',
    '/images/placeholder-size.svg',
    200, 4),
  ('tamaño', 'Extra grande',
    '24cm — Ideal para 25-30 personas',
    '/images/placeholder-size.svg',
    280, 5);
