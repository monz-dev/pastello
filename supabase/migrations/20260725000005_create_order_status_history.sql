-- Migration 00005: order_status_history table
-- Author: Pastello bootstrap (B02)
-- Description: Append-only audit log of order status transitions.
--   FK to orders with ON DELETE CASCADE (history dies with the order).
--   RLS: select owner-or-admin (via join to orders), insert admin only.

CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- SELECT: owner can read history of own orders; admins can read all
CREATE POLICY "order_status_history_select_owner_or_admin"
  ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- INSERT: admin only (records status transitions)
CREATE POLICY "order_status_history_insert_admin"
  ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index to support lookups by order
CREATE INDEX idx_order_status_history_order
  ON public.order_status_history(order_id);