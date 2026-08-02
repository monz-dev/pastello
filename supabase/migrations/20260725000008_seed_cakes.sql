-- Migration 00008: seed pre-designed cakes
-- Author: Pastello bootstrap (B02)
-- Description: Seeds 3 pre-designed cakes for the home grid.
--   Image URLs use Unsplash with a 1200px width parameter.
--   ingredients array stores the human-readable names (pan, relleno, cobertura).

INSERT INTO public.pre_designed_cakes
  (name, description, ingredients, size, price, estimated_time, image_url, category) VALUES
  ('Velvet Noir Royale',
    'Chocolate belga 70% con ganache oscuro',
    ARRAY['Chocolate', 'Nutella', 'Chocolate'],
    'Grande 14cm', 54.00, 120,
    'https://amoradulce.com/wp-content/uploads/2019/12/Torta-chocolate-1_04_13_2024-scaled.jpg',
    'chocolate'),
  ('Fresa Silvestre',
    'Vainilla orgánica con crema batida y fresas frescas',
    ARRAY['Vainilla', 'Queso Crema', 'Queso Crema'],
    'Chico 12cm', 48.00, 90,
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200',
    'frutas'),
  ('Pistacho & Limón',
    'Curd de limón siciliano con crocante de pistacho',
    ARRAY['Mantequilla', 'Queso Crema', 'Queso Crema'],
    'Chico 12cm', 62.00, 150,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200',
    'gourmet');