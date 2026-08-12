-- Add scheduling details for custom cake orders.
ALTER TABLE public.orders
  ADD COLUMN delivery_type TEXT CHECK (delivery_type IN ('pickup', 'delivery')),
  ADD COLUMN delivery_time TEXT CHECK (
    delivery_time ~ '^(1[5-9]|2[01]):(00|15|30|45)$'
  );
