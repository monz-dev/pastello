import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider } from '@/components/providers/auth-provider';
import { useAuth } from '@/hooks/use-auth';

/* ───────────────────────────────────────────────────────────── */
/*  Hoisted mocks (available inside vi.mock factory)             */
/* ───────────────────────────────────────────────────────────── */

const authMock = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: authMock.signInWithPassword,
      signUp: authMock.signUp,
      signInWithOAuth: authMock.signInWithOAuth,
      signOut: authMock.signOut,
      onAuthStateChange: authMock.onAuthStateChange,
    },
  }),
}));

/* ───────────────────────────────────────────────────────────── */
/*  Test helpers                                                  */
/* ───────────────────────────────────────────────────────────── */

/**
 * Consumer that mirrors what real descendants do: call `useAuth()` and render
 * values derived from the context, plus action buttons that delegate to the
 * auth helpers. This proves children receive the context AND that the context
 * shape matches the AuthState contract consumers rely on.
 */
function AuthConsumer() {
  const auth = useAuth();
  return (
    <>
      <span data-testid="user">{auth.user?.email ?? 'no-user'}</span>
      <span data-testid="loading">{auth.isLoading ? 'loading' : 'ready'}</span>
      <button
        type="button"
        data-testid="sign-in"
        onClick={() => auth.signIn('ada@pastello.com', 'pw')}
      >
        signIn
      </button>
      <button
        type="button"
        data-testid="sign-out"
        onClick={() => {
          void auth.signOut();
        }}
      >
        signOut
      </button>
    </>
  );
}

const mockSession = {
  user: { id: 'u-1', email: 'ada@pastello.com' },
  access_token: 'token-abc',
} as unknown as Session;

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    // Silent guest signUp runs on mount when initialSession is null; give it a
    // deterministic "no session returned" response so existing null-session
    // tests stay stable (no state update, no unhandled rejection).
    authMock.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });
  });

  it('propagates the user to children via useAuth (mock session)', () => {
    render(
      <AuthProvider initialSession={mockSession}>
        <AuthConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('ada@pastello.com');
    expect(screen.getByTestId('loading').textContent).toBe('ready');
  });

  it('exposes null user when initialSession is null', () => {
    render(
      <AuthProvider initialSession={null}>
        <AuthConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    expect(screen.getByTestId('loading').textContent).toBe('ready');
  });

  it('throws when useAuth is used outside an AuthProvider', () => {
    // Spy on console.error to keep the expected React error out of the test
    // output noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });

  it('signOut calls supabase.auth.signOut and clears the session', async () => {
    authMock.signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider initialSession={mockSession}>
        <AuthConsumer />
      </AuthProvider>,
    );

    // First render: session populated from initialSession.
    expect(screen.getByTestId('user').textContent).toBe('ada@pastello.com');

    await act(async () => {
      fireEvent.click(screen.getByTestId('sign-out'));
    });

    expect(authMock.signOut).toHaveBeenCalledTimes(1);
    // After signOut the provider clears local state; the consumer re-renders.
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });

  it('signIn delegates to supabase.auth.signInWithPassword', async () => {
    authMock.signInWithPassword.mockResolvedValue({
      data: { session: mockSession, user: mockSession.user },
      error: null,
    });

    render(
      <AuthProvider initialSession={null}>
        <AuthConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('sign-in'));
    });

    expect(authMock.signInWithPassword).toHaveBeenCalledWith({
      email: 'ada@pastello.com',
      password: 'pw',
    });
  });

  it('subscribes to onAuthStateChange on mount and unsubscribes on unmount', () => {
    const unsubscribe = vi.fn();
    authMock.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const { unmount } = render(
      <AuthProvider initialSession={null}>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(authMock.onAuthStateChange).toHaveBeenCalledTimes(1);
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});