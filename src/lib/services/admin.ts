import { createClient } from '@/lib/supabase/server';

/**
 * Admin dashboard data services — server-only helpers that query today's
 * orders through the Supabase server client. Each helper is independently
 * callable and creates its own server client (cookie-scoped), so they can be
 * composed with `Promise.all` without sharing connection state.
 *
 * All "today" boundaries use UTC day start to stay deterministic across server
 * locales.
 */

export interface PopularCake {
  id: string;
  name: string;
  orderCount: number;
}

export interface DashboardMetrics {
  ordersToday: number;
  revenueToday: number;
  popularCakes: PopularCake[];
}

/**
 * Aggregated dashboard snapshot for the current UTC day. Composes the three
 * independent helpers with `Promise.all`; each helper creates its own server
 * client so the calls run concurrently without sharing connection state.
 */
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [ordersToday, revenueToday, popularCakes] = await Promise.all([
    getTodayOrders(),
    getTodayRevenue(),
    getPopularCakes(),
  ]);
  return { ordersToday, revenueToday, popularCakes };
}

/**
 * Returns the UTC start (inclusive) and end (exclusive) ISO timestamps for the
 * current day — used to filter `created_at` to "today".
 */
function todayBounds(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Count of all orders created today (any status, including cancelled).
 */
export async function getTodayOrders(): Promise<number> {
  const supabase = await createClient();
  const { start, end } = todayBounds();
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start)
    .lt('created_at', end);
  return count ?? 0;
}

/**
 * Sum of `total_price` for today's non-cancelled orders.
 */
export async function getTodayRevenue(): Promise<number> {
  const supabase = await createClient();
  const { start, end } = todayBounds();
  const { data } = await supabase
    .from('orders')
    .select('total_price')
    .gte('created_at', start)
    .lt('created_at', end)
    .neq('status', 'cancelled');
  const rows = (data ?? []) as Array<{ total_price: number | null }>;
  return rows.reduce((sum, row) => sum + (row.total_price ?? 0), 0);
}

/**
 * Top 5 pre-designed cakes by order count today (cancelled orders excluded).
 * Custom orders (`pre_designed_cake_id` is null) are ignored.
 *
 * Implemented client-side over two queries because the Supabase JS client
 * cannot express a GROUP BY JOIN; the aggregation volume per day is small.
 */
export async function getPopularCakes(): Promise<PopularCake[]> {
  const supabase = await createClient();
  const { start, end } = todayBounds();
  const { data: orders } = await supabase
    .from('orders')
    .select('pre_designed_cake_id')
    .gte('created_at', start)
    .lt('created_at', end)
    .neq('status', 'cancelled')
    .not('pre_designed_cake_id', 'is', null);

  const orderRows =
    (orders ?? []) as Array<{ pre_designed_cake_id: string | null }>;
  const counts = new Map<string, number>();
  for (const row of orderRows) {
    const id = row.pre_designed_cake_id;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const ids = ranked.map(([id]) => id);

  const { data: cakes } = await supabase
    .from('pre_designed_cakes')
    .select('id, name')
    .in('id', ids);

  const cakeRows = (cakes ?? []) as Array<{ id: string; name: string }>;
  const nameById = new Map(cakeRows.map((c) => [c.id, c.name]));
  return ranked.map(([id, orderCount]) => ({
    id,
    name: nameById.get(id) ?? 'Pastel',
    orderCount,
  }));
}