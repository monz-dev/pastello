-- Migration 00009: favorites table
-- Author: Pastello bootstrap (B02)
-- Description: Per-user favorites (bookmarks) for pre-designed cakes.
--   UNIQUE(user_id, pre_designed_cake_id) prevents duplicate favorites.
--   RLS: select own, insert authenticated-own, delete own.

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pre_designed_cake_id UUID REFERENCES public.pre_designed_cakes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, pre_designed_cake_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- SELECT: owner can read own favorites
CREATE POLICY "favorites_select_owner" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: authenticated user can favorite for themselves only
CREATE POLICY "favorites_insert_authenticated" ON public.favorites
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.role() = 'authenticated'
  );

-- DELETE: owner can remove their own favorites
CREATE POLICY "favorites_delete_owner" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Index to support listing a user's favorites
CREATE INDEX idx_favorites_user ON public.favorites(user_id);