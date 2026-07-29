-- Migration 00001: profiles table + reusable updated_at trigger function
-- Author: Pastello bootstrap (B02)
-- Description: Creates the reusable updated_at trigger function (W-10),
--   the profiles table (1:1 with auth.users), RLS policies, index, and trigger.

-- ============================================================================
-- Reusable updated_at trigger function (W-10)
-- Used by: profiles, pre_designed_cakes, orders, bakery_settings
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- profiles table (1:1 with auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner can read self; admins can read all
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- INSERT: user can create only their own profile row
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: user can update only their own profile row
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Index to support admin-role lookups in RLS policies
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- updated_at trigger (W-10)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();