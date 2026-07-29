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

/**
 * Builds a Supabase client mock whose `auth.getSession` resolves with the
 * supplied session and whose `from('profiles').select('role').eq().single()`
 * chain resolves with the supplied profile row.
 */
function mockClient(session: object | null, profile: { role: string } | null) {
  const singleFn = vi.fn().mockResolvedValue({ data: profile, error: null });
  const eqFn = vi.fn().mockReturnValue({ single: singleFn });
  const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
  const fromFn = vi.fn().mockReturnValue({ select: selectFn });

  mocks.createServerClient.mockReturnValue({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
    from: fromFn,
  });
  return { singleFn, eqFn, selectFn, fromFn };
}

/* ───────────────────────────────────────────────────────────── */
/*  Tests                                                        */
/* ───────────────────────────────────────────────────────────── */

describe('middleware admin role guard', () => {
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

  it('allows an admin through to /admin/dashboard without redirect', async () => {
    mockClient(
      { user: { id: 'admin-1' }, access_token: 'tok' },
      { role: 'admin' },
    );

    const request = createMockRequest('/admin/dashboard');
    await updateSession(request as never);

    expect(mocks.redirectFn).not.toHaveBeenCalled();
    expect(mocks.nextFn).toHaveBeenCalled();
  });

  it('redirects a non-admin (customer) from /admin to /home?error=unauthorized', async () => {
    const { fromFn, eqFn } = mockClient(
      { user: { id: 'cust-1' }, access_token: 'tok' },
      { role: 'customer' },
    );

    const request = createMockRequest('/admin/dashboard');
    await updateSession(request as never);

    expect(fromFn).toHaveBeenCalledWith('profiles');
    expect(eqFn).toHaveBeenCalledWith('id', 'cust-1');
    expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
    const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe('/home');
    expect(redirectUrl.searchParams.get('error')).toBe('unauthorized');
  });

  it('redirects a user with no profile row from /admin to /home?error=unauthorized', async () => {
    mockClient({ user: { id: 'ghost' }, access_token: 'tok' }, null);

    const request = createMockRequest('/admin/settings');
    await updateSession(request as never);

    expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
    const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe('/home');
    expect(redirectUrl.searchParams.get('error')).toBe('unauthorized');
  });

  it('redirects an unauthenticated request to /admin to /login?next= (delegated to generic guard)', async () => {
    mockClient(null, null);

    const request = createMockRequest('/admin/dashboard');
    await updateSession(request as never);

    expect(mocks.redirectFn).toHaveBeenCalledTimes(1);
    const redirectUrl = mocks.redirectFn.mock.calls[0][0] as URL;
    expect(redirectUrl.pathname).toBe('/login');
    expect(redirectUrl.searchParams.get('next')).toBe('/admin/dashboard');
  });

  it('does NOT query profiles.role for a non-admin route (/orders)', async () => {
    const { fromFn } = mockClient(
      { user: { id: 'cust-1' }, access_token: 'tok' },
      { role: 'customer' },
    );

    const request = createMockRequest('/orders');
    await updateSession(request as never);

    expect(fromFn).not.toHaveBeenCalled();
    expect(mocks.nextFn).toHaveBeenCalled();
  });
});