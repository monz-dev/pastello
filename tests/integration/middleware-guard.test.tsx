import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ───────────────────────────────────────────────────────────── */
/*  Hoisted mocks (available inside vi.mock factory)             */
/* ───────────────────────────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  nextFn: vi.fn(),
  redirectFn: vi.fn(),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: mocks.nextFn,
    redirect: mocks.redirectFn,
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}));

/* ───────────────────────────────────────────────────────────── */
/*  Import AFTER mocks so the module uses mocked deps            */
/* ───────────────────────────────────────────────────────────── */

import { updateSession } from '@/lib/supabase/middleware';

/* ───────────────────────────────────────────────────────────── */
/*  Mock helpers                                                  */
/* ───────────────────────────────────────────────────────────── */

interface MockRequest {
  url: string;
  nextUrl: { pathname: string };
  cookies: { getAll: () => never[] };
}

function createMockRequest(pathname: string): MockRequest {
  return {
    url: `http://localhost:3000${pathname}`,
    nextUrl: { pathname },
    cookies: { getAll: () => [] },
  };
}

function mockSession(session: object | null) {
  mocks.createServerClient.mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session },
      }),
    },
  });
}

/* ───────────────────────────────────────────────────────────── */
/*  Tests                                                        */
/* ───────────────────────────────────────────────────────────── */

describe('middleware route guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.nextFn.mockReturnValue({
      cookies: { set: vi.fn() },
      headers: { set: vi.fn() },
    });
    mocks.redirectFn.mockImplementation((url: URL) => ({
      status: 307,
      headers: { get: () => url.toString() },
    }));

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  });

  describe('unauthenticated requests (no session)', () => {
    beforeEach(() => {
      mockSession(null);
    });

    it('redirects /orders → /login?next=/orders', async () => {
      const request = createMockRequest('/orders');
      await updateSession(request as never);

      expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
      const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/login');
      expect(redirectUrl.searchParams.get('next')).toBe('/orders');
    });

    it('redirects /profile → /login?next=/profile', async () => {
      const request = createMockRequest('/profile');
      await updateSession(request as never);

      expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
      const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/login');
      expect(redirectUrl.searchParams.get('next')).toBe('/profile');
    });

    it('redirects /admin/dashboard → /login?next=/admin/dashboard', async () => {
      const request = createMockRequest('/admin/dashboard');
      await updateSession(request as never);

      expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
      const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
      expect(redirectUrl.pathname).toBe('/login');
      expect(redirectUrl.searchParams.get('next')).toBe('/admin/dashboard');
    });

    it('does NOT redirect public /home', async () => {
      const request = createMockRequest('/home');
      await updateSession(request as never);

      expect(mocks.redirectFn).not.toHaveBeenCalled();
      expect(mocks.nextFn).toHaveBeenCalled();
    });
  });

  describe('authenticated requests (session present)', () => {
    beforeEach(() => {
      mockSession({
        user: { id: 'test-user-id' },
        access_token: 'test-token',
      });
    });

    it('allows /orders through without redirect', async () => {
      const request = createMockRequest('/orders');
      await updateSession(request as never);

      expect(mocks.redirectFn).not.toHaveBeenCalled();
      expect(mocks.nextFn).toHaveBeenCalled();
    });
  });
});