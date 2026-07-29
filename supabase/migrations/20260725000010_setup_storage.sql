-- Migration 00010: storage buckets + policies
-- Author: Pastello bootstrap (B02)
-- Description: Creates two storage buckets and their RLS policies on
--   storage.objects:
--     - cake-images (public):  public SELECT, admin-only INSERT/UPDATE/DELETE
--     - reference-uploads (private): authenticated INSERT scoped to own
--       user folder, owner+admin SELECT/DELETE scoped to own folder.
--   Bucket inserts are idempotent (ON CONFLICT DO NOTHING).

-- ============================================================================
-- Buckets
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cake-images', 'cake-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-uploads', 'reference-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- cake-images policies (public read, admin write)
-- ============================================================================
CREATE POLICY "cake_images_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'cake-images');

CREATE POLICY "cake_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cake-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cake_images_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cake-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cake_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cake-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- reference-uploads policies (authenticated, scoped to user folder)
-- ============================================================================
CREATE POLICY "reference_uploads_authenticated_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reference-uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "reference_uploads_owner_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reference-uploads'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "reference_uploads_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reference-uploads'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );