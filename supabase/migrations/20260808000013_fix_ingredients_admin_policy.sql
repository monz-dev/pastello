-- Migration 00013: fix ingredients admin RLS policy (infinite recursion)
-- Author: Pastello (create-flow slice)
-- Description: The ingredients_select_admin policy added in 00012 used a
--   subquery against public.profiles, which has its own self-referencing
--   RLS policy (profiles_select_owner_or_admin). This caused infinite
--   recursion for anonymous users.
--
--   Fix: create a SECURITY DEFINER function and rewrite the policy to use it.

-- 1. Create the admin-check helper (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop the broken policy
DROP POLICY IF EXISTS "ingredients_select_admin" ON public.ingredients;

-- 3. Recreate it using the safe function
CREATE POLICY "ingredients_select_admin" ON public.ingredients
  FOR SELECT USING (public.is_admin());
