-- Migration 00007: seed ingredients
-- Author: Pastello bootstrap (B02)
-- Description: Seeds 11 ingredients across the 3 types:
--   4 panes, 4 rellenos, 3 coberturas.
--   Image URLs use Unsplash with a 400px width parameter.
--   Idempotent courtesy of is_active/default activation (re-run guarded by
--   the migration runner which applies each file once).

INSERT INTO public.ingredients (type, name, description, image_url, additional_price, sort_order) VALUES
  -- Panes (type = 'pan')
  ('pan', 'Chocolate',
    'Bizcocho de chocolate belga 70% cacao',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    0, 1),
  ('pan', 'Vainilla',
    'Bizcocho de vainilla orgánica de Madagascar',
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
    0, 2),
  ('pan', 'Red Velvet',
    'Bizcocho red velvet clásico con cacao suave',
    'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400',
    10, 3),
  ('pan', 'Mantequilla',
    'Bizcocho de mantequilla francesa tradicional',
    'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400',
    0, 4),
  -- Rellenos (type = 'relleno')
  ('relleno', 'Nutella',
    'Crema de avellanas y cacao premium',
    'https://images.unsplash.com/photo-1584839404042-8bc6300916da?w=400',
    15, 1),
  ('relleno', 'Queso Crema',
    'Relleno de queso crema batido artesanal',
    'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400',
    10, 2),
  ('relleno', 'Oreo',
    'Crema de galleta Oreo triturada con nata',
    'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400',
    12, 3),
  ('relleno', 'Chocolate',
    'Ganache de chocolate negro intenso',
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
    10, 4),
  -- Coberturas (type = 'cobertura')
  ('cobertura', 'Chocolate',
    'Ganache brillante de chocolate 70%',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    0, 1),
  ('cobertura', 'Queso Crema',
    'Frosting de queso crema sedoso',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
    5, 2),
  ('cobertura', 'Oreo',
    'Cobertura de crema Oreo con trozos crocantes',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    8, 3);