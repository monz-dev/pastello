-- Migration 00004: orders table
-- Author: Pastello bootstrap (B02)
-- Description: Customer orders (pre_designed / custom_build / reference_image).
--   FKs use ON DELETE RESTRICT (soft-delete via is_active is the primary
--   strategy; RESTRICT is the safety net per design v3). Status CHECK
--   constraint. RLS: select owner-or-admin, insert own, update admin.
--   Includes updated_at trigger (W-10).

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  order_type TEXT NOT NULL CHECK (
    order_type IN ('pre_designed', 'custom_build', 'reference_image')
  ),
  pre_designed_cake_id UUID REFERENCES public.pre_designed_cakes(id) ON DELETE RESTRICT,
  size_choice TEXT,
  pan_choice UUID REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  relleno_choice UUID REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  cobertura_choice UUID REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  reference_image_url TEXT,
  description TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'preparing', 'shipped', 'cancelled', 'delivered')),
  required_date DATE,
  notes TEXT,
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- SELECT: owner can read own orders; admins can read all
CREATE POLICY "orders_select_owner_or_admin" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: user can create orders only for themselves
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: admin only (status transitions, etc.)
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes to support common query patterns
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- updated_at trigger (W-10)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();