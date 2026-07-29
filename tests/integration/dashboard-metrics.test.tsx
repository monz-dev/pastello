import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTodayOrders,
  getTodayRevenue,
  getPopularCakes,
  fetchDashboardMetrics,
} from '@/lib/services/admin';

/* ───────────────────────────────────────────────────────────── */
/*  Hoisted Supabase mock                                         */
/* ───────────────────────────────────────────────────────────── */
/*
 * Mocks `@/lib/supabase/server` so each helper's internal
 * `createClient()` returns a client whose `from(table)` builds a
 * chainable thenable. The resolver inspects the recorded `select`
 * call to discriminate the head/count path (`{ count }`) from the
 * data path (`{ data }`).
 */
const supabaseMock = vi.hoisted(() => {
  let ordersData: Record<string, unknown>[] = [];
  let cakesData: Record<string, unknown>[] = [];

  interface Filter {
    col: string;
    op: 'eq' | 'neq' | 'gte' | 'lt' | 'not_null' | 'in';
    val: unknown;
  }

  /**
   * Applies the recorded filter predicates against the in-memory fixture so
   * the helpers' SQL intent (`.neq('status','cancelled')`, `.not(..., 'is',
   * null)`, date bounds, `.in('id', ids)`) is honored by the mock — the naive
   * "return everything" mock returning the raw fixture would let cancelled
   * rows leak into revenue/popularity and break the assertions.
   */
  function applyFilters(
    rows: Record<string, unknown>[],
    filters: Filter[],
  ): Record<string, unknown>[] {
    return rows.filter((row) =>
      filters.every((f) => {
        const v = row[f.col];
        switch (f.op) {
          case 'eq':
            return v === f.val;
          case 'neq':
            return v !== f.val;
          case 'gte':
            return typeof v === 'string' && typeof f.val === 'string'
              ? v >= f.val
              : (v as number) >= (f.val as number);
          case 'lt':
            return typeof v === 'string' && typeof f.val === 'string'
              ? v < f.val
              : (v as number) < (f.val as number);
          case 'not_null':
            return v !== null && v !== undefined;
          case 'in':
            return Array.isArray(f.val) && f.val.includes(v);
          default:
            return true;
        }
      }),
    );
  }

  const from = vi.fn((table: string) => {
    const filters: Filter[] = [];
    const selectOpts: { head?: boolean } = {};
    const chain: Record<string, unknown> = {};

    chain.select = vi.fn((_cols?: string, opts?: { head?: boolean }) => {
      if (opts?.head) selectOpts.head = true;
      return chain;
    });
    chain.gte = vi.fn((col: string, val: unknown) => {
      filters.push({ col, op: 'gte', val });
      return chain;
    });
    chain.lt = vi.fn((col: string, val: unknown) => {
      filters.push({ col, op: 'lt', val });
      return chain;
    });
    chain.neq = vi.fn((col: string, val: unknown) => {
      filters.push({ col, op: 'neq', val });
      return chain;
    });
    chain.eq = vi.fn((col: string, val: unknown) => {
      filters.push({ col, op: 'eq', val });
      return chain;
    });
    chain.not = vi.fn((col: string, _op: string, val: unknown) => {
      if (val === null) filters.push({ col, op: 'not_null', val });
      return chain;
    });
    chain.in = vi.fn((col: string, val: unknown) => {
      filters.push({ col, op: 'in', val });
      return chain;
    });
    chain.order = vi.fn(() => chain);

    chain.then = (onFulfilled: (v: unknown) => unknown) => {
      if (table === 'orders') {
        const filtered = applyFilters(ordersData, filters);
        if (selectOpts.head) {
          return onFulfilled({ count: filtered.length, error: null });
        }
        return onFulfilled({ data: filtered, error: null });
      }
      if (table === 'pre_designed_cakes') {
        const filtered = applyFilters(cakesData, filters);
        return onFulfilled({ data: filtered, error: null });
      }
      return onFulfilled({ data: null, error: null });
    };

    return chain;
  });

  return {
    from,
    setOrders: (o: Record<string, unknown>[]) => {
      ordersData = o;
    },
    setCakes: (c: Record<string, unknown>[]) => {
      cakesData = c;
    },
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: (table: string) => supabaseMock.from(table),
  }),
}));

/* ───────────────────────────────────────────────────────────── */
/*  Fixtures — 12 orders today, 2 cancelled                       */
/* ───────────────────────────────────────────────────────────── */
/*
 * Non-cancelled (10): cake-a x4 @50, cake-b x3 @30, cake-c x2 @20,
 *   cake-d x1 @15  → revenue 345
 * Cancelled (2): cake-a @40, cake-b @60  → excluded from revenue
 *   and popularity.
 */
/* `created_at` is anchored to the middle of the current UTC day so the
 * helpers' `todayBounds()` (real UTC start/end) always includes the fixture
 * rows regardless of when the suite runs. */
const TODAY_DATE = new Date();
const TODAY = new Date(
  Date.UTC(
    TODAY_DATE.getUTCFullYear(),
    TODAY_DATE.getUTCMonth(),
    TODAY_DATE.getUTCDate(),
    12,
    0,
    0,
  ),
).toISOString();

function order(
  id: string,
  rest: Record<string, unknown>,
): Record<string, unknown> {
  return { id, created_at: TODAY, ...rest };
}

const ordersFixture: Record<string, unknown>[] = [
  order('o1', { pre_designed_cake_id: 'cake-a', total_price: 50, status: 'pending', order_type: 'predesigned' }),
  order('o2', { pre_designed_cake_id: 'cake-a', total_price: 50, status: 'confirmed', order_type: 'predesigned' }),
  order('o3', { pre_designed_cake_id: 'cake-a', total_price: 50, status: 'pending', order_type: 'predesigned' }),
  order('o4', { pre_designed_cake_id: 'cake-a', total_price: 50, status: 'pending', order_type: 'predesigned' }),
  order('o5', { pre_designed_cake_id: 'cake-b', total_price: 30, status: 'pending', order_type: 'predesigned' }),
  order('o6', { pre_designed_cake_id: 'cake-b', total_price: 30, status: 'confirmed', order_type: 'predesigned' }),
  order('o7', { pre_designed_cake_id: 'cake-b', total_price: 30, status: 'pending', order_type: 'predesigned' }),
  order('o8', { pre_designed_cake_id: 'cake-c', total_price: 20, status: 'pending', order_type: 'predesigned' }),
  order('o9', { pre_designed_cake_id: 'cake-c', total_price: 20, status: 'pending', order_type: 'predesigned' }),
  order('o10', { pre_designed_cake_id: 'cake-d', total_price: 15, status: 'pending', order_type: 'predesigned' }),
  order('o11', { pre_designed_cake_id: 'cake-a', total_price: 40, status: 'cancelled', order_type: 'predesigned' }),
  order('o12', { pre_designed_cake_id: 'cake-b', total_price: 60, status: 'cancelled', order_type: 'predesigned' }),
];

const cakesFixture: Record<string, unknown>[] = [
  { id: 'cake-a', name: 'Torta A' },
  { id: 'cake-b', name: 'Torta B' },
  { id: 'cake-c', name: 'Torta C' },
  { id: 'cake-d', name: 'Torta D' },
];

/* ───────────────────────────────────────────────────────────── */
/*  Tests                                                         */
/* ───────────────────────────────────────────────────────────── */

describe('Dashboard metrics helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setOrders(ordersFixture);
    supabaseMock.setCakes(cakesFixture);
  });

  it('getTodayOrders returns the count of all orders today', async () => {
    expect(await getTodayOrders()).toBe(12);
  });

  it('getTodayRevenue sums total_price of non-cancelled orders', async () => {
    // 4*50 + 3*30 + 2*20 + 15 = 345 ; cancelled 40 + 60 excluded.
    expect(await getTodayRevenue()).toBe(345);
  });

  it('getPopularCakes ranks cakes by order count excluding cancelled', async () => {
    expect(await getPopularCakes()).toEqual([
      { id: 'cake-a', name: 'Torta A', orderCount: 4 },
      { id: 'cake-b', name: 'Torta B', orderCount: 3 },
      { id: 'cake-c', name: 'Torta C', orderCount: 2 },
      { id: 'cake-d', name: 'Torta D', orderCount: 1 },
    ]);
  });

  it('empty dataset yields zeros and an empty popular list', async () => {
    supabaseMock.setOrders([]);
    supabaseMock.setCakes([]);
    expect(await getTodayOrders()).toBe(0);
    expect(await getTodayRevenue()).toBe(0);
    expect(await getPopularCakes()).toEqual([]);
  });
});

describe('fetchDashboardMetrics composition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setOrders(ordersFixture);
    supabaseMock.setCakes(cakesFixture);
  });

  it('returns the composed snapshot for 12 orders today', async () => {
    const metrics = await fetchDashboardMetrics();
    expect(metrics).toEqual({
      ordersToday: 12,
      revenueToday: 345,
      popularCakes: [
        { id: 'cake-a', name: 'Torta A', orderCount: 4 },
        { id: 'cake-b', name: 'Torta B', orderCount: 3 },
        { id: 'cake-c', name: 'Torta C', orderCount: 2 },
        { id: 'cake-d', name: 'Torta D', orderCount: 1 },
      ],
    });
  });

  it('empty state yields 0 orders, 0 revenue, and no popular cakes', async () => {
    supabaseMock.setOrders([]);
    supabaseMock.setCakes([]);
    const metrics = await fetchDashboardMetrics();
    expect(metrics).toEqual({
      ordersToday: 0,
      revenueToday: 0,
      popularCakes: [],
    });
  });
});