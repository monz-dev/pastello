-- Migration 00014: update ingredient images to Supabase Storage + remove deprecated items + fix prices
-- Author: Pastello (create-flow slice)
-- Description: Switches ingredient image_url from Unsplash to Supabase Storage,
--   removes Mantequilla (pan) and Oreo (cobertura), updates size prices.

-- ==========================================================================
-- 1. Update size prices
-- ==========================================================================
UPDATE public.ingredients SET additional_price = 40  WHERE type = 'tamaño' AND name = 'Mini';
UPDATE public.ingredients SET additional_price = 250 WHERE type = 'tamaño' AND name = 'Extra grande';

-- ==========================================================================
-- 2. Remove deprecated ingredients
-- ==========================================================================
DELETE FROM public.ingredients WHERE type = 'pan' AND name = 'Mantequilla';
DELETE FROM public.ingredients WHERE type = 'cobertura' AND name = 'Oreo';

-- ==========================================================================
-- 3. Update image URLs → Supabase Storage
--    Bucket: ingredients (public)
--    URL base: https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients
-- ==========================================================================

-- Panes
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/pan/chocolate.jpg'     WHERE type = 'pan'      AND name = 'Chocolate';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/pan/vainilla.jpg'     WHERE type = 'pan'      AND name = 'Vainilla';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/pan/red-velvet.jpg'  WHERE type = 'pan'      AND name = 'Red Velvet';

-- Rellenos
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/relleno/nutella.jpg'      WHERE type = 'relleno'  AND name = 'Nutella';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/relleno/queso-crema.jpg'  WHERE type = 'relleno'  AND name = 'Queso Crema';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/relleno/oreo.jpg'         WHERE type = 'relleno'  AND name = 'Oreo';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/relleno/chocolate.jpg'    WHERE type = 'relleno'  AND name = 'Chocolate';

-- Coberturas
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/cobertura/chocolate.jpg'     WHERE type = 'cobertura' AND name = 'Chocolate';
UPDATE public.ingredients SET image_url = 'https://vycvymdbqwmpivfnqqlg.supabase.co/storage/v1/object/public/ingredients/cobertura/queso-crema.jpg'  WHERE type = 'cobertura' AND name = 'Queso Crema';

-- Tamaños (placeholder, no tienen foto real)
UPDATE public.ingredients SET image_url = '/images/placeholder-size.svg' WHERE type = 'tamaño';
